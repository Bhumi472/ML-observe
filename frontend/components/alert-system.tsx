'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, CheckCircle2, Clock, TrendingDown, Zap } from 'lucide-react';

const alerts = [
  {
    id: 1,
    type: 'Performance Degradation',
    description: 'Model accuracy dropped from 94.2% to 91.2% over the last 6 weeks',
    severity: 'critical',
    timestamp: '30 minutes ago',
    status: 'active',
    model: 'Revenue Prediction v3.2',
    actions: ['Investigate', 'Retrain', 'Acknowledge'],
  },
  {
    id: 2,
    type: 'Data Drift Detected',
    description: 'PSI reached 0.21, approaching threshold of 0.25',
    severity: 'warning',
    timestamp: '2 hours ago',
    status: 'active',
    model: 'Churn Detection v2.1',
    actions: ['View Details', 'Acknowledge'],
  },
  {
    id: 3,
    type: 'Fairness Alert',
    description: 'Disparate impact detected: Female approval rate is 10% lower than baseline',
    severity: 'critical',
    timestamp: '4 hours ago',
    status: 'active',
    model: 'Loan Approval v1.8',
    actions: ['Review Bias', 'Mitigate', 'Acknowledge'],
  },
  {
    id: 4,
    type: 'Data Quality Issue',
    description: 'Missing values in phone_number field increased to 0.8%',
    severity: 'info',
    timestamp: '6 hours ago',
    status: 'acknowledged',
    model: 'Customer Segmentation v1.5',
    actions: ['View', 'Resolve'],
  },
  {
    id: 5,
    type: 'Explainability Drift',
    description: 'SHAP values showing increased variance (0.15, up from 0.02)',
    severity: 'warning',
    timestamp: '1 day ago',
    status: 'acknowledged',
    model: 'Revenue Prediction v3.2',
    actions: ['Investigate'],
  },
];

const alertStats = [
  { label: 'Active Alerts', value: 3, color: 'text-red-400', bg: 'bg-red-500/10' },
  { label: 'Critical', value: 2, color: 'text-red-400', bg: 'bg-red-500/10' },
  { label: 'Warnings', value: 2, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { label: 'Acknowledged', value: 2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

const priorityMatrix = [
  { impact: 'High', likelihood: 'High', count: 2, color: 'bg-red-500' },
  { impact: 'High', likelihood: 'Medium', count: 1, color: 'bg-yellow-500' },
  { impact: 'Medium', likelihood: 'High', count: 1, color: 'bg-yellow-500' },
  { impact: 'Medium', likelihood: 'Medium', count: 2, color: 'bg-blue-500' },
];

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'info':
      return <Bell className="w-5 h-5 text-blue-400" />;
    default:
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/10 border-red-500/30';
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 'info':
      return 'bg-blue-500/10 border-blue-500/30';
    default:
      return 'bg-green-500/10 border-green-500/30';
  }
};

const getSeverityBadgeColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 text-red-400';
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'info':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-green-500/20 text-green-400';
  }
};

export function AlertSystem() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Alert System</h1>
          <p className="text-muted-foreground mt-2">Real-time monitoring alerts and prioritization</p>
        </div>
        <Button className="gap-2">
          <Bell className="w-4 h-4" />
          Notification Preferences
        </Button>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {alertStats.map((stat) => (
          <Card key={stat.label} className={`bg-card border-border ${stat.bg}`}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="border-primary/50 bg-transparent">All Alerts</Button>
        <Button variant="outline" size="sm">Critical Only</Button>
        <Button variant="outline" size="sm">Active</Button>
        <Button variant="outline" size="sm">Acknowledged</Button>
        <Button variant="outline" size="sm">Last 24 Hours</Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border flex items-start justify-between transition-all hover:shadow-lg ${
              getSeverityColor(alert.severity)
            }`}
          >
            <div className="flex gap-4 flex-1">
              <div className="flex-shrink-0 mt-1">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{alert.type}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" /> {alert.timestamp}
                      </span>
                      <span className="text-primary font-medium">{alert.model}</span>
                      {alert.status === 'acknowledged' && (
                        <span className="text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap ${
                    getSeverityBadgeColor(alert.severity)
                  }`}>
                    {alert.severity}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {alert.actions.map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-current/20 hover:border-current/50 bg-transparent"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Priority Matrix */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Alert Priority Matrix</CardTitle>
          <CardDescription>Risk assessment based on impact and likelihood</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 max-w-md">
            {/* Header */}
            <div />
            <div className="text-center text-xs font-bold text-muted-foreground">Low</div>
            <div className="text-center text-xs font-bold text-muted-foreground">Medium</div>
            <div className="text-center text-xs font-bold text-muted-foreground">High</div>

            {/* Rows */}
            {['High', 'Medium', 'Low'].map((impact) => (
              <div key={impact}>
                <div key={`label-${impact}`} className="text-xs font-bold text-muted-foreground mb-2">{impact}</div>
                {[1, 2, 3].map((likelihood) => {
                  const cell = priorityMatrix.find(
                    (p) =>
                      (p.impact === 'High' && impact === 'High') ||
                      (p.impact === 'Medium' && impact === 'Medium') ||
                      (p.impact === 'High' && impact === 'High')
                  );
                  return (
                    <div
                      key={`${impact}-${likelihood}`}
                      className={`${cell?.color || 'bg-gray-500/20'} rounded h-12 mb-2 flex items-center justify-center text-xs font-bold text-white`}
                    >
                      {cell?.count || '0'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>System-suggested interventions based on alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-background/50 border border-primary/20 flex gap-3">
            <Zap className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Retrain Model</p>
              <p className="text-sm text-muted-foreground">Revenue Prediction model showing performance degradation</p>
            </div>
            <Button size="sm" variant="outline">Take Action</Button>
          </div>
          <div className="p-3 rounded-lg bg-background/50 border border-primary/20 flex gap-3">
            <TrendingDown className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Adjust Thresholds</p>
              <p className="text-sm text-muted-foreground">Update decision thresholds for Loan Approval model</p>
            </div>
            <Button size="sm" variant="outline">Take Action</Button>
          </div>
          <div className="p-3 rounded-lg bg-background/50 border border-primary/20 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Investigate Bias</p>
              <p className="text-sm text-muted-foreground">Review fairness metrics for protected attributes</p>
            </div>
            <Button size="sm" variant="outline">Take Action</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
