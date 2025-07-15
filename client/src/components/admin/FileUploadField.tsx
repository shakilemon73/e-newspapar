import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Link as LinkIcon, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { SupabaseStorage, MediaType, getFileValidator } from '@/lib/supabase-storage';
import { useToast } from '@/hooks/use-toast';

interface FileUploadFieldProps {
  label: string;
  description?: string;
  mediaType: MediaType;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

type UploadMethod = 'url' | 'upload';

interface UploadState {
  progress: number;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function FileUploadField({
  label,
  description,
  mediaType,
  value,
  onChange,
  placeholder,
  required = false,
  className = ''
}: FileUploadFieldProps) {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('url');
  const [uploadState, setUploadState] = useState<UploadState>({ progress: 0, status: 'idle' });
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  
  const validator = getFileValidator(mediaType);

  const getIcon = () => {
    switch (mediaType) {
      case 'images':
        return <FileImage className="h-5 w-5" />;
      case 'videos':
        return <FileVideo className="h-5 w-5" />;
      case 'audio':
        return <FileAudio className="h-5 w-5" />;
    }
  };

  const getAcceptedTypes = () => {
    switch (mediaType) {
      case 'images':
        return 'image/jpeg,image/jpg,image/png,image/webp';
      case 'videos':
        return 'video/mp4,video/webm,video/ogg';
      case 'audio':
        return 'audio/mp3,audio/wav,audio/ogg,audio/mpeg';
    }
  };

  const getMaxSizeText = () => {
    switch (mediaType) {
      case 'images':
        return '5MB';
      case 'videos':
        return '100MB';
      case 'audio':
        return '50MB';
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!validator(file)) {
      toast({
        title: 'Invalid file',
        description: `Please select a valid ${mediaType.slice(0, -1)} file (max ${getMaxSizeText()})`,
        variant: 'destructive'
      });
      return;
    }

    setUploadState({ progress: 0, status: 'uploading' });

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadState(prev => 
          prev.status === 'uploading' 
            ? { ...prev, progress: Math.min(prev.progress + 10, 90) }
            : prev
        );
      }, 200);

      const result = await SupabaseStorage.uploadFile(file, mediaType);
      clearInterval(progressInterval);

      if (result.success && result.url) {
        setUploadState({ progress: 100, status: 'completed' });
        onChange(result.url);
        toast({
          title: 'Upload successful',
          description: `${file.name} uploaded successfully`
        });
      } else {
        setUploadState({ 
          progress: 0, 
          status: 'error', 
          error: result.error || 'Upload failed' 
        });
        toast({
          title: 'Upload failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      setUploadState({ 
        progress: 0, 
        status: 'error', 
        error: error.message 
      });
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const resetUpload = () => {
    setUploadState({ progress: 0, status: 'idle' });
    onChange('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Method Selection */}
      <RadioGroup 
        value={uploadMethod} 
        onValueChange={(value) => setUploadMethod(value as UploadMethod)}
        className="flex flex-row space-x-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="url" id="url-method" />
          <Label htmlFor="url-method" className="text-sm flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Enter URL
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="upload" id="upload-method" />
          <Label htmlFor="upload-method" className="text-sm flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </Label>
        </div>
      </RadioGroup>

      {/* URL Input */}
      {uploadMethod === 'url' && (
        <div>
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${mediaType.slice(0, -1)} URL...`}
            className="w-full"
          />
        </div>
      )}

      {/* File Upload */}
      {uploadMethod === 'upload' && (
        <Card>
          <CardContent className="p-4">
            {uploadState.status === 'idle' && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                onClick={() => document.getElementById(`file-input-${mediaType}`)?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  {getIcon()}
                  <p className="text-sm font-medium">
                    Drop {mediaType.slice(0, -1)} here or click to select
                  </p>
                  <p className="text-xs text-gray-500">
                    Max {getMaxSizeText()} • {getAcceptedTypes().split(',').join(', ')}
                  </p>
                </div>
              </div>
            )}

            {uploadState.status === 'uploading' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </div>
                <Progress value={uploadState.progress} className="h-2" />
              </div>
            )}

            {uploadState.status === 'completed' && value && (
              <div className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upload successful! File URL: <span className="font-mono text-xs break-all">{value}</span>
                  </AlertDescription>
                </Alert>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetUpload}
                  className="w-full"
                >
                  <X className="h-3 w-3 mr-1" />
                  Upload Different File
                </Button>
              </div>
            )}

            {uploadState.status === 'error' && (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadState.error}</AlertDescription>
                </Alert>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetUpload}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              id={`file-input-${mediaType}`}
              type="file"
              accept={getAcceptedTypes()}
              onChange={handleFileInput}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}