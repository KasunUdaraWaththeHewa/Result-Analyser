import os
import pandas as pd

STUDENT_RESULTS_DIR = "data/results/"
DATA_DIR = "data/summary/"

def load_student_results(index_number: str) -> pd.DataFrame:
    """
    Load the Excel file for the given student index_number.
    Returns DataFrame or raises FileNotFoundError.
    """
    filepath = os.path.join(STUDENT_RESULTS_DIR, f"{index_number}.xlsx")
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Student result file not found: {index_number}.xlsx")
    df = pd.read_excel(filepath)
    # Basic cleaning or normalization can be done here if needed
    return df

def load_gpa_summary():
    return pd.read_excel(f"{DATA_DIR}GPA_Summary.xlsx")

def load_medical_credits_summary():
    return pd.read_excel(f"{DATA_DIR}GPA_Summary_By_Medicals.xlsx")

def load_subject_difficulty_summary():
    return pd.read_excel(f"{DATA_DIR}overall_subject_summary.xlsx")