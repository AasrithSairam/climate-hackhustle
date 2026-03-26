import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

print("Loading dataset...")
df = pd.read_excel("data/chennai_rainfall_data.xlsx")
df['Date'] = pd.to_datetime(df['Date'])
df = df.sort_values('Date').reset_index(drop=True)

print(f"Data shape: {df.shape}")

# Create lag features (last 7 days of rainfall)
for i in range(1, 8):
    df[f'lag_{i}'] = df['Rainfall_mm_day'].shift(i)

df_clean = df.dropna().reset_index(drop=True)

features = [f'lag_{i}' for i in range(1, 8)]
X = df_clean[features]
y = df_clean['Rainfall_mm_day']

train_size = int(len(df_clean) * 0.8)
X_train, X_test = X.iloc[:train_size], X.iloc[train_size:]
y_train, y_test = y.iloc[:train_size], y.iloc[train_size:]

print(f"Training on {len(X_train)} historical samples...")
print(f"Testing on {len(X_test)} historical samples...")

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)

last_7_days = df['Rainfall_mm_day'].iloc[-7:].values[::-1] 
latest_df = pd.DataFrame([last_7_days], columns=features)

predicted_rainfall = model.predict(latest_df)[0]
tomorrow_date = df['Date'].iloc[-1] + pd.Timedelta(days=1)

recent_history = df['Rainfall_mm_day'].iloc[-4:].tolist()
combined_for_rolling = recent_history + [predicted_rainfall]

rolling_3_day = sum(combined_for_rolling[-3:])
rolling_5_day = sum(combined_for_rolling[-5:])

cond1 = predicted_rainfall > 100
cond2 = rolling_3_day > 150
cond3 = rolling_5_day > 200

flood_risk = "YES" if (cond1 or cond2 or cond3) else "NO"

output_text = f"""--- Model Evaluation on Test Set ---
RMSE (Root Mean Squared Error): {rmse:.2f} mm
MAE (Mean Absolute Error): {mae:.2f} mm

--- Forecast for Tomorrow ({tomorrow_date.strftime('%Y-%m-%d')}) ---
Predicted Rainfall for Tomorrow: {predicted_rainfall:.2f} mm

--- Flood Risk Assessment ---
Rolling 3-day sum (including tomorrow): {rolling_3_day:.2f} mm
Rolling 5-day sum (including tomorrow): {rolling_5_day:.2f} mm
FLOOD RISK FOR TOMORROW: {flood_risk}
"""
print(output_text)

with open("metrics.txt", "w") as f:
    f.write(output_text)
