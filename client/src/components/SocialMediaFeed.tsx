import { useState, useEffect } from 'react';

type SocialMediaPlatform = 'facebook' | 'twitter' | 'instagram';

interface SocialMediaPost {
  id: number;
  platform: string;
  content: string;
  embed_code: string;
  published_at: string;
}

export const SocialMediaFeed = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialMediaPlatform>('facebook');
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSocialPosts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch social media posts from Supabase directly
        const { getSocialMediaPosts } = await import('../lib/supabase-api');
        const data: SocialMediaPost[] = await getSocialMediaPosts(selectedPlatform);
        
        // Filter by selected platform (additional client-side filtering)
        const filteredPosts = data.filter(post => post.platform === selectedPlatform);
        
        setPosts(filteredPosts);
        setError(null);
        
        // Load platform-specific scripts
        if (selectedPlatform === 'twitter') {
          // Load Twitter widget.js
          const script = document.createElement('script');
          script.src = 'https://platform.twitter.com/widgets.js';
          script.async = true;
          document.body.appendChild(script);
          return () => {
            document.body.removeChild(script);
          };
        } else if (selectedPlatform === 'instagram') {
          // Load Instagram embed.js
          const script = document.createElement('script');
          script.src = '//www.instagram.com/embed.js';
          script.async = true;
          document.body.appendChild(script);
          return () => {
            document.body.removeChild(script);
          };
        }
      } catch (err) {
        setError('সোশ্যাল মিডিয়া পোস্ট লোড করতে সমস্যা হয়েছে');
        console.error('Error fetching social media posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialPosts();
  }, [selectedPlatform]);

  const renderPosts = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="bg-gray-200 dark:bg-gray-700 h-64 rounded"></div>
          ))}
        </div>
      );
    }

    if (error || posts.length === 0) {
      return (
        <div className="text-center py-8">
          {error || `${selectedPlatform} থেকে কোন পোস্ট পাওয়া যায়নি`}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="border border-border rounded overflow-hidden">
            <div 
              className="embedded-social-post" 
              dangerouslySetInnerHTML={{ __html: post.embed_code }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card dark:bg-card rounded shadow-sm p-4">
      <h3 className="text-lg font-bold mb-4 font-hind border-b border-border pb-2">সোশ্যাল মিডিয়া</h3>
      
      <div className="flex border border-border rounded mb-6 overflow-hidden">
        <button
          className={`flex-1 py-2 text-center text-sm ${selectedPlatform === 'facebook' ? 'bg-accent text-white' : 'bg-card hover:bg-muted'}`}
          onClick={() => setSelectedPlatform('facebook')}
        >
          <i className="fab fa-facebook-f mr-2"></i>ফেসবুক
        </button>
        <button
          className={`flex-1 py-2 text-center text-sm ${selectedPlatform === 'twitter' ? 'bg-accent text-white' : 'bg-card hover:bg-muted'}`}
          onClick={() => setSelectedPlatform('twitter')}
        >
          <i className="fab fa-twitter mr-2"></i>টুইটার
        </button>
        <button
          className={`flex-1 py-2 text-center text-sm ${selectedPlatform === 'instagram' ? 'bg-accent text-white' : 'bg-card hover:bg-muted'}`}
          onClick={() => setSelectedPlatform('instagram')}
        >
          <i className="fab fa-instagram mr-2"></i>ইনস্টাগ্রাম
        </button>
      </div>
      
      {renderPosts()}
      
      <div className="text-center mt-6">
        <a 
          href={`https://${selectedPlatform}.com/prothomalo`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded text-sm transition"
        >
          {selectedPlatform === 'facebook' && 'ফেসবুকে ফলো করুন'}
          {selectedPlatform === 'twitter' && 'টুইটারে ফলো করুন'}
          {selectedPlatform === 'instagram' && 'ইনস্টাগ্রামে ফলো করুন'}
        </a>
      </div>
    </div>
  );
};

export default SocialMediaFeed;