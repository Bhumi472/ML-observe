// ModelManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Upload, Trash2, Eye, GitBranch, Calendar, BarChart3, 
  FileText, Database, AlertCircle, CheckCircle, RefreshCw,
  ServerOff, Network, X, Clock, FileUp, Edit, Pencil
} from 'lucide-react';

interface MLModel {
  id: number;
  name: string;
  description: string;
  framework: string;
  version: string;
  accuracy: number;
  file_size: number;
  status: string;
  uploaded_by: string;
  uploaded_at: string;
  last_updated: string;
  versions: number;
}

interface Dataset {
  id: number;
  name: string;
  description: string;
  file_path: string;
  file_size: number;
  rows_count: number;
  columns_count: number;
  data_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

interface UploadItem {
  id: string;
  name: string;
  type: 'model' | 'dataset';
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  size: number;
  file?: File;
}

export function ModelManagement() {
  const [models, setModels] = useState<MLModel[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'model' | 'dataset'>('model');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Active uploads state
  const [activeUploads, setActiveUploads] = useState<UploadItem[]>([]);
  
  // Form state
  const [modelName, setModelName] = useState('');
  const [modelFramework, setModelFramework] = useState('scikit-learn');
  const [modelDescription, setModelDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Edit state
  const [editingItem, setEditingItem] = useState<{type: 'model' | 'dataset', id: number} | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFramework, setEditFramework] = useState('');

  // Fetch ONLY from backend, no sample data
  useEffect(() => {
    fetchModels();
    fetchDatasets();
  }, []);

  const fetchModels = async () => {
    try {
      console.log('Fetching models from http://localhost:8000/api/models');
      const response = await fetch('http://localhost:8000/api/models', {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Models response:', data);
      
      if (data.models && Array.isArray(data.models)) {
        setModels(data.models);
        setConnectionError(null);
      } else {
        setModels([]);
        if (response.status === 404 || response.status === 500) {
          setConnectionError('Backend server not responding.');
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]); // Empty array instead of sample data
      setConnectionError(`Cannot connect to backend server: ${error instanceof Error ? error.message : 'Unknown error'}.`);
    }
  };

  const fetchDatasets = async () => {
    try {
      console.log('Fetching datasets from http://localhost:8000/api/datasets');
      const response = await fetch('http://localhost:8000/api/datasets', {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datasets response:', data);
      
      if (data.datasets && Array.isArray(data.datasets)) {
        setDatasets(data.datasets);
        setConnectionError(null);
      } else {
        setDatasets([]);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setDatasets([]); // Empty array instead of sample data
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);

    // Create upload item for UI
    const uploadId = `upload_${Date.now()}`;
    const uploadItem: UploadItem = {
      id: uploadId,
      name: uploadedFile.name,
      type: uploadType,
      progress: 0,
      status: 'uploading',
      size: uploadedFile.size,
      file: uploadedFile
    };
    
    // Add to active uploads immediately
    setActiveUploads(prev => [...prev, uploadItem]);
    
    // Start simulated progress
    simulateProgress(uploadId);
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    
    if (uploadType === 'model') {
      formData.append('name', modelName || uploadedFile.name);
      formData.append('framework', modelFramework);
      formData.append('description', modelDescription);
      formData.append('uploaded_by', 'current_user');
    } else {
      formData.append('name', uploadedFile.name);
      formData.append('description', modelDescription);
      formData.append('uploaded_by', 'current_user');
    }

    try {
      const endpoint = uploadType === 'model' 
        ? 'http://localhost:8000/api/models/upload'
        : 'http://localhost:8000/api/datasets/upload';
      
      console.log(`Uploading to ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Server returned invalid JSON response');
      }
      
      if (data.success) {
        // Update upload status
        setActiveUploads(prev => 
          prev.map(item => 
            item.id === uploadId 
              ? { ...item, status: 'completed', progress: 100 }
              : item
          )
        );
        
        // Refresh data after 1 second
        setTimeout(() => {
          if (uploadType === 'model') {
            fetchModels();
          } else {
            fetchDatasets();
          }
          // Remove from active uploads after 3 seconds
          setTimeout(() => {
            setActiveUploads(prev => prev.filter(item => item.id !== uploadId));
          }, 3000);
        }, 1000);
        
        // Reset form
        setShowUploadForm(false);
        setModelName('');
        setModelDescription('');
        setUploadedFile(null);
        setUploading(false);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setActiveUploads(prev => 
        prev.map(item => 
          item.id === uploadId 
            ? { ...item, status: 'failed', progress: 100 }
            : item
        )
      );
      setUploading(false);
    }
  };

  const simulateProgress = (uploadId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 90) {
        clearInterval(interval);
      }
      setActiveUploads(prev => 
        prev.map(item => 
          item.id === uploadId 
            ? { ...item, progress: Math.min(progress, 90) }
            : item
        )
      );
    }, 300);
  };

  const cancelUpload = (uploadId: string) => {
    setActiveUploads(prev => prev.filter(item => item.id !== uploadId));
  };

  const startEdit = (type: 'model' | 'dataset', id: number, currentName: string, currentDescription: string, currentFramework?: string) => {
    setEditingItem({ type, id });
    setEditName(currentName);
    setEditDescription(currentDescription);
    if (currentFramework) setEditFramework(currentFramework);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    
    try {
      const endpoint = editingItem.type === 'model' 
        ? `http://localhost:8000/api/models/${editingItem.id}`
        : `http://localhost:8000/api/datasets/${editingItem.id}`;
      
      const payload = editingItem.type === 'model' 
        ? { name: editName, description: editDescription, framework: editFramework }
        : { name: editName, description: editDescription };
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh data
        if (editingItem.type === 'model') {
          fetchModels();
        } else {
          fetchDatasets();
        }
        setShowEditForm(false);
        setEditingItem(null);
        alert(`${editingItem.type === 'model' ? 'Model' : 'Dataset'} updated successfully!`);
      } else {
        alert(`Failed to update: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Edit error:', error);
      alert('Error updating item');
    }
  };

  const deleteModel = async (modelId: number) => {
    if (!confirm('Are you sure you want to delete this model?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/models/${modelId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove from UI immediately
        setModels(prev => prev.filter(model => model.id !== modelId));
      } else {
        alert(`Failed to delete model: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      // Still remove from UI for immediate feedback
      setModels(prev => prev.filter(model => model.id !== modelId));
      alert('Backend not available. Removed from UI only.');
    }
  };

  const deleteDataset = async (datasetId: number) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${datasetId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDatasets(prev => prev.filter(dataset => dataset.id !== datasetId));
      } else {
        alert(`Failed to delete dataset: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete dataset error:', error);
      setDatasets(prev => prev.filter(dataset => dataset.id !== datasetId));
      alert('Backend not available. Removed from UI only.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const retryConnection = () => {
    setLoading(true);
    setConnectionError(null);
    fetchModels();
    fetchDatasets();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading models and datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Connection Error Alert */}
      {connectionError && (
        <Alert variant="destructive" className="mb-4">
          <ServerOff className="h-4 w-4" />
          <AlertTitle>Connection Issue</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{connectionError}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retryConnection}
              className="ml-4 gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Model Management</h1>
          <p className="text-muted-foreground mt-2">
            {models.length} models • {datasets.length} datasets • {activeUploads.length} uploading
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => { setUploadType('dataset'); setShowUploadForm(true); }}
            className="gap-2"
          >
            <Database className="w-4 h-4" />
            Upload Dataset
          </Button>
          <Button 
            onClick={() => { setUploadType('model'); setShowUploadForm(true); }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Model
          </Button>
          <Button 
            variant="outline"
            onClick={retryConnection}
            className="gap-2"
            title="Refresh data from server"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Uploads Section */}
      {activeUploads.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Active Uploads ({activeUploads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeUploads.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    upload.status === 'uploading' ? 'bg-blue-500/10 text-blue-500' :
                    upload.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {upload.status === 'uploading' ? <FileUp className="w-4 h-4" /> :
                     upload.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                     <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{upload.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{upload.type === 'model' ? 'Model' : 'Dataset'}</span>
                      <span>•</span>
                      <span>{formatFileSize(upload.size)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {upload.status === 'uploading' && (
                    <div className="w-32">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center mt-1">{upload.progress.toFixed(0)}%</p>
                    </div>
                  )}
                  
                  {upload.status === 'uploading' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelUpload(upload.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {uploadType === 'model' ? 'Upload ML Model' : 'Upload Dataset'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Supported formats: {uploadType === 'model' 
                  ? '.pkl, .joblib, .h5, .onnx, .pt' 
                  : '.csv, .json, .parquet, .feather, .xlsx'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept={uploadType === 'model' 
                      ? '.pkl,.joblib,.h5,.onnx,.pt,.pth,.model,.sav' 
                      : '.csv,.json,.parquet,.feather,.hdf5,.xlsx'}
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                
                {uploadType === 'model' && (
                  <>
                    <div>
                      <Label htmlFor="name">Model Name</Label>
                      <Input
                        id="name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="Enter model name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="framework">Framework</Label>
                      <select
                        id="framework"
                        value={modelFramework}
                        onChange={(e) => setModelFramework(e.target.value)}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="scikit-learn">scikit-learn</option>
                        <option value="tensorflow">TensorFlow</option>
                        <option value="pytorch">PyTorch</option>
                        <option value="xgboost">XGBoost</option>
                        <option value="lightgbm">LightGBM</option>
                        <option value="catboost">CatBoost</option>
                        <option value="keras">Keras</option>
                      </select>
                    </div>
                  </>
                )}
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    value={modelDescription}
                    onChange={(e) => setModelDescription(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background min-h-[80px]"
                    placeholder="Add description..."
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1"
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading || !uploadedFile}
                    className="flex-1 gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Uploading...
                      </>
                    ) : (
                      'Upload'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Edit {editingItem.type === 'model' ? 'Model' : 'Dataset'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter name"
                    required
                  />
                </div>
                
                {editingItem.type === 'model' && (
                  <div>
                    <Label htmlFor="edit-framework">Framework</Label>
                    <select
                      id="edit-framework"
                      value={editFramework}
                      onChange={(e) => setEditFramework(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="scikit-learn">scikit-learn</option>
                      <option value="tensorflow">TensorFlow</option>
                      <option value="pytorch">PyTorch</option>
                      <option value="xgboost">XGBoost</option>
                      <option value="lightgbm">LightGBM</option>
                      <option value="catboost">CatBoost</option>
                      <option value="keras">Keras</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background min-h-[80px]"
                    placeholder="Add description..."
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gap-2"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Models Grid - ONLY SHOWS UPLOADED MODELS */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          ML Models ({models.length})
        </h2>
        
        {models.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Models Uploaded</h3>
              <p className="text-muted-foreground mb-6">Upload your first ML model to get started</p>
              <Button onClick={() => { setUploadType('model'); setShowUploadForm(true); }}>
                <Upload className="w-4 h-4 mr-2" />
                Upload First Model
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {model.name}
                        {model.status === 'active' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <span>{model.framework}</span>
                        <span>•</span>
                        <span>v{model.version}</span>
                      </CardDescription>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      model.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
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
                      <p className="text-lg font-bold text-primary mt-1">
                        {model.accuracy?.toFixed(1) || '0.0'}%
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <GitBranch className="w-3 h-3" /> Versions
                      </p>
                      <p className="text-lg font-bold text-accent mt-1">{model.versions || 1}</p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Updated
                      </p>
                      <p className="text-xs font-bold text-foreground mt-2">
                        {formatDate(model.last_updated)}
                      </p>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{formatFileSize(model.file_size || 0)}</span>
                    </div>
                    <div>
                      Uploaded {formatDate(model.uploaded_at)}
                    </div>
                  </div>

                  {/* Description */}
                  {model.description && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                      {model.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2 bg-transparent" 
                      size="sm"
                      onClick={() => startEdit('model', model.id, model.name, model.description, model.framework)}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 bg-transparent" size="sm">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => deleteModel(model.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Datasets Section - ONLY SHOWS UPLOADED DATASETS */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Database className="w-6 h-6" />
          Datasets ({datasets.length})
        </h2>
        
        {datasets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Datasets Uploaded</h3>
              <p className="text-muted-foreground mb-6">Upload your first dataset for training and analysis</p>
              <Button 
                variant="outline"
                onClick={() => { setUploadType('dataset'); setShowUploadForm(true); }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload First Dataset
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((dataset) => (
              <Card key={dataset.id} className="bg-card hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {dataset.name}
                      </CardTitle>
                      <CardDescription>
                        {dataset.data_type?.toUpperCase() || 'UNKNOWN'} • {formatFileSize(dataset.file_size || 0)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => startEdit('dataset', dataset.id, dataset.name, dataset.description)}
                        title="Edit dataset"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteDataset(dataset.id)}
                        title="Delete dataset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rows:</span>
                      <span>{dataset.rows_count || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Columns:</span>
                      <span>{dataset.columns_count || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span>{formatDate(dataset.uploaded_at)}</span>
                    </div>
                    {dataset.description && (
                      <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                        {dataset.description}
                      </p>
                    )}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats - Only shows actual counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{models.length}</div>
            <p className="text-sm text-muted-foreground">Uploaded Models</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{datasets.length}</div>
            <p className="text-sm text-muted-foreground">Uploaded Datasets</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {activeUploads.length}
            </div>
            <p className="text-sm text-muted-foreground">Active Uploads</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {models.length > 0 
                ? (models.reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.length).toFixed(1) + '%'
                : '0%'
              }
            </div>
            <p className="text-sm text-muted-foreground">Avg Accuracy</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}