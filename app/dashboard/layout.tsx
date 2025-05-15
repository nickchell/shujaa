'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TaskProvider } from '@/lib/contexts/TaskContext';

// Dynamically import the client component to enable code splitting
const DashboardLayoutClient = dynamic<React.ComponentProps<typeof import('@/components/dashboard/dashboard-layout-client').default>>(
  () => import('@/components/dashboard/dashboard-layout-client').then(mod => mod.default),
  { 
    ssr: false, 
    loading: () => <DashboardLoading /> 
  }
);

// Loading component for the dashboard
function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}

// Error boundary for the dashboard
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're having trouble loading your dashboard. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }


    return this.props.children;
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set ready state to true to ensure we're client-side
    setIsReady(true);
    
    // Redirect to login if not authenticated
    if (isLoaded && !userId) {
      router.push('/login');
    }
  }, [isLoaded, userId, router]);

  // Show loading state while checking auth
  if (!isLoaded || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (will be redirected by the effect)
  if (!userId) {
    return null;
  }

  return (
    <TaskProvider>
      <DashboardErrorBoundary>
        <Suspense fallback={<DashboardLoading />}>
          <DashboardLayoutClient>
            {children}
          </DashboardLayoutClient>
        </Suspense>
      </DashboardErrorBoundary>
    </TaskProvider>
  );
}
