import os
import pandas as pd
from typing import Dict

from backend.app.schemas import FoodState

try:
    from langchain_groq import ChatGroq
    from langchain_core.messages import SystemMessage, HumanMessage
    LLM_AVAILABLE = True
except Exception:
    ChatGroq = None
    SystemMessage = None
    HumanMessage = None
    LLM_AVAILABLE = False


# Load CSVs from workspace data/ for dev convenience
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '..', '..', 'data')
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data'))

donors_df = None
ngos_df = None
volunteers_df = None


def _load_dataframes():
    global donors_df, ngos_df, volunteers_df
    base = os.path.abspath(os.path.join(os.getcwd(), 'data'))
    donors_path = os.path.join(base, 'donors.csv')
    ngos_path = os.path.join(base, 'ngos.csv')
    volunteers_path = os.path.join(base, 'volunteers.csv')

    donors_df = pd.read_csv(donors_path)
    ngos_df = pd.read_csv(ngos_path)
    volunteers_df = pd.read_csv(volunteers_path)


if donors_df is None:
    try:
        _load_dataframes()
    except Exception:
        # in case data not available, initialize empty frames
        donors_df = pd.DataFrame()
        ngos_df = pd.DataFrame()
        volunteers_df = pd.DataFrame()


VALIDATION_SYSTEM_PROMPT = """
You are an AI Food Donation Validation Agent.
Respond only with JSON: {"status": "APPROVED"|"REJECTED", "reason": "<short>"}
"""

PRIORITY_SYSTEM_PROMPT = """
You are an AI Priority Assessment Agent for food donations.
Respond only with JSON: {"priority": "HIGH"|"MEDIUM"|"LOW", "reason": "<short>"}
"""


def donation_intake_from_csv(index: int) -> Dict:
    if donors_df.empty:
        raise RuntimeError("donors.csv not found in data/")
    if index < 1 or index > len(donors_df):
        raise ValueError("index out of range")

    selected = donors_df.iloc[index - 1]
    state = {
        "donor_name": selected.get("donor_name", ""),
        "food_name": selected.get("food_name", ""),
        "quantity": int(selected.get("quantity", 0)),
        "location": selected.get("location", ""),
        "expiry_hours": int(selected.get("expiry_hours", 0)),
        "validation": "",
        "validation_reason": "",
        "priority": "",
        "priority_reason": "",
        "ngo": "",
        "volunteer": "",
        "status": ""
    }
    return state


def _get_llm():
    if not LLM_AVAILABLE:
        return None
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        return None
    return ChatGroq(model="llama-3.3-70b-versatile", temperature=0)


def validation_agent_node(state: Dict) -> Dict:
    llm = _get_llm()
    user_message = f"Donor Name: {state['donor_name']}\nFood Name: {state['food_name']}\nQuantity: {state['quantity']}\nLocation: {state['location']}\nExpiry Hours: {state['expiry_hours']}"

    if llm:
        response = llm.invoke([
            SystemMessage(content=VALIDATION_SYSTEM_PROMPT),
            HumanMessage(content=user_message)
        ])
        output = response.content.strip()
        # expect JSON
        try:
            import json
            payload = json.loads(output)
            status = payload.get('status', '').upper()
            reason = payload.get('reason', '')
        except Exception:
            status = 'REJECTED'
            reason = output
    else:
        # simple rule-based fallback
        if state['expiry_hours'] <= 0 or state['quantity'] <= 0:
            status = 'REJECTED'
            reason = 'Invalid expiry or zero quantity.'
        else:
            status = 'APPROVED'
            reason = 'Basic rule check passed.'

    state['validation'] = status
    state['validation_reason'] = reason
    return state


def priority_agent_node(state: Dict) -> Dict:
    llm = _get_llm()
    user_message = f"Food Name: {state['food_name']}\nQuantity: {state['quantity']}\nExpiry Hours: {state['expiry_hours']}"

    if llm:
        response = llm.invoke([
            SystemMessage(content=PRIORITY_SYSTEM_PROMPT),
            HumanMessage(content=user_message)
        ])
        output = response.content.strip()
        try:
            import json
            payload = json.loads(output)
            priority = payload.get('priority', '').upper()
            reason = payload.get('reason', '')
        except Exception:
            priority = 'LOW'
            reason = output
    else:
        # fallback rules
        eh = state['expiry_hours']
        q = state['quantity']
        if eh <= 4 or q >= 100:
            priority = 'HIGH'
            reason = 'Very urgent or very large donation.'
        elif 5 <= eh <= 12:
            priority = 'MEDIUM'
            reason = 'Moderate expiry time.'
        else:
            priority = 'LOW'
            reason = 'Long shelf life.'

    state['priority'] = priority
    state['priority_reason'] = reason
    return state


def ngo_matching_node(state: Dict) -> Dict:
    df = ngos_df
    try:
        available = df[(df['location'].str.lower() == state['location'].lower()) & (df['status'] == 'available')]
    except Exception:
        available = df

    if not available.empty:
        ngo = available.iloc[0]['ngo_name']
    else:
        ngo = 'No NGO Available'

    state['ngo'] = ngo
    return state


def volunteer_assignment_node(state: Dict) -> Dict:
    if state.get('ngo') == 'No NGO Available':
        state['volunteer'] = 'Not Assigned'
        state['status'] = 'Waiting for NGO'
        return state

    df = volunteers_df
    try:
        available = df[(df['location'].str.lower() == state['location'].lower()) & (df['status'] == 'free')]
    except Exception:
        available = df

    if not available.empty:
        volunteer = available.iloc[0]['volunteer_name']
        # mark busy in local dataframe for dev
        volunteers_df.loc[volunteers_df['volunteer_name'] == volunteer, 'status'] = 'busy'
        state['volunteer'] = volunteer
        state['status'] = 'Volunteer Assigned'
    else:
        state['volunteer'] = 'No Volunteer Available'
        state['status'] = 'Waiting for Volunteer'

    return state


def final_report_node(state: Dict) -> Dict:
    # returns state; the API will return JSON, printing kept minimal here
    return state
