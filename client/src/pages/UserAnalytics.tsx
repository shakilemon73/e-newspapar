import React from 'react';
import { UserAnalyticsDashboard } from '@/components/UserAnalyticsDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UserAnalytics() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <UserAnalyticsDashboard />
      </div>
      <Footer />
    </div>
  );
}