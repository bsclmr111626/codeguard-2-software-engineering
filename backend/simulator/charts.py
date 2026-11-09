"""
CodeGuard Matplotlib Charting Engine
Generates publication-quality security propagation and risk comparison charts
styled in enterprise dark navy aesthetics.
"""
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

def generate_sdlc_propagation_chart(stages, baseline_scores, mitigated_scores, scenario_name="Attack Propagation"):
    """
    Renders Matplotlib grouped bar chart comparing Baseline Risk vs Mitigated Risk
    across the five SDLC stages (IDE, Version Control, CI/CD, Software Registry, Production).
    Returns data:image/png;base64 string.
    """
    # Matplotlib styling for dark navy theme
    plt.style.use('dark_background')
    fig, ax = plt.subplots(figsize=(8.5, 4.0), dpi=130)
    fig.patch.set_facecolor('#0b1329')
    ax.set_facecolor('#070d19')

    # Coordinates
    x = np.arange(len(stages))
    width = 0.34

    # Bars
    bars_base = ax.bar(
        x - width/2,
        baseline_scores,
        width,
        label='Unmitigated Baseline Risk',
        color='#ef4444',
        edgecolor='#b91c1c',
        alpha=0.85,
        linewidth=1.2
    )

    bars_mit = ax.bar(
        x + width/2,
        mitigated_scores,
        width,
        label='Protected Mitigated Risk',
        color='#0284c7',
        edgecolor='#38bdf8',
        alpha=0.9,
        linewidth=1.2
    )

    # Risk threshold guidelines
    ax.axhline(75, color='#ef4444', linestyle='--', linewidth=0.8, alpha=0.4, label='Critical Threshold (75)')
    ax.axhline(50, color='#f59e0b', linestyle=':', linewidth=0.8, alpha=0.35, label='High Threshold (50)')
    ax.axhline(25, color='#10b981', linestyle='-.', linewidth=0.8, alpha=0.35, label='Low Risk Boundary (25)')

    # Labels and Titles
    ax.set_ylabel('Quantified Risk Score (0–100)', fontsize=10, fontweight='bold', color='#cbd5e1', labelpad=8)
    ax.set_title(f'CodeGuard SDLC Attack Propagation: {scenario_name}', fontsize=12, fontweight='bold', color='#ffffff', pad=12)
    ax.set_xticks(x)
    ax.set_xticklabels(stages, fontsize=9, fontweight='semibold', color='#e2e8f0')
    ax.set_ylim(0, 110)

    # Grid & Spines
    ax.grid(axis='y', linestyle='--', alpha=0.2, color='#64748b')
    for spine in ax.spines.values():
        spine.set_color('#334155')

    # Data value callouts on top of bars
    for bar in bars_base:
        yval = bar.get_height()
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            yval + 2.5,
            f"{int(yval)}",
            ha='center',
            va='bottom',
            fontsize=8.5,
            fontweight='bold',
            color='#fca5a5'
        )

    for bar in bars_mit:
        yval = bar.get_height()
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            yval + 2.5,
            f"{int(yval)}",
            ha='center',
            va='bottom',
            fontsize=8.5,
            fontweight='bold',
            color='#7dd3fc'
        )

    # Legend
    legend = ax.legend(
        loc='upper right',
        frameon=True,
        facecolor='#0f172a',
        edgecolor='#334155',
        fontsize=8.5
    )
    for text in legend.get_texts():
        text.set_color('#cbd5e1')

    plt.tight_layout()

    # Save to Base64
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=130)
    plt.close(fig)
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{encoded}"


def generate_stage_radar_chart(stages, scores, project_name="Project Scan"):
    """
    Renders Matplotlib radar / polar chart illustrating risk profile across 5 stages.
    Returns data:image/png;base64 string.
    """
    plt.style.use('dark_background')

    # Number of variables
    N = len(stages)
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1] # complete the loop

    values = list(scores)
    values += values[:1]

    fig, ax = plt.subplots(figsize=(5.5, 4.2), subplot_kw=dict(polar=True), dpi=120)
    fig.patch.set_facecolor('#0b1329')
    ax.set_facecolor('#070d19')

    # Draw one axe per variable + labels
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(stages, color='#cbd5e1', size=9, fontweight='bold')

    # Draw ylabels
    ax.set_rlabel_position(0)
    plt.yticks([25, 50, 75, 100], ["25", "50", "75", "100"], color="#64748b", size=7.5)
    plt.ylim(0, 100)

    # Plot data
    ax.plot(angles, values, color='#38bdf8', linewidth=2, linestyle='solid', label=f'{project_name} Risk')
    ax.fill(angles, values, color='#0284c7', alpha=0.35)

    ax.set_title(f'CodeGuard 5-Stage Risk Polar Matrix: {project_name}', color='#ffffff', size=11, fontweight='bold', pad=15)
    ax.grid(color='#334155', linestyle='--', alpha=0.4)

    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=120)
    plt.close(fig)
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{encoded}"
