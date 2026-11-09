import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ArrowRight,
  TrendingDown,
  RotateCcw,
  CheckCircle2,
  Info,
  Download,
  Terminal,
  Layers,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileCode,
  Image as ImageIcon,
  Cpu,
} from 'lucide-react';
import {
  SdlcStage,
  Scenario,
  MitigationControl,
  SimulationRecord,
  StageSimulationResult,
  UserAccount,
  RiskLevel,
} from '../../types';
import { SDLC_STAGES, runSimulationEngine, getRiskLevel } from '../../data/mockData';

interface AttackSimulatorProps {
  scenarios: Scenario[];
  mitigations: MitigationControl[];
  currentUser: UserAccount;
  onSaveSimulation: (record: SimulationRecord) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'info') => void;
}

export const AttackSimulator: React.FC<AttackSimulatorProps> = ({
  scenarios,
  mitigations,
  currentUser,
  onSaveSimulation,
  onShowToast,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.id || 'sc-1');
  const [selectedControlIds, setSelectedControlIds] = useState<string[]>(['mit-1', 'mit-2']);
  const [activeStageDetail, setActiveStageDetail] = useState<SdlcStage | null>('IDE');

  // Matplotlib & Python Engine State
  const [chartViewMode, setChartViewMode] = useState<'matplotlib' | 'interactive'>('matplotlib');
  const [matplotlibImage, setMatplotlibImage] = useState<string | null>(null);
  const [isGeneratingChart, setIsGeneratingChart] = useState(false);
  const [showCodeInspector, setShowCodeInspector] = useState(false);
  const [pythonCodeFiles, setPythonCodeFiles] = useState<{ [key: string]: string } | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'charts' | 'engine' | 'models'>('charts');

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const appliedControls = mitigations.filter((m) => selectedControlIds.includes(m.id));

  // Run simulation calculation
  const simulationResult = useMemo(() => {
    return runSimulationEngine(selectedScenario, appliedControls, currentUser);
  }, [selectedScenario, appliedControls, currentUser]);

  // Request Python Matplotlib Chart from backend API
  useEffect(() => {
    let isCancelled = false;
    const fetchMatplotlibChart = async () => {
      try {
        setIsGeneratingChart(true);
        const stages = simulationResult.stageResults.map((s) =>
          s.stage === 'Software Registry' ? 'Registry' : s.stage === 'Version Control' ? 'Git VCS' : s.stage
        );
        const baseline = simulationResult.stageResults.map((s) => s.baselineRisk);
        const mitigated = simulationResult.stageResults.map((s) => s.mitigatedRisk);

        const res = await fetch('/api/python/chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stages,
            baseline,
            mitigated,
            title: selectedScenario.name,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (!isCancelled && json.chart) {
            setMatplotlibImage(json.chart);
          }
        }
      } catch (err) {
        console.error('Python Matplotlib generation error:', err);
      } finally {
        if (!isCancelled) setIsGeneratingChart(false);
      }
    };

    fetchMatplotlibChart();
    return () => {
      isCancelled = true;
    };
  }, [selectedScenario, selectedControlIds, simulationResult]);

  // Fetch Python Source Code for Inspection
  const handleOpenCodeInspector = async () => {
    setShowCodeInspector(true);
    if (!pythonCodeFiles) {
      try {
        const res = await fetch('/api/python/code');
        if (res.ok) {
          const json = await res.json();
          setPythonCodeFiles(json.files);
        }
      } catch (err) {
        console.error('Failed to fetch Python code:', err);
      }
    }
  };

  const handleToggleControl = (controlId: string) => {
    setSelectedControlIds((prev) =>
      prev.includes(controlId) ? prev.filter((id) => id !== controlId) : [...prev, controlId]
    );
  };

  const handleSelectAllRecommended = () => {
    const recommended = mitigations
      .filter((m) => m.isRecommendedFor.includes(selectedScenario.id))
      .map((m) => m.id);
    setSelectedControlIds(recommended);
    onShowToast('Applied Recommended Controls', 'Enabled targeted defense baseline for this attack vector.', 'success');
  };

  const handleClearControls = () => {
    setSelectedControlIds([]);
    onShowToast('Cleared All Mitigations', 'Simulating unmitigated worst-case attack propagation.', 'warning');
  };

  const handleSaveToHistory = () => {
    onSaveSimulation(simulationResult);
    onShowToast('Simulation Saved', `Saved run "${selectedScenario.name}" to audit history.`, 'success');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(simulationResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `codeguard-simulation-${selectedScenario.id}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Report Exported', 'Simulation record and 5-stage telemetry exported as JSON.', 'success');
  };

  const getStageStatusColor = (status: StageSimulationResult['status']) => {
    switch (status) {
      case 'Compromised':
        return {
          border: 'border-red-500/80',
          bg: 'bg-red-950/40',
          badge: 'bg-red-900/60 text-red-300 border-red-700/80',
          text: 'text-red-400',
          icon: ShieldAlert,
        };
      case 'Propagated':
        return {
          border: 'border-amber-500/80',
          bg: 'bg-amber-950/40',
          badge: 'bg-amber-900/60 text-amber-300 border-amber-700/80',
          text: 'text-amber-400',
          icon: ShieldX,
        };
      case 'Mitigated':
        return {
          border: 'border-sky-500/80',
          bg: 'bg-sky-950/40',
          badge: 'bg-sky-900/60 text-sky-300 border-sky-700/80',
          text: 'text-sky-400',
          icon: Shield,
        };
      case 'Blocked':
        return {
          border: 'border-emerald-500/80',
          bg: 'bg-emerald-950/40',
          badge: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/80',
          text: 'text-emerald-400',
          icon: ShieldCheck,
        };
      case 'Unaffected':
      default:
        return {
          border: 'border-slate-800',
          bg: 'bg-slate-900/50',
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          text: 'text-slate-400',
          icon: Shield,
        };
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return 'text-red-400 bg-red-950/80 border-red-800/80';
      case 'High':
        return 'text-amber-300 bg-amber-950/80 border-amber-800/80';
      case 'Medium':
        return 'text-sky-300 bg-sky-950/80 border-sky-800/80';
      case 'Low':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Software Supply Chain Attack Simulator
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-950 border border-sky-500/40 text-sky-300 flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              Python 3.10 · Django · Matplotlib
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Simulate how software factory attacks propagate through the 5 SDLC stages (IDE, Version Control, CI/CD, Software Registry, Production).
            Evaluate transparent 0–100 risk metrics and test preventive controls before and after mitigation using Python scripting and Matplotlib charts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenCodeInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors font-mono"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Python Script</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
          <button
            onClick={handleSaveToHistory}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Save to History</span>
          </button>
        </div>
      </div>

      {/* Step 1 & Step 2 Selectors Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Attack Scenario Selector (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-sky-400">
                Step 1 of 2
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
                Select Threat Scenario
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {scenarios.length} Predefined
            </span>
          </div>

          {/* Scenarios Grid */}
          <div className="space-y-2">
            {scenarios.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <div
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenarioId(sc.id);
                    const rec = mitigations
                      .filter((m) => m.isRecommendedFor.includes(sc.id))
                      .map((m) => m.id);
                    setSelectedControlIds(rec.slice(0, 2));
                  }}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-950/30 shadow-md ring-1 ring-sky-500/40'
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white truncate">
                          {sc.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${getRiskBadge(
                        sc.baseSeverity
                      )}`}
                    >
                      {sc.baseSeverity}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-sky-400">Entry: {sc.entryPointStage}</span>
                    <span className="text-slate-400">{sc.realWorldExample}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Scenario Context Panel */}
          <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/80 text-xs space-y-1.5 font-mono">
            <div className="text-[11px] text-slate-400">
              <strong className="text-slate-300">Attack Vector:</strong> {selectedScenario.attackVector}
            </div>
            <div className="text-[11px] text-slate-400">
              <strong className="text-slate-300">CWE Mapping:</strong> {selectedScenario.cweMapping}
            </div>
          </div>
        </div>

        {/* Right: Preventive Controls & Mitigations Selector (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-sky-400">
                  Step 2 of 2
                </span>
                <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
                  Apply Preventive Mitigations
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllRecommended}
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Recommend</span>
                </button>
                <span className="text-slate-700">|</span>
                <button
                  type="button"
                  onClick={handleClearControls}
                  className="text-slate-400 hover:text-white"
                >
                  Reset (0)
                </button>
              </div>
            </div>

            {/* Mitigations Checkboxes List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {mitigations.map((ctrl) => {
                const isChecked = selectedControlIds.includes(ctrl.id);
                const isRecommended = ctrl.isRecommendedFor.includes(selectedScenario.id);

                return (
                  <div
                    key={ctrl.id}
                    onClick={() => handleToggleControl(ctrl.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'border-sky-500/80 bg-sky-950/20'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-1 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0 cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-sky-400">
                            {ctrl.code}
                          </span>
                          <span className="font-semibold text-xs text-white truncate">
                            {ctrl.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isRecommended && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/80">
                              Targeted
                            </span>
                          )}
                          <span className="text-[11px] font-mono font-bold text-emerald-400">
                            -{ctrl.riskReductionPct}%
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {ctrl.description}
                      </p>

                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-500">Defends:</span>
                        {ctrl.targetStages.map((st) => (
                          <span
                            key={st}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Applied Controls: <strong className="text-white">{selectedControlIds.length}</strong> of {mitigations.length}
            </span>
            <span className="text-emerald-400">Simulated via Python 3.10 Engine</span>
          </div>
        </div>
      </div>

      {/* Visual Attack Propagation Map Across 5 SDLC Stages */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Attack Propagation Visualizer (5 SDLC Stages)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any stage below to inspect failure modes, applied defenses, and telemetry
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Compromised
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Propagated
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500" /> Mitigated
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Blocked
            </span>
          </div>
        </div>

        {/* 5-Stage Diagram Cards Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {simulationResult.stageResults.map((stageResult, idx) => {
            const style = getStageStatusColor(stageResult.status);
            const isEntry = stageResult.stage === selectedScenario.entryPointStage;
            const isSelected = activeStageDetail === stageResult.stage;
            const IconComponent = style.icon;

            return (
              <div
                key={stageResult.stage}
                onClick={() => setActiveStageDetail(stageResult.stage)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                  style.bg
                } ${style.border} ${
                  isSelected ? 'ring-2 ring-sky-400 shadow-xl' : 'hover:scale-[1.02]'
                }`}
              >
                {/* Entry Point Badge */}
                {isEntry && (
                  <div className="absolute -top-2.5 left-4 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white shadow-sm">
                    Attack Entry Point
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      0{idx + 1}. Stage
                    </span>
                    <IconComponent className={`w-4 h-4 ${style.text}`} />
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">
                    {stageResult.stage}
                  </h4>

                  <span
                    className={`inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${style.badge}`}
                  >
                    {stageResult.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Mitigated Risk:</span>
                    <span className={`font-bold tabular-nums ${style.text}`}>
                      {stageResult.mitigatedRisk} / 100
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        stageResult.mitigatedRisk > 70
                          ? 'bg-red-500'
                          : stageResult.mitigatedRisk > 40
                          ? 'bg-amber-500'
                          : stageResult.mitigatedRisk > 20
                          ? 'bg-sky-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${stageResult.mitigatedRisk}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Base: {stageResult.baselineRisk}</span>
                    <span className="text-emerald-400">
                      -{Math.max(0, stageResult.baselineRisk - stageResult.mitigatedRisk)} pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Drawer */}
        {activeStageDetail && (
          <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/80 text-xs space-y-2">
            {(() => {
              const res = simulationResult.stageResults.find((s) => s.stage === activeStageDetail);
              if (!res) return null;
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono text-sm">
                        Stage Telemetry: {res.stage}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          getStageStatusColor(res.status).badge
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Score: <strong className="text-white">{res.mitigatedRisk}</strong> (was {res.baselineRisk})
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed font-sans">{res.findingsNotes}</p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-500">Active Controls at Stage:</span>
                    {res.mitigationsApplied.length > 0 ? (
                      res.mitigationsApplied.map((name, i) => (
                        <span key={i} className="text-sky-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          ✓ {name}
                        </span>
                      ))
                    ) : (
                      <span className="text-amber-400">None applied. Unprotected against direct exploit.</span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Before vs After Risk Comparison Chart (Matplotlib View + Interactive SVG) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transparent Scoreboard KPI Box (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Quantified Risk Scoreboard
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent 0–100 mathematical risk calculation
            </p>
          </div>

          <div className="space-y-3">
            {/* Baseline Risk */}
            <div className="p-3 rounded-lg border border-red-900/50 bg-red-950/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-red-400 font-semibold block">
                  Unmitigated Baseline Risk
                </span>
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {simulationResult.overallBaselineRisk} <span className="text-xs text-red-400 font-normal">/ 100</span>
                </span>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-1 rounded border ${getRiskBadge(simulationResult.baselineRiskLevel)}`}>
                {simulationResult.baselineRiskLevel}
              </span>
            </div>

            {/* Mitigated Risk */}
            <div className="p-3 rounded-lg border border-emerald-900/50 bg-emerald-950/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">
                  Protected Mitigated Risk
                </span>
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {simulationResult.overallMitigatedRisk} <span className="text-xs text-emerald-400 font-normal">/ 100</span>
                </span>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-1 rounded border ${getRiskBadge(simulationResult.mitigatedRiskLevel)}`}>
                {simulationResult.mitigatedRiskLevel}
              </span>
            </div>

            {/* Net Reduction */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Total Risk Reduction:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-sm">
                <TrendingDown className="w-4 h-4" />
                -{simulationResult.riskReductionPct}%
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Standard Scale Classification:</div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-400">0–24 Low</span>
              <span className="text-sky-400">25–49 Med</span>
              <span className="text-amber-400">50–74 High</span>
              <span className="text-red-400">75–100 Crit</span>
            </div>
          </div>
        </div>

        {/* Matplotlib Chart Container (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Before vs After Risk Comparison Chart
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 border border-sky-500/40 text-sky-300">
                  Matplotlib 3.6
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Visualizing propagation dampening and residual risk per stage
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
              <button
                onClick={() => setChartViewMode('matplotlib')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  chartViewMode === 'matplotlib'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Matplotlib Plot</span>
              </button>
              <button
                onClick={() => setChartViewMode('interactive')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  chartViewMode === 'interactive'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Interactive SVG</span>
              </button>
            </div>
          </div>

          {/* Chart Display */}
          {chartViewMode === 'matplotlib' ? (
            <div className="w-full min-h-[220px] rounded-lg border border-slate-800/80 bg-slate-950/80 overflow-hidden flex items-center justify-center relative p-1">
              {matplotlibImage ? (
                <img
                  src={matplotlibImage}
                  alt="CodeGuard Matplotlib SDLC Risk Propagation Chart"
                  className="w-full h-auto object-contain rounded"
                />
              ) : (
                <div className="text-xs font-mono text-slate-400 flex items-center gap-2 py-12">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  Generating Python Matplotlib visualization...
                </div>
              )}
            </div>
          ) : (
            /* Interactive SVG Mode */
            <div className="w-full relative h-56 pt-4">
              <svg viewBox="0 0 540 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <line x1="40" y1="20" x2="520" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <text x="32" y="24" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="JetBrains Mono">100</text>
                <line x1="40" y1="60" x2="520" y2="60" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <text x="32" y="64" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="JetBrains Mono">75</text>
                <line x1="40" y1="100" x2="520" y2="100" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <text x="32" y="104" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="JetBrains Mono">50</text>
                <line x1="40" y1="140" x2="520" y2="140" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
                <text x="32" y="144" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="JetBrains Mono">25</text>
                <line x1="40" y1="160" x2="520" y2="160" stroke="#475569" strokeWidth="1" />

                {simulationResult.stageResults.map((s, idx) => {
                  const groupWidth = 88;
                  const groupX = 55 + idx * groupWidth;
                  const barWidth = 24;

                  const baseHeight = (s.baselineRisk / 100) * 140;
                  const baseY = 160 - baseHeight;

                  const mitHeight = (s.mitigatedRisk / 100) * 140;
                  const mitY = 160 - mitHeight;

                  return (
                    <g key={s.stage} className="cursor-pointer" onClick={() => setActiveStageDetail(s.stage)}>
                      <rect
                        x={groupX}
                        y={baseY}
                        width={barWidth}
                        height={baseHeight}
                        rx="3"
                        fill="#ef4444"
                        opacity="0.8"
                      />
                      <text
                        x={groupX + barWidth / 2}
                        y={baseY - 4}
                        fill="#f87171"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        {s.baselineRisk}
                      </text>

                      <rect
                        x={groupX + barWidth + 4}
                        y={mitY}
                        width={barWidth}
                        height={mitHeight}
                        rx="3"
                        fill="#0284c7"
                      />
                      <text
                        x={groupX + barWidth + 4 + barWidth / 2}
                        y={mitY - 4}
                        fill="#38bdf8"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        {s.mitigatedRisk}
                      </text>

                      <text
                        x={groupX + barWidth + 2}
                        y="175"
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="JetBrains Mono"
                      >
                        {s.stage === 'Software Registry' ? 'Registry' : s.stage === 'Version Control' ? 'Git VCS' : s.stage}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Y-Axis: Normalized Risk Score (0–100)</span>
            <span className="text-emerald-400">Generated directly by Python Matplotlib backend</span>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Recommended Preventive Controls for this Attack Path
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {simulationResult.recommendations.length} Direct Measures
          </span>
        </div>

        <div className="space-y-2">
          {simulationResult.recommendations.map((rec, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-xs text-slate-300 flex items-start gap-2.5 font-mono"
            >
              <span className="text-sky-400 font-bold select-none shrink-0">➜</span>
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Python & Django Code Inspector Modal */}
      {showCodeInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    Python, Django & Matplotlib Source Code Inspector
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Review the native Python scripting, Django model schema, and Matplotlib chart generation
                </p>
              </div>
              <button
                onClick={() => setShowCodeInspector(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Code Tabs */}
            <div className="flex items-center px-5 pt-3 border-b border-slate-800 bg-slate-950/60 text-xs font-mono gap-2">
              <button
                onClick={() => setActiveCodeTab('charts')}
                className={`px-3 py-1.5 border-b-2 transition-colors ${
                  activeCodeTab === 'charts'
                    ? 'border-sky-500 text-sky-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                charts.py (Matplotlib Engine)
              </button>
              <button
                onClick={() => setActiveCodeTab('engine')}
                className={`px-3 py-1.5 border-b-2 transition-colors ${
                  activeCodeTab === 'engine'
                    ? 'border-sky-500 text-sky-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                engine.py (Python Traversal Engine)
              </button>
              <button
                onClick={() => setActiveCodeTab('models')}
                className={`px-3 py-1.5 border-b-2 transition-colors ${
                  activeCodeTab === 'models'
                    ? 'border-sky-500 text-sky-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                models.py (Django Class Model)
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-300">
              <pre className="leading-relaxed whitespace-pre-wrap">
                {pythonCodeFiles
                  ? pythonCodeFiles[activeCodeTab] || '# Loading script...'
                  : '# Fetching Python scripts from /backend/...'}
              </pre>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Practicing secure coding principles: parameter validation & input sanitization</span>
              <button
                type="button"
                onClick={() => setShowCodeInspector(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
