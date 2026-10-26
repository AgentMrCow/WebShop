"use client";

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { useShopConfig } from './SessionContext';

export default function OAuthButtons({ callbackUrl = '/' }: { callbackUrl?: string }) {
  const { config } = useShopConfig();
  if (!config?.providers.google && !config?.providers.github) return null;
  return <div className="space-y-3">
    {config.providers.google && <Button type="button" variant="outline" className="w-full" onClick={() => signIn('google', { callbackUrl })}><span className="mr-2 font-bold text-blue-600">G</span>Continue with Google</Button>}
    {config.providers.github && <Button type="button" variant="outline" className="w-full" onClick={() => signIn('github', { callbackUrl })}><GitHubLogoIcon className="mr-2 h-5 w-5" />Continue with GitHub</Button>}
    <div className="flex items-center gap-3 py-2 text-sm text-gray-500"><span className="h-px flex-1 bg-gray-200" />or use email<span className="h-px flex-1 bg-gray-200" /></div>
  </div>;
}
