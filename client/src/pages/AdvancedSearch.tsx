import React from 'react';
import { AdvancedBengaliSearch } from '@/components/AdvancedBengaliSearch';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdvancedSearch() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <AdvancedBengaliSearch />
      </div>
      <Footer />
    </div>
  );
}