import pandas as pd
import os

def save_results(name, index_no, data, folder="data/results"):
    df = pd.DataFrame(data, columns=["Subject", "Year", "Semester", "Credits", "Result"])
    filename = os.path.join(folder, f"{index_no}.xlsx")
    df.to_excel(filename, index=False)
    print(f"Saved: {filename}")
