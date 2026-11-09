#!/usr/bin/env python3
"""
CodeGuard Python Runner & IPC Interface
Allows the Node/Express backend or CLI to invoke Django models, the simulation engine, and Matplotlib.
"""
import sys
import os
import json

# Ensure parent directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.codeguard.settings')
try:
    import django
    django.setup()
except Exception:
    pass

from backend.simulator.engine import simulate_propagation
from backend.simulator.charts import generate_sdlc_propagation_chart, generate_stage_radar_chart

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action specified"}))
        sys.exit(1)

    action = sys.argv[1]

    if action == "simulate":
        payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        scenario = payload.get("scenario", {})
        controls = payload.get("controls", [])
        user = payload.get("user", {})

        result = simulate_propagation(scenario, controls, user)
        print(json.dumps(result))

    elif action == "chart":
        payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        stages = payload.get("stages", ['IDE', 'Git VCS', 'CI/CD', 'Registry', 'Production'])
        baseline = payload.get("baseline", [95, 90, 85, 80, 88])
        mitigated = payload.get("mitigated", [33, 27, 9, 8, 9])
        title = payload.get("title", "Attack Propagation")

        chart_b64 = generate_sdlc_propagation_chart(stages, baseline, mitigated, title)
        print(json.dumps({"chart": chart_b64}))

    elif action == "radar":
        payload = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        stages = payload.get("stages", ['IDE', 'Version Control', 'CI/CD', 'Software Registry', 'Production'])
        scores = payload.get("scores", [90, 75, 85, 68, 80])
        name = payload.get("name", "Project Audit")

        radar_b64 = generate_stage_radar_chart(stages, scores, name)
        print(json.dumps({"radar": radar_b64}))

    else:
        print(json.dumps({"error": f"Unknown action: {action}"}))

if __name__ == '__main__':
    main()
