const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Create or return existing SMTP transporter from env vars.
 * Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS (optional for no-auth).
 */
function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    console.warn('Email service: SMTP_HOST not set. Emails will not be sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined
  });

  return transporter;
}

/**
 * Send an email.
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} html - HTML body
 * @param {string} [text] - Plain text fallback
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendMail(to, subject, html, text) {
  const trans = getTransporter();
  if (!trans) {
    return { success: false, error: 'SMTP not configured' };
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@localhost';

  try {
    const info = await trans.sendMail({
      from,
      to,
      subject,
      html: html || text,
      text: text || (html ? html.replace(/<[^>]+>/g, '').trim() : undefined)
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send loan EMI reminder email (3 days before due date).
 */
async function sendLoanReminderEmail(to, { clientName, loanName, loanType, emiDate, emiAmount, deductionBank }) {
  const dueDateStr = new Date(emiDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `Reminder: EMI due in 3 days – ${loanName} (${clientName})`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;line-height:1.6;color:#333;max-width:560px;margin:0 auto;padding:20px}.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0}.highlight{background:#dbeafe;color:#1e40af;padding:2px 6px;border-radius:4px}.footer{font-size:12px;color:#64748b;margin-top:24px}</style></head>
<body>
  <h2>EMI reminder – adjust your bank</h2>
  <p>This is a reminder that an installment is due in <strong>3 days</strong>. Please ensure sufficient balance in your bank account.</p>
  <div class="box">
    <p><strong>Client:</strong> ${clientName}</p>
    <p><strong>Loan:</strong> ${loanName} (${loanType})</p>
    <p><strong>Due date:</strong> <span class="highlight">${dueDateStr}</span></p>
    <p><strong>EMI amount:</strong> ₹${Number(emiAmount).toLocaleString('en-IN')}</p>
    ${deductionBank ? `<p><strong>Deduction bank:</strong> ${deductionBank}</p>` : ''}
  </div>
  <p class="footer">This is an automated reminder from Darshan Loan Audit. You received this because your next EMI date is 3 days away.</p>
</body>
</html>`;

  const text = `EMI Reminder: ${loanName} (${clientName}). Due date: ${dueDateStr}. EMI: ₹${Number(emiAmount).toLocaleString('en-IN')}.${deductionBank ? ` Deduction bank: ${deductionBank}.` : ''} Please ensure sufficient balance.`;

  return sendMail(to, subject, html, text);
}

/**
 * Send login OTP for 2-step verification.
 */
async function sendOtpEmail(to, otp, username) {
  const subject = 'Your Darshan login OTP';
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;line-height:1.6;color:#333;max-width:400px;margin:0 auto;padding:20px}.box{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:16px 0;text-align:center}.otp{font-size:28px;font-weight:bold;letter-spacing:6px;color:#1e40af}.footer{font-size:12px;color:#64748b;margin-top:24px}</style></head>
<body>
  <h2>Login verification</h2>
  <p>${username ? `Hi ${username},` : 'Hi,'} use this one-time password to complete your login:</p>
  <div class="box"><span class="otp">${otp}</span></div>
  <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
  <p class="footer">If you did not request this, please ignore this email. Darshan – 2-step verification.</p>
</body>
</html>`;
  const text = `Your login OTP is: ${otp}. Valid for 5 minutes. Do not share. Darshan.`;
  return sendMail(to, subject, html, text);
}

module.exports = {
  getTransporter,
  sendMail,
  sendLoanReminderEmail,
  sendOtpEmail
};
