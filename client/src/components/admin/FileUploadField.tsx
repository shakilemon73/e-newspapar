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
  type: MediaType;
  value?: string;
  onChange?: (url: string) => void;
  placeholder?: string;
  accept?: string;
  maxSize?: string;
}

export function FileUploadField({ 
  label, 
  type, 
  value, 
  onChange, 
  placeholder = "Select file to upload",
  accept,
  maxSize = "5MB"
}: FileUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showStorageSetup, setShowStorageSetup] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const result = await SupabaseStorage.uploadFile(file, type);
      
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
      <Label>{label}</Label>
      
      <div className="space-y-2">
        {value && (
          <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 dark:text-green-200">
              File uploaded successfully
            </span>
          </div>
        )}
        
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
        
        <p className="text-sm text-gray-500">
          Max size: {maxSize}. {accept ? `Accepted formats: ${accept}` : ''}
        </p>
      </div>
    </div>
  );
}