import { useState, useEffect } from 'react';

type SocialMediaPlatform = 'facebook' | 'twitter' | 'instagram';

interface SocialMediaPost {
  id: string;
  platform: SocialMediaPlatform;
  content: string;
  embedCode: string;
  publishedAt: string;
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
        
        // In a real implementation, this would be an API call to fetch social media posts
        // For demonstration, we'll create some sample data
        const samplePosts: SocialMediaPost[] = [
          {
            id: 'fb1',
            platform: 'facebook',
            content: 'আজকের সর্বশেষ খবর জানতে আমাদের ফেসবুক পেজ ফলো করুন!',
            embedCode: `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fprothomalo%2Fposts%2F10160323778941192&width=500" width="100%" height="300" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`,
            publishedAt: new Date().toISOString()
          },
          {
            id: 'fb2',
            platform: 'facebook',
            content: 'এই সপ্তাহের সেরা ছবিগুলি দেখুন',
            embedCode: `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fprothomalo%2Fposts%2F10160323778941192&width=500" width="100%" height="300" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`,
            publishedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          },
          {
            id: 'tw1',
            platform: 'twitter',
            content: 'সর্বশেষ আপডেটের জন্য ফলো করুন আমাদের টুইটার',
            embedCode: `<blockquote class="twitter-tweet"><p lang="bn" dir="ltr">আমাদের গল্প • এমন এক মধ্যবিত্ত পরিবারের গল্প, যে পরিবারের সব সদস্যরা দেশের অর্থনীতির জন্য প্রতিদিন জীবন দিচ্ছেন কিন্তু অর্থনীতির চাকা সচল রাখতে ক্ষমতাধরদের কাছে তাঁদের কোনো মূল্যই নেই। <a href="https://twitter.com/hashtag/%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A5%E0%A6%AE_%E0%A6%86%E0%A6%B2%E0%A7%8B?src=hash&amp;ref_src=twsrc%5Etfw">#প্রথম_আলো</a><a href="https://t.co/lZhrbCrLJn">https://t.co/lZhrbCrLJn</a></p>&mdash; Prothom Alo (@ProthomAlo) <a href="https://twitter.com/ProthomAlo/status/1650022057500028928?ref_src=twsrc%5Etfw">April 23, 2023</a></blockquote>`,
            publishedAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
          },
          {
            id: 'tw2',
            platform: 'twitter',
            content: 'আজকের মূল সংবাদ',
            embedCode: `<blockquote class="twitter-tweet"><p lang="bn" dir="ltr">আমাদের গল্প • এমন এক মধ্যবিত্ত পরিবারের গল্প, যে পরিবারের সব সদস্যরা দেশের অর্থনীতির জন্য প্রতিদিন জীবন দিচ্ছেন কিন্তু অর্থনীতির চাকা সচল রাখতে ক্ষমতাধরদের কাছে তাঁদের কোনো মূল্যই নেই। <a href="https://twitter.com/hashtag/%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A5%E0%A6%AE_%E0%A6%86%E0%A6%B2%E0%A7%8B?src=hash&amp;ref_src=twsrc%5Etfw">#প্রথম_আলো</a><a href="https://t.co/lZhrbCrLJn">https://t.co/lZhrbCrLJn</a></p>&mdash; Prothom Alo (@ProthomAlo) <a href="https://twitter.com/ProthomAlo/status/1650022057500028928?ref_src=twsrc%5Etfw">April 23, 2023</a></blockquote>`,
            publishedAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
          },
          {
            id: 'in1',
            platform: 'instagram',
            content: 'আমাদের ইনস্টাগ্রামে আরও সুন্দর ছবি দেখুন',
            embedCode: `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/Cy0BxBWr39Q/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14"></blockquote>`,
            publishedAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
          },
          {
            id: 'in2',
            platform: 'instagram',
            content: 'সুন্দর বাংলাদেশ ক্যাম্পেইন',
            embedCode: `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/Cy0BxBWr39Q/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14"></blockquote>`,
            publishedAt: new Date(Date.now() - 432000000).toISOString() // 5 days ago
          }
        ];
        
        // Filter by selected platform
        const filteredPosts = samplePosts.filter(post => post.platform === selectedPlatform);
        
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
              dangerouslySetInnerHTML={{ __html: post.embedCode }}
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