'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function FixRegistrationsPage() {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFixRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/fix-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error fixing registrations:', error);
      setResult({ error: 'Failed to fix registrations' });
    } finally {
      setLoading(false);
    }
  };

  const handleGetStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/fix-registrations', {
        method: 'GET',
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error getting status:', error);
      setResult({ error: 'Failed to get status' });
    } finally {
      setLoading(false);
    }
  };

  if (!session && status !== 'unauthenticated') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div className="min-h-screen bg-dark-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Fix Tournament Registrations</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={handleGetStatus}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Registration Status'}
          </button>
          
          <button
            onClick={handleFixRegistrations}
            disabled={loading}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 ml-4"
          >
            {loading ? 'Fixing...' : 'Fix Registrations'}
          </button>
        </div>

        {result && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Result:</h2>
            <pre className="text-green-400 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 