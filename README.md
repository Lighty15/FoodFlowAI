FoodFlowAI

Prototype full-stack conversion of the FoodFlowAI LangGraph notebook.

Quick start (dev):

1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

2. Run the backend:

```bash
uvicorn backend.app.main:app --reload --port 8000
```

3. Use the API `POST /api/process_from_csv` to process a donation row (see API docs at `/docs`).

Run a worker (requires Redis running at `REDIS_URL` env or default `redis://localhost:6379/0`):

```bash
celery -A backend.app.workers.celery_app.celery_app worker --loglevel=info
```

Task status API
----------------

You can check task status with:

```
GET /api/tasks/{task_id}
```

Response includes `status` (PENDING, PROCESSING, SUCCESS, FAILURE). If `SUCCESS`, result JSON will include `donation_id`, `ngo`, `volunteer`, and full workflow result.

Swagger testing flow (tasks):

1. Create a donation as a donor via `POST /api/donations` — note returned `task_id` and `donation_id`.
2. Call `GET /api/tasks/{task_id}` to poll status. When `SUCCESS`, examine returned fields.


