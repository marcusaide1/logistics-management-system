import nodemailer from "nodemailer";

const smtpHost = process.env.EMAIL_SMTP_HOST;
const smtpPort = Number(process.env.EMAIL_SMTP_PORT || 587);
const smtpSecure = process.env.EMAIL_SMTP_SECURE === "true";
const smtpUser = process.env.EMAIL_SMTP_USER;
const smtpPass = process.env.EMAIL_SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || "Logistics App <no-reply@logistics-app.local>";
const resetUrlBase = (process.env.RESET_PASSWORD_URL_BASE || process.env.CORS_ORIGIN || "http://localhost:5173").replace(/\/$/, "");

let transporter = null;
if (smtpHost) {
  const transportOptions = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
  };

  transporter = nodemailer.createTransport(transportOptions);
}

export function emailTransportConfigured() {
  return Boolean(transporter);
}

export async function sendPasswordResetEmail(to, token) {
  if (!transporter) return false;

  const resetLink = `${resetUrlBase}/forgot-password`;
  const text = `We received a request to reset your Logistics App password.

Your password reset token is:
${token}

Open the reset page and enter this token:
${resetLink}

This token expires in 1 hour.

If you did not request a password reset, you can ignore this email.
`;
  const html = `
    <p>We received a request to reset your Logistics App password.</p>
    <p><strong>Your password reset token is:</strong><br/><code>${token}</code></p>
    <p>Open the reset page and enter this token:<br/><a href="${resetLink}">${resetLink}</a></p>
    <p>This token expires in 1 hour.</p>
    <p>If you did not request a password reset, you can ignore this email.</p>
  `;

  await transporter.sendMail({
    from: emailFrom,
    to,
    subject: "Logistics App password reset instructions",
    text,
    html
  });

  return true;
}
