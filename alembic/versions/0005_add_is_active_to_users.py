"""add is_active to users

Revision ID: 0005_add_is_active_to_users
Revises: 0004_add_taskid_to_donations
Create Date: 2026-07-20
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0005_add_is_active_to_users'
down_revision = '0004_add_taskid_to_donations'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('is_active', sa.Integer(), nullable=True, server_default='1'))


def downgrade():
    op.drop_column('users', 'is_active')
