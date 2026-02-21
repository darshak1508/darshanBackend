const { LoanAudit } = require('../models');
const { sendLoanReminderEmail } = require('../services/emailService');

const REMINDER_DAYS = 3;

/**
 * Get date as YYYY-MM-DD using local date (so "today" and EMI dates match correctly).
 */
function toDateOnly(d) {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const day = date.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Add n months to a date (same day of month when possible).
 */
function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

/**
 * Compute the next EMI date on or after today from first EMI date.
 */
function getNextEmiDate(emiDate, today) {
  let next = new Date(emiDate);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  while (next.getTime() < todayStart) {
    next = addMonths(next, 1);
  }
  return next;
}

/**
 * Run the loan reminder job: find loans whose next EMI is in REMINDER_DAYS days
 * and send every reminder to the single REMINDER_EMAIL from env.
 */
async function runLoanReminderJob() {
  const smtpConfigured = process.env.SMTP_HOST;
  const reminderEmail = process.env.REMINDER_EMAIL?.trim();

  if (!smtpConfigured) {
    console.log('Loan reminder: SMTP not configured, skipping.');
    return { matched: 0, sent: 0, targetDate: null };
  }
  if (!reminderEmail) {
    console.log('Loan reminder: REMINDER_EMAIL not set, skipping.');
    return { matched: 0, sent: 0, targetDate: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + REMINDER_DAYS);
  const targetDateStr = toDateOnly(targetDate);

  const audits = await LoanAudit.find({}).lean();
  let sent = 0;
  let matched = 0;

  for (const audit of audits) {
    const emiDate = audit.Parameters?.emiDate;
    if (!emiDate) continue;

    const nextEmi = getNextEmiDate(emiDate, today);
    const nextEmiStr = toDateOnly(nextEmi);

    if (nextEmiStr !== targetDateStr) continue;

    matched++;

    const result = await sendLoanReminderEmail(reminderEmail, {
      clientName: audit.ClientName,
      loanName: audit.LoanName,
      loanType: audit.LoanType,
      emiDate: nextEmi,
      emiAmount: audit.Parameters.emi,
      deductionBank: audit.DeductionBank || null
    });

    if (result.success) {
      console.log(`Loan reminder sent to ${reminderEmail} for ${audit.LoanName} (${audit.ClientName}).`);
      sent++;
    } else {
      console.error(`Loan reminder failed for audit ${audit.AuditID}:`, result.error);
    }
  }

  if (sent > 0) {
    console.log(`Loan reminder job finished. Sent ${sent} mail(s) to ${reminderEmail}.`);
  }

  return { matched, sent, targetDate: targetDateStr };
}

module.exports = { runLoanReminderJob, getNextEmiDate, toDateOnly };
