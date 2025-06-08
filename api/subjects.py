from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os

router = APIRouter()

SUBJECTS_DIR = "data/summary/subjects/"

@router.get("/")
def list_subjects():
    files = [f for f in os.listdir(SUBJECTS_DIR) if f.endswith(".xlsx")]
    subjects = [os.path.splitext(f)[0] for f in files]
    return {"subjects": subjects}

@router.get("/{subject_code}")
def get_subject_summary(subject_code: str):
    # You could read the Excel here and return JSON summary if needed
    filepath = os.path.join(SUBJECTS_DIR, f"{subject_code}.xlsx")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Subject not found")
    # For simplicity, just return available metadata here
    return {"subject": subject_code, "file": f"/subjects/{subject_code}/download"}

@router.get("/{subject_code}/download")
def download_subject_excel(subject_code: str):
    filepath = os.path.join(SUBJECTS_DIR, f"{subject_code}.xlsx")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Subject summary not found")
    return FileResponse(filepath, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        filename=f"{subject_code}.xlsx")
