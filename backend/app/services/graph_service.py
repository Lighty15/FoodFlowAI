from backend.app.ai_engine import nodes


def run_workflow(state: dict) -> dict:
    # Sequentially run nodes similar to the notebook's StateGraph
    s = state
    s = nodes.validation_agent_node(s)
    s = nodes.priority_agent_node(s)
    s = nodes.ngo_matching_node(s)
    s = nodes.volunteer_assignment_node(s)
    s = nodes.final_report_node(s)
    return s
