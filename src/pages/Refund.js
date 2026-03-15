import './Legal.css';

export default function Refund() {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <div className="legal-logo">FIRE<span>Ledger</span></div>
        <h1>Refund Policy</h1>
        <p className="legal-date">Last updated: March 2026</p>

        <h2>Digital Product — All Sales Final</h2>
        <p>
          FIRE Ledger is a digital software platform. Due to the nature of digital products
          and the immediate access to premium features granted upon purchase, all sales are
          considered final once the product has been accessed.
        </p>

        <h2>48-Hour Guarantee</h2>
        <p>
          A refund may be considered within <strong>48 hours of purchase</strong>, provided that:
        </p>
        <ul>
          <li>You have not accessed the dashboard or logged any transactions</li>
          <li>You have not imported any data or used any export features</li>
          <li>You contact us at <a href="mailto:support@fireledger.app">support@fireledger.app</a> within the 48-hour window with your purchase email</li>
        </ul>

        <h2>No Refund After Use</h2>
        <p>
          Refunds will not be granted under any circumstances once:
        </p>
        <ul>
          <li>You have logged into the dashboard</li>
          <li>You have recorded one or more transactions</li>
          <li>You have imported data from an external source</li>
          <li>You have used the export feature</li>
          <li>48 hours have elapsed since purchase</li>
        </ul>

        <h2>Chargebacks</h2>
        <p>
          By completing your purchase you agree to contact us at
          <a href="mailto:support@fireledger.app"> support@fireledger.app</a> before
          initiating any chargeback or dispute with your bank or card issuer.
          Initiating a chargeback without first contacting us may result in your account
          being permanently suspended. We retain all login activity, transaction records,
          and usage timestamps as evidence in dispute proceedings.
        </p>

        <h2>Subscriptions</h2>
        <p>
          Monthly and annual subscriptions can be cancelled at any time from your account
          settings. Cancellation stops future charges — it does not entitle you to a refund
          of the current billing period.
        </p>

        <h2>Contact</h2>
        <p>
          For refund requests or billing questions contact us at{' '}
          <a href="mailto:support@fireledger.app">support@fireledger.app</a>.
          We respond within 24 hours.
        </p>
      </div>
    </div>
  );
}
