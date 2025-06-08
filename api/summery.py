from fastapi import APIRouter, HTTPException
from api.utils import load_gpa_summary, load_medical_credits_summary, load_subject_difficulty_summary
from fastapi import Query

router = APIRouter()

@router.get("/students/gpa-summary")
def get_gpa_summary():
    """
    Return student GPA summaries including yearly semester GPAs, final GPA, total MCs, and ranks.
    """
    df = load_gpa_summary()
    return {"summary": df.to_dict(orient="records")}

@router.get("/students/gpa-summary/{index_number}")
def get_gpa_summary_for_student(index_number: str):
    """
    Return GPA summary for a specific student by index number.
    """
    df = load_gpa_summary()
    student_data = df[df["Index"].astype(str) == index_number]
    if student_data.empty:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"index_number": index_number, "summary": student_data.to_dict(orient="records")}


@router.get("/students/medical-credits")
def get_medical_credits(
        strategic_only: bool = Query(False, description="Filter to only students with StrategicUseOfMC=True")):
    """
    Return student medical credit details and strategic usage.

    - **strategic_only**: If true, return only records where StrategicUseOfMC is true.
    """
    df = load_medical_credits_summary()

    if strategic_only:
        df = df[df["StrategicUseOfMC"] == True]

    return {"summary": df.to_dict(orient="records")}

@router.get("/subjects/difficulty-summary")
def get_subject_difficulty_summary():
    """
    Return subject-wise difficulty metrics including average GPA, failure rate, and difficulty scores.
    """
    df = load_subject_difficulty_summary()
    return {"summary": df.to_dict(orient="records")}

@router.get("/subjects/difficulty-summary/{subject_code}")
def get_subject_difficulty(subject_code: str):
    """
    Return difficulty summary for a specific subject code.
    """
    df = load_subject_difficulty_summary()
    subject_data = df[df["Subject"].str.upper() == subject_code.upper()]
    if subject_data.empty:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"subject_code": subject_code, "summary": subject_data.to_dict(orient="records")}
