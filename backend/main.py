import warnings
warnings.filterwarnings('ignore')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import requests
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from datetime import datetime, timedelta
import os

app = FastAPI(title="Chennai Flood Prediction API v2")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model_classifier = None
model_regressor = None
full_df = None
# Features focusing on volume, trend, and seasonality
features = [f'lag_{i}' for i in range(1, 8)] + ['Rolling_3_Sum', 'Rolling_7_Sum', 'Trend_Lag', 'Month_Sin', 'Month_Cos']

def prepare_features(df):
    # Lags
    for i in range(1, 8):
        df[f'lag_{i}'] = df['Rainfall_mm_day'].shift(i)
    
    # Volume Context (Lagged)
    df['Rolling_3_Sum'] = df['Rainfall_mm_day'].shift(1).rolling(window=3).sum()
    df['Rolling_7_Sum'] = df['Rainfall_mm_day'].shift(1).rolling(window=7).sum()
    
    # Momentum feature
    df['Trend_Lag'] = df['lag_1'] - df['lag_2']
    
    # Seasonal context
    df['Month'] = df['Date'].dt.month
    df['Month_Sin'] = np.sin(2 * np.pi * df['Month'] / 12)
    df['Month_Cos'] = np.cos(2 * np.pi * df['Month'] / 12)
    
    # Labelling (100mm+ or heavy rolling sums)
    r3 = df['Rainfall_mm_day'].rolling(window=3).sum()
    r5 = df['Rainfall_mm_day'].rolling(window=5).sum()
    df['Flood_Risk_Label'] = ((df['Rainfall_mm_day'] > 100) | (r3 > 150) | (r5 > 200)).astype(int)
    
    return df

@app.on_event("startup")
def startup_event():
    global model_classifier, model_regressor, full_df
    print("Loading historical Excel data...")
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "../data/chennai_rainfall_data.xlsx")
    
    df_hist = pd.read_excel(data_path)
    df_hist['Date'] = pd.to_datetime(df_hist['Date'])
    
    last_date = df_hist['Date'].max()
    today = pd.to_datetime(datetime.now().date())
    yesterday_date = today - timedelta(days=1)
    
    new_data = []
    if last_date < yesterday_date:
        start_str = (last_date + timedelta(days=1)).strftime('%Y-%m-%d')
        end_str = yesterday_date.strftime('%Y-%m-%d')
        print(f"Fetching missing data from {start_str} to {end_str}...")
        url = f"https://archive-api.open-meteo.com/v1/archive?latitude=13.0827&longitude=80.2707&start_date={start_str}&end_date={end_str}&daily=precipitation_sum&timezone=auto"
        res = requests.get(url)
        if res.status_code == 200:
            data = res.json()
            if 'daily' in data:
                dates = pd.to_datetime(data['daily']['time'])
                rain_sums = data['daily']['precipitation_sum']
                for d, r in zip(dates, rain_sums):
                    new_data.append({'Date': d, 'Rainfall_mm_day': r if r is not None else 0.0})
    
    if new_data:
        df_new = pd.DataFrame(new_data)
        df_full = pd.concat([df_hist, df_new], ignore_index=True)
    else:
        df_full = df_hist.copy()
        
    df_full = df_full.sort_values('Date').reset_index(drop=True)
    df_full = prepare_features(df_full)
    
    full_df = df_full.copy()
    
    print("Training the ML Classifier & Regressor on all available data...")
    df_clean = df_full.dropna().reset_index(drop=True)
    
    # Extremely aggressive oversampling for rare heavy rainfall events
    # This forces Gradient Boosting to treat these residuals as high priority
    heavy_events = df_clean[df_clean['Rainfall_mm_day'] > 80]
    super_heavy = df_clean[df_clean['Rainfall_mm_day'] > 150]
    df_augmented = pd.concat([df_clean] + [heavy_events]*20 + [super_heavy]*50, ignore_index=True)
    
    X = df_augmented[features]
    y_class = df_augmented['Flood_Risk_Label']
    y_reg = df_augmented['Rainfall_mm_day']
    
    model_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    model_classifier.fit(X, y_class)
    
    # Trained in linear space with high iteration to capture the full magnitude of storms
    # l2_regularization reduced to allow fitting peaks
    model_regressor = HistGradientBoostingRegressor(max_iter=1000, random_state=42, l2_regularization=0.01)
    model_regressor.fit(X, y_reg)
    print("Startup complete. System ready.")

@app.get("/api/dashboard")
def get_dashboard():
    recent_30 = full_df.tail(30)[['Date', 'Rainfall_mm_day']].copy()
    recent_30['Date'] = recent_30['Date'].dt.strftime('%b %d')
    
    flood_days = full_df[full_df['Flood_Risk_Label'] == 1]
    hist_floods = flood_days[['Date', 'Rainfall_mm_day']].tail(20).copy()
    hist_floods['Date'] = hist_floods['Date'].dt.strftime('%Y-%m-%d')
    hist_floods_list = hist_floods.to_dict(orient='records')[::-1]
    
    return {
        "graph_data": recent_30.to_dict(orient='records'),
        "historical_floods": hist_floods_list,
        "last_updated": full_df['Date'].max().strftime('%Y-%m-%d')
    }

