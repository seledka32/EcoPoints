import nodemailer from 'nodemailer'

function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT ?? '465')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials not configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `EcoPoints <${from}>`,
    to,
    subject: 'Подтверждение email — EcoPoints',
    text: `Ваш код подтверждения: ${code}\n\nКод действителен 15 минут.`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111;border:1px solid #222;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #1f1f1f;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#34d399,#22d3ee);border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="color:#000;font-size:20px;line-height:40px;">🌿</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">EcoPoints</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Подтверждение почты</p>
              <h1 style="margin:0 0 16px;color:#fff;font-size:22px;font-weight:700;line-height:1.3;">
                Введите код из письма
              </h1>
              <p style="margin:0 0 28px;color:#9ca3af;font-size:15px;line-height:1.6;">
                Чтобы завершить регистрацию в EcoPoints, введите этот код на странице подтверждения:
              </p>
              <!-- Code block -->
              <div style="background:#0a0a0a;border:2px solid #34d399;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <span style="color:#34d399;font-size:40px;font-weight:700;letter-spacing:12px;font-family:monospace;">${code}</span>
              </div>
              <p style="margin:0;color:#6b7280;font-size:13px;text-align:center;">
                Код действителен <strong style="color:#9ca3af;">15 минут</strong>.<br/>
                Если вы не регистрировались — просто проигнорируйте это письмо.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1f1f1f;text-align:center;">
              <p style="margin:0;color:#4b5563;font-size:12px;">© 2026 EcoPoints. Все права защищены.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}
