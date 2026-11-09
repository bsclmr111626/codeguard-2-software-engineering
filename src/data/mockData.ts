import {
  SdlcStage,
  RiskLevel,
  UserRole,
  UserAccount,
  Scenario,
  MitigationControl,
  SimulationRecord,
  StageSimulationResult,
  AuditLog,
  ScannedProject,
  ProjectScanFinding,
} from '../types';

export const SDLC_STAGES: SdlcStage[] = [
  'IDE',
  'Version Control',
  'CI/CD',
  'Software Registry',
  'Production',
];

export const initialUsers: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Denzel Otunga',
    email: 'denzel.otunga@codeguard.internal',
    role: 'Administrator',
    avatarUrl: '/src/assets/images/avatar_security_lead_1794219487214.jpg',
    twoFactorEnabled: true,
    status: 'active',
    lastActive: 'Just now',
    createdDate: '2025-01-15',
    department: 'Software Supply Chain Security',
  },
  {
    id: 'usr-2',
    name: 'Angie Marie',
    email: 'angie.marie@codeguard.internal',
    role: 'Learner / Analyst',
    avatarUrl: '/src/assets/images/avatar_devsecops_1794219488665.jpg',
    twoFactorEnabled: true,
    status: 'active',
    lastActive: '5 mins ago',
    createdDate: '2025-02-10',
    department: 'DevSecOps & Platform Engineering',
  },
  {
    id: 'usr-3',
    name: 'Mark Cheruiyot',
    email: 'mark.cheruiyot@codeguard.internal',
    role: 'Learner / Analyst',
    twoFactorEnabled: true,
    status: 'active',
    lastActive: '1 hour ago',
    createdDate: '2025-03-01',
    department: 'Security Architecture & Audit',
  },
  {
    id: 'usr-4',
    name: 'Nicholas Mutai',
    email: 'nicholas.mutai@codeguard.demo',
    role: 'Guest',
    twoFactorEnabled: false,
    status: 'active',
    lastActive: '2 days ago',
    createdDate: '2025-03-12',
    department: 'External Reviewer / Guest',
  },
];

export const initialScenarios: Scenario[] = [
  {
    id: 'sc-1',
    name: 'Compromised Developer Account',
    description: 'An attacker obtains developer workstation credentials or session tokens via phishing, injecting backdoor commits into the source repository.',
    entryPointStage: 'IDE',
    baseSeverity: 'Critical',
    propagationPath: ['IDE', 'Version Control', 'CI/CD', 'Software Registry', 'Production'],
    attackVector: 'Credential theft, infected IDE extensions, or unauthenticated Git push access.',
    realWorldExample: 'Event-Stream Incident / PyPI Account Hijacking',
    cweMapping: 'CWE-287: Improper Authentication & CWE-506: Embedded Malicious Code',
    stageBaseRisks: {
      'IDE': 95,
      'Version Control': 90,
      'CI/CD': 85,
      'Software Registry': 80,
      'Production': 88,
    },
  },
  {
    id: 'sc-2',
    name: 'Compromised CI/CD Pipeline Runner',
    description: 'An adversary compromises a self-hosted CI build agent or injects malicious build scripts via an unverified pull request, poisoning the compiled release binary.',
    entryPointStage: 'CI/CD',
    baseSeverity: 'Critical',
    propagationPath: ['CI/CD', 'Software Registry', 'Production'],
    attackVector: 'Leaked runner registration tokens, malicious Makefile / workflow syntax injection.',
    realWorldExample: 'SolarWinds Orion Sunburst Build Poisoning (2020)',
    cweMapping: 'CWE-494: Download of Code Without Integrity Check',
    stageBaseRisks: {
      'IDE': 10,
      'Version Control': 20,
      'CI/CD': 96,
      'Software Registry': 92,
      'Production': 95,
    },
  },
  {
    id: 'sc-3',
    name: 'Malicious Upstream Dependency (Typosquatting)',
    description: 'A malicious package mimicking a popular open-source library is published to an open registry. Unpinned project builds fetch and execute the backdoor during installation.',
    entryPointStage: 'Software Registry',
    baseSeverity: 'High',
    propagationPath: ['Software Registry', 'CI/CD', 'Production'],
    attackVector: 'Namespace confusion, typosquatting, post-install malicious script execution.',
    realWorldExample: 'XZ Utils Backdoor (CVE-2024-3094) / Colors.js NPM Sabotage',
    cweMapping: 'CWE-1357: Reliance on Uncontrolled Component',
    stageBaseRisks: {
      'IDE': 25,
      'Version Control': 20,
      'CI/CD': 75,
      'Software Registry': 94,
      'Production': 85,
    },
  },
  {
    id: 'sc-4',
    name: 'Leaked Secrets in Version Control',
    description: 'AWS production keys or database tokens are inadvertently committed into Git. Automated scrapers discover the secret and bypass the software pipeline entirely to attack production directly.',
    entryPointStage: 'Version Control',
    baseSeverity: 'Critical',
    propagationPath: ['Version Control', 'Production'],
    attackVector: 'Committed .env files, hardcoded cloud credentials, public GitHub repository exposure.',
    realWorldExample: 'Uber GitHub Key Leak / CircleCI Token Exfiltration',
    cweMapping: 'CWE-798: Use of Hard-coded Credentials',
    stageBaseRisks: {
      'IDE': 70,
      'Version Control': 95,
      'CI/CD': 40,
      'Software Registry': 15,
      'Production': 98,
    },
  },
];

