'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';

const demographicParityData = [
  { group: 'Female', approved: 82, denied: 18 },
  { group: 'Male', approved: 81, denied: 19 },
  { group: 'Under 30', approved: 75, denied: 25 },
  { group: 'Over 50', approved: 88, denied: 12 },
  { group: 'Minority', approved: 72, denied: 28 },
  { group: 'Majority', approved: 85, denied: 15 },
];

const fairnessMetrics = [
  { metric: 'Demographic Parity', value: 0.94, threshold: 0.9 },
  { metric: 'Equal Opportunity', value: 0.91, threshold: 0.85 },
  { metric: 'Predictive Parity', value: 0.88, threshold: 0.9 },
  { metric: 'Calibration', value: 0.92, threshold: 0.85 },
  { metric: 'Equalized Odds', value: 0.89, threshold: 0.85 },
  { metric: 'Disparate Impact', value: 0.81, threshold: 0.8 },
];

const biasTimeSeries = [
  { week: 'Week 1', female_rate: 82, male_rate: 80 },
  { week: 'Week 2', female_rate: 81, male_rate: 82 },
  { week: 'Week 3', female_rate: 80, male_rate: 83 },
  { week: 'Week 4', female_rate: 79, male_rate: 82 },
  { week: 'Week 5', female_rate: 78, male_rate: 83 },
  { week: 'Week 6', female_rate: 75, male_rate: 85 },
];

const disparityGroups = [
  {
    id: 1,
    group: 'Gender (Female)',
    approvalRate: 75,
    overall: 81,
    disparity: -6,
    severity: 'high',
    trend: 'worsening',
  },
  {
    id: 2,
    group: 'Age (Under 30)',
    approvalRate: 72,
    overall: 81,
    disparity: -9,
    severity: 'high',
    trend: 'stable',
  },
  {
    id: 3,
    group: 'Ethnicity (Minority)',
    approvalRate: 71,
    overall: 81,
    disparity: -10,
    severity: 'critical',
    trend: 'worsening',
  },
  {
    id: 4,
    group: 'Location (Rural)',
    approvalRate: 74,
    overall: 81,
    disparity: -7,
    severity: 'high',
    trend: 'stable',
  },
];

export function BiasMonitoring() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Bias & Fairness Monitoring</h1>
        <p className="text-muted-foreground mt-2">Monitor demographic parity, equal opportunity, and disparate impact</p>
      </div>

      {/* Critical Alert */}
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="font-medium text-red-400">Critical Bias Alert</p>
          <p className="text-sm text-red-300/80 mt-1">Significant disparate impact detected for minority groups. Immediate investigation and mitigation recommended.</p>
        </div>
      </div>

      {/* Fairness Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fairnessMetrics.map((metric) => (
          <Card key={metric.metric} className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{metric.metric}</p>
              <p className="text-2xl font-bold text-primary mt-2">{(metric.value * 100).toFixed(1)}%</p>
              <p className="text-xs text-green-400 mt-2">
                Threshold: {(metric.threshold * 100).toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Rate by Group */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Approval Rate by Demographic Group</CardTitle>
            <CardDescription>Comparing approval rates across protected attributes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demographicParityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="group" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="approved" fill="#6366f1" name="Approved %" />
                <Bar dataKey="denied" fill="#ec4899" name="Denied %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Disparity Over Time */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Approval Rate Trend</CardTitle>
            <CardDescription>Gender-based approval rate disparity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={biasTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" domain={[70, 90]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="female_rate" stroke="#ec4899" strokeWidth={2} name="Female" />
                <Line type="monotone" dataKey="male_rate" stroke="#6366f1" strokeWidth={2} name="Male" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fairness Radar */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Fairness Metrics Radar</CardTitle>
          <CardDescription>Multi-dimensional fairness assessment</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ResponsiveContainer width={400} height={400}>
            <RadarChart data={fairnessMetrics}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" />
              <PolarRadiusAxis angle={90} domain={[0, 1]} stroke="rgba(255,255,255,0.5)" />
              <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
              <Radar name="Threshold" dataKey="threshold" stroke="#a78bfa" fillOpacity={0} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                labelStyle={{ color: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disparity Analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Disparate Impact Analysis</CardTitle>
          <CardDescription>Approval rate disparity from overall population rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {disparityGroups.map((group) => (
              <div
                key={group.id}
                className={`p-4 rounded-lg border flex items-start justify-between ${
                  group.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : group.severity === 'high'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{group.group}</p>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Group Rate</p>
                      <p className="font-mono font-bold">{group.approvalRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Overall Rate</p>
                      <p className="font-mono font-bold">{group.overall}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Disparity</p>
                      <p className="font-mono font-bold text-red-400">{group.disparity}%</p>
                    </div>
                  </div>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${
                    group.trend === 'worsening' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    <TrendingUp className="w-3 h-3" /> Trend: {group.trend}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  group.severity === 'critical'
                    ? 'bg-red-500/20 text-red-400'
                    : group.severity === 'high'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {group.severity}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mitigation Strategies */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle>Bias Mitigation Strategies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">1</div>
            <div>
              <p className="font-medium text-foreground">Stratified Data Collection</p>
              <p className="text-sm text-muted-foreground">Collect more training data for underrepresented groups</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">2</div>
            <div>
              <p className="font-medium text-foreground">Fairness Constraints in Training</p>
              <p className="text-sm text-muted-foreground">Add fairness-aware loss functions during model training</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">3</div>
            <div>
              <p className="font-medium text-foreground">Post-Processing Adjustments</p>
              <p className="text-sm text-muted-foreground">Adjust decision thresholds per group to achieve parity</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">4</div>
            <div>
              <p className="font-medium text-foreground">Feature Engineering</p>
              <p className="text-sm text-muted-foreground">Remove or transform proxy variables for protected attributes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
