from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.services.auth_service import get_db, require_role
from backend.app.db import models

router = APIRouter()


class UserUpdate(BaseModel):
    role: Optional[str]
    is_active: Optional[bool]
    ngo_id: Optional[int]
    volunteer_id: Optional[int]


class NGOIn(BaseModel):
    ngo_name: str
    location: Optional[str]
    status: Optional[str] = 'available'


class VolunteerIn(BaseModel):
    volunteer_name: str
    location: Optional[str]
    status: Optional[str] = 'free'


class EnableIn(BaseModel):
    is_active: bool


@router.get('/users')
def get_users(page: int = 1, limit: int = 50, role: Optional[str] = None, active: Optional[int] = None, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    q = db.query(models.User)
    if role:
        q = q.filter(models.User.role == role)
    if active is not None:
        q = q.filter(models.User.is_active == (1 if active else 0))
    total = q.count()
    items = q.offset((page-1)*limit).limit(limit).all()
    result = []
    for u in items:
        result.append({'id': u.id, 'username': u.username, 'role': u.role, 'is_active': bool(u.is_active), 'ngo_id': u.ngo_id, 'volunteer_id': u.volunteer_id})
    return {'items': result, 'total': total}


@router.get('/users/{user_id}')
def get_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail='User not found')
    return {'id': u.id, 'username': u.username, 'role': u.role, 'is_active': bool(u.is_active), 'ngo_id': u.ngo_id, 'volunteer_id': u.volunteer_id}


@router.put('/users/{user_id}')
def update_user(user_id: int, body: UserUpdate, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail='User not found')
    if body.role:
        u.role = body.role
    if body.is_active is not None:
        u.is_active = 1 if body.is_active else 0
    if body.ngo_id is not None:
        u.ngo_id = body.ngo_id
    if body.volunteer_id is not None:
        u.volunteer_id = body.volunteer_id
    db.add(u)
    db.commit()
    db.refresh(u)
    return {'id': u.id, 'username': u.username, 'role': u.role, 'is_active': bool(u.is_active)}


@router.patch('/users/{user_id}/enable')
def enable_user(user_id: int, body: EnableIn, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail='User not found')
    u.is_active = 1 if body.is_active else 0
    db.add(u)
    db.commit()
    return {'id': u.id, 'is_active': bool(u.is_active)}


