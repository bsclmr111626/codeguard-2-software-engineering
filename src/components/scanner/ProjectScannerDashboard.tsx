import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileCode,
  FolderGit2,
  Play,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  FileArchive,
  Lock,
  GitBranch,
  X,
  FileText,
  Cpu,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ScannedProject,
  ProjectScanFinding,
  SdlcStage,
  RiskLevel,
  UserAccount,
} from '../../types';
import {
  SDLC_STAGES,
  getRiskLevel,
  getSecurityGrade,
} from '../../data/mockData';

interface ProjectScannerDashboardProps {
  scannedProjects: ScannedProject[];
  currentUser: UserAccount;
  onAddProject: (project: ScannedProject) => void;
  onUpdateFindingStatus: (projectId: string, findingId: string, resolved: boolean) => void;
  onNavigateToSimulator: (scenarioId?: string) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const ProjectScannerDashboard: React.FC<ProjectScannerDashboardProps> = ({
  scannedProjects,
  currentUser,
  onAddProject,
  onUpdateFindingStatus,
  onNavigateToSimulator,
  onShowToast,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    scannedProjects[0]?.id || 'proj-1'
  );

  // Upload Modal / Form State
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'git' | 'sample'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [projectName, setProjectName] = useState('');
  const [gitUrl, setGitUrl] = useState('https://github.com/my-org/core-api-service.git');
  const [gitBranch, setGitBranch] = useState('main');

  // Scanner Progress State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  // Findings Filter
  const [stageFilter, setStageFilter] = useState<'all' | SdlcStage>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | RiskLevel>('all');
  const [activeFindingDetail, setActiveFindingDetail] = useState<ProjectScanFinding | null>(null);

  const activeProject =
    scannedProjects.find((p) => p.id === selectedProjectId) || scannedProjects[0];

  // Python Matplotlib Polar Radar State
  const [showRadarChart, setShowRadarChart] = useState(false);
  const [radarImage, setRadarImage] = useState<string | null>(null);
  const [isLoadingRadar, setIsLoadingRadar] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    if (showRadarChart && activeProject) {
      const fetchRadar = async () => {
        try {
          setIsLoadingRadar(true);
          const stages = ['IDE', 'Git VCS', 'CI/CD', 'Registry', 'Production'];
          const scores = [
            activeProject.stageScores['IDE']?.score ?? 20,
            activeProject.stageScores['Version Control']?.score ?? 20,
            activeProject.stageScores['CI/CD']?.score ?? 20,
            activeProject.stageScores['Software Registry']?.score ?? 20,
            activeProject.stageScores['Production']?.score ?? 20,
          ];

          const res = await fetch('/api/python/radar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stages,
              scores,
              title: `${activeProject.name} (Risk Profile)`,
            }),
          });

          if (res.ok) {
            const json = await res.json();
            if (!isCancelled && json.radar) {
              setRadarImage(json.radar);
            }
          }
        } catch (err) {
          console.error('Failed to load Python Matplotlib radar:', err);
        } finally {
          if (!isCancelled) setIsLoadingRadar(false);
        }
      };

      fetchRadar();
    }

    return () => {
      isCancelled = true;
    };
  }, [showRadarChart, activeProject]);

  // Scan simulation steps
  const scanningPhases = [
    'Parsing project structure and analyzing manifest trees...',
    'Stage 1 (IDE): Scanning for hardcoded AWS, GCP, database secrets and insecure extensions...',
    'Stage 2 (Version Control): Verifying branch protection rules, PR reviewers, and GPG signed commits...',
    'Stage 3 (CI/CD): Auditing GitHub Actions & runner permissions for command injection vectors...',
    'Stage 4 (Software Registry): Performing SCA on dependencies, lockfile hashes, and typosquatting risks...',
    'Stage 5 (Production & IaC): Checking Dockerfile non-root directives, Kubernetes manifests, and cloud bucket encryption...',
    'Compiling composite 5-stage risk matrix and calculating security grade...',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      if (!projectName) {
        const baseName = filesArray[0].name.replace(/\.[^/.]+$/, '');
        setProjectName(baseName);
      }
    }
  };

  const handleStartScan = (
    nameToScan: string,
    sourceType: ScannedProject['sourceType'],
    customFiles?: { name: string; size: number }[]
  ) => {
    setIsScanning(true);
    setScanStep(0);
    setScanLogs([`[INFO] Starting CodeGuard 5-Stage Security Scanner for ${nameToScan}...`]);

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < scanningPhases.length) {
        setScanStep(stepIdx);
        setScanLogs((prev) => [...prev, `[INFO] ${scanningPhases[stepIdx]}`]);
      } else {
        clearInterval(interval);

        // Generate findings based on name or realistic simulation
        const isClean = nameToScan.toLowerCase().includes('clean') || nameToScan.toLowerCase().includes('secure');

        const newFindings: ProjectScanFinding[] = isClean
          ? [
              {
                id: `f-${Date.now()}-1`,
                stage: 'Software Registry',
                severity: 'Low',
                category: 'SCA Dependency',
                ruleId: 'SCA-NOTICE-01',
                title: 'Transitive Dependency Has Minor Patch Available',
                description: 'Package lodash is on 4.17.20. Patch 4.17.21 available.',
                file: 'package.json',
                lineNumber: 12,
                offendingCode: '"lodash": "4.17.20"',
                remediation: 'Run npm update lodash to bump to latest verified minor release.',
                mitigationCode: 'CTRL-04',
              },
            ]
          : [
              {
                id: `f-${Date.now()}-1`,
                stage: 'IDE',
                severity: 'Critical',
                category: 'Secrets',
                ruleId: 'SEC-TOKEN-01',
                title: 'Unencrypted Production API Token in Environment File',
                description: 'Hardcoded Bearer API token found committed in local project configuration.',
                file: 'config/app-env.json',
                lineNumber: 18,
                offendingCode: '"STRIPE_SECRET_KEY": "sk_live_51M00000EXAMPLEKEY"',
                remediation: 'Remove hardcoded secret and inject via secure vault or CI runner OIDC federation.',
                mitigationCode: 'CTRL-05',
              },
              {
                id: `f-${Date.now()}-2`,
                stage: 'CI/CD',
                severity: 'Critical',
                category: 'CI/CD Pipeline',
                ruleId: 'CICD-INJECT-02',
                title: 'Untrusted Pull Request Title Injected into Bash Execution',
                description: 'GitHub Actions workflow runs shell command interpolating github.event.pull_request.title without sanitization.',
                file: '.github/workflows/ci.yml',
                lineNumber: 34,
                offendingCode: 'run: echo "PR Name: ${{ github.event.pull_request.title }}" | bash',
                remediation: 'Pass untrusted context expressions through environment variables rather than direct inline expansion.',
                mitigationCode: 'CTRL-03',
              },
              {
                id: `f-${Date.now()}-3`,
                stage: 'Software Registry',
                severity: 'High',
                category: 'SCA Dependency',
                ruleId: 'SCA-VULN-03',
                title: 'Vulnerable Upstream Package: axios < 1.7.4 (CVE-2024-39338)',
                description: 'Server-Side Request Forgery vulnerability present when handling absolute URLs.',
                file: 'package-lock.json',
                lineNumber: 88,
                offendingCode: '"axios": "0.21.1"',
                remediation: 'Upgrade axios to version >= 1.7.4 and lock SHA-512 package hash.',
                mitigationCode: 'CTRL-04',
              },
              {
                id: `f-${Date.now()}-4`,
                stage: 'Production',
                severity: 'High',
                category: 'Production / IaC',
                ruleId: 'DOCKER-USER-04',
                title: 'Container Base Image Runs Default Root Privileges',
                description: 'Dockerfile does not specify USER directive; runs application processes with root capabilities.',
                file: 'Dockerfile',
                lineNumber: 22,
                offendingCode: 'ENTRYPOINT ["node", "dist/server.js"]\n# No USER declaration',
                remediation: 'Add `USER 10001:10001` before ENTRYPOINT to enforce rootless execution.',
                mitigationCode: 'CTRL-07',
              },
            ];

        const overallScore = isClean ? 14 : 76;
        const riskLevel = getRiskLevel(overallScore);
        const securityGrade = getSecurityGrade(overallScore);

        const newProject: ScannedProject = {
          id: `proj-${Date.now()}`,
          name: nameToScan,
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          fileCount: customFiles?.length || selectedFiles.length || 8,
          sourceType,
          overallScore,
          securityGrade,
          riskLevel,
          stageScores: {
            'IDE': {
              score: isClean ? 10 : 88,
              riskLevel: isClean ? 'Low' : 'Critical',
              passedChecks: isClean ? 3 : 1,
              failedChecks: isClean ? 0 : 1,
            },
            'Version Control': {
              score: isClean ? 15 : 45,
              riskLevel: isClean ? 'Low' : 'Medium',
              passedChecks: 2,
              failedChecks: isClean ? 0 : 1,
            },
            'CI/CD': {
              score: isClean ? 12 : 82,
              riskLevel: isClean ? 'Low' : 'Critical',
              passedChecks: isClean ? 4 : 1,
              failedChecks: isClean ? 0 : 1,
            },
            'Software Registry': {
              score: isClean ? 18 : 74,
              riskLevel: isClean ? 'Low' : 'High',
              passedChecks: isClean ? 3 : 1,
              failedChecks: isClean ? 0 : 1,
            },
            'Production': {
              score: isClean ? 8 : 70,
              riskLevel: isClean ? 'Low' : 'High',
              passedChecks: isClean ? 3 : 1,
              failedChecks: isClean ? 0 : 1,
            },
          },
          findings: newFindings,
          status: 'completed',
          uploadedFiles: customFiles || selectedFiles.map((f) => ({ name: f.name, size: f.size })),
        };

        onAddProject(newProject);
        setSelectedProjectId(newProject.id);
        setIsScanning(false);
        setSelectedFiles([]);
        setProjectName('');
        onShowToast(
          'Project Scan Finalized',
          `Completed 5-stage SDLC scan for "${newProject.name}". Grade: ${newProject.securityGrade} (${newProject.overallScore}/100).`,
          isClean ? 'success' : 'warning'
        );
      }
    }, 600);
  };

  const filteredFindings = (activeProject?.findings || []).filter((f) => {
    if (stageFilter !== 'all' && f.stage !== stageFilter) return false;
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    return true;
  });

  const handleResolveFinding = (findingId: string) => {
    onUpdateFindingStatus(activeProject.id, findingId, true);
    onShowToast('Finding Remediated', 'Applied recommended mitigation fix. Project risk reduced.', 'success');
  };

  const handleExportScanJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeProject.name}-security-audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Scan Report Downloaded', `Exported 5-stage audit report for ${activeProject.name}.`, 'success');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Banner / Upload Callout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Project Security Scanner & SDLC Audit Dashboard
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Upload your software project archive, dependency lockfile, or repository to scan for supply chain vulnerabilities across all 5 SDLC stages (IDE, Version Control, CI/CD, Software Registry, and Production).
          </p>
        </div>

        {/* Project Switcher Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs text-slate-400 font-mono">Audited Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
          >
            {scannedProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Grade {p.securityGrade})
              </option>
            ))}
          </select>
          <button
            onClick={handleExportScanJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Project Upload & Intake Console */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Upload New Project for Security Audit</h3>
          </div>

          {/* Upload Method Switcher */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => setUploadMethod('upload')}
              className={`px-3 py-1 rounded-md transition-all ${
                uploadMethod === 'upload'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Upload Archive / Files
            </button>
            <button
              onClick={() => setUploadMethod('git')}
              className={`px-3 py-1 rounded-md transition-all ${
                uploadMethod === 'git'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Git Repo URL
            </button>
            <button
              onClick={() => setUploadMethod('sample')}
              className={`px-3 py-1 rounded-md transition-all ${
                uploadMethod === 'sample'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Preloaded Test Projects
            </button>
          </div>
        </div>

        {uploadMethod === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/60 rounded-xl p-6 text-center transition-colors bg-slate-950/40">
              <UploadCloud className="w-8 h-8 text-sky-400 mx-auto mb-2 opacity-80" />
              <div className="text-xs font-semibold text-white">
                Drag and drop your project ZIP, TAR, package.json, Dockerfile, or workflow YAML
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Supports: .zip, .tar.gz, package.json, requirements.txt, go.mod, Dockerfile, .yml, .tf
              </p>

              <label className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg cursor-pointer transition-colors shadow-sm">
                <span>Browse Files</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {selectedFiles.length > 0 && (
                <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-lg max-w-md mx-auto text-left text-xs font-mono">
                  <div className="font-semibold text-sky-300 mb-1">
                    Selected Files ({selectedFiles.length}):
                  </div>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {selectedFiles.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex justify-between truncate">
                        <span>{f.name}</span>
                        <span className="text-slate-500">{(f.size / 1024).toFixed(1)} KB</span>
                      </li>
                    ))}
                    {selectedFiles.length > 4 && (
                      <li className="text-slate-500">+{selectedFiles.length - 4} more files</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Assign Project Name (e.g. checkout-billing-api)"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                disabled={selectedFiles.length === 0 || isScanning}
                onClick={() => handleStartScan(projectName || 'custom-uploaded-project', 'archive')}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start 5-Stage Project Scan</span>
              </button>
            </div>
          </div>
        )}

        {uploadMethod === 'git' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Git Repository Clone URL (HTTPS)
                </label>
                <div className="relative">
                  <FolderGit2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-300 text-[11px] mb-1">Target Branch</label>
                  <input
                    type="text"
                    value={gitBranch}
                    onChange={(e) => setGitBranch(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-[11px] mb-1">Scan Preset</label>
                  <select className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500">
                    <option>Full Supply Chain Audit (5 Stages)</option>
                    <option>SCA & Secrets Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                disabled={isScanning}
                onClick={() => {
                  const repoName = gitUrl.split('/').pop()?.replace('.git', '') || 'git-cloned-service';
                  handleStartScan(repoName, 'git_url');
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Clone & Scan Repository</span>
              </button>
            </div>
          </div>
        )}

        {uploadMethod === 'sample' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Select a pre-built sample project codebase to test the scanning engine immediately:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  name: 'vulnerable-ecommerce-microservice',
                  desc: 'Includes hardcoded AWS keys, unpinned npm dependencies, and root Dockerfile.',
                  type: 'archive' as const,
                  badge: 'Critical Risk',
                  color: 'border-red-800/80 bg-red-950/20 text-red-300',
                },
                {
                  name: 'kubernetes-cloud-infra-repo',
                  desc: 'Terraform S3 bucket missing encryption and overprivileged CI service account.',
                  type: 'manifest' as const,
                  badge: 'Medium Risk',
                  color: 'border-amber-800/80 bg-amber-950/20 text-amber-300',
                },
                {
                  name: 'secure-auth-broker-hardened',
                  desc: 'Zero secrets, pinned dependencies, SLSA cosign container signing, rootless container.',
                  type: 'archive' as const,
                  badge: 'Low Risk (Grade A)',
                  color: 'border-emerald-800/80 bg-emerald-950/20 text-emerald-300',
                },
              ].map((sample) => (
                <div
                  key={sample.name}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${sample.color}`}>
                        {sample.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white font-mono">{sample.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{sample.desc}</p>
                  </div>

                  <button
                    disabled={isScanning}
                    onClick={() => handleStartScan(sample.name, sample.type)}
                    className="w-full py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-sky-600 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Scan Sample</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Terminal Output while scanning */}
        {isScanning && (
          <div className="p-4 rounded-xl border border-sky-500/40 bg-slate-950 shadow-inner space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-sky-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Executing 5-Stage Supply Chain Audit Pipeline...
              </span>
              <span className="text-slate-400">
                Phase {scanStep + 1} of {scanningPhases.length}
              </span>
            </div>

            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${((scanStep + 1) / scanningPhases.length) * 100}%` }}
              />
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300 pt-2 border-t border-slate-800/80">
              {scanLogs.map((log, i) => (
                <div key={i} className="text-slate-400">
                  <span className="text-sky-500 mr-2">➜</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Project Security Scorecard */}
      {activeProject && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Overall Security Grade Card */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold font-mono border-2 shrink-0 ${
                  activeProject.securityGrade === 'A'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                    : activeProject.securityGrade === 'B'
                    ? 'border-sky-500 bg-sky-950/40 text-sky-400'
                    : activeProject.securityGrade === 'C'
                    ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                    : 'border-red-500 bg-red-950/40 text-red-400'
                }`}
              >
                <span className="text-2xl leading-none">{activeProject.securityGrade}</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Grade</span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Overall Composite Risk
                </span>
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {activeProject.overallScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
                <span
                  className={`inline-block text-[10px] font-mono font-bold uppercase mt-0.5 px-1.5 py-0.2 rounded border ${
                    activeProject.riskLevel === 'Critical'
                      ? 'text-red-400 bg-red-950/80 border-red-800/80'
                      : activeProject.riskLevel === 'High'
                      ? 'text-amber-300 bg-amber-950/80 border-amber-800/80'
                      : activeProject.riskLevel === 'Medium'
                      ? 'text-sky-300 bg-sky-950/80 border-sky-800/80'
                      : 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80'
                  }`}
                >
                  {activeProject.riskLevel}
                </span>
              </div>
            </div>

            {/* Total Findings */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Detected Deficiencies
              </span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
                {activeProject.findings.length}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-2">
                <span className="text-red-400 font-semibold">
                  {activeProject.findings.filter((f) => f.severity === 'Critical').length} Critical
                </span>
                <span>·</span>
                <span className="text-amber-300">
                  {activeProject.findings.filter((f) => f.severity === 'High').length} High
                </span>
              </div>
            </div>

            {/* File & Source Telemetry */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Audited Artifacts
              </span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
                {activeProject.fileCount} <span className="text-xs font-normal text-slate-400">files</span>
              </div>
              <div className="text-[11px] font-mono text-sky-400 mt-2 truncate">
                Source: {activeProject.sourceType.toUpperCase()}
              </div>
            </div>

            {/* Attack Simulator Bridge */}
            <div className="p-5 rounded-xl border border-sky-500/30 bg-sky-950/20 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold block">
                  Supply Chain Simulation
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Test how detected flaws would propagate across production
                </p>
              </div>

              <button
                onClick={() => onNavigateToSimulator('sc-1')}
                className="mt-3 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Simulate Attack Path</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5-Stage Health Breakdown Strip */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  5-Stage SDLC Security Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Normalized vulnerability risk score (0–100) and check pass rates across each stage
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRadarChart(!showRadarChart)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                    showRadarChart
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span>{showRadarChart ? 'Hide Radar' : 'Python Matplotlib Radar'}</span>
                </button>
              </div>
            </div>

            {showRadarChart && (
              <div className="p-4 rounded-xl border border-sky-500/30 bg-slate-950/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs text-sky-300">
                    <ImageIcon className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold">Python Matplotlib 3.6 Polar Attack Surface Radar</span>
                    <span className="text-[10px] px-2 py-0.5 bg-sky-950 text-sky-400 border border-sky-800 rounded">
                      backend/simulator/charts.py
                    </span>
                  </div>
                  {radarImage && (
                    <a
                      href={radarImage}
                      download={`codeguard-radar-${activeProject.name.toLowerCase().replace(/\s+/g, '-')}.png`}
                      className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save PNG</span>
                    </a>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-2">
                  {isLoadingRadar ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-2 font-mono text-xs text-slate-400">
                      <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
                      <span>Generating Matplotlib polar projection in Python...</span>
                    </div>
                  ) : radarImage ? (
                    <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 max-w-md w-full shadow-lg">
                      <img
                        src={radarImage}
                        alt="Python Matplotlib SDLC Radar"
                        className="w-full h-auto rounded-lg mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono py-8">
                      Matplotlib polar chart unavailable.
                    </div>
                  )}

                  <div className="max-w-xs space-y-2 text-xs font-mono text-slate-300">
                    <div className="text-sky-400 font-bold uppercase tracking-wider text-[11px]">
                      Mathematical Surface Projection
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      This radar chart calculates the convex polygon area across all 5 supply chain dimensions.
                      Larger surface areas indicate elevated vulnerability chaining potential where an attacker in IDE or VCS can cross into CI/CD runners and Registry artifacts.
                    </p>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] space-y-1 text-slate-400">
                      <div>• Engine: <span className="text-slate-200">Python 3.10 + Django ORM</span></div>
                      <div>• Lib: <span className="text-slate-200">matplotlib.pyplot (polar projection)</span></div>
                      <div>• Metric: <span className="text-slate-200">Stage Risk [0–100]</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {SDLC_STAGES.map((stage, idx) => {
                const stageScore = activeProject.stageScores[stage] || {
                  score: 20,
                  riskLevel: 'Low',
                  passedChecks: 2,
                  failedChecks: 0,
                };
                const findingsAtStage = activeProject.findings.filter((f) => f.stage === stage);

                return (
                  <div
                    key={stage}
                    onClick={() => setStageFilter(stageFilter === stage ? 'all' : stage)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      stageFilter === stage
                        ? 'border-sky-500 bg-sky-950/30 ring-1 ring-sky-500/40'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span>0{idx + 1}. STAGE</span>
                        <span
                          className={`font-bold ${
                            stageScore.failedChecks > 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          {stageScore.failedChecks > 0
                            ? `${stageScore.failedChecks} Fail`
                            : 'All Pass'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{stage}</h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400">Risk Score:</span>
                        <span
                          className={`font-bold tabular-nums ${
                            stageScore.score > 70
                              ? 'text-red-400'
                              : stageScore.score > 40
                              ? 'text-amber-300'
                              : 'text-emerald-400'
                          }`}
                        >
                          {stageScore.score}
                        </span>
                      </div>

                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            stageScore.score > 70
                              ? 'bg-red-500'
                              : stageScore.score > 40
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${stageScore.score}%` }}
                        />
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                        <span>{findingsAtStage.length} findings</span>
                        <span className="text-sky-400">Filter →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Findings & Vulnerabilities Table */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Detected Defects & Supply Chain Misconfigurations ({filteredFindings.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inspect file paths, code snippets, and apply 1-click preventive remediations
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="all">All SDLC Stages</option>
                  {SDLC_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="all">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Findings List */}
            <div className="space-y-3">
              {filteredFindings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-mono text-xs">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white">No vulnerabilities found for current filter criteria.</p>
                  <p className="text-slate-500 mt-0.5">All audited checks passed successfully.</p>
                </div>
              ) : (
                filteredFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 transition-all hover:border-slate-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              finding.severity === 'Critical'
                                ? 'text-red-400 bg-red-950 border-red-800'
                                : finding.severity === 'High'
                                ? 'text-amber-300 bg-amber-950 border-amber-800'
                                : 'text-sky-300 bg-sky-950 border-sky-800'
                            }`}
                          >
                            {finding.severity}
                          </span>
                          <span className="text-sky-400 font-semibold">{finding.stage} Stage</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400 font-mono">{finding.category}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-300">{finding.ruleId}</span>
                        </div>

                        <h4 className="text-sm font-bold text-white mt-1">
                          {finding.title}
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {finding.description}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 shrink-0">
                        <span className="text-slate-400 font-mono text-xs">
                          {finding.file} {finding.lineNumber ? `:${finding.lineNumber}` : ''}
                        </span>

                        <button
                          onClick={() => handleResolveFinding(finding.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Apply Remediation</span>
                        </button>
                      </div>
                    </div>

                    {/* Code Snippet Box */}
                    {finding.offendingCode && (
                      <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/90 font-mono text-xs overflow-x-auto space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase">
                          Offending Code Snippet:
                        </div>
                        <div className="text-red-400 bg-red-950/40 p-1.5 rounded border border-red-900/50">
                          {finding.offendingCode}
                        </div>
                      </div>
                    )}

                    {/* Remediation Note */}
                    <div className="p-3 rounded-lg border border-emerald-900/40 bg-emerald-950/20 text-xs text-emerald-200 font-mono flex items-start gap-2">
                      <span className="font-bold text-emerald-400 shrink-0">REMEDY:</span>
                      <span className="leading-relaxed">{finding.remediation}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
