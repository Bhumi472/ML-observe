'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, AlertTriangle } from 'lucide-react';

const performanceData = [
  { week: 'Week 1', accuracy: 94.2, precision: 92.1, recall: 91.8, fScore: 91.9 },
  { week: 'Week 2', accuracy: 93.8, precision: 91.7, recall: 91.2, fScore: 91.4 },
  { week: 'Week 3', accuracy: 93.1, precision: 90.9, recall: 90.5, fScore: 90.7 },
  { week: 'Week 4', accuracy: 92.5, precision: 90.2, recall: 89.8, fScore: 90.0 },
  { week: 'Week 5', accuracy: 91.9, precision: 89.5, recall: 89.1, fScore: 89.3 },
  { week: 'Week 6', accuracy: 91.2, precision: 88.8, recall: 88.4, fScore: 88.6 },
];

const confusionMatrixData = [
  { metric: 'True Positive', current: 8542, baseline: 8890 },
  { metric: 'True Negative', current: 15230, baseline: 15620 },
  { metric: 'False Positive', current: 420, baseline: 230 },
  { metric: 'False Negative', current: 308, baseline: 160 },
];

const classPerformance = [
  { class: 'Class A', accuracy: 95.2, change: -2.1 },
  { class: 'Class B', accuracy: 90.8, change: -3.5 },
  { class: 'Class C', accuracy: 88.5, change: -2.8 },
  { class: 'Class D', accuracy: 92.1, change: -1.9 },
];

const driftIndicators = [
  {
    id: 1,
    metric: 'Accuracy Drop',
    baseline: 94.2,
    current: 91.2,
    change: -3.0,
    severity: 'medium',
  },
  {
    id: 2,
    metric: 'Precision Degradation',
    baseline: 92.1,
    current: 88.8,
    change: -3.3,
    severity: 'high',
  },
  {
    id: 3,
    metric: 'Recall Decrease',
    baseline: 91.8,
    current: 88.4,
    change: -3.4,
    severity: 'high',
  },
  {
    id: 4,
    metric: 'AUC-ROC Shift',
    baseline: 0.956,
    current: 0.923,
    change: -3.3,
    severity: 'medium',
  },
];

export function ConceptDrift() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Concept Drift & Performance</h1>
        <p className="text-muted-foreground mt-2">Monitor model behavior changes and performance degradation</p>
      </div>

      {/* Alert */}
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        <div>
          <p className="font-medium text-yellow-400">Concept Drift Detected</p>
          <p className="text-sm text-yellow-300/80 mt-1">Model performance has degraded by 3% over the last 6 weeks. Consider retraining with new data.</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {driftIndicators.map((indicator) => (
          <Card key={indicator.id} className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{indicator.metric}</p>
              <p className="text-2xl font-bold text-foreground mt-2">{indicator.current}</p>
              <p className={`text-xs mt-2 flex items-center gap-1 ${
                indicator.change < -2 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                <TrendingDown className="w-3 h-3" /> {indicator.change}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Over Time */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Performance Metrics Over Time</CardTitle>
          <CardDescription>Tracking accuracy, precision, recall, and F1-score</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" domain={[85, 95]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="accuracy" stroke="#6366f1" fillOpacity={1} fill="url(#colorAccuracy)" />
              <Line type="monotone" dataKey="precision" stroke="#a78bfa" strokeWidth={2} />
              <Line type="monotone" dataKey="recall" stroke="#ec4899" strokeWidth={2} />
              <Line type="monotone" dataKey="fScore" stroke="#22c55e" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Changes */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Confusion Matrix Changes</CardTitle>
            <CardDescription>Current vs baseline model predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confusionMatrixData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="current" fill="#6366f1" name="Current" />
                <Bar dataKey="baseline" fill="#a78bfa" name="Baseline" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class-wise Performance */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Per-Class Accuracy</CardTitle>
            <CardDescription>Performance change by class</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="class" type="category" stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="accuracy" fill="#6366f1" name="Accuracy" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Drift Analysis</CardTitle>
          <CardDescription>Metrics showing significant performance degradation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {driftIndicators.map((indicator) => (
              <div
                key={indicator.id}
                className={`p-4 rounded-lg border flex items-start justify-between ${
                  indicator.severity === 'high'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{indicator.metric}</p>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Baseline</p>
                      <p className="font-mono font-bold">{indicator.baseline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="font-mono font-bold">{indicator.current}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Change</p>
                      <p className="font-mono font-bold text-red-400">{indicator.change}%</p>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-medium ${
                  indicator.severity === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {indicator.severity}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">1</div>
            <div>
              <p className="font-medium text-foreground">Retrain Model</p>
              <p className="text-sm text-muted-foreground">Include recent data samples to capture new patterns</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">2</div>
            <div>
              <p className="font-medium text-foreground">Adjust Decision Thresholds</p>
              <p className="text-sm text-muted-foreground">Optimize classification thresholds for current distribution</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">3</div>
            <div>
              <p className="font-medium text-foreground">Investigate Features</p>
              <p className="text-sm text-muted-foreground">Analyze which features are contributing most to the drift</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
