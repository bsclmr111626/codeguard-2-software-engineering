export type SdlcStage = 'IDE' | 'Version Control' | 'CI/CD' | 'Software Registry' | 'Production';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type UserRole = 'Learner / Analyst' | 'Administrator' | 'Guest';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  twoFactorEnabled: boolean;
  status: 'active' | 'suspended' | 'pending';
  lastActive: string;
  createdDate: string;
  department: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  entryPointStage: SdlcStage;
  baseSeverity: RiskLevel;
  propagationPath: SdlcStage[];
  attackVector: string;
  realWorldExample: string;
  cweMapping: string;
  stageBaseRisks: Record<SdlcStage, number>; // 0-100 baseline risk if unmitigated
}

export interface MitigationControl {
  id: string;
  code: string;
  name: string;
  description: string;
  targetStages: SdlcStage[];
  riskReductionPct: number; // e.g. 35 for 35% reduction on targeted stages
  implementationGuide: string;
  costComplexity: 'Low' | 'Medium' | 'High';
  isRecommendedFor: string[]; // Scenario IDs this is best suited for
}

export interface StageSimulationResult {
  stage: SdlcStage;
  baselineRisk: number; // 0-100
  mitigatedRisk: number; // 0-100
  status: 'Compromised' | 'Propagated' | 'Mitigated' | 'Blocked' | 'Unaffected';
  riskLevel: RiskLevel;
  mitigationsApplied: string[];
  findingsNotes: string;
}

export interface SimulationRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  scenarioId: string;
  scenarioName: string;
  entryPointStage: SdlcStage;
  appliedControlIds: string[];
  appliedControlNames: string[];
  overallBaselineRisk: number; // 0-100
  overallMitigatedRisk: number; // 0-100
  baselineRiskLevel: RiskLevel;
  mitigatedRiskLevel: RiskLevel;
  riskReductionPct: number;
  stageResults: StageSimulationResult[];
  recommendations: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    email: string;
    role: UserRole;
  };
  action: string;
  resource: string;
  ipAddress: string;
  status: 'success' | 'denied' | 'flagged';
  details: string;
}

export interface ProjectScanFinding {
  id: string;
  stage: SdlcStage;
  severity: RiskLevel;
  category: 'Secrets' | 'SCA Dependency' | 'CI/CD Pipeline' | 'VCS Governance' | 'Production / IaC';
  ruleId: string;
  title: string;
  description: string;
  file: string;
  lineNumber?: number;
  offendingCode?: string;
  remediation: string;
  mitigationCode?: string;
  resolved?: boolean;
}

export interface ScannedProject {
  id: string;
  name: string;
  uploadedAt: string;
  fileCount: number;
  sourceType: 'archive' | 'manifest' | 'git_url';
  overallScore: number; // 0-100 (where 0 is completely safe, 100 is critical risk)
  securityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  riskLevel: RiskLevel;
  stageScores: Record<
    SdlcStage,
    {
      score: number;
      riskLevel: RiskLevel;
      passedChecks: number;
      failedChecks: number;
    }
  >;
  findings: ProjectScanFinding[];
  status: 'scanning' | 'completed' | 'failed';
  uploadedFiles?: { name: string; size: number }[];
}
