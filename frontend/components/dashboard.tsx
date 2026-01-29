'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const performanceData = [
  { time: '00:00', accuracy: 92, precision: 89, recall: 85 },
  { time: '04:00', accuracy: 92.5, precision: 89.2, recall: 85.5 },
  { time: '08:00', accuracy: 91.8, precision: 88.9, recall: 84.8 },
  { time: '12:00', accuracy: 93.2, precision: 90.1, recall: 86.2 },
  { time: '16:00', accuracy: 92.8, precision: 89.7, recall: 85.9 },
  { time: '20:00', accuracy: 91.5, precision: 88.5, recall: 84.5 },
  { time: '24:00', accuracy: 92.1, precision: 89.3, recall: 85.2 },
];

const driftData = [
  { metric: 'PSI', value: 0.18, threshold: 0.25 },
  { metric: 'KS Test', value: 0.12, threshold: 0.15 },
  { metric: 'Wasserstein', value: 0.22, threshold: 0.3 },
  { metric: 'Chi-Square', value: 0.08, threshold: 0.2 },
];

const alertsData = [
  { id: 1, type: 'Data Drift Detected', severity: 'warning', time: '2 hours ago' },
  { id: 2, type: 'Accuracy Drop', severity: 'critical', time: '30 minutes ago' },
  { id: 3, type: 'Missing Values Spike', severity: 'info', time: '1 hour ago' },
];

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <Card className="bg-card border-border">
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-primary opacity-60" />
      </div>
      {trend && <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {trend}</p>}
    </CardContent>
  </Card>
);

export function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">ML Observability Dashboard</h1>
        <p className="text-muted-foreground">Real-time monitoring of model performance and data quality</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Models" value="12" icon={CheckCircle} trend="+2 this week" />
        <StatCard title="Avg Accuracy" value="92.3%" icon={TrendingUp} trend="+0.5% from last week" />
        <StatCard title="Critical Alerts" value="3" icon={AlertCircle} />
        <StatCard title="Monitoring Uptime" value="99.8%" icon={Clock} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Model Performance</CardTitle>
            <CardDescription>Accuracy, Precision, and Recall over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} />
                <Line type="monotone" dataKey="precision" stroke="#a78bfa" strokeWidth={2} />
                <Line type="monotone" dataKey="recall" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Drift Metrics */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Data Drift Analysis</CardTitle>
            <CardDescription>Drift detection metrics vs thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={driftData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="value" fill="#6366f1" name="Measured" />
                <Bar dataKey="threshold" fill="#ec4899" name="Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>Recent monitoring alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertsData.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border flex items-start justify-between ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : alert.severity === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div>
                  <p className="font-medium text-foreground">{alert.type}</p>
                  <p className="text-sm text-muted-foreground mt-1">{alert.time}</p>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-medium ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/20 text-red-400'
                    : alert.severity === 'warning'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {alert.severity}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Data Quality Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Missing Values</span>
                <span className="text-green-400">0.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Schema Violations</span>
                <span className="text-green-400">None</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Outliers Detected</span>
                <span className="text-yellow-400">12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
          <CardHeader>
            <CardTitle className="text-accent">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Inference Latency</span>
                <span className="text-green-400">45ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Throughput</span>
                <span className="text-green-400">1.2k req/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span>API Uptime</span>
                <span className="text-green-400">99.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
