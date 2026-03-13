import './Legal.css';

export default function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <a href="/" className="legal-back">← Back</a>
        <h1>Privacy Policy</h1>
        <p className="legal-date">Last updated: March 2026</p>

        <h2>1. Information We Collect</h2>
        <p>We collect your email address and name when you sign in with Google. We store the financial data you enter into the app, including transactions, categories, and FIRE settings.</p>

        <h2>2. How We Use Your Information</h2>
        <p>Your data is used solely to provide the FIRE Ledger service. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>

        <h2>3. Data Storage</h2>
        <p>Your data is stored securely using Supabase, hosted on AWS infrastructure. All data is encrypted in transit and at rest.</p>

        <h2>4. Payment Information</h2>
        <p>We do not store your payment information. All payment processing is handled by Paddle, a PCI-compliant payment processor.</p>

        <h2>5. Cookies</h2>
        <p>We use essential cookies only for authentication and session management. We do not use tracking or advertising cookies.</p>

        <h2>6. Your Rights</h2>
        <p>You have the right to access, export, or delete your data at any time. Use the Export CSV feature in the app, or contact us at support@fireledger.app to request full data deletion.</p>

        <h2>7. Children's Privacy</h2>
        <p>FIRE Ledger is not intended for users under the age of 18. We do not knowingly collect data from minors.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this policy periodically. We will notify users of significant changes via email.</p>

        <h2>9. Contact</h2>
        <p>For privacy-related questions, contact us at support@fireledger.app</p>
      </div>
    </div>
  );
}
