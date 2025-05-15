'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SimpleDashboardProps {
  userId: string;
}

export function SimpleDashboard({ userId }: SimpleDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-medium">Your dashboard is ready!</div>
            <p className="text-xs text-muted-foreground mt-2">
              User ID: {userId}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 