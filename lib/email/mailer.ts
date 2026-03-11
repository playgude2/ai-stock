import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

interface AlertEmailParams {
  to: string;
  ticker: string;
  company: string;
  oldAction: string;
  newAction: string;
  confidence: number;
  reason: string;
}

export async function sendAlertEmail({
  to,
  ticker,
  company,
  oldAction,
  newAction,
  confidence,
  reason,
}: AlertEmailParams): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:12px;border:1px solid #222222;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:30px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">AI Stock Scanner</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Signal Change Alert</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#ffffff;font-size:28px;font-weight:700;">${ticker}</h2>
              <p style="margin:0 0 24px;color:#a0a0a0;font-size:16px;">${company}</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="48%" style="background-color:#1a1a1a;border-radius:8px;padding:20px;text-align:center;">
                    <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Previous Signal</p>
                    <p style="margin:0;color:#ef4444;font-size:20px;font-weight:700;">${oldAction}</p>
                  </td>
                  <td width="4%" style="text-align:center;color:#a0a0a0;font-size:24px;">&#8594;</td>
                  <td width="48%" style="background-color:#1a1a1a;border-radius:8px;padding:20px;text-align:center;">
                    <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">New Signal</p>
                    <p style="margin:0;color:#22c55e;font-size:20px;font-weight:700;">${newAction}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Confidence</p>
                    <p style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">${confidence}%</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:32px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Reasoning</p>
                    <p style="margin:0;color:#d4d4d4;font-size:14px;line-height:1.6;">${reason}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
                       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;">
                      View Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #222222;">
              <p style="margin:0;color:#666666;font-size:12px;text-align:center;">
                You received this email because you enabled alerts for ${ticker} on AI Stock Scanner.
                <br />To unsubscribe, remove this ticker from your watchlist.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"AI Stock Scanner" <${process.env.MAIL_USERNAME}>`,
    to,
    subject: `Signal Change: ${ticker} — ${oldAction} → ${newAction}`,
    html,
  });
}

interface WelcomeEmailParams {
  to: string;
  name: string;
}

export async function sendWelcomeEmail({ to, name }: WelcomeEmailParams): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:12px;border:1px solid #222222;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:30px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">AI Stock Scanner</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Welcome aboard!</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;">Hey ${name},</h2>
              <p style="color:#d4d4d4;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Welcome to AI Stock Scanner! You now have access to AI-powered market analysis and real-time trading signals.
              </p>
              <p style="color:#d4d4d4;font-size:16px;line-height:1.6;margin:0 0 32px;">
                Get started by running your first market scan from the dashboard. Add stocks to your watchlist and enable alerts to stay on top of signal changes.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
                       style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #222222;">
              <p style="margin:0;color:#666666;font-size:12px;text-align:center;">
                AI Stock Scanner &mdash; AI-Powered Market Intelligence
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"AI Stock Scanner" <${process.env.MAIL_USERNAME}>`,
    to,
    subject: 'Welcome to AI Stock Scanner',
    html,
  });
}
