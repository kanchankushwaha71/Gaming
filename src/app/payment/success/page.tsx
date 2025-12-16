"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();

  const [statusText, setStatusText] = useState<string>("Verifying payment...");
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    const paymentId =
      searchParams.get("razorpay_payment_id") ||
      searchParams.get("payment_id") ||
      searchParams.get("paymentId");

    // If user is not authenticated, ask them to login first
    if (status === "unauthenticated") {
      setError("Please login to complete verification.");
      setStatusText("");
      return;
    }

    // Allow fallback if we saved a registrationId even when paymentId is absent
    if (!paymentId) {
      let hasSavedReg = false;
      try {
        hasSavedReg = !!(typeof window !== 'undefined' && window.localStorage.getItem('lastRegistrationId'));
      } catch {}
      if (!hasSavedReg) {
        setError("Missing payment id in URL.");
        setStatusText("");
        return;
      }
    }

    let cancelled = false;
    async function verify() {
      try {
        setStatusText("Verifying payment with server...");

        // Try to include registrationId saved before redirect
        let registrationId: string | null = null;
        try {
          registrationId = typeof window !== 'undefined' ? window.localStorage.getItem('lastRegistrationId') : null;
        } catch {}

        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // We only have payment_id from Payment Pages; use testMode path in API
          body: JSON.stringify({
            razorpay_payment_id: paymentId,
            testMode: true,
            registrationId,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Verification failed");
        }

        if (!cancelled) {
          setVerified(true);
          setStatusText("Payment verified. Registration confirmed.");
          try {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem('lastRegistrationId');
            }
          } catch {}
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Payment verification failed.");
          setStatusText("");
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [searchParams, status]);

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 rounded-xl border border-neon-blue/30 bg-dark-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
      {statusText && <p className="text-gray-200 mb-4">{statusText}</p>}
      {error && (
        <div className="mb-4 p-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-300">
          {error}
        </div>
      )}
      {verified && (
        <div className="mb-4 p-3 rounded-lg border border-emerald-500/50 bg-emerald-500/10 text-emerald-300">
          Payment successful and verified.
        </div>
      )}
      <div className="flex gap-3 mt-6">
        <Link
          className="px-4 py-2 rounded-lg bg-neon-blue text-dark-900 hover:bg-neon-blue/80"
          href="/tournaments"
        >
          Go to Tournaments
        </Link>
        <button
          className="px-4 py-2 rounded-lg border border-neon-blue/40 hover:bg-dark-800"
          onClick={() => router.push("/")}
        >
          Home
        </button>
      </div>
    </div>
  );
}


