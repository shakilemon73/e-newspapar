import SEO from '@/components/SEO';
import ContactForm from '@/components/contact/ContactForm';

export default function Contact() {
  return (
    <>
      <SEO
        title="যোগাযোগ"
        description="আমাদের সাথে যোগাযোগ করুন। আপনার মতামত, প্রশ্ন বা পরামর্শ আমাদের কাছে গুরুত্বপূর্ণ।"
      />
      <ContactForm />
    </>
  );
}