# NGOs
@router.get('/ngos')
def list_ngos(page: int = 1, limit: int = 50, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    q = db.query(models.NGO)
    total = q.count()
    items = q.offset((page-1)*limit).limit(limit).all()
    result = [{'id': n.id, 'ngo_name': n.ngo_name, 'location': n.location, 'status': n.status} for n in items]
    return {'items': result, 'total': total}


@router.post('/ngos')
def create_ngo(body: NGOIn, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    n = models.NGO(ngo_name=body.ngo_name, location=body.location, status=body.status)
    db.add(n)
    db.commit()
    db.refresh(n)
    return {'id': n.id, 'ngo_name': n.ngo_name}


@router.get('/ngos/{ngo_id}')
def get_ngo(ngo_id: int, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    n = db.query(models.NGO).filter(models.NGO.id == ngo_id).first()
    if not n:
        raise HTTPException(status_code=404, detail='NGO not found')
    return {'id': n.id, 'ngo_name': n.ngo_name, 'location': n.location, 'status': n.status}


@router.put('/ngos/{ngo_id}')
def update_ngo(ngo_id: int, body: NGOIn, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    n = db.query(models.NGO).filter(models.NGO.id == ngo_id).first()
    if not n:
        raise HTTPException(status_code=404, detail='NGO not found')
    n.ngo_name = body.ngo_name
    n.location = body.location
    n.status = body.status
    db.add(n)
    db.commit()
    return {'id': n.id, 'ngo_name': n.ngo_name}


@router.delete('/ngos/{ngo_id}')
def delete_ngo(ngo_id: int, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    n = db.query(models.NGO).filter(models.NGO.id == ngo_id).first()
    if not n:
        raise HTTPException(status_code=404, detail='NGO not found')
    db.delete(n)
    db.commit()
    return {'success': True}


# Volunteers
@router.get('/volunteers')
def list_volunteers(page: int = 1, limit: int = 50, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    q = db.query(models.Volunteer)
    total = q.count()
    items = q.offset((page-1)*limit).limit(limit).all()
    result = [{'id': v.id, 'volunteer_name': v.volunteer_name, 'location': v.location, 'status': v.status} for v in items]
    return {'items': result, 'total': total}


@router.post('/volunteers')
def create_volunteer(body: VolunteerIn, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    v = models.Volunteer(volunteer_name=body.volunteer_name, location=body.location, status=body.status)
    db.add(v)
    db.commit()
    db.refresh(v)
    return {'id': v.id, 'volunteer_name': v.volunteer_name}


@router.get('/volunteers/{vol_id}')
def get_volunteer(vol_id: int, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    v = db.query(models.Volunteer).filter(models.Volunteer.id == vol_id).first()
    if not v:
        raise HTTPException(status_code=404, detail='Volunteer not found')
    return {'id': v.id, 'volunteer_name': v.volunteer_name, 'location': v.location, 'status': v.status}


@router.put('/volunteers/{vol_id}')
def update_volunteer(vol_id: int, body: VolunteerIn, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    v = db.query(models.Volunteer).filter(models.Volunteer.id == vol_id).first()
    if not v:
        raise HTTPException(status_code=404, detail='Volunteer not found')
    v.volunteer_name = body.volunteer_name
    v.location = body.location
    v.status = body.status
    db.add(v)
    db.commit()
    return {'id': v.id, 'volunteer_name': v.volunteer_name}


# Donations monitoring
@router.get('/donations')
def list_donations(page: int = 1, limit: int = 50, status: Optional[str] = None, priority: Optional[str] = None, location: Optional[str] = None, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    q = db.query(models.Donation)
    if status:
        q = q.filter(models.Donation.status == status)
    if priority:
        q = q.filter(models.Donation.priority == priority)
    if location:
        q = q.filter(models.Donation.location == location)
    total = q.count()
    items = q.offset((page-1)*limit).limit(limit).all()
    result = []
    for d in items:
        # find latest assignment if any
        assign = db.query(models.Assignment).filter(models.Assignment.donation_id == d.id).order_by(models.Assignment.assigned_at.desc()).first()
        ngo_id = assign.ngo_id if assign else None
        volunteer_id = assign.volunteer_id if assign else None
        result.append({
            'id': d.id, 'donor_name': d.donor_name, 'food_name': d.food_name, 'quantity': d.quantity,
            'location': d.location, 'expiry_hours': d.expiry_hours, 'status': d.status, 'priority': getattr(d, 'priority', None),
            'ngo_id': ngo_id, 'volunteer_id': volunteer_id, 'task_id': d.task_id
        })
    return {'items': result, 'total': total}


@router.get('/donations/{donation_id}')
def get_donation_admin(donation_id: int, db: Session = Depends(get_db), _=Depends(require_role('admin'))):
    d = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not d:
        raise HTTPException(status_code=404, detail='Donation not found')
    # include basic audit logs
    logs = db.query(models.AuditLog).filter(models.AuditLog.donation_id == donation_id).order_by(models.AuditLog.timestamp.desc()).all()
    log_items = [{'node_name': l.node_name, 'input': l.input, 'output': l.output, 'timestamp': l.timestamp.isoformat()} for l in logs]
    # assignment
    assign = db.query(models.Assignment).filter(models.Assignment.donation_id == d.id).order_by(models.Assignment.assigned_at.desc()).first()
    ngo_id = assign.ngo_id if assign else None
    volunteer_id = assign.volunteer_id if assign else None
    # donation ai
    dai = db.query(models.DonationAI).filter(models.DonationAI.donation_id == d.id).first()
    priority = dai.priority_level if dai else None
    validation_status = dai.validation_status if dai else None
    return {
        'id': d.id, 'donor_name': d.donor_name, 'food_name': d.food_name, 'quantity': d.quantity,
        'location': d.location, 'expiry_hours': d.expiry_hours, 'status': d.status, 'priority': priority,
        'validation_status': validation_status, 'ngo_id': ngo_id, 'volunteer_id': volunteer_id, 'task_id': d.task_id, 'audit_logs': log_items
    }
