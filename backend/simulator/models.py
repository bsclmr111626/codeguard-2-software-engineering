"""
CodeGuard Django Models
Defines the Class Model entities according to the Software Supply Chain Simulator specification.
"""
from django.db import models
from django.utils import timezone
import json

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('Administrator', 'Administrator'),
        ('Learner / Analyst', 'Learner / Analyst'),
        ('Guest', 'Guest'),
    ]

    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='Learner / Analyst')
    department = models.CharField(max_length=120, default='Software Security')
    two_factor_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Scenario(models.Model):
    SEVERITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]

    STAGE_CHOICES = [
        ('IDE', 'IDE'),
        ('Version Control', 'Version Control'),
        ('CI/CD', 'CI/CD'),
        ('Software Registry', 'Software Registry'),
        ('Production', 'Production'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    entry_point_stage = models.CharField(max_length=30, choices=STAGE_CHOICES)
    base_severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='High')
    propagation_path = models.JSONField(default=list) # e.g. ["IDE", "Version Control", "CI/CD", ...]
    attack_vector = models.CharField(max_length=300)
    real_world_example = models.CharField(max_length=200, blank=True)
    cwe_mapping = models.CharField(max_length=150, blank=True)
    stage_base_risks = models.JSONField(default=dict) # e.g. {"IDE": 95, "Version Control": 90, ...}

    def __str__(self):
        return f"{self.name} (Entry: {self.entry_point_stage})"


class MitigationControl(models.Model):
    code = models.CharField(max_length=20, unique=True) # e.g. CTRL-01
    name = models.CharField(max_length=200)
    description = models.TextField()
    target_stages = models.JSONField(default=list) # e.g. ["IDE", "Version Control"]
    risk_reduction_pct = models.IntegerField(default=60) # e.g. 65%
    implementation_guide = models.TextField(blank=True)
    cost_complexity = models.CharField(max_length=20, default='Medium')

    def __str__(self):
        return f"{self.code}: {self.name} (-{self.risk_reduction_pct}%)"


class Simulation(models.Model):
    """
    Simulation Hub Entity linking user, scenario, applied controls,
    and 5-stage propagation results.
    """
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='simulations')
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE)
    applied_controls = models.ManyToManyField(MitigationControl, blank=True)
    overall_baseline_risk = models.IntegerField(default=80)
    overall_mitigated_risk = models.IntegerField(default=25)
    baseline_risk_level = models.CharField(max_length=20, default='Critical')
    mitigated_risk_level = models.CharField(max_length=20, default='Low')
    risk_reduction_pct = models.IntegerField(default=70)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Simulation #{self.id} - {self.scenario.name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


class StageResult(models.Model):
    simulation = models.ForeignKey(Simulation, on_delete=models.CASCADE, related_name='stage_results')
    stage = models.CharField(max_length=30)
    baseline_risk = models.IntegerField(default=80)
    mitigated_risk = models.IntegerField(default=20)
    status = models.CharField(max_length=30) # Compromised, Propagated, Mitigated, Blocked, Unaffected
    findings_notes = models.TextField()

    def __str__(self):
        return f"{self.stage}: {self.status} ({self.mitigated_risk}/100)"


class AuditLog(models.Model):
    timestamp = models.DateTimeField(default=timezone.now)
    actor_name = models.CharField(max_length=150)
    actor_role = models.CharField(max_length=50)
    action = models.CharField(max_length=200)
    resource = models.CharField(max_length=200)
    ip_address = models.GenericIPAddressField(default='127.0.0.1')
    status = models.CharField(max_length=20, default='success')
    details = models.TextField()

    def __str__(self):
        return f"[{self.timestamp}] {self.actor_name}: {self.action} ({self.status})"
