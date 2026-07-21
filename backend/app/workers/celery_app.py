import os
from celery import Celery

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

celery_app = Celery('foodflow', broker=REDIS_URL, backend=REDIS_URL)
celery_app.conf.task_always_eager = os.environ.get('CELERY_TASK_ALWAYS_EAGER', '1').lower() in ('1', 'true', 'yes')
celery_app.conf.task_store_eager_result = True
