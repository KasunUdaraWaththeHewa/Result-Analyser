import pandas as pd
import os

# === Load the GPA summary ===
summary_path = "data/summary/GPA_Summary.xlsx"
df = pd.read_excel(summary_path)

# === Filter only the needed columns ===
columns_to_keep = ["Index", "FinalGPA", "Rank", "TotalMC"]
df_filtered = df[columns_to_keep]

# === Sort by number of medicals descending (most MCs first) ===
df_sorted = df_filtered.sort_values(by="TotalMC", ascending=False)

# === Calculate thresholds ===
gpa_threshold = df_sorted["FinalGPA"].median()
mc_threshold = df_sorted["TotalMC"].quantile(0.75)

# === Flag students possibly using MCs strategically ===
df_sorted["StrategicUseOfMC"] = (
    (df_sorted["FinalGPA"] > gpa_threshold) &
    (df_sorted["TotalMC"] >= mc_threshold)
)

# === Save to a new file ===
output_path = "data/summary/GPA_Summary_By_Medicals.xlsx"
os.makedirs(os.path.dirname(output_path), exist_ok=True)
df_sorted.to_excel(output_path, index=False)

print(f"✅ Summary with strategic MC usage insight saved to {output_path}")
