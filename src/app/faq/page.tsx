export default function FAQPage() {
  const faqs = [
    {
      question: "What is EpicEsports India?",
      answer: "EpicEsports India is a premier gaming platform that hosts competitive esports tournaments for various games including Valorant, CS:GO, Free Fire, BGMI, and more. We provide a platform for gamers to compete, win prizes, and build their gaming careers."
    },
    {
      question: "How do I register for tournaments?",
      answer: "To register for tournaments: 1) Create an account on our platform, 2) Browse available tournaments, 3) Click 'Register Now' on your chosen tournament, 4) Complete the registration form, 5) Make payment if required, 6) You'll receive confirmation via email."
    },
    {
      question: "What games do you support?",
      answer: "We support popular games including Valorant, CS:GO, Free Fire, BGMI (Battlegrounds Mobile India), Call of Duty Mobile, FIFA, and many more. We regularly add new games based on community demand."
    },
    {
      question: "How do payments work?",
      answer: "We use Razorpay for secure payment processing. You can pay using UPI, credit/debit cards, net banking, and digital wallets. All transactions are encrypted and secure. Refunds are processed within 5-7 business days if tournaments are cancelled."
    },
    {
      question: "What are the eligibility requirements?",
      answer: "Players must be at least 13 years old to participate. For tournaments with cash prizes, players must be 18+ or have parental consent. You need a valid email address and the game installed on your device."
    },
    {
      question: "How do I know if my registration is confirmed?",
      answer: "You'll receive an email confirmation immediately after successful registration and payment. You can also check your registration status in your account dashboard under 'My Tournaments'."
    },
    {
      question: "What happens if I can't participate after registering?",
      answer: "If you need to withdraw, contact our support team at least 24 hours before the tournament starts. Refund policies vary by tournament - check the specific tournament terms for details."
    },
    {
      question: "How are prizes distributed?",
      answer: "Prizes are distributed within 7-14 days after tournament completion. We verify results and handle any disputes before prize distribution. Winners will be contacted via email with prize claim instructions."
    },
    {
      question: "Can I participate in team tournaments?",
      answer: "Yes! We host both solo and team tournaments. For team tournaments, the team captain registers and adds team members. All team members must have valid accounts on our platform."
    },
    {
      question: "What if I face technical issues during a tournament?",
      answer: "Contact our live support during tournaments for immediate assistance. We have dedicated support staff monitoring all tournaments. Report issues immediately for fastest resolution."
    },
    {
      question: "How do I improve my ranking?",
      answer: "Your ranking improves based on tournament performance, wins, and consistency. Participate regularly, perform well in matches, and maintain good sportsmanship to climb the leaderboards."
    },
    {
      question: "Is there an age limit for tournaments?",
      answer: "Minimum age is 13 years for all tournaments. For cash prize tournaments, participants must be 18+ or have verified parental consent. Age verification may be required for high-value tournaments."
    }
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-gaming font-bold text-gradient mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-400">
              Find answers to common questions about EpicEsports India
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group glass-effect rounded-xl border border-neon-blue/20 overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-dark-800/30 transition-colors">
                  <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  <span className="text-neon-blue group-open:rotate-180 transition-transform flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6">
                  <div className="pt-4 border-t border-gray-700/50">
                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="glass-effect rounded-xl p-8 border border-neon-blue/20">
              <h3 className="text-2xl font-semibold mb-4">Still have questions?</h3>
              <p className="text-gray-400 mb-6">
                Can't find what you're looking for? Our support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/support" 
                  className="btn-gaming px-6 py-3"
                >
                  Contact Support
                </a>
                <a 
                  href="/contact" 
                  className="btn-gaming-outline px-6 py-3"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
