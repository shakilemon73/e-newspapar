import React from 'react';
import { EnhancedPersonalizedRecommendations } from '@/components/EnhancedPersonalizedRecommendations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PersonalizedRecommendations() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <EnhancedPersonalizedRecommendations />
      </div>
      <Footer />
    </div>
  );
}