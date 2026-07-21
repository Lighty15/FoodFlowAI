from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session

from backend.app.ai_engine import nodes
from backend.app.services import graph_service, auth_service
from backend.app.workers.tasks import process_donation_task
from backend.app.db import models

from backend.app.services.auth_service import get_db
from backend.app.workers.celery_app import celery_app
from celery.result import AsyncResult

router = APIRouter()


class CsvIndexRequest(BaseModel):
    index: int


class DonationInput(BaseModel):
    donor_name: str
    food_name: str
    quantity: int
    location: str
    expiry_hours: int


class AcceptRequest(BaseModel):
    accept: bool


class DeliveryUpdate(BaseModel):
    status: str


@router.post("/process_from_csv")
def process_from_csv(req: CsvIndexRequest, current_user: models.User = Depends(auth_service.require_role('admin'))):
    # admin only: process a CSV row by index
    try:
        state = nodes.donation_intake_from_csv(req.index)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    task = process_donation_task.delay(state)
    return {"task_id": task.id}


@router.post('/donations')
def create_donation(d: DonationInput, db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.require_role('donor'))):
    # donor (or admin) can create donation; owner set to current_user
    donation = models.Donation(
        donor_name=d.donor_name,
        food_name=d.food_name,
        quantity=d.quantity,
        location=d.location,
        expiry_hours=d.expiry_hours,
        status='new',
        owner_id=current_user.id
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)

    # enqueue processing
    state = {
        'donor_name': donation.donor_name,
        'food_name': donation.food_name,
        'quantity': donation.quantity,
        'location': donation.location,
        'expiry_hours': donation.expiry_hours,
        'donation_id': donation.id,
        'validation': '',
        'validation_reason': '',
        'priority': '',
        'priority_reason': '',
        'ngo': '',
        'volunteer': '',
        'status': ''
    }
    task = process_donation_task.delay(state)
    # persist task_id on donation for task->donation mapping
    donation.task_id = task.id
    db.add(donation)
    db.commit()
    return {'donation_id': donation.id, 'task_id': task.id}


@router.get('/tasks/{task_id}')
def get_task_status(task_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_user)):
    """Return Celery task status and result summary.

    Status mapping: PENDING, PROCESSING, SUCCESS, FAILURE
    """
    # Find donation associated with this task
    donation = db.query(models.Donation).filter(models.Donation.task_id == task_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail='Task or donation not found')

    # Role-based access control
    if current_user.role != 'admin':
        if current_user.role == 'donor':
            if donation.owner_id != current_user.id:
                raise HTTPException(status_code=403, detail='Not allowed')
        elif current_user.role == 'ngo':
            if not current_user.ngo_id:
                raise HTTPException(status_code=403, detail='NGO not linked')
            assign = db.query(models.Assignment).filter(models.Assignment.donation_id == donation.id, models.Assignment.ngo_id == current_user.ngo_id).first()
            if not assign:
                raise HTTPException(status_code=403, detail='Donation not assigned to your NGO')
        elif current_user.role == 'volunteer':
            if not current_user.volunteer_id:
                raise HTTPException(status_code=403, detail='Volunteer not linked')
            assign = db.query(models.Assignment).filter(models.Assignment.donation_id == donation.id, models.Assignment.volunteer_id == current_user.volunteer_id).first()
            if not assign:
                raise HTTPException(status_code=403, detail='Donation not assigned to you')
        else:
            raise HTTPException(status_code=403, detail='Not allowed')

    async_res = AsyncResult(id=task_id, app=celery_app)
    state = async_res.state
    if state == 'PENDING':
        status = 'PENDING'
        return {'task_id': task_id, 'status': status}
    elif state in ('STARTED', 'RETRY'):
        status = 'PROCESSING'
        return {'task_id': task_id, 'status': status}
    elif state == 'SUCCESS':
        status = 'SUCCESS'
        try:
            result = async_res.result
        except Exception:
            result = None

        # extract details if present
        donation_id = result.get('donation_id') if isinstance(result, dict) else None
        ngo = result.get('ngo') if isinstance(result, dict) else None
        volunteer = result.get('volunteer') if isinstance(result, dict) else None

        return {
            'task_id': task_id,
            'status': status,
            'donation_id': donation_id,
            'ngo': ngo,
            'volunteer': volunteer,
            'result': result
        }
    else:
        # FAILURE or other state
        status = 'FAILURE'
        # try to get info
        info = None
        try:
            info = async_res.result
        except Exception:
            info = None
        return {'task_id': task_id, 'status': status, 'info': str(info)}


