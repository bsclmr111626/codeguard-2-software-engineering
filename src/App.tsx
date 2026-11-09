/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { ProjectScannerDashboard } from './components/scanner/ProjectScannerDashboard';
import { AttackSimulator } from './components/simulator/AttackSimulator';
import { SimulationHistory } from './components/history/SimulationHistory';
import { ScenarioManagement } from './components/scenarios/ScenarioManagement';
import { MitigationManagement } from './components/mitigations/MitigationManagement';
import { AuditLogView } from './components/audit/AuditLogView';
import { UserManagement } from './components/admin/UserManagement';
import { AuthPages } from './components/auth/AuthPages';
import { ToastContainer, ToastMessage } from './components/common/Toast';

import {
  initialUsers,
  initialScenarios,
  initialMitigations,
  initialSimulations,
  initialAuditLogs,
  initialScannedProjects,
  getRiskLevel,
  getSecurityGrade,
} from './data/mockData';

import {
  UserAccount,
  UserRole,
  Scenario,
  MitigationControl,
  SimulationRecord,
  AuditLog,
  ScannedProject,
} from './types';

export default function App() {
  // Authentication State (default logged in as Denzel Otunga - Administrator for full review access)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(initialUsers[0]);
  const [availableUsers, setAvailableUsers] = useState<UserAccount[]>(initialUsers);

  // Active Navigation Tab (defaults to 'scanner' so user immediately sees the upload & scan dashboard)
  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Core Data
  const [scannedProjects, setScannedProjects] = useState<ScannedProject[]>(initialScannedProjects);
  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios);
  const [mitigations, setMitigations] = useState<MitigationControl[]>(initialMitigations);
  const [simulations, setSimulations] = useState<SimulationRecord[]>(initialSimulations);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description?: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add newly uploaded / scanned project
  const handleAddProject = (project: ScannedProject) => {
    setScannedProjects((prev) => [project, ...prev]);

    if (currentUser) {
      const newAudit: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        },
        action: 'Uploaded Project Security Scan',
        resource: `Project: ${project.name}`,
        ipAddress: '192.168.1.104',
        status: 'success',
        details: `Scanned ${project.fileCount} files across 5 SDLC stages. Discovered ${project.findings.length} findings. Score: ${project.overallScore} (Grade ${project.securityGrade}).`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  // Remediate a finding in real-time
  const handleUpdateFindingStatus = (projectId: string, findingId: string, resolved: boolean) => {
    setScannedProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedFindings = proj.findings.filter((f) => f.id !== findingId);
        const newScore = Math.max(10, proj.overallScore - 18);
        return {
          ...proj,
          findings: updatedFindings,
          overallScore: newScore,
          securityGrade: getSecurityGrade(newScore),
          riskLevel: getRiskLevel(newScore),
        };
      })
    );
  };

  // Simulation Record Saved
  const handleSaveSimulation = (record: SimulationRecord) => {
    setSimulations((prev) => [record, ...prev]);

    if (currentUser) {
      const newAudit: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        },
        action: 'Executed Simulation Run',
        resource: `Scenario: ${record.scenarioName}`,
        ipAddress: '192.168.1.104',
        status: 'success',
        details: `Calculated 5-stage propagation with ${record.appliedControlNames.length} controls applied. Risk reduced from ${record.overallBaselineRisk} (${record.baselineRiskLevel}) to ${record.overallMitigatedRisk} (${record.mitigatedRiskLevel}).`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  // Scenario Management Handlers
  const handleAddScenario = (newScenario: Scenario) => {
    setScenarios((prev) => [newScenario, ...prev]);
    if (currentUser) {
      const newAudit: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        },
        action: 'Created Threat Scenario',
        resource: `Scenario: ${newScenario.name}`,
        ipAddress: '192.168.1.104',
        status: 'success',
        details: `Configured entry point stage ${newScenario.entryPointStage} with ${newScenario.baseSeverity} base severity.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  // Mitigation Management Handlers
  const handleAddMitigation = (newControl: MitigationControl) => {
    setMitigations((prev) => [newControl, ...prev]);
    if (currentUser) {
      const newAudit: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        },
        action: 'Registered Preventive Control',
        resource: `Control: ${newControl.code} (${newControl.name})`,
        ipAddress: '192.168.1.104',
        status: 'success',
        details: `Targeted stages: ${newControl.targetStages.join(', ')} with ${newControl.riskReductionPct}% reduction rating.`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const handleDeleteMitigation = (id: string) => {
    setMitigations((prev) => prev.filter((m) => m.id !== id));
  };

  // User & Role Handlers
  const handleAddUser = (newUser: UserAccount) => {
    setAvailableUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateUserRole = (userId: string, role: UserRole) => {
    setAvailableUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role } : null));
    }
  };

  const handleSelectUserRole = (role: UserRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      setAvailableUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? updated : u))
      );
      showToast('Switched Persona Role', `Active permissions updated to ${role}.`, 'info');
    }
  };

  // Logged out view
  if (!currentUser) {
    return (
      <>
        <AuthPages
          onLogin={(user) => {
            setCurrentUser(user);
            showToast('Authenticated', `Welcome back, ${user.name}.`, 'success');
          }}
          availableUsers={availableUsers}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={(tab) => setActiveTab(tab)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          historyCount={simulations.length}
          scenariosCount={scenarios.length}
          currentUser={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            showToast('Signed Out', 'Your session has been securely invalidated.', 'info');
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
          {/* Top Header Bar */}
          <Header
            activeTab={activeTab}
            currentUser={currentUser}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectUserRole={handleSelectUserRole}
            onLogout={() => {
              setCurrentUser(null);
              showToast('Signed Out', 'Your session has been securely invalidated.', 'info');
            }}
          />

          {/* Primary Viewport */}
          <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto">
            {activeTab === 'scanner' && (
              <ProjectScannerDashboard
                scannedProjects={scannedProjects}
                currentUser={currentUser}
                onAddProject={handleAddProject}
                onUpdateFindingStatus={handleUpdateFindingStatus}
                onNavigateToSimulator={() => setActiveTab('simulator')}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'simulator' && (
              <AttackSimulator
                scenarios={scenarios}
                mitigations={mitigations}
                currentUser={currentUser}
                onSaveSimulation={handleSaveSimulation}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'history' && (
              <SimulationHistory
                history={simulations}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'scenarios' && (
              <ScenarioManagement
                scenarios={scenarios}
                currentUser={currentUser}
                onAddScenario={handleAddScenario}
                onDeleteScenario={handleDeleteScenario}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'mitigations' && (
              <MitigationManagement
                mitigations={mitigations}
                currentUser={currentUser}
                onAddMitigation={handleAddMitigation}
                onDeleteMitigation={handleDeleteMitigation}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'audit' && (
              <AuditLogView
                logs={auditLogs}
                currentUser={currentUser}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'users' && (
              <UserManagement
                users={availableUsers}
                currentUser={currentUser}
                onAddUser={handleAddUser}
                onUpdateUserRole={handleUpdateUserRole}
                onShowToast={showToast}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Interactive Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        scenarios={scenarios}
        mitigations={mitigations}
      />

      {/* Global Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
