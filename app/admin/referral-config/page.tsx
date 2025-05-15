'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { config } from '@/lib/config';

export default function ReferralConfigPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [referralPath, setReferralPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load current config
  useEffect(() => {
    async function loadConfig() {
      try {
        setBaseUrl(config.baseUrl);
        setReferralPath(config.referralPath);
      } catch (error) {
        console.error('Error loading config:', error);
        toast({
          title: 'Error',
          description: 'Failed to load current configuration.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!baseUrl) {
      toast({
        title: 'Error',
        description: 'Base URL is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const success = await config.updateConfig({
        baseUrl: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
        referralPath: referralPath.startsWith('/') ? referralPath : `/${referralPath}`
      });
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Referral configuration updated successfully!',
        });
        
        // Reload the page to apply changes
        window.location.reload();
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: 'Failed to update referral configuration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Referral URL Configuration</CardTitle>
          <CardDescription>
            Update the base URL and path used for referral links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
              <p className="text-sm text-muted-foreground">
                The base URL where your application is hosted (e.g., https://yourapp.com)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referralPath">Referral Path</Label>
              <Input
                id="referralPath"
                type="text"
                value={referralPath}
                onChange={(e) => setReferralPath(e.target.value)}
                placeholder="/welcome"
                required
              />
              <p className="text-sm text-muted-foreground">
                The path where users land when they use a referral link (e.g., /welcome)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 bg-muted rounded-md">
                <p className="font-mono break-all">
                  {`${baseUrl.replace(/\/+$/, '')}${referralPath ? `/${referralPath.replace(/^\/+/, '')}` : ''}?ref=rafiki-EXAMPLE`}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
