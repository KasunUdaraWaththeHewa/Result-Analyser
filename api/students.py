from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import List
import pandas as pd
from api.utils import load_student_results
import os

router = APIRouter()
STUDENT_RESULTS_DIR = "data/results/"

@router.get("/{index_number}")
def get_student_results(index_number: str):
    """
    Fetch student's subject results as JSON.
    """
    try:
        df = load_student_results(index_number)
        # Convert to dict for JSON response
        results = df.to_dict(orient="records")
        return {"index_number": index_number, "results": results}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Student results not found")

@router.get("/{index_number}/download")
def download_student_results(index_number: str):
    """
    Download the student's Excel file.
    """
    filepath = os.path.join(STUDENT_RESULTS_DIR, f"{index_number}.xlsx")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Student results not found")
    return FileResponse(
        filepath,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=f"{index_number}.xlsx",
    )


# No need since the table
@router.get("/{index_number}/subject/{subject_code}")
def get_student_subject_result(index_number: str, subject_code: str):
    """
    Fetch the result of a particular subject for the given student.
    """
    try:
        df = load_student_results(index_number)
        # Normalize subject codes for comparison (you can reuse your normalize function)
        subject_code = subject_code.strip().upper()
        df["NormalizedSubject"] = df["Subject"].astype(str).str.strip().str.upper()
        filtered = df[df["NormalizedSubject"] == subject_code]

        if filtered.empty:
            raise HTTPException(status_code=404, detail="Subject result not found for this student")

        results = filtered.to_dict(orient="records")
        return {"index_number": index_number, "subject_code": subject_code, "results": results}

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Student results not found")

