import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { SupabaseStorage, MediaType, getFileValidator } from '@/lib/supabase-storage';
import { useToast } from '@/hooks/use-toast';
import { StorageSetup } from './StorageSetup';

interface MediaUploaderProps {
  type: MediaType;
  onUploadComplete?: (url: string, path: string) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  path?: string;
  error?: string;
}

export function MediaUploader({ 
  type, 
  onUploadComplete, 
  onUploadError, 
  maxFiles = 5,
  className = '' 
}: MediaUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const validator = getFileValidator(type);

  const getIcon = () => {
    switch (type) {
      case 'images':
        return <FileImage className="h-8 w-8" />;
      case 'videos':
        return <FileVideo className="h-8 w-8" />;
      case 'audio':
        return <FileAudio className="h-8 w-8" />;
    }
  };

  const getAcceptedTypes = () => {
    switch (type) {
      case 'images':
        return 'image/jpeg,image/jpg,image/png,image/webp';
      case 'videos':
        return 'video/mp4,video/webm,video/ogg';
      case 'audio':
        return 'audio/mp3,audio/wav,audio/ogg,audio/mpeg';
    }
  };

  const getMaxSizeText = () => {
    switch (type) {
      case 'images':
        return '5MB';
      case 'videos':
        return '100MB';
      case 'audio':
        return '50MB';
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    // Validate files
    for (const file of fileArray) {
      if (uploadingFiles.length + validFiles.length >= maxFiles) {
        toast({
          title: 'Too many files',
          description: `Maximum ${maxFiles} files allowed`,
          variant: 'destructive'
        });
        break;
      }

      if (!validator(file)) {
        toast({
          title: 'Invalid file',
          description: `${file.name} is not a valid ${type.slice(0, -1)} file or exceeds ${getMaxSizeText()} limit`,
          variant: 'destructive'
        });
        continue;
      }

      validFiles.push(file);
    }

    // Start uploading valid files
    uploadFiles(validFiles);
  };

  const uploadFiles = async (files: File[]) => {
    const newUploadingFiles: UploadingFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map((item, index) => 
              index === prev.length - files.length + i && item.status === 'uploading'
                ? { ...item, progress: Math.min(item.progress + 10, 90) }
                : item
            )
          );
        }, 200);

        const result = await SupabaseStorage.uploadFile(file, type);
        clearInterval(progressInterval);

        setUploadingFiles(prev => 
          prev.map((item, index) => 
            index === prev.length - files.length + i
              ? {
                  ...item,
                  progress: 100,
                  status: result.success ? 'completed' : 'error',
                  url: result.url,
                  path: result.path,
                  error: result.error
                }
              : item
          )
        );

        if (result.success && result.url && result.path) {
          onUploadComplete?.(result.url, result.path);
          toast({
            title: 'Upload successful',
            description: `${file.name} uploaded successfully`
          });
        } else {
          onUploadError?.(result.error || 'Upload failed');
          toast({
            title: 'Upload failed',
            description: result.error || 'Unknown error occurred',
            variant: 'destructive'
          });
        }
      } catch (error: any) {
        setUploadingFiles(prev => 
          prev.map((item, index) => 
            index === prev.length - files.length + i
              ? {
                  ...item,
                  progress: 100,
                  status: 'error',
                  error: error.message
                }
              : item
          )
        );
        
        onUploadError?.(error.message);
        toast({
          title: 'Upload failed',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          Upload {type.charAt(0).toUpperCase() + type.slice(1)}
        </CardTitle>
        <CardDescription>
          Upload {type} files (max {getMaxSizeText()} per file, up to {maxFiles} files)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium">
              Drag and drop {type} here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              Supported: {getAcceptedTypes().split(',').join(', ')}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles.length >= maxFiles}
            >
              Select Files
            </Button>
          </div>
        </div>

        {/* Hidden File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptedTypes()}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Upload Progress */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Upload Progress</Label>
            {uploadingFiles.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{item.file.name}</span>
                  <div className="flex items-center gap-2">
                    {item.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {item.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Progress value={item.progress} className="h-2" />
                {item.status === 'error' && item.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{item.error}</AlertDescription>
                  </Alert>
                )}
                {item.status === 'completed' && item.url && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Uploaded successfully! URL: {item.url}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}