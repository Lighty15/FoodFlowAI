"""Seed the database with sample data for development/testing."""

from backend.app.db.session import SessionLocal, engine
from backend.app.db.base import Base
from backend.app.db import models
from sqlalchemy.orm import Session
from backend.app.services.auth_service import get_password_hash


def seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # NGOs
        ngos = [
            models.NGO(ngo_name='HelpingHands', location='Chennai', status='available'),
            models.NGO(ngo_name='FoodForAll', location='Chennai', status='available'),
            models.NGO(ngo_name='CareNGO', location='Bangalore', status='available')
        ]
        db.add_all(ngos)

        # Volunteers
        vols = [
            models.Volunteer(volunteer_name='Ravi', location='Chennai', status='free'),
            models.Volunteer(volunteer_name='Anita', location='Chennai', status='free'),
            models.Volunteer(volunteer_name='Suresh', location='Bangalore', status='free')
        ]
        db.add_all(vols)

        # Users
        users = [
            models.User(username='admin', hashed_password=get_password_hash('adminpass'), role='admin', is_active=1),
            models.User(username='ngo_user', hashed_password=get_password_hash('ngopass'), role='ngo', is_active=1),
            models.User(username='donor1', hashed_password=get_password_hash('donorpass'), role='donor', is_active=1),
            models.User(username='vol1', hashed_password=get_password_hash('volpass'), role='volunteer', is_active=1)
        ]
        db.add_all(users)
        db.commit()

        # refresh to get IDs
        for u in users:
            db.refresh(u)
        for n in ngos:
            db.refresh(n)
        for v in vols:
            db.refresh(v)

        # link ngo_user to first NGO and vol1 to first volunteer
        users[1].ngo_id = ngos[0].id
        users[3].volunteer_id = vols[0].id
        db.add_all(users)
        db.commit()

        # Donations (assign one to donor1)
        donations = [
            models.Donation(donor_name='ABC Hotel', food_name='Veg Biryani', quantity=20, location='Chennai', expiry_hours=4, status='new', owner_id=users[2].id),
            models.Donation(donor_name='XYZ Caterers', food_name='Sandwiches', quantity=50, location='Chennai', expiry_hours=8, status='new', owner_id=None),
            models.Donation(donor_name='Grand Cafe', food_name='Salads', quantity=10, location='Bangalore', expiry_hours=24, status='new', owner_id=None)
        ]
        db.add_all(donations)
        db.commit()

        # Refresh and create an example assignment
        db.refresh(donations[0])
        db.refresh(ngos[0])
        db.refresh(vols[0])

        assign = models.Assignment(donation_id=donations[0].id, ngo_id=ngos[0].id, volunteer_id=vols[0].id, status='assigned')
        db.add(assign)
        db.commit()

        print('Seeding complete')
    finally:
        db.close()


if __name__ == '__main__':
    seed()
