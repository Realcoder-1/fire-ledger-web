import './Legal.css';

export default function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <a href="/" className="legal-back">← Back</a>
        <h1>Terms of Service</h1>
        <p className="legal-date">Last updated: March 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using FIRE Ledger, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>

        <h2>2. Description of Service</h2>
        <p>FIRE Ledger is a subscription-based personal finance tracking application designed to help users work toward Financial Independence and Early Retirement (FIRE). The service includes transaction tracking, FIRE calculations, insights, and data export features.</p>

        <h2>3. Subscriptions and Billing</h2>
        <p>FIRE Ledger is offered as a paid subscription. By subscribing, you authorize us to charge your payment method on a recurring basis. Subscriptions automatically renew unless cancelled before the renewal date. All payments are processed securely through Paddle.</p>

        <h2>4. Refund Policy</h2>
        <p>We offer a 7-day refund policy from the date of purchase. To request a refund, contact us at support@fireledger.app within 7 days of your purchase.</p>

        <h2>5. User Data</h2>
        <p>You retain full ownership of all financial data you enter into FIRE Ledger. We do not sell, share, or monetize your personal data. See our Privacy Policy for full details.</p>

        <h2>6. Acceptable Use</h2>
        <p>You agree not to misuse the service, attempt to gain unauthorized access, or use the service for any unlawful purpose.</p>

        <h2>7. Disclaimer</h2>
        <p>FIRE Ledger provides financial tracking tools for informational purposes only. It does not constitute financial advice. Always consult a qualified financial advisor for investment decisions.</p>

        <h2>8. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>

        <h2>9. Contact</h2>
        <p>For any questions regarding these terms, contact us at support@fireledger.app</p>
      </div>
    </div>
  );
}
