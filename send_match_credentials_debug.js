const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend('re_YAFhJ4mC_15bi942LxJ5EFBZ7ThVGXQVa');

// Email addresses to send to
const emailAddresses = [
  'e22cseu1432@bennett.edu.in',
  'sahithkumarpasupuleti.48@gmail.com', 
  'shubhamkush011112@gmail.com'
];

// Match credentials
const matchId = '123';
const password = '123';

// Beautiful email template matching the Gmail screenshot
const emailTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #ffffff; padding: 20px; border-radius: 10px;">
  <!-- Header Banner -->
  <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">EpicEsports Tournament</h1>
    <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 18px;">Valorant Championship 2025 (Test)</p>
  </div>
  
  <!-- Greeting -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h2 style="color: #f97316; margin: 0; font-size: 20px;">Hi Player! 👋</h2>
    <p style="color: #94a3b8; margin: 10px 0; font-size: 16px;">Your tournament registration is confirmed! Here are your match credentials:</p>
  </div>
  
  <!-- Match Credentials Box -->
  <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
    <h3 style="color: white; margin: 0 0 15px 0; font-size: 18px; text-align: center;">🏆 MATCH CREDENTIALS</h3>
    
    <div style="background-color: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px;">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🏆</span>
        <span style="color: white;"><strong>Tournament:</strong> Valorant Championship 2025 (Test)</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🎮</span>
        <span style="color: white;"><strong>Game:</strong> Valorant</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🕐</span>
        <span style="color: white;"><strong>Start Time:</strong> Saturday, 16 August 2025 at 7:01 pm</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🆔</span>
        <span style="color: white;"><strong>Room ID:</strong> ${matchId}</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🔑</span>
        <span style="color: white;"><strong>Password:</strong> ${password}</span>
      </div>
      <div style="display: flex; align-items: center;">
        <span style="color: #fbbf24; font-size: 20px; margin-right: 10px;">🌍</span>
        <span style="color: white;"><strong>Server:</strong> Asia (Mumbai)</span>
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
`;

const textTemplate = `🏆 Match Credentials - EpicEsports

Hi Player! 👋

Your tournament registration is confirmed! Here are your match credentials:

🏆 MATCH CREDENTIALS
Tournament: Valorant Championship 2025 (Test)
Game: Valorant
Start Time: Saturday, 16 August 2025 at 7:01 pm
Room ID: ${matchId}
Password: ${password}
Server: Asia (Mumbai)

⚠️ IMPORTANT INSTRUCTIONS:
• Join the match room 15 minutes before the scheduled time
• Use the exact credentials provided above
• Make sure you have a stable internet connection
• Keep your game updated to the latest version
• Contact support immediately if you face any issues

Need help? Contact our support team at support@epicesports.tech or join our Discord server.

Good luck and have fun! 🚀

EpicEsports Team`;

// Send emails with detailed debugging
async function sendMatchCredentials() {
  console.log('🚀 Starting to send match credentials...');
  console.log('📧 Using Resend API key:', 're_YAFhJ4mC_15bi942LxJ5EFBZ7ThVGXQVa');
  console.log('📧 From email:', 'noreply@epicesports.tech');
  
  for (const email of emailAddresses) {
    try {
      console.log(`\n📧 Sending email to: ${email}`);
      
      const result = await resend.emails.send({
        from: 'noreply@epicesports.tech',
        to: [email],
        subject: '🏆 Match Credentials - EpicEsports',
        html: emailTemplate,
        text: textTemplate,
      });
      
      console.log(`📊 Full API response:`, JSON.stringify(result, null, 2));
      
      if (result && result.id) {
        console.log(`✅ Email sent successfully to ${email}:`, result.id);
      } else {
        console.log(`⚠️  Email sent but no message ID returned to ${email}`);
        console.log(`📊 Response data:`, result);
      }
      
    } catch (error) {
      console.error(`❌ Failed to send email to ${email}:`);
      console.error(`   Error type:`, error.constructor.name);
      console.error(`   Error message:`, error.message);
      console.error(`   Full error:`, error);
      
      if (error.response) {
        console.error(`   Response status:`, error.response.status);
        console.error(`   Response data:`, error.response.data);
      }
    }
    
    // Wait a bit between emails to avoid rate limiting
    console.log(`⏳ Waiting 2 seconds before next email...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎉 Email sending process completed!');
}

// Test Resend connection first
async function testResendConnection() {
  console.log('🧪 Testing Resend connection...');
  
  try {
    // Try to get domains to test connection
    const domains = await resend.domains.list();
    console.log('✅ Resend connection successful!');
    console.log('📊 Available domains:', domains);
  } catch (error) {
    console.error('❌ Resend connection failed:', error.message);
    console.error('   This might be why emails are not being delivered');
  }
}

// Run tests
async function main() {
  await testResendConnection();
  console.log('\n' + '='.repeat(50) + '\n');
  await sendMatchCredentials();
}

main().catch(console.error);

