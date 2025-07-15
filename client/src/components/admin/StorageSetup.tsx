import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function StorageSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSetupStorage = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/api/admin/setup-storage', {
        method: 'POST'
      });
      
      if (response.success) {
        setSetupComplete(true);
        toast({
          title: 'Storage setup complete',
          description: 'Media bucket has been configured successfully'
        });
      } else {
        setError(response.error || 'Failed to setup storage');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to setup storage');
    } finally {
      setIsLoading(false);
    }
  };

  if (setupComplete) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          Storage setup is complete. You can now upload files.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <Database className="h-5 w-5" />
          Storage Setup Required
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          The media storage bucket needs to be configured before you can upload files.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleSetupStorage} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Setting up storage...
            </>
          ) : (
            'Setup Storage Bucket'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}