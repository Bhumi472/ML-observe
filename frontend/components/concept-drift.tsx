'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertTriangle, TrendingDown, TrendingUp, Activity } from 'lucide-react';

interface Model {
  id: number;
  filename: string;
  uploaded_at: string;
}

interface Dataset {
  id: number;
  filename: string;
  uploaded_at: string;
}

interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  mse?: number;
  rmse?: number;
  r2_score?: number;
  mae?: number;
}

interface EvaluationResult {
  model_name: string;
  dataset_name: string;
  task_type: string;
  metrics: ModelMetrics;
  drift_detected: boolean;
  drift_score: number;
  drift_percentage: number | null;
  baseline_metrics: any;
}

interface PerformanceHistory {
  [modelName: string]: Array<{
    accuracy: number;
    precision: number;
    recall: number;
    timestamp: string;
  }>;
}

export function ConceptDrift() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [taskType, setTaskType] = useState<string>('classification');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistory>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  const getToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    fetchModels();
    fetchDatasets();
    fetchPerformanceHistory();
  }, []);

  const fetchModels = async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/upload/models', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
    }
  };

  const fetchDatasets = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:8000/upload/datasets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setDatasets(data.datasets || []);
      }
    } catch (err) {
      console.error('Failed to fetch datasets:', err);
    }
  };

  const fetchPerformanceHistory = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:8000/model-drift/history?days=30', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPerformanceHistory(data.history || {});
      }
    } catch (err) {
      console.error('Failed to fetch performance history:', err);
    }
  };

  const evaluateModel = async () => {
    if (!selectedModel || !selectedDataset || !targetColumn) {
      setError('Please select model, dataset, and target column');
      return;
    }

    setLoading(true);
    setError('');
    setEvaluationResult(null);

    const token = getToken();

    try {
      const res = await fetch('http://localhost:8000/model-drift/evaluate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_id: parseInt(selectedModel),
          dataset_id: parseInt(selectedDataset),
          target_column: targetColumn,
          task_type: taskType
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.available_columns) {
          setAvailableColumns(data.available_columns);
          setError(`${data.error}. Available columns: ${data.available_columns.join(', ')}`);
        } else {
          setError(data.error || 'Model evaluation failed');
        }
        return;
      }

      setEvaluationResult(data);
      fetchPerformanceHistory(); // Refresh history

    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDriftStatusColor = (driftDetected: boolean) => {
    return driftDetected ? 'text-red-500' : 'text-green-500';
  };

  const getDriftStatusBg = (driftDetected: boolean) => {
    return driftDetected ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30';
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Model Performance Drift Detection</h1>
        <p className="text-muted-foreground mt-2">Monitor model performance degradation over time</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Model Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluate Model Performance</CardTitle>
          <CardDescription>Test your model on a dataset to detect performance drift</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Dataset</label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map(dataset => (
                    <SelectItem key={dataset.id} value={dataset.id.toString()}>
                      {dataset.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Column Name</label>
              <Input
                type="text"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                placeholder="e.g., target, label, class"
              />
              {availableColumns.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {availableColumns.join(', ')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Task Type</label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classification">Classification</SelectItem>
                  <SelectItem value="regression">Regression</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={evaluateModel} 
            disabled={loading || !selectedModel || !selectedDataset || !targetColumn}
            className="w-full"
          >
            {loading ? 'Evaluating Model...' : 'Evaluate Model Performance'}
          </Button>
        </CardContent>
      </Card>

      {/* Evaluation Results */}
      {evaluationResult && (
        <>
          {/* Drift Alert */}
          <Card className={getDriftStatusBg(evaluationResult.drift_detected)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {evaluationResult.drift_detected ? (
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  ) : (
                    <Activity className="w-8 h-8 text-green-500" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${getDriftStatusColor(evaluationResult.drift_detected)}`}>
                      {evaluationResult.drift_detected ? 'Performance Drift Detected!' : 'No Drift Detected'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Model: {evaluationResult.model_name} | Dataset: {evaluationResult.dataset_name}
                    </p>
                  </div>
                </div>
                {evaluationResult.drift_percentage !== null && (
                  <div className="text-right">
                    <p className="text-3xl font-bold text-red-500">
                      {evaluationResult.drift_percentage > 0 ? '-' : '+'}{Math.abs(evaluationResult.drift_percentage).toFixed(2)}%
                    </p>
                    <p className="text-sm text-muted-foreground">vs Baseline</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {taskType === 'classification' ? (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-3xl font-bold mt-2">
                      {(evaluationResult.metrics.accuracy! * 100).toFixed(2)}%
                    </p>
                    {evaluationResult.baseline_metrics?.accuracy && (
                      <div className="flex items-center gap-1 mt-1">
                        {evaluationResult.metrics.accuracy! >= evaluationResult.baseline_metrics.accuracy ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <p className="text-xs text-muted-foreground">
                          Baseline: {(evaluationResult.baseline_metrics.accuracy * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Precision</p>
                    <p className="text-3xl font-bold mt-2">
                      {(evaluationResult.metrics.precision! * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Recall</p>
                    <p className="text-3xl font-bold mt-2">
                      {(evaluationResult.metrics.recall! * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">F1 Score</p>
                    <p className="text-3xl font-bold mt-2">
                      {(evaluationResult.metrics.f1_score! * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">RMSE</p>
                    <p className="text-3xl font-bold mt-2">
                      {evaluationResult.metrics.rmse!.toFixed(4)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">R² Score</p>
                    <p className="text-3xl font-bold mt-2">
                      {evaluationResult.metrics.r2_score!.toFixed(4)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">MAE</p>
                    <p className="text-3xl font-bold mt-2">
                      {evaluationResult.metrics.mae!.toFixed(4)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">MSE</p>
                    <p className="text-3xl font-bold mt-2">
                      {evaluationResult.metrics.mse!.toFixed(4)}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </>
      )}

      {/* Performance History */}
      {Object.keys(performanceHistory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance History (Last 30 Days)</CardTitle>
            <CardDescription>Track how your models perform over time</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(performanceHistory).map(([modelName, history]) => (
              <div key={modelName} className="mb-8">
                <h4 className="font-semibold mb-3">{modelName}</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString()}
                    />
                    <YAxis domain={[0, 1]} />
                    <Tooltip 
                      labelFormatter={(val) => new Date(val).toLocaleString()}
                      formatter={(value: number) => (value * 100).toFixed(2) + '%'}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" name="Accuracy" strokeWidth={2} />
                    <Line type="monotone" dataKey="precision" stroke="#10b981" name="Precision" strokeWidth={2} />
                    <Line type="monotone" dataKey="recall" stroke="#f59e0b" name="Recall" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {models.length === 0 || datasets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Get Started</h3>
              <p className="text-muted-foreground mb-4">
                Upload a trained model (.pkl) and a test dataset (.csv) to detect performance drift
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Upload Model & Dataset
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}