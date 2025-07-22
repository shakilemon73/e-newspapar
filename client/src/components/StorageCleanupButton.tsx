import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cleanupCorruptedStorage } from '@/lib/storage-cleanup';
import { Trash2, RefreshCw } from 'lucide-react';

export function StorageCleanupButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsLoading(true);
    
    try {
      const cleanedCount = cleanupCorruptedStorage();
      
      toast({
        title: "স্টোরেজ পরিষ্কার সফল",
        description: `${cleanedCount} টি ত্রুটিপূর্ণ এন্ট্রি মুছে ফেলা হয়েছে`,
      });
      
      // Reload the page after cleanup to ensure fresh state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Storage cleanup failed:', error);
      toast({
        title: "পরিষ্কার করতে ব্যর্থ",
        description: "স্টোরেজ পরিষ্কার করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleCleanup} 
      disabled={isLoading}
      className="gap-2"
      size="sm"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {isLoading ? 'পরিষ্কার করা হচ্ছে...' : 'স্টোরেজ পরিষ্কার করুন'}
    </Button>
  );
}

// Auto-cleanup component that runs on app start
export function AutoStorageCleanup() {
  useState(() => {
    // Run cleanup once when component mounts
    try {
      cleanupCorruptedStorage();
    } catch (error) {
      console.error('Auto storage cleanup failed:', error);
    }
  });

  return null; // This component doesn't render anything
}