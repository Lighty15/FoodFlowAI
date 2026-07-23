import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db.base import Base


def get_database_url():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        sqlite_path = Path(__file__).resolve().parents[3] / 'dev.db'
        database_url = f'sqlite:///{sqlite_path}'

    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    return database_url


def get_engine():
    database_url = get_database_url()
    connect_args = {}
    if database_url.startswith('sqlite'):
        connect_args['check_same_thread'] = False
    return create_engine(
        database_url,
        connect_args=connect_args,
        pool_pre_ping=True,
    )


engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def initialize_database():
    from alembic import command
    from alembic.config import Config

    config = Config(Path(__file__).resolve().parents[3] / 'alembic.ini')
    config.set_main_option('sqlalchemy.url', get_database_url())

    try:
        command.upgrade(config, 'head')
    except Exception as exc:
        print(f'Alembic initialization skipped, falling back to metadata create_all: {exc}')
        Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
