import React from 'react';
import UserAnalyticsDashboard from '@/components/UserAnalyticsDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

export default function UserAnalytics() {
  const { user } = useSupabaseAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">লগইন প্রয়োজন</h1>
            <p className="text-gray-600">আপনার পরিসংখ্যান দেখতে প্রথমে লগইন করুন।</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <UserAnalyticsDashboard userId={user.id} />
      </div>
      <Footer />
    </div>
  );
}