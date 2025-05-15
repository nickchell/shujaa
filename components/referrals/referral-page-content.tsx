'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Share2 } from 'lucide-react';
import { ReferralList } from '@/components/referrals/referral-list';
import { useToast } from '@/hooks/use-toast';
import { config } from '@/lib/config';

interface ReferralPageContentProps {
  initialReferralCode: string;
  initialReferralLink: string;
}

export function ReferralPageContent({ 
  initialReferralCode, 
  initialReferralLink 
}: ReferralPageContentProps) {
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState<string>(initialReferralLink);
  const [referralCode, setReferralCode] = useState<string>(initialReferralCode);
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    // Check if Web Share API is supported
    setShareSupported('share' in navigator);
  }, []);

  useEffect(() => {
    // Update the referral link if the code changes
    if (referralCode) {
      try {
        // Use the configured base URL from the config service
        const baseUrl = config.referralUrl;
        const url = new URL(baseUrl);
        url.searchParams.set('ref', referralCode);
        setReferralLink(url.toString());
      } catch (err) {
        console.error('Error updating referral link:', err);
        // Fallback to the initial link if there's an error
        setReferralLink(initialReferralLink || `${window.location.origin}/signup?ref=${referralCode}`);
      }
    }
  }, [referralCode, initialReferralLink]);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Copied to clipboard',
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    });
  };

  const handleShare = async () => {
    if (!shareSupported) {
      copyToClipboard(referralLink);
      return;
    }

    try {
      await navigator.share({
        title: 'Join me on Rafiki!',
        text: `Use my referral code: ${referralCode}`,
        url: referralLink,
      });
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback to copy if share fails
      copyToClipboard(referralLink);
    }
  };

  if (!referralCode) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Generating your referral code...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReferralList />

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>
            Share your unique code with friends to earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="referral-code" className="text-sm font-medium text-gray-500">
                Your Referral Code
              </Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex flex-grow items-stretch focus-within:z-10">
                  <Input
                    id="referral-code"
                    type="text"
                    value={referralCode || 'Loading...'}
                    readOnly
                    className="rounded-r-none font-mono font-bold"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-l-none border-l-0"
                  onClick={() => copyToClipboard(referralCode)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Link Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link with friends and earn rewards when they join!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  value={referralLink || 'Loading...'}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(referralLink)}
                title="Copy link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy link</span>
              </Button>
              {shareSupported && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  const text = encodeURIComponent(
                    `Join me on Rafiki! Use my referral code: ${referralCode} - ${referralLink}`
                  );
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
              >
                Share on WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const text = encodeURIComponent(
                    `Join me on Rafiki! Use my referral link: ${referralLink}`
                  );
                  window.open(
                    `https://twitter.com/intent/tweet?text=${text}`,
                    '_blank'
                  );
                }}
              >
                Share on Twitter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