export const initialMitigations: MitigationControl[] = [
  {
    id: 'mit-1',
    code: 'CTRL-01',
    name: 'Mandatory Multi-Factor Authentication (MFA) & FIDO2',
    description: 'Require hardware security keys or authenticator TOTP for all developer workstation logins, Git provider accounts, and registry publishers.',
    targetStages: ['IDE', 'Version Control'],
    riskReductionPct: 65,
    implementationGuide: 'Enforce hardware security key SSO in Okta/GitHub Enterprise. Disallow SMS-based verification and disallow personal access tokens without expiration.',
    costComplexity: 'Low',
    isRecommendedFor: ['sc-1', 'sc-4'],
  },
  {
    id: 'mit-2',
    code: 'CTRL-02',
    name: 'Strict Branch Protection & Mandatory 2-Peer Review',
    description: 'Disallow direct commits to main/production branches. Require minimum 2 code owner approvals and passing automated verification before merge.',
    targetStages: ['Version Control', 'CI/CD'],
    riskReductionPct: 70,
    implementationGuide: 'Configure repository branch protection rules: "Require pull request before merging", "Require approvals (2)", and "Require signed commits".',
    costComplexity: 'Low',
    isRecommendedFor: ['sc-1', 'sc-4'],
  },
  {
    id: 'mit-3',
    code: 'CTRL-03',
    name: 'Ephemeral Pipeline Isolation & Read-Only Runners',
    description: 'Run build jobs in isolated disposable containers with minimal network egress. Disallow persistent worker state and inject single-use OIDC tokens.',
    targetStages: ['CI/CD'],
    riskReductionPct: 75,
    implementationGuide: 'Adopt short-lived autoscaling runners on Kubernetes. Strip host Docker socket mounts and utilize cloud OIDC federation instead of static secrets.',
    costComplexity: 'Medium',
    isRecommendedFor: ['sc-2'],
  },
  {
    id: 'mit-4',
    code: 'CTRL-04',
    name: 'Dependency Pinning, Lockfiles & Cryptographic SBOM Auditing',
    description: 'Pin all direct and transitive dependencies with cryptographic SHA-512 hashes. Audit build dependencies against the National Vulnerability Database before compiling.',
    targetStages: ['Software Registry', 'CI/CD', 'IDE'],
    riskReductionPct: 80,
    implementationGuide: 'Commit package-lock.json / go.sum, mandate npm ci --ignore-scripts, and run automated SCA vulnerability checkers like Trivy / Syft.',
    costComplexity: 'Medium',
    isRecommendedFor: ['sc-3'],
  },
  {
    id: 'mit-5',
    code: 'CTRL-05',
    name: 'Automated Pre-Commit & Pre-Receive Secret Scanning',
    description: 'Block commits containing high-entropy tokens or known credential regex patterns before they enter the source repository history.',
    targetStages: ['IDE', 'Version Control'],
    riskReductionPct: 85,
    implementationGuide: 'Deploy Gitleaks pre-commit git hooks and configure GitHub/GitLab server-side secret push protection.',
    costComplexity: 'Low',
    isRecommendedFor: ['sc-4', 'sc-1'],
  },
  {
    id: 'mit-6',
    code: 'CTRL-06',
    name: 'Cryptographic Artifact Signing & Provenance Attestation (SLSA)',
    description: 'Sign build artifacts and container images using Cosign/Sigstore with SLSA Level 3 build provenance. Enforce verification before production deployment.',
    targetStages: ['Software Registry', 'Production'],
    riskReductionPct: 75,
    implementationGuide: 'Implement Sigstore Cosign in CI pipelines to generate keyless signatures and verify OIDC workload identities on production admission controllers.',
    costComplexity: 'Medium',
    isRecommendedFor: ['sc-2', 'sc-3'],
  },
  {
    id: 'mit-7',
    code: 'CTRL-07',
    name: 'Least-Privilege Production IAM & Zero-Trust Runtime',
    description: 'Restrict production execution privileges, mount read-only filesystems, and employ runtime behavioral anomaly detection to contain breakouts.',
    targetStages: ['Production'],
    riskReductionPct: 60,
    implementationGuide: 'Configure Kubernetes SecurityContext with runAsNonRoot: true, readOnlyRootFilesystem: true, and drop all Linux capabilities except NET_BIND_SERVICE.',
    costComplexity: 'High',
    isRecommendedFor: ['sc-1', 'sc-2', 'sc-4'],
  },
];

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 24) return 'Low';
  if (score <= 49) return 'Medium';
  if (score <= 74) return 'High';
  return 'Critical';
}

