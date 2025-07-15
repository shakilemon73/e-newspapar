import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Database, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function DatabaseSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [sqlCommands, setSqlCommands] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(false);
  const { toast } = useToast();

  const handleSetupDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/admin/setup-database');
      const data = await response.json();
      
      if (data.success) {
        setSqlCommands(data.sqlCommands);
        setShowInstructions(true);
        toast({
          title: "Database Setup Ready",
          description: "SQL commands generated. Please run them in Supabase SQL editor.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate setup commands');
      }
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to generate database setup commands",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlCommands);
      toast({
        title: "Copied!",
        description: "SQL commands copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup
        </CardTitle>
        <CardDescription>
          Set up missing database tables for reading history and personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showInstructions ? (
          <>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                This will generate SQL commands to create the missing <code>reading_history</code> and <code>saved_articles</code> tables with proper indexes and security policies.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleSetupDatabase}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Generating Setup Commands...' : 'Generate Database Setup Commands'}
            </Button>
          </>
        ) : (
          <>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Database setup commands generated! Copy the SQL commands below and run them in your Supabase SQL editor.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">SQL Commands</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy SQL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://supabase.com/dashboard/project', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Supabase
                  </Button>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{sqlCommands}</code>
                </pre>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Instructions:</strong>
                  <ol className="mt-2 ml-4 space-y-1 list-decimal">
                    <li>Copy the SQL commands above</li>
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to SQL Editor</li>
                    <li>Paste and run the commands</li>
                    <li>Refresh this page to enable reading history and personalized recommendations</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Button 
                onClick={() => {
                  setShowInstructions(false);
                  setSqlCommands('');
                }}
                variant="outline"
                className="w-full"
              >
                Generate New Commands
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}