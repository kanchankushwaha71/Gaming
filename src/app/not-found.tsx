import Link from 'next/link';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="bg-dark-950 min-h-screen text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="text-gray-400 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/" 
              className="inline-block bg-gradient-to-r from-neon-blue to-neon-purple text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Go Home
            </Link>
            <div>
              <Link 
                href="/tournaments" 
                className="inline-block text-neon-blue hover:text-neon-purple transition-colors mx-4"
              >
                Browse Tournaments
              </Link>
              <Link 
                href="/contact" 
                className="inline-block text-neon-blue hover:text-neon-purple transition-colors mx-4"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 