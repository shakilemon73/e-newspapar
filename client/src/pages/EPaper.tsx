import React from 'react';
import SEO from '@/components/SEO';
import AdvancedEPaperViewer from '@/components/epaper/AdvancedEPaperViewer';

const EPaper = () => {
  return (
    <>
      <SEO
        title="ই-পেপার - World-Class E-Paper Experience"
        description="NYT, Guardian & FT inspired Bengali e-paper with advanced viewer, dark mode, and mobile-first design"
        keywords="ই-পেপার, বাংলা সংবাদপত্র, আজকের কাগজ, digital newspaper, bengali epaper"
      />
      
      <AdvancedEPaperViewer />
    </>
  );
};

export default EPaper;