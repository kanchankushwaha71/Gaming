"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

// Define the tournament type for TypeScript
type Tournament = {
  id: string;
  name: string;
  game: string;
  registrationFee: number;
  teamSize: number;
  maxTeams: number;
  currentTeams: number;
};

// Define the component props
interface TournamentRegistrationFormProps {
  tournament: Tournament;
  onSuccess: () => void;
  onCancel: () => void;
}

// Component definition
export default function TournamentRegistrationForm({ 
  tournament, 
  onSuccess, 
  onCancel 
}: TournamentRegistrationFormProps) {
  
  const { data: session } = useSession();
  
  // Form state
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: session?.user?.name || '',
    leaderEmail: session?.user?.email || '',
    leaderPhone: '',
    teamMembers: Array(Math.max(0, (tournament?.teamSize || 1) - 1)).fill('').map(() => ({
      name: '',
      email: '',
      gameUsername: ''
    }))
  });
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!session?.user) {
        throw new Error('Please log in to register for the tournament');
      }

      // Prepare registration data
      const registrationData = {
        tournamentId: tournament.id,
        teamName: formData.teamName,
        leaderName: formData.leaderName,
        leaderEmail: formData.leaderEmail,
        leaderPhone: formData.leaderPhone,
        teamMembers: formData.teamMembers.filter(member => member.name.trim() !== ''),
        notes: `Team registration for ${tournament?.name || 'tournament'}`,
      };

      // Call the registration API with timeout
      const response = await fetch('/api/tournaments/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Failed to register for tournament';
        
        // Handle specific error types
        if (response.status === 503) {
          throw new Error('Database connection timeout. Please try again in a moment.');
        } else if (response.status === 400 && errorMessage.includes('already registered')) {
          throw new Error('You are already registered for this tournament.');
        } else {
          throw new Error(errorMessage);
        }
      }

      // Store registration ID for payment verification
      const registrationId = result.registration?.id;

      // Handle payment for paid tournaments
      if ((tournament?.registrationFee || 0) > 0) {
        // Persist registration id locally so success page can update DB
        try {
          if (registrationId && typeof window !== 'undefined') {
            window.localStorage.setItem('lastRegistrationId', registrationId);
          }
        } catch {}

        // Redirect to Razorpay Payment Page
        const paymentPageUrl = process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_URL || 'https://rzp.io/l/yx1fpUA';
        window.location.href = paymentPageUrl;
      } else {
        // Free tournament - registration is complete
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register for tournament');
      setIsSubmitting(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="bg-dark-900 border border-neon-blue/30 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 flex justify-between items-center border-b border-neon-blue/20">
          <h3 className="text-xl font-bold text-white">Register for {tournament?.name || 'Tournament'}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-neon-blue text-lg">
              Registration Fee: {(tournament?.registrationFee || 0) === 0 ? 'Free' : `₹${tournament?.registrationFee || 0}`}
            </p>
                        <p className="text-gray-400 text-sm mt-2">
              Team Size: {tournament?.teamSize || 1} {(tournament?.teamSize || 1) === 1 ? 'Player' : 'Players'}
            </p>

          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Team Information */}
            {step === 1 && (
              <div className="space-y-4">
              <div>
                  <label className="block text-white mb-2 font-medium">Team Name *</label>
                  <input
                    type="text"
                    className="w-full bg-dark-800 border border-neon-blue/30 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none"
                    value={formData.teamName}
                    onChange={(e) => handleInputChange('teamName', e.target.value)}
                    placeholder="Enter your team name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-medium">Team Leader Name *</label>
                    <input
                      type="text"
                      className="w-full bg-dark-800 border border-neon-blue/30 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none"
                      value={formData.leaderName}
                      onChange={(e) => handleInputChange('leaderName', e.target.value)}
                      placeholder="Team leader's name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-medium">Email *</label>
                    <input
                      type="email"
                      className="w-full bg-dark-800 border border-neon-blue/30 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none"
                      value={formData.leaderEmail}
                      onChange={(e) => handleInputChange('leaderEmail', e.target.value)}
                      placeholder="Email address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full bg-dark-800 border border-neon-blue/30 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none"
                    value={formData.leaderPhone}
                    onChange={(e) => handleInputChange('leaderPhone', e.target.value)}
                    placeholder="Phone number (optional)"
                  />
                </div>

                {/* Team Members (if team size > 1) */}
                {(tournament?.teamSize || 1) > 1 && (
                  <div>
                    <h4 className="text-white font-medium mb-4">Team Members ({(tournament?.teamSize || 1) - 1} more needed)</h4>
                    <div className="space-y-3">
                      {formData.teamMembers.map((member, index) => (
                        <div key={index} className="border border-neon-blue/20 rounded-xl p-4 space-y-3">
                          <h5 className="text-neon-blue font-medium">Member {index + 2}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              className="bg-dark-800 border border-neon-blue/30 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none"
                              value={member.name}
                              onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                              placeholder="Player name"
                            />
                            <input
                              type="email"
                              className="bg-dark-800 border border-neon-blue/30 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none"
                              value={member.email}
                              onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                              placeholder="Email"
                            />
                            <input
                              type="text"
                              className="bg-dark-800 border border-neon-blue/30 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none"
                              value={member.gameUsername}
                              onChange={(e) => handleTeamMemberChange(index, 'gameUsername', e.target.value)}
                              placeholder="Game username"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-dark-800 text-white rounded-xl hover:bg-dark-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-neon-blue text-dark-900 rounded-xl hover:bg-neon-blue/80 transition-colors font-medium"
                    disabled={!formData.teamName || !formData.leaderName || !formData.leaderEmail}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Confirmation & Payment */}
            {step === 2 && (
              <div>
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-white">Confirm Registration</h4>
                  <p className="text-gray-400">
                    Review your details and complete the registration
                  </p>
                </div>

                {/* Registration Summary */}
                <div className="bg-dark-800 border border-neon-blue/20 rounded-xl p-6 mb-6">
                  <h5 className="text-neon-blue font-medium mb-4">Registration Summary</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tournament:</span>
                      <span className="text-white">{tournament?.name || 'Tournament'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Team Name:</span>
                      <span className="text-white">{formData.teamName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Team Leader:</span>
                      <span className="text-white">{formData.leaderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Registration Fee:</span>
                      <span className="text-white">
                        {(tournament?.registrationFee || 0) === 0 ? 'Free' : `₹${tournament?.registrationFee || 0}`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-dark-800 text-white rounded-xl hover:bg-dark-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-neon-blue text-dark-900 rounded-xl hover:bg-neon-blue/80 transition-colors font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : (tournament?.registrationFee || 0) === 0 ? 'Complete Registration' : 'Proceed to Payment'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
}