import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-gaming font-bold text-gradient mb-4">
              Support Center
            </h1>
            <p className="text-xl text-gray-400">
              We're here to help you with any questions or issues
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="glass-effect rounded-xl p-8 border border-neon-blue/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Email Support</h3>
                <p className="text-gray-400 mb-6">
                  Get help from our support team via email
                </p>
                <a 
                  href="mailto:support@epicesports.in" 
                  className="btn-gaming px-6 py-3 inline-block"
                >
                  Contact Support
                </a>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-8 border border-neon-blue/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Discord Community</h3>
                <p className="text-gray-400 mb-6">
                  Join our Discord server for community support
                </p>
                <a 
                  href="https://discord.gg/epicesports" 
                  className="btn-gaming px-6 py-3 inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Discord
                </a>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-xl p-8 border border-neon-blue/20">
            <h3 className="text-2xl font-semibold mb-6">Common Issues</h3>
            <div className="space-y-4">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-4 bg-dark-800/50 rounded-lg">
                  <span className="font-medium">How do I register for tournaments?</span>
                  <span className="text-neon-blue group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-400">
                  <p>To register for tournaments:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Create an account or sign in</li>
                    <li>Browse available tournaments</li>
                    <li>Click "Register Now" on your chosen tournament</li>
                    <li>Complete payment if required</li>
                    <li>You'll receive confirmation via email</li>
                  </ol>
                </div>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-4 bg-dark-800/50 rounded-lg">
                  <span className="font-medium">Payment not working?</span>
                  <span className="text-neon-blue group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-400">
                  <p>If you're having payment issues:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Check your internet connection</li>
                    <li>Ensure your card details are correct</li>
                    <li>Try a different payment method</li>
                    <li>Contact your bank if the issue persists</li>
                    <li>Reach out to our support team</li>
                  </ul>
                </div>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-4 bg-dark-800/50 rounded-lg">
                  <span className="font-medium">Can't login to my account?</span>
                  <span className="text-neon-blue group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-gray-400">
                  <p>If you can't access your account:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Check your email and password</li>
                    <li>Try resetting your password</li>
                    <li>Clear your browser cache</li>
                    <li>Try a different browser</li>
                    <li>Contact support if none of these work</li>
                  </ul>
                </div>
              </details>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">
              Still need help? Our support team is available 24/7
            </p>
            <Link href="/contact" className="btn-gaming-outline px-6 py-3">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
