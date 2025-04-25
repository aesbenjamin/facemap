# Facial Analysis System

A web application that analyzes facial features, microexpressions, and generates personality reports based on facial analysis.

## Features
- Upload and analyze facial images
- Detect facial landmarks and measure distances
- Analyze microexpressions
- Generate personality reports

## Tech Stack
- Frontend: React + TypeScript + Material-UI
- Backend: FastAPI + OpenCV + dlib + ML libraries

## Setup Instructions

### Backend Setup
1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the backend server:
```bash
uvicorn backend.main:app --reload
```

### Frontend Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm start
```

## Project Structure
```
.
├── backend/           # FastAPI backend
├── frontend/          # React frontend
└── README.md
``` 