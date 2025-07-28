import SEO from '@/components/SEO';
import PollsWidget from '@/components/polls/PollsWidget';

export default function Polls() {
  return (
    <>
      <SEO
        title="জনমত জরিপ"
        description="বিভিন্ন গুরুত্বপূর্ণ বিষয়ে আপনার মতামত দিন এবং জনমত জরিপে অংশগ্রহণ করুন।"
      />
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">জনমত জরিপ</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            বিভিন্ন গুরুত্বপূর্ণ বিষয়ে আপনার মতামত দিন এবং সকলের মতামত দেখুন
          </p>
        </div>
        <PollsWidget />
      </div>
    </>
  );
}