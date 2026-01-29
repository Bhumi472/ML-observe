'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const qualityMetrics = [
  { category: 'Missing Values', value: 0.2, status: 'good' },
  { category: 'Schema Violations', value: 0, status: 'good' },
  { category: 'Range Violations', value: 1.5, status: 'warning' },
  { category: 'Duplicates', value: 0.3, status: 'good' },
  { category: 'Outliers', value: 2.1, status: 'warning' },
];

const missingValuesData = [
  { field: 'age', percentage: 0.1 },
  { field: 'income', percentage: 0.3 },
  { field: 'location', percentage: 0.05 },
  { field: 'phone', percentage: 0.8 },
  { field: 'email', percentage: 0.2 },
];

const schemaData = [
  { name: 'Valid', value: 98.5, fill: '#22c55e' },
  { name: 'Invalid', value: 1.5, fill: '#ef4444' },
];

const timeSeriesData = [
  { time: '00:00', quality: 98.2 },
  { time: '04:00', quality: 97.8 },
  { time: '08:00', quality: 97.5 },
  { time: '12:00', quality: 98.5 },
  { time: '16:00', quality: 98.1 },
  { time: '20:00', quality: 97.9 },
  { time: '24:00', quality: 98.3 },
];

const qualityIssues = [
  {
    id: 1,
    type: 'Missing Values',
    field: 'phone_number',
    count: 342,
    percentage: 0.8,
    severity: 'warning',
  },
  {
    id: 2,
    type: 'Range Violation',
    field: 'age',
    count: 23,
    percentage: 0.05,
    severity: 'info',
  },
  {
    id: 3,
    type: 'Outlier Detection',
    field: 'income',
    count: 156,
    percentage: 0.4,
    severity: 'warning',
  },
];

export function DataQuality() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Data Quality & Integrity</h1>
        <p className="text-muted-foreground mt-2">Monitor data completeness, schema validation, and anomaly detection</p>
      </div>

      {/* Quality Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {qualityMetrics.map((metric) => (
          <Card key={metric.category} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{metric.category}</p>
                  <p className="text-2xl font-bold mt-2 text-foreground">{metric.value}%</p>
                </div>
                {metric.status === 'good' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Values */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Missing Values by Field</CardTitle>
            <CardDescription>Percentage of missing values in each field</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={missingValuesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="field" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="percentage" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Schema Validation */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Schema Validation Status</CardTitle>
            <CardDescription>Data conformance to schema</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={schemaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {schemaData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quality Trend */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Data Quality Trend</CardTitle>
          <CardDescription>Overall data quality score over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" domain={[95, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="quality" stroke="#6366f1" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quality Issues */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Detected Issues</CardTitle>
          <CardDescription>Data quality issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qualityIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 rounded-lg border flex items-start justify-between ${
                  issue.severity === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{issue.type}</p>
                  <p className="text-sm text-muted-foreground mt-1">Field: {issue.field}</p>
                  <p className="text-sm text-muted-foreground">Records affected: {issue.count} ({issue.percentage}%)</p>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  issue.severity === 'warning'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {issue.severity}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
