# FoodFlowAI

AI-powered Food Donation Management System using FastAPI, React, LangGraph, Celery, and Groq LLM.

## Features

- AI-based food validation
- Priority assessment
- NGO matching
- Volunteer assignment
- Admin dashboard
- Donor dashboard
- NGO dashboard
- Volunteer dashboard
- LangGraph workflow
- JWT Authentication

## Tech Stack

- React + Vite + Tailwind CSS
- FastAPI
- SQLite
- SQLAlchemy
- Celery
- Redis
- LangGraph
- Groq LLM

## Installation

### Backend

```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

### Celery

```bash
celery -A backend.app.workers.celery_app.celery_app worker --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## AI Workflow

Donation
↓
Validation Agent
↓
Priority Agent
↓
NGO Matching Agent
↓
Volunteer Assignment Agent
↓
Final Report
