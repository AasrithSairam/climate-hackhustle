# Cell 1
# df.head() # Note: df is not defined yet in the notebook's linear order

# Cell 2
# print(df.columns)

# Cell 3
import pandas as pd

df = pd.read_excel("data/chennai_rainfall_data.xlsx")

df['flood_label'] = 0

for i in range(len(df)-2):

    if (df['Rainfall_mm_day'][i] >= 50 and
        df['Rainfall_mm_day'][i+1] >= 50 and
        df['Rainfall_mm_day'][i+2] >= 50):

        df.loc[i:i+2, 'flood_label'] = 1

print(df.head())

# Cell 4
df.to_csv("rainfall_labeled.csv", index=False)

# Cell 5
print(df['Rainfall_mm_day'].max())

# Cell 6
print(df.dtypes)

# Cell 7
print(df[df['Rainfall_mm_day'] >= 50])

# Cell 8
for i in range(len(df)-2):

    if (df['Rainfall_mm_day'][i] >= 50 and
        df['Rainfall_mm_day'][i+1] >= 50 and
        df['Rainfall_mm_day'][i+2] >= 50):

        print("Flood condition at index:", i)

        df.loc[i:i+2,'label'] = 1

# Cell 9
import pandas as pd

# Load dataset
df = pd.read_excel("data/chennai_rainfall_data.xlsx")

# Convert date column if needed
df['Date'] = pd.to_datetime(df['Date'])

# Create rolling rainfall totals
df['Rolling_3Day'] = df['Rainfall_mm_day'].rolling(window=3).sum()
df['Rolling_5Day'] = df['Rainfall_mm_day'].rolling(window=5).sum()

# Flood conditions
cond_1_day = df['Rainfall_mm_day'] > 100
cond_3_day = df['Rolling_3Day'] > 150
cond_5_day = df['Rolling_5Day'] > 200

# Combine all conditions
flood_dates = df[cond_1_day | cond_3_day | cond_5_day]

# Show flood dates
print(flood_dates[['Date','Rainfall_mm_day','Rolling_3Day','Rolling_5Day']])

# Cell 10
import pandas as pd

# Load dataset
df = pd.read_excel("data/chennai_rainfall_data.xlsx")

# Convert date column
df['Date'] = pd.to_datetime(df['Date'])

# Calculate rolling rainfall totals
df['Rolling_3Day'] = df['Rainfall_mm_day'].rolling(window=3).sum()
df['Rolling_5Day'] = df['Rainfall_mm_day'].rolling(window=5).sum()

# Flood conditions
cond_1 = df['Rainfall_mm_day'] > 100
cond_2 = df['Rolling_3Day'] > 150
cond_3 = df['Rolling_5Day'] > 200

# Create Flood_Risk column
df['Flood_Risk'] = (cond_1 | cond_2 | cond_3)

# Convert True/False to Yes/No
df['Flood_Risk'] = df['Flood_Risk'].map({True: 'Yes', False: 'No'})

# Display result
print(df[['Date','Rainfall_mm_day','Rolling_3Day','Rolling_5Day','Flood_Risk']])

# Cell 11
df.to_csv("floodrisk.csv",index=False)

# Cell 12
flood_days=df[df['Flood_Risk']=='Yes']
print(flood_days)
