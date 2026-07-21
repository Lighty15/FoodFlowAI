"""Run Alembic migrations to create/update the database schema."""
from alembic import command
from alembic.config import Config
import os


def upgrade_head():
    here = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    cfg_path = os.path.join(here, 'alembic.ini')
    cfg = Config(cfg_path)
    command.upgrade(cfg, 'head')


if __name__ == '__main__':
    upgrade_head()
    print('Database upgraded to head via Alembic')
