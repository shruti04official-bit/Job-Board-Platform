from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber

app = FastAPI()

# Enable CORS so frontend can access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with your frontend URL
    allow_methods=["*"],
    allow_headers=["*"]
)

# In-memory "database" for hackathon speed
jobs = [
    {
        "id": 1,
        "title": "Software Developer",
        "company": "TechNova",
        "location": "Remote",
        "skills": ["python", "javascript", "react"],
        "applied": 0
    },
    {
        "id": 2,
        "title": "Data Scientist",
        "company": "DataCore",
        "location": "Bangalore",
        "skills": ["python", "machine learning", "pandas"],
        "applied": 0
    }
]

# Pydantic model for new job
class Job(BaseModel):
    title: str
    company: str
    location: str
    skills: str  # comma-separated string

# ---------------------- API ENDPOINTS ----------------------

# Get all jobs
@app.get("/jobs")
def get_jobs():
    return jobs

# Add a new job
@app.post("/jobs")
def add_job(job: Job):
    new_job = {
        "id": len(jobs) + 1,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "skills": [s.strip().lower() for s in job.skills.split(",")],
        "applied": 0
    }
    jobs.append(new_job)
    return {"status": "success", "job": new_job}

# Apply to a job
@app.post("/jobs/{job_id}/apply")
def apply_job(job_id: int):
    for job in jobs:
        if job["id"] == job_id:
            job["applied"] += 1
            return {"status": "applied", "job": job["title"]}
    return {"error": "Job not found"}

# ATS / AI Resume Match
@app.post("/match")
async def match_resume(file: UploadFile = File(...)):
    text = ""
    # Extract text from PDF
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text

    text = text.lower()
    matched_jobs = []

    for job in jobs:
        skills = job["skills"]
        match_count = sum(1 for skill in skills if skill in text)
        match_percent = round((match_count / len(skills)) * 100) if skills else 0
        matched_jobs.append({
            "job_id": job["id"],
            "title": job["title"],
            "company": job["company"],
            "match_score": match_percent
        })

    return matched_jobs