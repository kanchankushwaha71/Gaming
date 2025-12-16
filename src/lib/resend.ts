import { Resend } from 'resend';

// Initialize Resend with API key from environment, with fallback for build time
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');

export interface SendEmailOptions {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    // Check if we have a valid API key
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.warn('Resend API key not configured - email sending disabled');
      return { success: false, error: 'Email service not configured' };
    }

    const fromEmail = options.from || process.env.FROM_EMAIL || 'noreply@epicesports.tech';
    
    const data = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// Email templates for different types of notifications
export const EmailTemplates = {
  matchReminder: (playerName: string, tournamentName: string, matchTime: string) => ({
    subject: `🏆 Match Starting Soon - ${tournamentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 10px;">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🎮 EpicEsports</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 18px;">India's Premier Esports Platform</p>
        </div>
        
        <!-- Greeting -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #f97316; margin: 0; font-size: 20px;">Hi ${playerName}! 👋</h2>
          <p style="color: #94a3b8; margin: 10px 0; font-size: 16px;">Your match for <strong>${tournamentName}</strong> is starting soon!</p>
        </div>
        
        <!-- Match Details Box -->
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; text-align: center;">⏰ MATCH REMINDER</h3>
          
          <div style="background-color: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🕐</span>
              <span style="color: white;"><strong>Match Time:</strong> ${matchTime}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🏆</span>
              <span style="color: white;"><strong>Tournament:</strong> ${tournamentName}</span>
            </div>
          </div>
        </div>
        
        <!-- Important Instructions -->
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; text-align: center;">⚠️ IMPORTANT INSTRUCTIONS:</h3>
          <ul style="color: white; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Join the tournament lobby <strong>10 minutes early</strong></li>
            <li>Check your equipment and internet connection</li>
            <li>Have your game client ready</li>
            <li>Make sure you have a stable internet connection</li>
            <li>Keep your game updated to the latest version</li>
          </ul>
        </div>
        
        <!-- Call to Action Button -->
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="https://www.epicesports.tech/tournaments" style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            View Tournament Details
          </a>
        </div>
        
        <!-- Support Section -->
        <div style="text-align: center; margin-bottom: 25px;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            Need help? Contact our support team at <a href="mailto:support@epicesports.tech" style="color: #f97316; text-decoration: none;">support@epicesports.tech</a> or join our Discord server.
          </p>
          <p style="color: #f97316; margin: 10px 0 0 0; font-size: 16px; font-weight: bold;">Good luck and may the best team win! 🎯</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #475569; color: #94a3b8; font-size: 14px;">
          <p>EpicEsports Team</p>
        </div>
      </div>
    `,
    text: `🏆 Match Starting Soon - ${tournamentName}

Hi ${playerName}! 👋

Your match for ${tournamentName} is starting soon!

⏰ MATCH REMINDER
Match Time: ${matchTime}
Tournament: ${tournamentName}

⚠️ IMPORTANT INSTRUCTIONS:
• Join the tournament lobby 10 minutes early
• Check your equipment and internet connection
• Have your game client ready
• Make sure you have a stable internet connection
• Keep your game updated to the latest version

Need help? Contact our support team at support@epicesports.tech or join our Discord server.

Good luck and may the best team win! 🎯

EpicEsports Team`
  }),

  matchCredentials: (playerName: string, tournamentName: string, game: string, startTime: string, roomId: string, password: string, server: string = 'Asia (Mumbai)') => ({
    subject: `🏆 Match Credentials - ${tournamentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 10px;">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">EpicEsports Tournament</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 18px;">${tournamentName}</p>
        </div>
        
        <!-- Greeting -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #f97316; margin: 0; font-size: 20px;">Hi ${playerName}! 👋</h2>
          <p style="color: #94a3b8; margin: 10px 0; font-size: 16px;">Your tournament registration is confirmed! Here are your match credentials:</p>
        </div>
        
        <!-- Match Credentials Box -->
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; text-align: center;">🏆 MATCH CREDENTIALS</h3>
          
          <div style="background-color: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🏆</span>
              <span style="color: white;"><strong>Tournament:</strong> ${tournamentName}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🎮</span>
              <span style="color: white;"><strong>Game:</strong> ${game}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🕐</span>
              <span style="color: white;"><strong>Start Time:</strong> ${startTime}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🆔</span>
              <span style="color: white;"><strong>Room ID:</strong> ${roomId}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🔑</span>
              <span style="color: white;"><strong>Password:</strong> ${password}</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🌍</span>
              <span style="color: white;"><strong>Server:</strong> ${server}</span>
            </div>
          </div>
        </div>
        
        <!-- Important Instructions -->
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; text-align: center;">⚠️ IMPORTANT INSTRUCTIONS:</h3>
          <ul style="color: white; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>Join the match room <strong>15 minutes before</strong> the scheduled time</li>
            <li>Use the <strong>exact credentials</strong> provided above</li>
            <li>Make sure you have a stable internet connection</li>
            <li>Keep your game updated to the latest version</li>
            <li>Contact support immediately if you face any issues</li>
          </ul>
        </div>
        
        <!-- Call to Action Button -->
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="https://www.epicesports.tech/tournaments" style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            View Tournament Dashboard
          </a>
        </div>
        
        <!-- Support Section -->
        <div style="text-align: center; margin-bottom: 25px;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            Need help? Contact our support team at <a href="mailto:support@epicesports.tech" style="color: #f97316; text-decoration: none;">support@epicesports.tech</a> or join our Discord server.
          </p>
          <p style="color: #f97316; margin: 10px 0 0 0; font-size: 16px; font-weight: bold;">Good luck and have fun! 🚀</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #475569; color: #94a3b8; font-size: 14px;">
          <p>EpicEsports Team</p>
        </div>
      </div>
    `,
    text: `🏆 Match Credentials - ${tournamentName}

Hi ${playerName}! 👋

Your tournament registration is confirmed! Here are your match credentials:

🏆 MATCH CREDENTIALS
Tournament: ${tournamentName}
Game: ${game}
Start Time: ${startTime}
Room ID: ${roomId}
Password: ${password}
Server: ${server}

⚠️ IMPORTANT INSTRUCTIONS:
• Join the match room 15 minutes before the scheduled time
• Use the exact credentials provided above
• Make sure you have a stable internet connection
• Keep your game updated to the latest version
• Contact support immediately if you face any issues

Need help? Contact our support team at support@epicesports.tech or join our Discord server.

Good luck and have fun! 🚀

EpicEsports Team`
  }),

  customNotification: (playerName: string, subject: string, message: string, tournamentName?: string) => ({
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 10px;">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🎮 EpicEsports</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 18px;">India's Premier Esports Platform</p>
        </div>
        
        <!-- Greeting -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #f97316; margin: 0; font-size: 20px;">Hi ${playerName}! 👋</h2>
          <p style="color: #94a3b8; margin: 10px 0; font-size: 16px;">You have a new notification from EpicEsports!</p>
        </div>
        
        <!-- Message Content -->
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; text-align: center;">📧 NOTIFICATION</h3>
          
          ${tournamentName ? `<p style="color: #e0e7ff; margin-bottom: 20px; text-align: center;"><strong>Regarding: ${tournamentName}</strong></p>` : ''}
          
          <div style="background-color: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <!-- Call to Action Button -->
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="https://www.epicesports.tech/member" style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            View Dashboard
          </a>
        </div>
        
        <!-- Support Section -->
        <div style="text-align: center; margin-bottom: 25px;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            Need help? Contact our support team at <a href="mailto:support@epicesports.tech" style="color: #f97316; text-decoration: none;">support@epicesports.tech</a> or join our Discord server.
          </p>
          <p style="color: #f97316; margin: 10px 0 0 0; font-size: 16px; font-weight: bold;">EpicEsports Team</p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #475569; color: #94a3b8; font-size: 14px;">
          <p>EpicEsports Team</p>
        </div>
      </div>
    `,
    text: `${subject}

Hi ${playerName}! 👋

You have a new notification from EpicEsports!

${tournamentName ? `Regarding: ${tournamentName}\n\n` : ''}${message}

Need help? Contact our support team at support@epicesports.tech or join our Discord server.

EpicEsports Team`
  })
};

export default resend;

