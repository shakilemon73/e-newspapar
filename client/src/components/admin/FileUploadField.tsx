import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { SupabaseStorage, MediaType } from '@/lib/supabase-storage';
import { StorageSetup } from './StorageSetup';
import { useToast } from '@/hooks/use-toast';

interface FileUploadFieldProps {
  label: string;
  type?: MediaType;
  mediaType?: MediaType;
  value?: string;
  onChange?: (url: string) => void;
  placeholder?: string;
  accept?: string;
  maxSize?: string;
  description?: string;
}

export function FileUploadField({ 
  label, 
  type, 
  mediaType, 
  value, 
  onChange, 
  placeholder = "Select file to upload or enter URL",
  accept,
  maxSize = "500MB",
  description
}: FileUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showStorageSetup, setShowStorageSetup] = useState(false);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');
  const { toast } = useToast();

  // Use either type or mediaType prop
  const fileType = type || mediaType;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const result = await SupabaseStorage.uploadFile(file, fileType!);
      
      if (result.success && result.url) {
        onChange?.(result.url);
        toast({
          title: 'Upload successful',
          description: `${file.name} uploaded successfully`
        });
      } else {
        // Check if it's a bucket issue
        if (result.error?.includes('Bucket not found') || result.error?.includes('bucket')) {
          setShowStorageSetup(true);
          toast({
            title: 'Storage setup required',
            description: 'Please set up the media storage bucket first',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Upload failed',
            description: result.error || 'Unknown error occurred',
            variant: 'destructive'
          });
        }
      }
    } catch (error: any) {
      if (error.message?.includes('Bucket not found') || error.message?.includes('bucket')) {
        setShowStorageSetup(true);
        toast({
          title: 'Storage setup required',
          description: 'Please set up the media storage bucket first',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Upload failed',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  if (showStorageSetup) {
    return (
      <div className="space-y-4">
        <Label>{label}</Label>
        <StorageSetup />
        <Button 
          variant="outline" 
          onClick={() => setShowStorageSetup(false)}
          className="w-full"
        >
          Try Upload Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label>{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex rounded-md border">
          <Button
            type="button"
            variant={inputMode === 'url' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setInputMode('url')}
            className="rounded-r-none"
          >
            URL
          </Button>
          <Button
            type="button"
            variant={inputMode === 'upload' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setInputMode('upload')}
            className="rounded-l-none"
          >
            Upload
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        {value && (
          <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 dark:text-green-200">
              {inputMode === 'upload' ? 'File uploaded successfully' : 'URL set successfully'}
            </span>
          </div>
        )}
        
        {inputMode === 'url' ? (
          <Input
            type="url"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={`Enter ${fileType ? fileType.slice(0, -1) : 'media'} URL...`}
            className="w-full"
          />
        ) : (
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex-1"
            />
            
            {isUploading && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            )}
          </div>
        )}
        
        <p className="text-sm text-gray-500">
          {inputMode === 'upload' ? `Max size: ${maxSize}. ${accept ? `Accepted formats: ${accept}` : ''}` : 'Enter a direct URL to the media file'}
        </p>
      </div>
    </div>
  );
}