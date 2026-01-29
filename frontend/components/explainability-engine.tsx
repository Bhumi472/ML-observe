'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Zap, TrendingDown } from 'lucide-react';

const shapelyValues = [
  { feature: 'income', value: 0.24, abs: 0.24 },
  { feature: 'credit_score', value: 0.19, abs: 0.19 },
  { feature: 'employment_length', value: -0.15, abs: 0.15 },
  { feature: 'age', value: 0.12, abs: 0.12 },
  { feature: 'debt_to_income', value: -0.08, abs: 0.08 },
  { feature: 'num_accounts', value: 0.06, abs: 0.06 },
];

const featureImportance = [
  { feature: 'income', importance: 28, drift: 0.15 },
  { feature: 'credit_score', importance: 24, drift: 0.08 },
  { feature: 'employment_length', importance: 18, drift: 0.22 },
  { feature: 'age', importance: 15, drift: 0.05 },
  { feature: 'debt_to_income', importance: 10, drift: 0.12 },
  { feature: 'num_accounts', importance: 5, drift: 0.03 },
];

const explainabilityDrift = [
  { week: 'Week 1', shap_drift: 0.02, correlation_drift: 0.01 },
  { week: 'Week 2', shap_drift: 0.03, correlation_drift: 0.02 },
  { week: 'Week 3', shap_drift: 0.05, correlation_drift: 0.04 },
  { week: 'Week 4', shap_drift: 0.08, correlation_drift: 0.07 },
  { week: 'Week 5', shap_drift: 0.12, correlation_drift: 0.11 },
  { week: 'Week 6', shap_drift: 0.15, correlation_drift: 0.14 },
];

const predictions = [
  { id: 1, prediction: 'Approved', confidence: 0.92, topFeatures: ['income', 'credit_score', 'employment_length'] },
  { id: 2, prediction: 'Denied', confidence: 0.88, topFeatures: ['debt_to_income', 'age', 'num_accounts'] },
  { id: 3, prediction: 'Approved', confidence: 0.85, topFeatures: ['credit_score', 'income', 'age'] },
];

export function ExplainabilityEngine() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Explainability Engine</h1>
        <p className="text-muted-foreground mt-2">SHAP values, feature importance, and model interpretability analysis</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">SHAP Value Drift</p>
            <p className="text-2xl font-bold text-primary mt-2">0.15</p>
            <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Increasing
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Feature Importance Stability</p>
            <p className="text-2xl font-bold text-primary mt-2">87%</p>
            <p className="text-xs text-green-400 mt-2">Stable ranking</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Model Interpretability Score</p>
            <p className="text-2xl font-bold text-primary mt-2">8.7/10</p>
            <p className="text-xs text-green-400 mt-2">Good interpretability</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Values */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>SHAP Global Feature Importance</CardTitle>
            <CardDescription>Average absolute SHAP values for each feature</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={shapelyValues}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="feature" type="category" stroke="rgba(255,255,255,0.5)" width={140} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="abs" fill="#6366f1" name="SHAP |Impact|" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feature Importance vs Drift */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Feature Importance & Drift</CardTitle>
            <CardDescription>Importance score vs detected drift</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="importance" name="Importance %" stroke="rgba(255,255,255,0.5)" />
                <YAxis dataKey="drift" name="Drift Score" stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Scatter name="Features" data={featureImportance} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Explainability Drift Trend */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Explainability Drift Over Time</CardTitle>
          <CardDescription>How much the model explanations are changing</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={explainabilityDrift}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #6366f1' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="shap_drift" stroke="#6366f1" strokeWidth={2} name="SHAP Drift" />
              <Line type="monotone" dataKey="correlation_drift" stroke="#a78bfa" strokeWidth={2} name="Correlation Drift" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Prediction Explanations */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Recent Predictions & Explanations</CardTitle>
          <CardDescription>Local interpretable model-agnostic explanations (LIME)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions.map((pred) => (
            <div
              key={pred.id}
              className="p-4 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">Prediction {pred.id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      pred.prediction === 'Approved'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {pred.prediction}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Confidence: {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Top Contributing Features:</p>
                <div className="flex flex-wrap gap-2">
                  {pred.topFeatures.map((feature, idx) => (
                    <span
                      key={feature}
                      className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/30"
                    >
                      {idx + 1}. {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SHAP Waterfall */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Feature Impact Breakdown</CardTitle>
          <CardDescription>How features push the model output toward positive/negative class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shapelyValues.map((item) => (
              <div key={item.feature}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{item.feature}</span>
                  <span className={`text-sm font-bold ${
                    item.value > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.value > 0 ? '+' : ''}{item.value.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-background rounded h-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      item.value > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${(item.abs / 0.3) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
