from backend.app.db import models
from backend.app.db.session import SessionLocal
from backend.app.workers.celery_app import celery_app
from backend.app.services import graph_service


def _persist_workflow_results(state: dict) -> dict:
    donation_id = state.get('donation_id')
    if not donation_id:
        return state

    db = SessionLocal()
    try:
        donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
        if donation:
            if state.get('validation') == 'REJECTED':
                donation.status = 'rejected'
            elif state.get('ngo') and state.get('ngo') != 'No NGO Available' and state.get('volunteer') and state.get('volunteer') != 'No Volunteer Available':
                donation.status = 'assigned'
            else:
                donation.status = 'pending_assignment'
            db.add(donation)

        ai_record = db.query(models.DonationAI).filter(models.DonationAI.donation_id == donation_id).first()
        if ai_record is None:
            ai_record = models.DonationAI(donation_id=donation_id)
        ai_record.validation_status = state.get('validation', '')
        ai_record.validation_reason = state.get('validation_reason', '')
        ai_record.priority_level = state.get('priority', '')
        ai_record.priority_reason = state.get('priority_reason', '')
        ai_record.ai_metadata = {
            'donor_name': state.get('donor_name'),
            'food_name': state.get('food_name'),
            'location': state.get('location'),
            'ngo': state.get('ngo'),
            'volunteer': state.get('volunteer'),
            'status': state.get('status'),
        }
        db.add(ai_record)

        ngo_id = None
        volunteer_id = None

        if state.get('ngo') and state.get('ngo') != 'No NGO Available':
            ngo = db.query(models.NGO).filter(models.NGO.ngo_name == state['ngo']).first()
            if not ngo:
                ngo = db.query(models.NGO).filter(models.NGO.location == state.get('location')).filter(models.NGO.status == 'available').order_by(models.NGO.id).first()
            if ngo:
                ngo_id = ngo.id

        if state.get('volunteer') and state.get('volunteer') != 'No Volunteer Available' and state.get('volunteer') != 'Not Assigned':
            volunteer = db.query(models.Volunteer).filter(models.Volunteer.volunteer_name == state['volunteer']).first()
            if not volunteer:
                volunteer = db.query(models.Volunteer).filter(models.Volunteer.location == state.get('location')).filter(models.Volunteer.status == 'free').order_by(models.Volunteer.id).first()
            if volunteer:
                volunteer_id = volunteer.id

        assignment = db.query(models.Assignment).filter(models.Assignment.donation_id == donation_id).order_by(models.Assignment.assigned_at.desc()).first()
        if assignment is None:
            assignment = models.Assignment(donation_id=donation_id)
        assignment.ngo_id = ngo_id
        assignment.volunteer_id = volunteer_id
        assignment.status = 'assigned' if ngo_id and volunteer_id else ('pending_assignment' if state.get('validation') != 'REJECTED' else 'rejected')
        db.add(assignment)

        for node_name, input_payload, output_payload in [
            ('validation_agent', {'donor_name': state.get('donor_name'), 'food_name': state.get('food_name')}, {'validation': state.get('validation'), 'reason': state.get('validation_reason')}),
            ('priority_agent', {'food_name': state.get('food_name'), 'quantity': state.get('quantity')}, {'priority': state.get('priority'), 'reason': state.get('priority_reason')}),
            ('ngo_matching_agent', {'location': state.get('location')}, {'ngo': state.get('ngo')}),
            ('volunteer_assignment_agent', {'ngo': state.get('ngo')}, {'volunteer': state.get('volunteer')}),
            ('final_report_agent', {'donation_id': donation_id}, {'status': state.get('status')})
        ]:
            db.add(models.AuditLog(donation_id=donation_id, node_name=node_name, input=input_payload, output=output_payload))

        db.commit()
    finally:
        db.close()

    return state


@celery_app.task(name='foodflow.process_donation')
def process_donation_task(state: dict) -> dict:
    final = graph_service.run_workflow(state)
    return _persist_workflow_results(final)
