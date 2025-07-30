/**
 * Admin Timestamp Fixer Component
 * Allows admin to fix article timestamps directly from the UI
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { fixArticleTimestamp, fixRonaldoArticleTimestamp } from '@/lib/fix-timestamp-admin';

export const TimestampFixer: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [titleKeyword, setTitleKeyword] = useState('রোনালদো');
  const [minutesAgo, setMinutesAgo] = useState(30);

  const handleFixRonaldoArticle = async () => {
    setIsFixing(true);
    
    try {
      const result = await fixRonaldoArticleTimestamp();
      
      if (result.success) {
        toast({
          title: "✅ Timestamp Fixed!",
          description: `রোনালদো article timestamp updated successfully. It should now show "৩০ মিনিট আগে".`,
        });
      } else {
        toast({
          title: "❌ Fix Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to fix timestamp",
        variant: "destructive",
      });
    }
    
    setIsFixing(false);
  };
  
  const handleFixCustomArticle = async () => {
    if (!titleKeyword.trim()) {
      toast({
        title: "❌ Invalid Input",
        description: "Please enter a title keyword",
        variant: "destructive",
      });
      return;
    }
    
    setIsFixing(true);
    
    try {
      const result = await fixArticleTimestamp(titleKeyword, minutesAgo);
      
      if (result.success) {
        toast({
          title: "✅ Timestamp Fixed!",
          description: `Updated ${result.updatedArticles?.length || 0} article(s) containing "${titleKeyword}"`,
        });
      } else {
        toast({
          title: "❌ Fix Failed",
          description: "Failed to update article timestamp",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to fix timestamp",
        variant: "destructive",
      });
    }
    
    setIsFixing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">🔧 Article Timestamp Fixer</CardTitle>
          <CardDescription>
            Fix incorrect article timestamps that are showing wrong relative time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Quick Fix for Ronaldo Article */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold mb-2">Quick Fix: রোনালদো Article</h3>
            <p className="text-sm text-gray-600 mb-3">
              The রোনালদো article is showing "২১ ঘন্টা আগে" but should show "৩০ মিনিট আগে"
            </p>
            <Button 
              onClick={handleFixRonaldoArticle}
              disabled={isFixing}
              className="w-full"
            >
              {isFixing ? 'Fixing...' : 'Fix রোনালদো Article Timestamp'}
            </Button>
          </div>
          
          {/* Custom Article Timestamp Fix */}
          <div className="space-y-4">
            <h3 className="font-semibold">Custom Article Fix</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titleKeyword">Article Title Keyword</Label>
                <Input
                  id="titleKeyword"
                  value={titleKeyword}
                  onChange={(e) => setTitleKeyword(e.target.value)}
                  placeholder="e.g., রোনালদো"
                />
              </div>
              
              <div>
                <Label htmlFor="minutesAgo">Minutes Ago</Label>
                <Input
                  id="minutesAgo"
                  type="number"
                  value={minutesAgo}
                  onChange={(e) => setMinutesAgo(parseInt(e.target.value) || 0)}
                  placeholder="30"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleFixCustomArticle}
              disabled={isFixing || !titleKeyword.trim()}
              variant="outline"
              className="w-full"
            >
              {isFixing ? 'Fixing...' : `Fix Article Timestamp (${minutesAgo} minutes ago)`}
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
            <strong>Note:</strong> This tool fixes articles that have incorrect timestamps in the database. 
            After fixing, refresh the homepage to see updated relative times.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimestampFixer;