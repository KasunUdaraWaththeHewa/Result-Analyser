import pandas as pd
import os
import re

# === Grade to GPA mapping ===
grade_points = {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0,
    "E": 0.0, "F": 0.0, "NC": 0.0
}

# === Non-credit/invalid grades to exclude from GPA calculation but count MCs ===
exclude_results = {"CM", "MC", "EC", "CN", "WH", "NC"}

# === Normalize subject code ===
def normalize_subject_code(code):
    return re.sub(r"\s+", "", str(code)).strip().upper()


def get_semester(subject_code):
    subject_code = normalize_subject_code(subject_code)
    match = re.search(r'SCS(\d{4})', subject_code)
    if not match:
        return "Unknown"
    num = int(match.group(1))

    if 1201 <= num <= 1207:
        return "Y1S1"
    elif 1208 <= num <= 1214:
        return "Y1S2"
    elif 2201 <= num <= 2208:
        return "Y2S1"
    elif 2209 <= num <= 2214:
        return "Y2S2"
    elif 3200 <= num <= 3299:
        return "Y3S1"
    else:
        return "Unknown"


def sanitize_results(df):
    df = df[df["Credits"] > 0].copy()
    df["Result"] = df["Result"].astype(str).str.strip().str.upper()
    df["Subject"] = df["Subject"].apply(normalize_subject_code)
    df["GradePoint"] = df["Result"].map(grade_points)

    # Exclude for GPA (but keep for MC counting)
    df_valid = df[~df["Result"].isin(exclude_results)].copy()

    # Mark subjects with multiple attempts
    repeat_flags = df_valid["Subject"].duplicated(keep=False)
    df_valid["IsRepeat"] = repeat_flags

    # Sort so best grade comes first
    df_valid = df_valid.sort_values(by=["Subject", "GradePoint"], ascending=[True, False])

    # Deduplicate by subject — keep best grade
    df_gpa = df_valid.drop_duplicates(subset="Subject", keep="first").copy()

    # Cap grade point at C+ (2.3) if it's a repeat AND better than C+
    df_gpa["CappedGradePoint"] = df_gpa.apply(
        lambda row: min(row["GradePoint"], 2.3) if row["IsRepeat"] and row["GradePoint"] > 2.3 else row["GradePoint"],
        axis=1
    )

    # Assign semester after deduplication
    df_gpa["Semester"] = df_gpa["Subject"].apply(get_semester)

    # Full list with all results (for MC/CM handling)
    df_all = df.copy()
    df_all["Semester"] = df_all["Subject"].apply(get_semester)

    return df_all, df_gpa


def calculate_gpa(df, use_capped=True):
    if df.empty:
        return 0.0
    gp_col = "CappedGradePoint" if use_capped and "CappedGradePoint" in df.columns else "GradePoint"
    df = df.copy()
    df["Weighted"] = df["Credits"] * df[gp_col]
    total_credits = df["Credits"].sum()
    if total_credits == 0:
        return 0.0
    return round(df["Weighted"].sum() / total_credits, 4)

def process_student(file_path):
    df = pd.read_excel(file_path)
    df_all, df_gpa = sanitize_results(df)
    df_gpa["Semester"] = df_gpa["Subject"].apply(get_semester)
    df_all["Semester"] = df_all["Subject"].apply(get_semester)

    sem_gpas = {}
    for sem in ["Y1S1", "Y1S2", "Y2S1", "Y2S2", "Y3S1"]:
        sem_df = df_gpa[df_gpa["Semester"] == sem]
        sem_gpas[sem] = calculate_gpa(sem_df, use_capped=False)

    # Final GPA includes all grades except excluded
    final_gpa = calculate_gpa(df_gpa, use_capped=True)

    # Count total MC (and CM) credits
    mc_df = df_all[df_all["Result"].isin({"MC", "CM"})]
    total_mc_credits = mc_df["Credits"].sum()

    index = os.path.splitext(os.path.basename(file_path))[0]

    return {
        "Index": index,
        **sem_gpas,
        "FinalGPA": final_gpa,
        "TotalMC": total_mc_credits
    }

# === Process all students ===
folder = "data/results/"
all_students = []

for filename in os.listdir(folder):
    if filename.endswith(".xlsx") and not filename.startswith("~$"):
        path = os.path.join(folder, filename)
        try:
            result = process_student(path)
            all_students.append(result)
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")

# === Export to Excel ===
summary_df = pd.DataFrame(all_students)
summary_df = summary_df.sort_values(by="FinalGPA", ascending=False)

output_path = "data/summary/GPA_Summary.xlsx"
os.makedirs(os.path.dirname(output_path), exist_ok=True)
summary_df.to_excel(output_path, index=False)

print(f"✅ GPA summary saved to {output_path}")
