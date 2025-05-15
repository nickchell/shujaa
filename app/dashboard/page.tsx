'use client';

import { useEffect, useState } from 'react';
import { useUser } from "@clerk/nextjs";
import DashboardClient from '@/components/dashboard/dashboard-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, Clock, Gift, Trophy, Users, Settings, ClipboardList } from 'lucide-react';

// This is a client component that wraps the dashboard content
function DashboardContent() {
  const { user, isLoaded } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wait for client-side mounting
  useEffect(() => {
    setIsMounted(true);
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Handle unauthenticated state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to access the dashboard</h2>
        </div>
      </div>
    );
  }

  // Show error state if there was an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error loading dashboard</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show the dashboard using the DashboardClient component
  return <DashboardClient />;
}

// Main dashboard page component
export default function DashboardPage() {
  return <DashboardContent />;
}