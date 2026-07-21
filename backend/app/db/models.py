from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from backend.app.db.base import Base


class Donation(Base):
    __tablename__ = 'donations'
    id = Column(Integer, primary_key=True, index=True)
    donor_name = Column(String, nullable=False)
    food_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    location = Column(String, nullable=False)
    expiry_hours = Column(Integer, nullable=False)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    task_id = Column(String, nullable=True, index=True)
    status = Column(String, default='new')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DonationAI(Base):
    __tablename__ = 'donation_ai'
    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey('donations.id'))
    validation_status = Column(String)
    validation_reason = Column(String)
    priority_level = Column(String)
    priority_reason = Column(String)
    ai_metadata = Column(JSON)


class NGO(Base):
    __tablename__ = 'ngos'
    id = Column(Integer, primary_key=True, index=True)
    ngo_name = Column(String, nullable=False)
    location = Column(String)
    status = Column(String, default='available')


class Volunteer(Base):
    __tablename__ = 'volunteers'
    id = Column(Integer, primary_key=True, index=True)
    volunteer_name = Column(String, nullable=False)
    location = Column(String)
    status = Column(String, default='free')


class Assignment(Base):
    __tablename__ = 'assignments'
    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey('donations.id'))
    ngo_id = Column(Integer, ForeignKey('ngos.id'))
    volunteer_id = Column(Integer, ForeignKey('volunteers.id'))
    status = Column(String)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey('donations.id'))
    node_name = Column(String)
    input = Column(JSON)
    output = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default='user')
    ngo_id = Column(Integer, ForeignKey('ngos.id'), nullable=True)
    volunteer_id = Column(Integer, ForeignKey('volunteers.id'), nullable=True)
    is_active = Column(Integer, default=1)
