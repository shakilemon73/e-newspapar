import SEO from '@/components/SEO';
import { VideoGrid } from '@/components/media/VideoGrid';

export default function Videos() {
  return (
    <>
      <SEO 
        title="ভিডিও | Bengali News"
        description="বাংলা ভিডিও সংবাদ এবং প্রতিবেদন। দেখুন সর্বশেষ ভিডিও কন্টেন্ট এবং সংবাদ।"
        keywords="বাংলা ভিডিও, সংবাদ ভিডিও, প্রতিবেদন"
      />
      <div className="container mx-auto px-4 py-8">
        <VideoGrid 
          title="সকল ভিডিও"
          limit={20}
          showPlayer={true}
          className="space-y-6"
        />
      </div>
    </>
  );
}