import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Download, Eye, FileText, Newspaper, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { generateEPaperDirect, getEPaperHistory, downloadEPaperPDF } from '@/lib/epaper-generator-direct';

interface GenerationResult {
  success: boolean;
  message: string;
  epaper?: any;
  downloadUrl?: string;
}

const EPaperGeneratorAdmin = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [title, setTitle] = useState('');
  const [batchStartDate, setBatchStartDate] = useState<Date>();
  const [batchEndDate, setBatchEndDate] = useState<Date>();
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);

  // Generate single e-paper using direct Supabase calls
  const handleGenerateEPaper = async (preview = false) => {
    try {
      setIsGenerating(true);
      
      const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
      const epaperTitle = title || `Bengali News - ${format(selectedDate || new Date(), 'yyyy-MM-dd')}`;
      
      console.log('🚀 Generating e-paper with direct Supabase calls...');
      
      // Use direct Supabase API call instead of Express server
      const result = await generateEPaperDirect(dateString, epaperTitle, !preview);

      if (preview) {
        // Download PDF for preview
        await downloadEPaperPDF(result.pdfBytes, `epaper-preview-${dateString || 'today'}.pdf`);
        
        toast({
          title: "Preview Generated",
          description: "E-paper preview downloaded successfully",
        });
      } else {
        // E-paper generated and saved
        toast({
          title: "E-Paper Generated!",
          description: "E-paper created and saved to database successfully",
        });
        
        // Reset form
        setTitle('');
        setSelectedDate(undefined);
        
        // Refresh history
        fetchGenerationHistory();
      }
    } catch (error: any) {
      console.error('Error generating e-paper:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate e-paper",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate batch e-papers using direct Supabase calls
  const handleBatchGeneration = async () => {
    if (!batchStartDate || !batchEndDate) {
      toast({
        title: "Dates Required",
        description: "Please select both start and end dates for batch generation",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBatchGenerating(true);
      
      const start = new Date(batchStartDate);
      const end = new Date(batchEndDate);
      const results = [];
      
      // Generate e-paper for each date using direct Supabase calls
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateString = format(date, 'yyyy-MM-dd');
        
        try {
          const result = await generateEPaperDirect(
            dateString, 
            `Bengali News - ${dateString}`, 
            true // auto-save
          );
          results.push(result.epaper);
        } catch (error: any) {
          console.error(`Error generating e-paper for ${dateString}:`, error);
          results.push({ date: dateString, error: error.message });
        }
      }
      
      toast({
        title: "Batch Generation Complete!",
        description: `Generated ${results.length} e-papers successfully`,
      });
      
      // Reset batch form
      setBatchStartDate(undefined);
      setBatchEndDate(undefined);
      
      // Refresh history
      fetchGenerationHistory();
    } catch (error: any) {
      console.error('Error in batch generation:', error);
      toast({
        title: "Batch Generation Failed",
        description: error.message || "Failed to generate e-papers",
        variant: "destructive",
      });
    } finally {
      setIsBatchGenerating(false);
    }
  };

  // Auto-generate today's e-paper using direct Supabase calls
  const handleAutoGenerate = async () => {
    try {
      setIsGenerating(true);
      
      const today = new Date().toISOString().split('T')[0];
      const todayTitle = `Bengali News - ${new Date().toLocaleDateString('bn-BD')}`;
      
      // Check if today's e-paper already exists
      const existingHistory = await getEPaperHistory(1, 1);
      const todayExists = existingHistory.epapers.some(
        epaper => epaper.publish_date === today
      );
      
      if (todayExists) {
        toast({
          title: "Today's E-Paper Exists",
          description: "Today's e-paper has already been generated",
        });
        return;
      }
      
      // Generate new e-paper for today
      await generateEPaperDirect(today, todayTitle, true);
      
      toast({
        title: "Auto-Generation Complete!",
        description: "Today's e-paper generated successfully",
      });
      
      fetchGenerationHistory();
    } catch (error: any) {
      console.error('Error in auto-generation:', error);
      toast({
        title: "Auto-Generation Failed",
        description: error.message || "Failed to auto-generate today's e-paper",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch generation history using direct Supabase calls
  const fetchGenerationHistory = async () => {
    try {
      const result = await getEPaperHistory(1, 10);
      setGenerationHistory(result.epapers || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Load history on component mount
  React.useEffect(() => {
    fetchGenerationHistory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Newspaper className="h-6 w-6" />
        <h1 className="text-2xl font-bold">E-Paper Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single E-Paper Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Generate E-Paper</span>
            </CardTitle>
            <CardDescription>
              Create a newspaper-style PDF with clickable articles from your database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="epaper-title">E-Paper Title</Label>
              <Input
                id="epaper-title"
                placeholder="Bengali News - Today's Edition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Publication Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => handleGenerateEPaper(false)}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? 'Generating...' : 'Generate & Save'}
              </Button>
              <Button 
                onClick={() => handleGenerateEPaper(true)}
                disabled={isGenerating}
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Automated e-paper generation options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              className="w-full"
              variant="secondary"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Auto-Generate Today\'s E-Paper'}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Automatically collects today's articles and generates a newspaper-style PDF with clickable links to full articles.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Generation</CardTitle>
          <CardDescription>
            Generate multiple e-papers for a date range
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !batchStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {batchStartDate ? format(batchStartDate, "PPP") : <span>Start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={batchStartDate}
                    onSelect={setBatchStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !batchEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {batchEndDate ? format(batchEndDate, "PPP") : <span>End date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={batchEndDate}
                    onSelect={setBatchEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button 
            onClick={handleBatchGeneration}
            disabled={isBatchGenerating || !batchStartDate || !batchEndDate}
            className="w-full"
          >
            {isBatchGenerating ? 'Generating Batch...' : 'Generate Batch E-Papers'}
          </Button>
        </CardContent>
      </Card>

      {/* Generation History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent E-Papers</CardTitle>
          <CardDescription>
            Recently generated e-papers with download links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generationHistory.length > 0 ? (
            <div className="space-y-2">
              {generationHistory.map((epaper) => (
                <div key={epaper.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{epaper.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(epaper.publish_date), 'PPP')}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {epaper.pdf_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={epaper.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No e-papers generated yet. Create your first one above!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EPaperGeneratorAdmin;