'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, TrendingDown } from 'lucide-react';

const psiData = [
  { date: 'Day 1', value: 0.05, threshold: 0.25 },
  { date: 'Day 2', value: 0.08, threshold: 0.25 },
  { date: 'Day 3', value: 0.12, threshold: 0.25 },
  { date: 'Day 4', value: 0.18, threshold: 0.25 },
  { date: 'Day 5', value: 0.22, threshold: 0.25 },
  { date: 'Day 6', value: 0.19, threshold: 0.25 },
  { date: 'Day 7', value: 0.21, threshold: 0.25 },
];

const ksTestData = [
  { feature: 'feature_1', value: 0.08, threshold: 0.15 },
  { feature: 'feature_2', value: 0.12, threshold: 0.15 },
  { feature: 'feature_3', value: 0.04, threshold: 0.15 },
  { feature: 'feature_4', value: 0.14, threshold: 0.15 },
  { feature: 'feature_5', value: 0.06, threshold: 0.15 },
];

const wassertsteinData = [
  { date: 'Day 1', distance: 0.15 },
  { date: 'Day 2', distance: 0.18 },
  { date: 'Day 3', distance: 0.22 },
  { date: 'Day 4', distance: 0.25 },
  { date: 'Day 5', distance: 0.23 },
  { date: 'Day 6', distance: 0.26 },
  { date: 'Day 7', distance: 0.24 },
];

const featureDriftData = [
  {
    id: 1,
    feature: 'age',
    mean: 42.3,
    previousMean: 41.8,
    variance: 125.4,
    previousVariance: 118.9,
    driftType: 'Mean Shift',
    severity: 'low',
  },
  {
    id: 2,
    feature: 'income',
    mean: 65000,
    previousMean: 62000,
    variance: 2500000,
    previousVariance: 2400000,
    driftType: 'Mean Shift',
    severity: 'medium',
  },
  {
    id: 3,
    feature: 'credit_score',
    mean: 680,
    previousMean: 675,
    variance: 4500,
    previousVariance: 3800,
    driftType: 'Variance Shift',
    severity: 'medium',
  },
];

export function DriftDetection() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Data Drift Detection</h1>
        <p className="text-muted-foreground mt-2">Monitor input distribution changes using statistical tests</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">PSI (Population Stability Index)</p>
            <p className="text-2xl font-bold text-primary mt-2">0.21</p>
            <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Approaching threshold
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">KS Test (Max Statistic)</p>
            <p className="text-2xl font-bold text-primary mt-2">0.14</p>
            <p className="text-xs text-green-400 mt-2">Below threshold</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Wasserstein Distance</p>
            <p className="text-2xl font-bold text-primary mt-2">0.24</p>
            <p className="text-xs text-yellow-400 mt-2">High variation</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Features with Drift</p>
            <p className="text-2xl font-bold text-accent mt-2">3</p>
            <p className="text-xs text-muted-foreground mt-2">Out of 45</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PSI Trend */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Population Stability Index (PSI)</CardTitle>
            <CardDescription>PSI measures distribution shift over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={psiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} name="PSI" />
                <Line type="monotone" dataKey="threshold" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" name="Threshold" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* KS Test by Feature */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Kolmogorov-Smirnov Test</CardTitle>
            <CardDescription>Statistical drift test by feature</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ksTestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="feature" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="value" fill="#6366f1" name="KS Statistic" />
                <Bar dataKey="threshold" fill="#ec4899" name="Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Wasserstein Distance */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Wasserstein Distance (Earth Mover)</CardTitle>
          <CardDescription>Measures optimal transport cost between distributions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={wassertsteinData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="distance" stroke="#a78bfa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feature Drift Details */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Feature Drift Analysis</CardTitle>
          <CardDescription>Detailed drift information for each feature</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {featureDriftData.map((drift) => (
              <div
                key={drift.id}
                className="p-4 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-foreground">{drift.feature}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{drift.driftType}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Mean</p>
                      <p className="font-mono text-foreground">{drift.mean}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Previous Mean</p>
                      <p className="font-mono text-foreground">{drift.previousMean}</p>
                    </div>
                  </div>
                </div>
                <div className={`mt-3 inline-block px-3 py-1 rounded text-xs font-medium ${
                  drift.severity === 'low'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {drift.severity} severity
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
