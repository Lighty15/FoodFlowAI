"""initial migration

Revision ID: 0001_initial
Revises: 
Create Date: 2026-07-20
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'donations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('donor_name', sa.String(), nullable=False),
        sa.Column('food_name', sa.String(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('location', sa.String(), nullable=False),
        sa.Column('expiry_hours', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True)
    )

    op.create_table(
        'ngos',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('ngo_name', sa.String(), nullable=False),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True, server_default='available')
    )

    op.create_table(
        'volunteers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('volunteer_name', sa.String(), nullable=False),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True, server_default='free')
    )

    op.create_table(
        'donation_ai',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('donation_id', sa.Integer(), sa.ForeignKey('donations.id')),
        sa.Column('validation_status', sa.String(), nullable=True),
        sa.Column('validation_reason', sa.String(), nullable=True),
        sa.Column('priority_level', sa.String(), nullable=True),
        sa.Column('priority_reason', sa.String(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True)
    )

    op.create_table(
        'assignments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('donation_id', sa.Integer(), sa.ForeignKey('donations.id')),
        sa.Column('ngo_id', sa.Integer(), sa.ForeignKey('ngos.id')),
        sa.Column('volunteer_id', sa.Integer(), sa.ForeignKey('volunteers.id')),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('donation_id', sa.Integer(), sa.ForeignKey('donations.id')),
        sa.Column('node_name', sa.String(), nullable=True),
        sa.Column('input', sa.JSON(), nullable=True),
        sa.Column('output', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.func.now())
    )

    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('username', sa.String(), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=True)
    )


def downgrade():
    op.drop_table('users')
    op.drop_table('audit_logs')
    op.drop_table('assignments')
    op.drop_table('donation_ai')
    op.drop_table('volunteers')
    op.drop_table('ngos')
    op.drop_table('donations')
