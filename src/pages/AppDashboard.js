/* ============================================
   FIRE LEDGER — PREMIUM DASHBOARD JS
   ============================================ */

// ── Progress bar animation on load ──
document.addEventListener('DOMContentLoaded', () => {
  const pfill = document.getElementById('pfill');
  if (pfill) {
    // Set from your real FIRE progress value (0–100)
    const progress = getFireProgress();
    setTimeout(() => { pfill.style.width = progress + '%'; }, 100);
  }

  updateRing();
  updateInsightStrip();
  updateStageBar();
});

// ── Calculate FIRE progress % ──
function getFireProgress() {
  // Replace with your real values from state/props
  const currentSavings = 50000;
  const fireNumber = 2500000;
  return Math.min((currentSavings / fireNumber) * 100, 100).toFixed(1);
}

// ── Update SVG ring ──
function updateRing() {
  const progress = parseFloat(getFireProgress());
  const circumference = 251; // 2 * PI * r (r=40)
  const offset = circumference - (circumference * progress / 100);

  const circle = document.querySelector('.hero-ring circle:last-of-type');
  if (circle) circle.setAttribute('stroke-dashoffset', offset);

  const ringNum = document.querySelector('.ring-num');
  if (ringNum) ringNum.textContent = progress.toFixed(1) + '%';
}

// ── Dynamic insight strip ──
function updateInsightStrip() {
  const strip = document.querySelector('.insight-strip span:last-child');
  if (!strip) return;

  // Replace with your real calcFIRE values
  const annualExpenses = 40000;
  const annualSavings  = 20000;
  const currentSavings = 50000;
  const extraPerMonth  = 500;

  const baseYears = calcFIREYears(annualExpenses, annualSavings, currentSavings);
  const boostYears = calcFIREYears(annualExpenses, annualSavings + extraPerMonth * 12, currentSavings);
  const saved = Math.max(0, baseYears - boostYears);

  const now = new Date();
  const baseDate  = new Date(now.getFullYear() + baseYears,  now.getMonth());
  const boostDate = new Date(now.getFullYear() + boostYears, now.getMonth());
  const fmt = d => d.toLocaleString('default', { month: 'long', year: 'numeric' });

  strip.innerHTML = `Save an extra <strong style="color:var(--text)">$${extraPerMonth}/mo</strong> and reach FIRE <strong style="color:var(--gold)">${saved} year${saved!==1?'s':''} earlier</strong> — freedom ${fmt(boostDate)} instead of ${fmt(baseDate)}.`;
}

// ── FIRE years calculation ──
function calcFIREYears(annualExp, annualSav, currentSav) {
  const fireNum = annualExp * 25;
  if (annualSav <= 0) return Infinity;
  const r = 0.07;
  let years = 0, bal = currentSav;
  while (bal < fireNum && years < 100) {
    bal = bal * (1 + r) + annualSav;
    years++;
  }
  return years;
}

// ── Stage bar — highlight current stage ──
function updateStageBar() {
  const progress = parseFloat(getFireProgress());
  const stages = document.querySelectorAll('.stage');

  // Stage thresholds as % of FIRE number
  const thresholds = [0, 5, 25, 50, 100]; // foundation, accumulation, coast, lean, full

  stages.forEach((stage, i) => {
    stage.classList.remove('done', 'active');
    if (progress >= thresholds[i + 1]) {
      stage.classList.add('done');
    } else if (progress >= thresholds[i]) {
      stage.classList.add('active');
    }
  });
}

// ── Modal: open / close ──

 

document.addEventListener('DOMContentLoaded', () => {
  const modalBg = document.getElementById('modal');
  if (modalBg) {
    modalBg.addEventListener('click', (e) => {
      if (e.target === modalBg) closeModal();
    });
  }
});

// ── Modal: transaction type toggle ──

// ── Month navigation ──
let selMonth = new Date().getMonth();
let selYear  = new Date().getFullYear();
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];


  // Hook: re-filter your transactions here
  // filterTransactionsByMonth(selMonth, selYear);
}
