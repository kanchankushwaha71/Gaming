"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ProfileRedirect() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect to member dashboard with profile tab
      router.replace('/member?tab=profile');
    } else if (status === 'unauthenticated') {
      // Redirect to login if not authenticated
      router.replace('/login?redirect=/member');
    }
  }, [status, router]);

  return (
    <div className="bg-dark-950 min-h-screen text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-400">Redirecting to your profile...</p>
        </div>
      </div>
    </div>
  );
} 