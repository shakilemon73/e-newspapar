import SEO from '@/components/SEO';
import AboutUs from '@/components/company/AboutUs';

export default function About() {
  return (
    <>
      <SEO
        title="আমাদের সম্পর্কে"
        description="বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম হিসেবে আমাদের যাত্রা ও লক্ষ্য সম্পর্কে জানুন।"
      />
      <AboutUs />
    </>
  );
}