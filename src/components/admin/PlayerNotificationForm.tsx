"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Tournament {
  id: string;
  name: string;
  currentTeams: number;
}

export default function PlayerNotificationForm() {
  const [formData, setFormData] = useState({
    tournamentId: '',
    subject: '',
    message: '',
    sendToAll: false
  });
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch tournaments for selection
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('/api/tournaments');
        if (response.ok) {
          const data = await response.json();
          setTournaments(data.tournaments || []);
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };

    fetchTournaments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      setMessage('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/notify-players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        const { stats } = result;
        if (stats?.failed > 0) {
          setMessage(`⚠️ Emails sent to ${stats.successful} players. ${stats.failed} failed to deliver.`);
        } else {
          setMessage(`✅ Successfully sent emails to ${result.playersNotified} players!`);
        }
        setFormData({
          tournamentId: '',
          subject: '',
          message: '',
          sendToAll: false
        });
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to send notifications');
      console.error('Error sending notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="bg-slate-800 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-white mb-6">📧 Notify Players</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Send to All or Specific Tournament */}
        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              checked={formData.sendToAll}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                sendToAll: e.target.checked,
                tournamentId: e.target.checked ? '' : prev.tournamentId
              }))}
              className="mr-2"
            />
            Send to All Players
          </label>
        </div>

        {/* Tournament Selection */}
        {!formData.sendToAll && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Tournament
            </label>
            <select
              value={formData.tournamentId}
              onChange={(e) => setFormData(prev => ({ ...prev, tournamentId: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
              required={!formData.sendToAll}
            >
              <option value="">Select a tournament...</option>
              {tournaments.map(tournament => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name} ({tournament.currentTeams} teams)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g., Important: Match starting in 30 minutes"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Enter your message to players..."
            rows={6}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Sending...' : '📧 Send Notifications'}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${message.includes('✅') ? 'bg-green-800' : 'bg-red-800'}`}>
          <p className="text-white text-sm">{message}</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-slate-700 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">💡 How it works:</h3>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Notifications are stored in database and shown to players</li>
          <li>• Choose specific tournament or send to all registered players</li>
          <li>• Perfect for match reminders, schedule changes, or announcements</li>
          <li>• Players will see notifications in their dashboard</li>
        </ul>
      </div>
    </motion.div>
  );
}

