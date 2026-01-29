'use client';

import { BarChart3, Database, Zap, TrendingDown, Brain, AlertTriangle, PieChart, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'models', label: 'Models', icon: Database },
  { id: 'data-quality', label: 'Data Quality', icon: Eye },
  { id: 'drift-detection', label: 'Data Drift', icon: TrendingDown },
  { id: 'concept-drift', label: 'Concept Drift', icon: Zap },
  { id: 'explainability', label: 'Explainability', icon: Brain },
  { id: 'bias', label: 'Bias & Fairness', icon: PieChart },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'business-impact', label: 'Business Impact', icon: BarChart3 },
];

export function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          ObserveAI
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">ML Observability Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              variant="ghost"
              className={`w-full justify-start px-4 py-2 h-10 ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
              }`}
            >
              <Icon className="w-4 h-4 mr-3" />
              <span className="text-sm font-medium">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button variant="ghost" className="w-full justify-start px-4 py-2 h-10">
          <Settings className="w-4 h-4 mr-3" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </aside>
  );
}
