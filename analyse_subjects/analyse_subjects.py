import pandas as pd
import os
import re
from collections import defaultdict

# === Grade to GPA mapping ===
grade_points = {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0,
    "E": 0.0, "F": 0.0, "NC": 0.0
}
exclude_results = {"CM", "MC", "EC", "CN", "WH", "NC"}

def normalize_subject_code(code):
    return re.sub(r"\s+", "", str(code)).strip().upper()

def sanitize_results(df):
    df = df[df["Credits"] > 0].copy()
    df["Result"] = df["Result"].astype(str).str.strip().str.upper()
    df["OriginalSubject"] = df["Subject"]  # <-- Keep original casing
    df["Subject"] = df["Subject"].apply(normalize_subject_code)  # Normalized for grouping
    df["GradePoint"] = df["Result"].map(grade_points)
    return df

def process_all_students(folder):
    all_subject_records = []
    for filename in os.listdir(folder):
        if filename.endswith(".xlsx") and not filename.startswith("~$"):
            path = os.path.join(folder, filename)
            try:
                df = pd.read_excel(path)
                df = sanitize_results(df)
                index = os.path.splitext(os.path.basename(filename))[0]
                df["Index"] = index
                all_subject_records.append(df)
            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")
    return pd.concat(all_subject_records, ignore_index=True)

def analyze_subjects(df_all):
    grouped = df_all.groupby("OriginalSubject")
    output_dir = "data/summary/subjects/"
    os.makedirs(output_dir, exist_ok=True)

    for subject, group in grouped:
        # Only valid grade results
        valid = group[~group["Result"].isin(exclude_results)].copy()

        if valid.empty:
            continue

        avg_gpa = valid["GradePoint"].mean()
        fail_count = valid[valid["GradePoint"] == 0.0].shape[0]
        total_students = valid.shape[0]
        fail_rate = fail_count / total_students

        # Grade distribution
        grade_counts = valid["Result"].value_counts().sort_index()
        grade_df = grade_counts.rename("Count").reset_index().rename(columns={"index": "Grade"})

        # Summary info
        summary = pd.DataFrame({
            "Metric": ["Average Grade Point", "Total Students", "Failures", "Failure Rate"],
            "Value": [round(avg_gpa, 3), total_students, fail_count, round(fail_rate * 100, 2)]
        })

        # Save sheet
        writer = pd.ExcelWriter(f"{output_dir}/{subject}.xlsx", engine="xlsxwriter")
        valid[["Index", "Result", "GradePoint", "Credits"]].to_excel(writer, index=False, sheet_name="RawData")
        summary.to_excel(writer, index=False, sheet_name="Summary")
        grade_df.to_excel(writer, index=False, sheet_name="GradeDistribution")
        writer.close()

        print(f"✅ Saved analysis for subject: {subject}")

def create_overall_summary(df_all):
    output_dir = "data/summary/"
    os.makedirs(output_dir, exist_ok=True)

    grouped = df_all.groupby("OriginalSubject")

    summary_data = []

    for subject, group in grouped:
        valid = group[~group["Result"].isin(exclude_results)].copy()
        if valid.empty:
            continue

        avg_gpa = valid["GradePoint"].mean()
        fail_count = valid[valid["GradePoint"] == 0.0].shape[0]
        total_students = valid.shape[0]
        fail_rate = fail_count / total_students

        summary_data.append({
            "Subject": subject,
            "Average GPA": round(avg_gpa, 3),
            "Total Students": total_students,
            "Failures": fail_count,
            "Failure Rate (%)": round(fail_rate * 100, 2)
        })

    summary_df = pd.DataFrame(summary_data)

    # Define a difficulty score — example: lower GPA + higher fail rate means harder
    # You can tweak this formula as needed
    summary_df["Difficulty Score"] = (4 - summary_df["Average GPA"]) + summary_df["Failure Rate (%)"] / 100

    # Sort by Difficulty Score descending (hardest first)
    summary_df = summary_df.sort_values(by="Difficulty Score", ascending=False).reset_index(drop=True)

    # Save overall summary
    summary_df.to_excel(f"{output_dir}/overall_subject_summary.xlsx", index=False)

    print("✅ Saved overall subject summary with difficulty ranking.")


if __name__ == "__main__":
    folder = "data/results/"
    df_all = process_all_students(folder)
    analyze_subjects(df_all)
    create_overall_summary(df_all)
