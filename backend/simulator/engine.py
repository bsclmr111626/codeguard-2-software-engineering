"""
CodeGuard Rule-Based Simulation Engine in Python
Models attack propagation through the 5 SDLC stages, transparent scoring, and Matplotlib visualizations.
"""
from backend.simulator.charts import generate_sdlc_propagation_chart, generate_stage_radar_chart

SDLC_STAGES = [
    'IDE',
    'Version Control',
    'CI/CD',
    'Software Registry',
    'Production',
]

def get_risk_level(score):
    if score <= 24:
        return 'Low'
    elif score <= 49:
        return 'Medium'
    elif score <= 74:
        return 'High'
    return 'Critical'

def simulate_propagation(scenario_dict, applied_controls_list, user_dict=None):
    """
    Core mathematical model for software supply chain attack traversal.
    Calculates stage-by-stage risks and renders real Matplotlib charts.
    """
    propagation_path = scenario_dict.get('propagationPath', SDLC_STAGES)
    stage_base_risks = scenario_dict.get('stageBaseRisks', {})
    entry_point = scenario_dict.get('entryPointStage', 'IDE')

    stage_results = []
    baseline_scores = []
    mitigated_scores = []
    is_upstream_blocked = False

    for stage in SDLC_STAGES:
        base_risk = stage_base_risks.get(stage, 50)
        is_in_path = stage in propagation_path

        # Find applied controls targeting this stage
        controls_for_stage = [
            c for c in applied_controls_list
            if stage in c.get('targetStages', [])
        ]
        control_names = [c.get('name', '') for c in controls_for_stage]

        if not is_in_path:
            stage_results.append({
                'stage': stage,
                'baselineRisk': min(15, base_risk),
                'mitigatedRisk': min(5, int(base_risk * 0.2)),
                'status': 'Unaffected',
                'riskLevel': 'Low',
                'mitigationsApplied': control_names,
                'findingsNotes': 'Stage is outside active attack propagation pathway.'
            })
            baseline_scores.append(min(15, base_risk))
            mitigated_scores.append(min(5, int(base_risk * 0.2)))
            continue

        if is_upstream_blocked:
            stage_results.append({
                'stage': stage,
                'baselineRisk': base_risk,
                'mitigatedRisk': int(base_risk * 0.1),
                'status': 'Blocked',
                'riskLevel': 'Low',
                'mitigationsApplied': control_names,
                'findingsNotes': 'Upstream security controls halted the attack. Threat did not reach this stage.'
            })
            baseline_scores.append(base_risk)
            mitigated_scores.append(int(base_risk * 0.1))
            continue

        cumulative_reduction = sum([c.get('riskReductionPct', 0) for c in controls_for_stage])
        effective_reduction = min(88, cumulative_reduction)
        mitigated_score = max(8, int(base_risk * (1 - effective_reduction / 100)))

        if stage == entry_point:
            status = 'Mitigated' if effective_reduction >= 60 else 'Compromised'
        else:
            status = 'Mitigated' if effective_reduction >= 60 else 'Propagated'

        if effective_reduction >= 65:
            is_upstream_blocked = True

        stage_results.append({
            'stage': stage,
            'baselineRisk': base_risk,
            'mitigatedRisk': mitigated_score,
            'status': status,
            'riskLevel': get_risk_level(mitigated_score),
            'mitigationsApplied': control_names,
            'findingsNotes': (
                f"Controls reduced stage risk by {effective_reduction}%."
                if effective_reduction >= 60
                else "Unprotected by sufficient controls; attack propagates downstream."
            )
        })
        baseline_scores.append(base_risk)
        mitigated_scores.append(mitigated_score)

    overall_baseline = int(sum(baseline_scores) / len(baseline_scores))
    overall_mitigated = int(sum(mitigated_scores) / len(mitigated_scores))
    risk_reduction_pct = max(0, int(((overall_baseline - overall_mitigated) / overall_baseline) * 100))

    # Generate Real Matplotlib Chart using Python
    chart_base64 = generate_sdlc_propagation_chart(
        stages=['IDE', 'Version Control', 'CI/CD', 'Registry', 'Production'],
        baseline_scores=baseline_scores,
        mitigated_scores=mitigated_scores,
        scenario_name=scenario_dict.get('name', 'Attack Simulation')
    )

    return {
        'scenarioName': scenario_dict.get('name'),
        'entryPointStage': entry_point,
        'overallBaselineRisk': overall_baseline,
        'overallMitigatedRisk': overall_mitigated,
        'baselineRiskLevel': get_risk_level(overall_baseline),
        'mitigatedRiskLevel': get_risk_level(overall_mitigated),
        'riskReductionPct': risk_reduction_pct,
        'stageResults': stage_results,
        'matplotlibChart': chart_base64,
        'engineEngineeredWith': 'Python 3.10 / Django / Matplotlib 3.6',
    }