@router.get('/donations', response_model=List[dict])
def list_donations(db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_user)):
    # admin: all; donor: own; ngo: assigned; volunteer: assigned
    if current_user.role == 'admin':
        donations = db.query(models.Donation).all()
    elif current_user.role == 'donor':
        donations = db.query(models.Donation).filter(models.Donation.owner_id == current_user.id).all()
    elif current_user.role == 'ngo':
        # find assignments for this NGO
        if not current_user.ngo_id:
            return []
        assigns = db.query(models.Assignment).filter(models.Assignment.ngo_id == current_user.ngo_id).all()
        donation_ids = [a.donation_id for a in assigns]
        donations = db.query(models.Donation).filter(models.Donation.id.in_(donation_ids)).all() if donation_ids else []
    elif current_user.role == 'volunteer':
        if not current_user.volunteer_id:
            return []
        assigns = db.query(models.Assignment).filter(models.Assignment.volunteer_id == current_user.volunteer_id).all()
        donation_ids = [a.donation_id for a in assigns]
        donations = db.query(models.Donation).filter(models.Donation.id.in_(donation_ids)).all() if donation_ids else []
    else:
        raise HTTPException(status_code=403, detail='Role not permitted')

    result = []
    for d in donations:
        ai = db.query(models.DonationAI).filter(models.DonationAI.donation_id == d.id).first()
        assignment = db.query(models.Assignment).filter(models.Assignment.donation_id == d.id).order_by(models.Assignment.assigned_at.desc()).first()
        ngo_name = None
        volunteer_name = None
        if assignment:
            if assignment.ngo_id:
                ngo = db.query(models.NGO).filter(models.NGO.id == assignment.ngo_id).first()
                ngo_name = ngo.ngo_name if ngo else None
            if assignment.volunteer_id:
                volunteer = db.query(models.Volunteer).filter(models.Volunteer.id == assignment.volunteer_id).first()
                volunteer_name = volunteer.volunteer_name if volunteer else None
        result.append({
            'id': d.id,
            'donor_name': d.donor_name,
            'food_name': d.food_name,
            'quantity': d.quantity,
            'location': d.location,
            'expiry_hours': d.expiry_hours,
            'status': d.status,
            'owner_id': d.owner_id,
            'task_id': d.task_id,
            'validation_status': ai.validation_status if ai else None,
            'priority': ai.priority_level if ai else None,
            'priority_reason': ai.priority_reason if ai else None,
            'ngo_name': ngo_name,
            'volunteer_name': volunteer_name,
            'assignment_status': assignment.status if assignment else None,
        })
    return result


@router.get('/donations/{donation_id}')
def get_donation(donation_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.get_current_user)):
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail='Donation not found')

    # permission checks
    if current_user.role == 'admin':
        pass
    elif current_user.role == 'donor':
        if donation.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail='Not allowed')
    elif current_user.role == 'ngo':
        if not current_user.ngo_id:
            raise HTTPException(status_code=403, detail='Not allowed')
        assign = db.query(models.Assignment).filter(models.Assignment.donation_id == donation_id, models.Assignment.ngo_id == current_user.ngo_id).first()
        if not assign:
            raise HTTPException(status_code=403, detail='Not assigned to your NGO')
    elif current_user.role == 'volunteer':
        if not current_user.volunteer_id:
            raise HTTPException(status_code=403, detail='Not allowed')
        assign = db.query(models.Assignment).filter(models.Assignment.donation_id == donation_id, models.Assignment.volunteer_id == current_user.volunteer_id).first()
        if not assign:
            raise HTTPException(status_code=403, detail='Not assigned to you')
    else:
        raise HTTPException(status_code=403, detail='Not allowed')

    ai = db.query(models.DonationAI).filter(models.DonationAI.donation_id == donation.id).first()
    assignment = db.query(models.Assignment).filter(models.Assignment.donation_id == donation.id).order_by(models.Assignment.assigned_at.desc()).first()
    ngo_name = None
    volunteer_name = None
    if assignment:
        if assignment.ngo_id:
            ngo = db.query(models.NGO).filter(models.NGO.id == assignment.ngo_id).first()
            ngo_name = ngo.ngo_name if ngo else None
        if assignment.volunteer_id:
            volunteer = db.query(models.Volunteer).filter(models.Volunteer.id == assignment.volunteer_id).first()
            volunteer_name = volunteer.volunteer_name if volunteer else None

    return {
        'id': donation.id,
        'donor_name': donation.donor_name,
        'food_name': donation.food_name,
        'quantity': donation.quantity,
        'location': donation.location,
        'expiry_hours': donation.expiry_hours,
        'status': donation.status,
        'owner_id': donation.owner_id,
        'task_id': donation.task_id,
        'validation_status': ai.validation_status if ai else None,
        'priority': ai.priority_level if ai else None,
        'priority_reason': ai.priority_reason if ai else None,
        'ngo_name': ngo_name,
        'volunteer_name': volunteer_name,
        'assignment_status': assignment.status if assignment else None,
    }


@router.put('/donations/{donation_id}/accept')
def ngo_accept(donation_id: int, body: AcceptRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.require_role('ngo'))):
    # NGO approves or rejects assigned donation
    if not current_user.ngo_id:
        raise HTTPException(status_code=403, detail='NGO not linked')
    assign = db.query(models.Assignment).filter(models.Assignment.donation_id == donation_id, models.Assignment.ngo_id == current_user.ngo_id).first()
    if not assign:
        raise HTTPException(status_code=403, detail='Donation not assigned to your NGO')
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail='Donation not found')
    donation.status = 'accepted' if body.accept else 'rejected'
    db.add(donation)
    db.commit()
    return {'donation_id': donation.id, 'status': donation.status}


@router.put('/donations/{donation_id}/delivery')
def volunteer_update_delivery(donation_id: int, body: DeliveryUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_service.require_role('volunteer'))):
    # Volunteer updates delivery status for assigned donation
    if not current_user.volunteer_id:
        raise HTTPException(status_code=403, detail='Volunteer not linked')
    assign = db.query(models.Assignment).filter(models.Assignment.donation_id == donation_id, models.Assignment.volunteer_id == current_user.volunteer_id).first()
    if not assign:
        raise HTTPException(status_code=403, detail='Donation not assigned to you')
    # update assignment and donation status
    assign.status = body.status
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if donation:
        donation.status = body.status
        db.add(donation)
    db.add(assign)
    db.commit()
    return {'donation_id': donation_id, 'status': body.status}


@router.get('/protected')
def protected_example(current_user: dict = Depends(auth_service.get_current_user)):
    return {'message': f'Hello {current_user.username}, role={current_user.role}'}


@router.get('/admin-only')
def admin_only_example(current_user: dict = Depends(auth_service.require_role('admin'))):
    return {'message': 'Admin access granted'}
