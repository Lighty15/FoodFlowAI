"""add task_id to donations

Revision ID: 0004_add_taskid_to_donations
Revises: 0003_add_user_links
Create Date: 2026-07-20
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0004_add_taskid_to_donations'
down_revision = '0003_add_user_links'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('donations', sa.Column('task_id', sa.String(), nullable=True))
    op.create_index('ix_donations_task_id', 'donations', ['task_id'])


def downgrade():
    op.drop_index('ix_donations_task_id', table_name='donations')
    op.drop_column('donations', 'task_id')