@app.get("/api/forecast")
def get_forecast():
    url = "https://api.open-meteo.com/v1/forecast?latitude=13.0827&longitude=80.2707&daily=precipitation_sum&timezone=auto"
    res = requests.get(url)
    if res.status_code != 200:
        return {"error": "Failed to fetch weather forecast"}
    
    data = res.json()
    forecast_dates = pd.to_datetime(data['daily']['time'])
    forecast_rain = data['daily']['precipitation_sum']
    
    last_7_rain = full_df['Rainfall_mm_day'].tail(7).tolist()
    forecast_results = []
    
    for i in range(len(forecast_dates)):
        current_date = forecast_dates[i]
        date_str = current_date.strftime('%Y-%m-%d')
        predicted_rain = forecast_rain[i] if forecast_rain[i] is not None else 0.0
        
        # Prepare feature vector
        feats_vals = last_7_rain[::-1] # lags 1-7
        rolling_3 = np.sum(last_7_rain[-3:])
        rolling_7 = np.sum(last_7_rain)
        trend = feats_vals[0] - feats_vals[1]
        
        month = current_date.month
        m_sin = np.sin(2 * np.pi * month / 12)
        m_cos = np.cos(2 * np.pi * month / 12)
        
        input_row = feats_vals + [rolling_3, rolling_7, trend, m_sin, m_cos]
        X_input = pd.DataFrame([input_row], columns=features)
        
        prob = model_classifier.predict_proba(X_input)[0][1]
        
        if prob > 0.5: risk_level = "HIGH"
        elif prob > 0.2: risk_level = "MODERATE"
        else: risk_level = "LOW"
            
        forecast_results.append({
            "date": date_str,
            "rainfall_mm": predicted_rain,
            "flood_probability": round(prob * 100, 1),
            "risk_level": risk_level
        })
        
        last_7_rain.pop(0)
        last_7_rain.append(predicted_rain)
        
    return {"forecast": forecast_results}

@app.get("/api/test_forecast")
def test_forecast(start_date: str):
    """
    Takes a start_date (YYYY-MM-DD), predicts 7 days sequentially using the ML Regressor,
    and compares them to the actual next 7 days in the database.
    """
    try:
        target_ts = pd.to_datetime(start_date)
    except:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    
    match_idx = full_df[full_df['Date'] == target_ts].index
    if len(match_idx) == 0:
        raise HTTPException(status_code=404, detail="Date not found in historical record.")
        
    idx = match_idx[0]
    if idx < 7 or idx + 7 > len(full_df):
        raise HTTPException(status_code=400, detail="Insufficient data before or after this date to run a 7-day test.")
        
    # Actual next 7 days
    actual_slice = full_df.iloc[idx:idx+7]
    actual_values = actual_slice['Rainfall_mm_day'].tolist()
    dates = actual_slice['Date'].dt.strftime('%b %d').tolist()
    
    # We predict the 7 days autoregressively.
    # Start with the 7 days BEFORE the target date.
    last_7_rain = full_df['Rainfall_mm_day'].iloc[idx-7:idx].tolist()
    
    predicted_values = []
    
    for i in range(7):
        current_date = target_ts + timedelta(days=i)
        
        feats_vals = last_7_rain[::-1]
        rolling_3 = np.sum(last_7_rain[-3:])
        rolling_7 = np.sum(last_7_rain)
        trend = feats_vals[0] - feats_vals[1]
        
        month = current_date.month
        m_sin = np.sin(2 * np.pi * month / 12)
        m_cos = np.cos(2 * np.pi * month / 12)
        
        input_row = feats_vals + [rolling_3, rolling_7, trend, m_sin, m_cos]
        X_input = pd.DataFrame([input_row], columns=features)
        
        pred = model_regressor.predict(X_input)[0]
        # Clip to 0 since rainfall cannot be negative
        pred = max(0.0, float(pred))
        
        predicted_values.append(round(float(pred), 2))
        
        # update sliding window
        last_7_rain.pop(0)
        last_7_rain.append(pred)
        
    # Compute accuracy score roughly based on MAE
    mae = mean_absolute_error(actual_values, predicted_values)
    # Refined score: 100 - (MAE / mean_actual * 50). More balanced for extremes.
    mean_val = max(10, np.mean(actual_values))
    acc_score = max(0.0, min(100.0, 100.0 - (mae / mean_val) * 70.0))
    
    graph_out = []
    for d, act, pred in zip(dates, actual_values, predicted_values):
        graph_out.append({"date": d, "actual": act, "predicted": pred})
        
    return {
        "start_date": start_date,
        "accuracy_score": round(acc_score, 1),
        "mae": round(mae, 2),
        "graph": graph_out
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
