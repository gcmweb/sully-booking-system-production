
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionCanceledPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-red-600">
            Subscription Update Canceled
          </h1>
          <p className="text-muted-foreground mt-2">
            Your subscription update was canceled. No changes have been made to your account.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You canceled the subscription update process. Your current plan remains active 
              and no charges have been made.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Need help?</strong> If you encountered any issues during the upgrade process, 
                please contact our support team and we'll be happy to assist you.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Link href="/dashboard/subscription">
            <Button className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
