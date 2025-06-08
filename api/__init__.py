from fastapi import APIRouter

router = APIRouter()

from . import subjects, students, summery

router.include_router(subjects.router, prefix="/subjects", tags=["Subjects"])
router.include_router(students.router, prefix="/students", tags=["Students"])
router.include_router(summery.router, prefix="/summary", tags=["Summary"])
