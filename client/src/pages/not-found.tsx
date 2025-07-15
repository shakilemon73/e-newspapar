import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">৪০৪</h1>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            পৃষ্ঠা খুঁজে পাওয়া যায়নি
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            আপনি যে পৃষ্ঠাটি খুঁজছেন তা হয়তো সরানো হয়েছে বা আর বিদ্যমান নেই।
          </p>
          <Link href="/">
            <Button className="w-full">
              হোম পেজে ফিরে যান
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
