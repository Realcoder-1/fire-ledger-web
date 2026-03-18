import { useState } from "react";
import "./AppDashboard.css";
import { formatCurrency } from "../lib/format";

export default function AppDashboard() {
  // 🔥 Replace with real data later
  const [data] = useState({
    age: 25,
    retirementAge: 67,
    yearsRemaining: 42,
    hoursRemaining: 87400,
    savingsRate: 11,
    fireProgress: 14,
    yearsLost: 8.2,
    netWorth: 20110,
    fireNumber: 500000,
  });

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="dash-header">
        <div>
          <h1>Your FIRE Dashboard</h1>
          <p>Real-time projection based on your inputs</p>
        </div>
      </div>

      {/* 🔥 MAIN GRID */}
      <div className="dash-grid">

        {/* BIG CARD */}
        <div className="card card-hero">
          <div className="card-label">Estimated Retirement</div>

          <div className="card-main">
            Age {data.retirementAge}
          </div>

          {/* ✅ FIXED YEARS + HOURS */}
          <div className="card-sub">
            {data.yearsRemaining} years ({data.hoursRemaining.toLocaleString()} hrs)
          </div>
        </div>

        {/* NET WORTH */}
        <div className="card">
          <div className="card-label">Net Worth</div>
          <div className="card-value">
            {formatCurrency(data.netWorth)}
          </div>
        </div>

        {/* FIRE NUMBER */}
        <div className="card">
          <div className="card-label">FIRE Target</div>
          <div className="card-value">
            {formatCurrency(data.fireNumber)}
          </div>
        </div>

        {/* SAVINGS RATE */}
        <div className="card">
          <div className="card-label">Savings Rate</div>
          <div className="card-value warning">
            {data.savingsRate}%
          </div>
        </div>

        {/* FIRE PROGRESS */}
        <div className="card">
          <div className="card-label">FIRE Progress</div>
          <div className="card-value good">
            {data.fireProgress}%
          </div>
        </div>

        {/* YEARS LOST */}
        <div className="card">
          <div className="card-label">Years Lost to Spending</div>
          <div className="card-value danger">
            {data.yearsLost} yrs
          </div>
        </div>

      </div>
    </div>
  );
}