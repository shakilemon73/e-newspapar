import SEO from '@/components/SEO';
import { AudioGrid } from '@/components/media/AudioGrid';

export default function AudioArticles() {
  return (
    <>
      <SEO 
        title="অডিও আর্টিকেল | Bengali News"
        description="বাংলা অডিও সংবাদ এবং আর্টিকেল। শুনুন সর্বশেষ অডিও কন্টেন্ট এবং সংবাদ।"
        keywords="বাংলা অডিও, অডিও সংবাদ, অডিও আর্টিকেল"
      />
      <div className="container mx-auto px-4 py-8">
        <AudioGrid 
          title="সকল অডিও আর্টিকেল"
          limit={20}
          showPlayer={true}
          layout="grid"
          className="space-y-6"
        />
      </div>
    </>
  );
}