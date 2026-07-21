"""add ngo_id and volunteer_id to users

Revision ID: 0003_add_user_links
Revises: 0002_add_owner_to_donations
Create Date: 2026-07-20
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003_add_user_links'
down_revision = '0002_add_owner_to_donations'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('ngo_id', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('volunteer_id', sa.Integer(), nullable=True))
    # op.create_foreign_key('fk_users_ngo', 'users', 'ngos', ['ngo_id'], ['id'])
    # op.create_foreign_key('fk_users_volunteer', 'users', 'volunteers', ['volunteer_id'], ['id'])


def downgrade():
    # op.drop_constraint('fk_users_volunteer', 'users', type_='foreignkey')
    # op.drop_constraint('fk_users_ngo', 'users', type_='foreignkey')
    op.drop_column('users', 'volunteer_id')
    op.drop_column('users', 'ngo_id')
