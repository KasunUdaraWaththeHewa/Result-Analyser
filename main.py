import pandas as pd
from scraper.login import login
from scraper.fetch_results import get_results_html
from scraper.parse_results import parse_student_results
from scraper.save_to_excel import save_results
import os

def main():
    os.makedirs("data/results", exist_ok=True)

    # Read NIC as string (important for preserving full digits and non-numeric suffixes)
    df = pd.read_excel("data/creditionals.xlsx", dtype={"NIC": str, "Index": str})
    for _, row in df.iterrows():
        index_no = row["Index"].strip()
        nic = str(row["NIC"]).strip()
        print("index_no", index_no)
        print("nic", nic)
        try:
            html = login(index_no, nic)
            name, idx, result_data = parse_student_results(html)
            save_results(name, idx, result_data)
        except Exception as e:
            print(f"Error for hi {index_no}: {e}")

if __name__ == "__main__":
    main()
