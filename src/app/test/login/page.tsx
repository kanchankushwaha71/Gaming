'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingDb, setIsResettingDb] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createTestUser = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');
    
    try {
      setMessage('Creating test user...');
      const response = await fetch('/api/setup/create-test-user');
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`User created: ${data.user.email} / ${data.user.password}`);
        
        // Automatically log in
        setMessage(prev => `${prev}\nLogging in...`);
        const result = await signIn('credentials', {
          redirect: false,
          email: data.user.email,
          password: data.user.password
        });
        
        if (result?.ok) {
          setMessage(prev => `${prev}\nLogin successful! Redirecting...`);
          setTimeout(() => router.push('/'), 2000);
        } else {
          setError(`Login failed: ${result?.error}`);
        }
      } else {
        if (data.message && data.message.includes('already exists')) {
          setMessage(`Test user already exists: ${data.user.email} / ${data.user.password}`);
          
          // Try to log in with existing user
          setMessage(prev => `${prev}\nTrying to log in...`);
          const result = await signIn('credentials', {
            redirect: false,
            email: 'test@example.com',
            password: 'Test123!'
          });
          
          if (result?.ok) {
            setMessage(prev => `${prev}\nLogin successful! Redirecting...`);
            setTimeout(() => router.push('/'), 2000);
          } else {
            setError(`Login failed: ${result?.error}`);
          }
        } else {
          setError(`Error: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDatabase = async () => {
    setIsResettingDb(true);
    setMessage('Resetting database...');
    setError('');
    
    try {
      const response = await fetch('/api/setup/database');
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Database reset successful! ${data.message}`);
      } else {
        setError(`Failed to reset database: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsResettingDb(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen p-8">
      <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Test Login</h1>
        
        {error && <div className="bg-red-600/20 border border-red-400 text-white p-3 rounded mb-4">{error}</div>}
        
        {message && (
          <div className="bg-blue-600/20 border border-blue-400 text-white p-3 rounded mb-4 whitespace-pre-line">
            {message}
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={createTestUser}
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-md font-semibold hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Create & Login Test User'}
          </button>
          
          <button
            onClick={resetDatabase}
            disabled={isResettingDb}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-md font-semibold hover:bg-red-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isResettingDb ? 'Resetting...' : 'Reset Database Schema'}
          </button>
        </div>
        
        <p className="mt-4 text-sm text-gray-400">
          This will create a test user with email <code>test@example.com</code> and password <code>Test123!</code> if it doesn't exist, 
          then automatically log you in with that account.
        </p>
        
        <p className="mt-2 text-sm text-gray-400">
          If you're having database issues, click "Reset Database Schema" to recreate all tables from scratch.
        </p>
      </div>
    </div>
  );
} 