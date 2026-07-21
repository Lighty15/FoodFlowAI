"""add owner_id to donations

Revision ID: 0002_add_owner_to_donations
Revises: 0001_initial
Create Date: 2026-07-20
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_add_owner_to_donations'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('donations', sa.Column('owner_id', sa.Integer(), nullable=True))
    # op.create_foreign_key('fk_donations_owner_users', 'donations', 'users', ['owner_id'], ['id'])


def downgrade():
    # op.drop_constraint('fk_donations_owner_users', 'donations', type_='foreignkey')
    op.drop_column('donations', 'owner_id')
