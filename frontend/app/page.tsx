'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Dashboard } from '@/components/dashboard';
import { ModelManagement } from '@/components/model-management';
import { DataQuality } from '@/components/data-quality';
import { DriftDetection } from '@/components/drift-detection';
import { ConceptDrift } from '@/components/concept-drift';
import { ExplainabilityEngine } from '@/components/explainability-engine';
import { BiasMonitoring } from '@/components/bias-monitoring';
import { AlertSystem } from '@/components/alert-system';
import { BusinessImpact } from '@/components/business-impact';

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'models':
        return <ModelManagement />;
      case 'data-quality':
        return <DataQuality />;
      case 'drift-detection':
        return <DriftDetection />;
      case 'concept-drift':
        return <ConceptDrift />;
      case 'explainability':
        return <ExplainabilityEngine />;
      case 'bias':
        return <BiasMonitoring />;
      case 'alerts':
        return <AlertSystem />;
      case 'business-impact':
        return <BusinessImpact />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 overflow-auto">
        {renderSection()}
      </main>
    </div>
  );
}
