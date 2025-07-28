import { AdminLayout } from '@/components/admin/AdminLayout';
import AnalyticsDataVisualization from '@/components/admin/AnalyticsDataVisualization';

export default function AnalyticsAdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">অ্যানালিটিক্স ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground">
            ওয়েবসাইটের ব্যবহারকারী কার্যকলাপ এবং পারফরম্যান্স মেট্রিক্স
          </p>
        </div>
        
        <AnalyticsDataVisualization />
      </div>
    </AdminLayout>
  );
}