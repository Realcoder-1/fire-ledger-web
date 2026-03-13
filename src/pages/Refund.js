import './Legal.css';

export default function Refund() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <a href="/" className="legal-back">← Back</a>
        <h1>Refund Policy</h1>
        <p className="legal-date">Last updated: March 2026</p>

        <h2>7-Day Money Back Guarantee</h2>
        <p>We stand behind FIRE Ledger. If you're not satisfied within the first 7 days of your subscription, we'll refund you in full — no questions asked.</p>

        <h2>How to Request a Refund</h2>
        <p>Email us at support@fireledger.app within 7 days of your purchase with the subject line "Refund Request". Include the email address used to sign up and we'll process your refund within 2-3 business days.</p>

        <h2>After 7 Days</h2>
        <p>After the 7-day window, refunds are handled on a case-by-case basis. We're a small team and we'll always try to do right by our customers.</p>

        <h2>Cancellations</h2>
        <p>You can cancel your subscription at any time from the Settings page in the app. Cancellation stops future charges but does not automatically trigger a refund for the current billing period.</p>

        <h2>Contact</h2>
        <p>support@fireledger.app</p>
      </div>
    </div>
  );
}
