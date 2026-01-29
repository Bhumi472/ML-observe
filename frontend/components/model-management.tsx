'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Eye, GitBranch, Calendar, BarChart3 } from 'lucide-react';

const models = [
  {
    id: 1,
    name: 'Revenue Prediction v3.2',
    framework: 'XGBoost',
    accuracy: 94.2,
    versions: 12,
    lastUpdated: '2 days ago',
    status: 'active',
  },
  {
    id: 2,
    name: 'Churn Detection v2.1',
    framework: 'LightGBM',
    accuracy: 91.8,
    versions: 8,
    lastUpdated: '1 week ago',
    status: 'active',
  },
  {
    id: 3,
    name: 'Customer Segmentation v1.5',
    framework: 'scikit-learn',
    accuracy: 87.3,
    versions: 5,
    lastUpdated: '3 weeks ago',
    status: 'inactive',
  },
  {
    id: 4,
    name: 'Recommendation Engine v2.0',
    framework: 'TensorFlow',
    accuracy: 89.5,
    versions: 15,
    lastUpdated: '5 days ago',
    status: 'active',
  },
];

export function ModelManagement() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Model Management</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor your ML models</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Upload className="w-4 h-4" />
          Upload Model
        </Button>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model) => (
          <Card key={model.id} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-xl">{model.name}</CardTitle>
                  <CardDescription className="mt-1">{model.framework}</CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  model.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {model.status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                  <p className="text-lg font-bold text-primary mt-1">{model.accuracy}%</p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <GitBranch className="w-3 h-3" /> Versions
                  </p>
                  <p className="text-lg font-bold text-accent mt-1">{model.versions}</p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Updated
                  </p>
                  <p className="text-xs font-bold text-foreground mt-2">{model.lastUpdated}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 gap-2 bg-transparent" size="sm">
                  <Eye className="w-4 h-4" />
                  Monitor
                </Button>
                <Button variant="outline" className="flex-1 gap-2 bg-transparent" size="sm">
                  <BarChart3 className="w-4 h-4" />
                  Compare
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-dashed border-2 border-primary/30">
        <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center">
          <Upload className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Upload a New Model</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Drag and drop your model file or click to browse. Supported formats: pickle, joblib, h5, onnx, pt
          </p>
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Choose File
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
