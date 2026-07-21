"""add ai_metadata to donation_ai

Revision ID: 0006_add_ai_metadata_to_donation_ai
Revises: 0005_add_is_active_to_users
Create Date: 2026-07-21
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0006_add_ai_metadata_to_donation_ai'
down_revision = '0005_add_is_active_to_users'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [column['name'] for column in inspector.get_columns('donation_ai')]
    if 'ai_metadata' not in columns:
        op.add_column('donation_ai', sa.Column('ai_metadata', sa.JSON(), nullable=True))


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [column['name'] for column in inspector.get_columns('donation_ai')]
    if 'ai_metadata' in columns:
        op.drop_column('donation_ai', 'ai_metadata')