export function getSecurityGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score <= 24) return 'A';
  if (score <= 45) return 'B';
  if (score <= 65) return 'C';
  if (score <= 80) return 'D';
  return 'F';
}

export function runSimulationEngine(
  scenario: Scenario,
  appliedControls: MitigationControl[],
  user: UserAccount
): SimulationRecord {
  const stageResults: StageSimulationResult[] = [];
  let isUpstreamBlocked = false;

  SDLC_STAGES.forEach((stage) => {
    const isStageInPropagation = scenario.propagationPath.includes(stage);
    const baseRisk = scenario.stageBaseRisks[stage] || 0;

    const controlsForStage = appliedControls.filter((c) => c.targetStages.includes(stage));
    const controlNames = controlsForStage.map((c) => c.name);

    if (!isStageInPropagation) {
      stageResults.push({
        stage,
        baselineRisk: Math.min(15, baseRisk),
        mitigatedRisk: Math.min(5, Math.round(baseRisk * 0.2)),
        status: 'Unaffected',
        riskLevel: 'Low',
        mitigationsApplied: controlNames,
        findingsNotes: 'Stage is outside the active propagation pathway of this attack scenario.',
      });
      return;
    }

    if (isUpstreamBlocked) {
      stageResults.push({
        stage,
        baselineRisk: baseRisk,
        mitigatedRisk: Math.round(baseRisk * 0.1),
        status: 'Blocked',
        riskLevel: 'Low',
        mitigationsApplied: controlNames,
        findingsNotes: 'Attack propagation was severed by upstream security controls. Threat did not reach this stage.',
      });
      return;
    }

    let cumulativeReduction = 0;
    controlsForStage.forEach((ctrl) => {
      cumulativeReduction += ctrl.riskReductionPct;
    });

    const effectiveReduction = Math.min(88, cumulativeReduction);
    const mitigatedScore = Math.max(8, Math.round(baseRisk * (1 - effectiveReduction / 100)));

    let status: StageSimulationResult['status'] = 'Compromised';
    if (stage === scenario.entryPointStage) {
      status = effectiveReduction >= 60 ? 'Mitigated' : 'Compromised';
    } else {
      status = effectiveReduction >= 60 ? 'Mitigated' : 'Propagated';
    }

    if (effectiveReduction >= 65) {
      isUpstreamBlocked = true;
    }

    stageResults.push({
      stage,
      baselineRisk: baseRisk,
      mitigatedRisk: mitigatedScore,
      status,
      riskLevel: getRiskLevel(mitigatedScore),
      mitigationsApplied: controlNames,
      findingsNotes:
        effectiveReduction >= 60
          ? `Controls (${controlNames.join(', ') || 'Active'}) reduced risk by ${effectiveReduction}%.`
          : `Residual vulnerability high due to missing target mitigations. Attack traverses successfully.`,
    });
  });

  const totalBaseline = stageResults.reduce((acc, s) => acc + s.baselineRisk, 0);
  const totalMitigated = stageResults.reduce((acc, s) => acc + s.mitigatedRisk, 0);

  const overallBaselineRisk = Math.round(totalBaseline / stageResults.length);
  const overallMitigatedRisk = Math.round(totalMitigated / stageResults.length);
  const riskReductionPct = Math.max(0, Math.round(((overallBaselineRisk - overallMitigatedRisk) / overallBaselineRisk) * 100));

  const unappliedRecommended = initialMitigations.filter(
    (m) => m.isRecommendedFor.includes(scenario.id) && !appliedControls.some((ac) => ac.id === m.id)
  );

  const recommendations = unappliedRecommended.map(
    (m) => `Implement ${m.name} (${m.code}) to protect ${m.targetStages.join(' & ')} (Expected -${m.riskReductionPct}% risk reduction).`
  );

  if (recommendations.length === 0) {
    recommendations.push('Full defense-in-depth baseline applied. Continue regular audit reviews and verify signature enforcement.');
  }

  return {
    id: `sim-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    entryPointStage: scenario.entryPointStage,
    appliedControlIds: appliedControls.map((c) => c.id),
    appliedControlNames: appliedControls.map((c) => c.name),
    overallBaselineRisk,
    overallMitigatedRisk,
    baselineRiskLevel: getRiskLevel(overallBaselineRisk),
    mitigatedRiskLevel: getRiskLevel(overallMitigatedRisk),
    riskReductionPct,
    stageResults,
    recommendations,
  };
}

export const initialSimulations: SimulationRecord[] = [
  {
    id: 'sim-1001',
    timestamp: '2026-11-09 09:15:32',
    userId: 'usr-1',
    userName: 'Denzel Otunga',
    userRole: 'Administrator',
    scenarioId: 'sc-1',
    scenarioName: 'Compromised Developer Account',
    entryPointStage: 'IDE',
    appliedControlIds: ['mit-1', 'mit-2'],
    appliedControlNames: [
      'Mandatory Multi-Factor Authentication (MFA) & FIDO2',
      'Strict Branch Protection & Mandatory 2-Peer Review',
    ],
    overallBaselineRisk: 88,
    overallMitigatedRisk: 24,
    baselineRiskLevel: 'Critical',
    mitigatedRiskLevel: 'Low',
    riskReductionPct: 73,
    stageResults: [
      {
        stage: 'IDE',
        baselineRisk: 95,
        mitigatedRisk: 33,
        status: 'Mitigated',
        riskLevel: 'Medium',
        mitigationsApplied: ['Mandatory Multi-Factor Authentication (MFA) & FIDO2'],
        findingsNotes: 'FIDO2 requirement intercepted credential reuse attempt at workstation.',
      },
      {
        stage: 'Version Control',
        baselineRisk: 90,
        mitigatedRisk: 27,
        status: 'Mitigated',
        riskLevel: 'Medium',
        mitigationsApplied: ['Strict Branch Protection & Mandatory 2-Peer Review'],
        findingsNotes: 'Direct push blocked; mandatory 2-peer approval stopped unreviewed backdoor.',
      },
      {
        stage: 'CI/CD',
        baselineRisk: 85,
        mitigatedRisk: 9,
        status: 'Blocked',
        riskLevel: 'Low',
        mitigationsApplied: [],
        findingsNotes: 'Upstream branch protection prevented poisoned code from triggering pipeline.',
      },
      {
        stage: 'Software Registry',
        baselineRisk: 80,
        mitigatedRisk: 8,
        status: 'Blocked',
        riskLevel: 'Low',
        mitigationsApplied: [],
        findingsNotes: 'No compromised artifact reached registry.',
      },
      {
        stage: 'Production',
        baselineRisk: 88,
        mitigatedRisk: 9,
        status: 'Blocked',
        riskLevel: 'Low',
        mitigationsApplied: [],
        findingsNotes: 'Production workloads remained fully unaffected.',
      },
    ],
    recommendations: [
      'Implement Automated Pre-Commit & Pre-Receive Secret Scanning (CTRL-05) to add extra IDE guardrails.',
    ],
  },
  {
    id: 'sim-1002',
    timestamp: '2026-11-09 08:30:10',
    userId: 'usr-2',
    userName: 'Angie Marie',
    userRole: 'Learner / Analyst',
    scenarioId: 'sc-2',
    scenarioName: 'Compromised CI/CD Pipeline Runner',
    entryPointStage: 'CI/CD',
    appliedControlIds: ['mit-3', 'mit-6'],
    appliedControlNames: [
      'Ephemeral Pipeline Isolation & Read-Only Runners',
      'Cryptographic Artifact Signing & Provenance Attestation (SLSA)',
    ],
    overallBaselineRisk: 64,
    overallMitigatedRisk: 19,
    baselineRiskLevel: 'High',
    mitigatedRiskLevel: 'Low',
    riskReductionPct: 70,
    stageResults: [
      {
        stage: 'IDE',
        baselineRisk: 10,
        mitigatedRisk: 2,
        status: 'Unaffected',
        riskLevel: 'Low',
        mitigationsApplied: [],
        findingsNotes: 'Stage is outside attack propagation route.',
      },
      {
        stage: 'Version Control',
        baselineRisk: 20,
        mitigatedRisk: 4,
        status: 'Unaffected',
        riskLevel: 'Low',
        mitigationsApplied: [],
        findingsNotes: 'Stage is outside attack propagation route.',
      },
      {
        stage: 'CI/CD',
        baselineRisk: 96,
        mitigatedRisk: 24,
        status: 'Mitigated',
        riskLevel: 'Low',
        mitigationsApplied: ['Ephemeral Pipeline Isolation & Read-Only Runners'],
        findingsNotes: 'Disposable runner container prevented persistent state tampering.',
      },
      {
        stage: 'Software Registry',
        baselineRisk: 92,
        mitigatedRisk: 23,
        status: 'Mitigated',
        riskLevel: 'Low',
        mitigationsApplied: ['Cryptographic Artifact Signing & Provenance Attestation (SLSA)'],
        findingsNotes: 'Unsigned binary rejected by registry admission policy.',
      },
      {
        stage: 'Production',
        baselineRisk: 95,
        mitigatedRisk: 10,
        status: 'Blocked',
        riskLevel: 'Low',
        mitigationsApplied: ['Cryptographic Artifact Signing & Provenance Attestation (SLSA)'],
        findingsNotes: 'Kubernetes cluster admission controller rejected unsigned container.',
      },
    ],
    recommendations: [
      'Implement Least-Privilege Production IAM & Zero-Trust Runtime (CTRL-07) for full defense in depth.',
    ],
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-09 09:15:32',
    actor: {
      name: 'Denzel Otunga',
      email: 'denzel.otunga@codeguard.internal',
      role: 'Administrator',
    },
    action: 'Executed Simulation Run',
    resource: 'Scenario: Compromised Developer Account',
    ipAddress: '192.168.1.104',
    status: 'success',
    details: 'Calculated 5-stage propagation with 2 mitigations applied. Overall risk reduced from 88 to 24.',
  },
  {
    id: 'log-2',
    timestamp: '2026-11-09 08:30:10',
    actor: {
      name: 'Angie Marie',
      email: 'angie.marie@codeguard.internal',
      role: 'Learner / Analyst',
    },
    action: 'Executed Simulation Run',
    resource: 'Scenario: Compromised CI/CD Pipeline Runner',
    ipAddress: '10.0.4.55',
    status: 'success',
    details: 'Tested Ephemeral Runner and Sigstore Cosign controls. Overall risk reduced from 64 to 19.',
  },
  {
    id: 'log-3',
    timestamp: '2026-11-09 07:45:00',
    actor: {
      name: 'Denzel Otunga',
      email: 'denzel.otunga@codeguard.internal',
      role: 'Administrator',
    },
    action: 'Project Security Scan Uploaded',
    resource: 'Project: payment-gateway-service.zip',
    ipAddress: '192.168.1.104',
    status: 'success',
    details: 'Scanned 14 files across 5 SDLC stages. Discovered 5 critical findings across IDE, CI/CD, and Production.',
  },
];

export const initialScannedProjects: ScannedProject[] = [
  {
    id: 'proj-1',
    name: 'payment-gateway-service',
    uploadedAt: '2026-11-09 09:40:15',
    fileCount: 18,
    sourceType: 'archive',
    overallScore: 78,
    securityGrade: 'D',
    riskLevel: 'Critical',
    stageScores: {
      'IDE': { score: 92, riskLevel: 'Critical', passedChecks: 1, failedChecks: 2 },
      'Version Control': { score: 75, riskLevel: 'Critical', passedChecks: 2, failedChecks: 1 },
      'CI/CD': { score: 85, riskLevel: 'Critical', passedChecks: 1, failedChecks: 2 },
      'Software Registry': { score: 68, riskLevel: 'High', passedChecks: 3, failedChecks: 1 },
      'Production': { score: 80, riskLevel: 'Critical', passedChecks: 1, failedChecks: 2 },
    },
    findings: [
      {
        id: 'f-1',
        stage: 'IDE',
        severity: 'Critical',
        category: 'Secrets',
        ruleId: 'SEC-LEAK-01',
        title: 'Hardcoded AWS Secret Access Key Committed',
        description: 'Plaintext high-entropy AWS production credential discovered in local configuration template.',
        file: 'config/local-env.sh',
        lineNumber: 14,
        offendingCode: 'export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"',
        remediation: 'Immediately revoke IAM credential in AWS Console and migrate to short-lived OIDC role assumption.',
        mitigationCode: 'CTRL-05',
      },
      {
        id: 'f-2',
        stage: 'Version Control',
        severity: 'High',
        category: 'VCS Governance',
        ruleId: 'VCS-PROT-02',
        title: 'Main Branch Missing Pull Request & Signed Commit Requirement',
        description: 'Repository settings permit unreviewed direct pushes to default branch without GPG/SSH commit signature.',
        file: '.github/settings.yml',
        lineNumber: 8,
        offendingCode: 'branch_protection: false # Allow quick hotfix pushes',
        remediation: 'Enforce minimum 2-peer review approvals and enable require_signed_commits in repository settings.',
        mitigationCode: 'CTRL-02',
      },
      {
        id: 'f-3',
        stage: 'CI/CD',
        severity: 'Critical',
        category: 'CI/CD Pipeline',
        ruleId: 'CICD-RUNNER-03',
        title: 'Unpinned Third-Party Action & Insecure Script Execution',
        description: 'GitHub Actions workflow references unpinned @master branch and passes untrusted PR payload to shell interpreter.',
        file: '.github/workflows/deploy.yml',
        lineNumber: 26,
        offendingCode: 'uses: thirdparty-actions/deploy-helper@master\nrun: eval "${{ github.event.pull_request.title }}"',
        remediation: 'Pin actions to immutable 40-character commit SHAs and sanitize all input variables into environment variables.',
        mitigationCode: 'CTRL-03',
      },
      {
        id: 'f-4',
        stage: 'Software Registry',
        severity: 'High',
        category: 'SCA Dependency',
        ruleId: 'SCA-DEP-04',
        title: 'Unpinned Dependency Lockfile with Vulnerable libwebp',
        description: 'package.json allows floating minor versions; sharp/libwebp 1.3.1 vulnerable to heap buffer overflow (CVE-2023-4863).',
        file: 'package.json',
        lineNumber: 32,
        offendingCode: '"sharp": "^0.32.0" # Resolved to vulnerable 0.32.1',
        remediation: 'Pin exact package version sharp: 0.33.2 with verified package-lock.json integrity hash.',
        mitigationCode: 'CTRL-04',
      },
      {
        id: 'f-5',
        stage: 'Production',
        severity: 'High',
        category: 'Production / IaC',
        ruleId: 'IAC-ROOT-05',
        title: 'Container Running as Root with Host Docker Socket Mount',
        description: 'Dockerfile omits USER directive and docker-compose exposes /var/run/docker.sock to container namespace.',
        file: 'Dockerfile',
        lineNumber: 41,
        offendingCode: 'VOLUME /var/run/docker.sock\n# USER not declared - runs as root UID 0',
        remediation: 'Declare non-root USER 10001:10001 and drop all privileges to prevent container breakout.',
        mitigationCode: 'CTRL-07',
      },
    ],
    status: 'completed',
    uploadedFiles: [
      { name: 'config/local-env.sh', size: 1240 },
      { name: '.github/settings.yml', size: 850 },
      { name: '.github/workflows/deploy.yml', size: 2410 },
      { name: 'package.json', size: 1980 },
      { name: 'Dockerfile', size: 1450 },
      { name: 'src/server.ts', size: 8420 },
    ],
  },
  {
    id: 'proj-2',
    name: 'cloud-infrastructure-k8s',
    uploadedAt: '2026-11-09 08:12:00',
    fileCount: 12,
    sourceType: 'manifest',
    overallScore: 44,
    securityGrade: 'B',
    riskLevel: 'Medium',
    stageScores: {
      'IDE': { score: 15, riskLevel: 'Low', passedChecks: 3, failedChecks: 0 },
      'Version Control': { score: 20, riskLevel: 'Low', passedChecks: 3, failedChecks: 0 },
      'CI/CD': { score: 48, riskLevel: 'Medium', passedChecks: 2, failedChecks: 1 },
      'Software Registry': { score: 25, riskLevel: 'Medium', passedChecks: 3, failedChecks: 0 },
      'Production': { score: 58, riskLevel: 'High', passedChecks: 2, failedChecks: 2 },
    },
    findings: [
      {
        id: 'f-201',
        stage: 'Production',
        severity: 'High',
        category: 'Production / IaC',
        ruleId: 'IAC-S3-01',
        title: 'S3 Backup Bucket Missing Server-Side KMS Encryption',
        description: 'Terraform configuration does not declare aws_s3_bucket_server_side_encryption_configuration.',
        file: 'terraform/s3_backups.tf',
        lineNumber: 19,
        offendingCode: 'resource "aws_s3_bucket" "prod_backup" {\n  bucket = "company-prod-backups"\n}',
        remediation: 'Add SSE block with aws:kms key algorithm and enable public access block.',
        mitigationCode: 'CTRL-07',
      },
      {
        id: 'f-202',
        stage: 'CI/CD',
        severity: 'Medium',
        category: 'CI/CD Pipeline',
        ruleId: 'CICD-TOKEN-02',
        title: 'CI Runner Over-Provisioned with Cluster-Admin Binding',
        description: 'Kubernetes RBAC ClusterRoleBinding attaches cluster-admin to automated deployer service account.',
        file: 'k8s/rbac-ci.yaml',
        lineNumber: 14,
        offendingCode: 'roleRef:\n  kind: ClusterRole\n  name: cluster-admin',
        remediation: 'Scope CI deployment permissions to target namespace with specific resource verbs.',
        mitigationCode: 'CTRL-03',
      },
    ],
    status: 'completed',
    uploadedFiles: [
      { name: 'terraform/s3_backups.tf', size: 1820 },
      { name: 'k8s/rbac-ci.yaml', size: 940 },
      { name: 'terraform/main.tf', size: 4500 },
    ],
  },
];
