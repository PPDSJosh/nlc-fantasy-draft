import { NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';

const CREDENTIALS = [
  {
    name: 'Josh',
    email: 'josh@ppds.studio',
    password: 'DraftKing25!',
  },
  {
    name: 'Jazzy',
    email: 'iamjazzybull@gmail.com',
    password: 'DraftQueen25!',
  },
];

function buildEmailHtml(name: string, email: string, password: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#FAF7F2; font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px; margin:0 auto; padding:20px;">
    <!-- Header -->
    <div style="background-color:#0A0A0A; border-radius:12px 12px 0 0; padding:32px 24px; text-align:center;">
      <p style="margin:0; font-size:10px; font-weight:700; letter-spacing:0.3em; text-transform:uppercase; color:#C9A84C;">
        Season 5
      </p>
      <h1 style="margin:8px 0 0; font-family:Georgia,'Times New Roman',serif; font-size:28px; font-weight:700; color:#FFFFFF;">
        Next Level Chef
      </h1>
      <p style="margin:6px 0 0; font-size:14px; color:rgba(255,255,255,0.4);">
        Fantasy Draft
      </p>
    </div>

    <!-- Gold accent -->
    <div style="height:3px; background-color:#C9A84C;"></div>

    <!-- Body -->
    <div style="background-color:#FFFFFF; padding:32px 24px; border-radius:0 0 12px 12px;">
      <p style="margin:0 0 16px; font-size:16px; color:#1C1C1C;">
        Hey ${name},
      </p>
      <p style="margin:0 0 24px; font-size:16px; color:#1C1C1C; line-height:1.6;">
        Draft night is here. Here are your login credentials for the NLC Fantasy Draft app.
      </p>

      <!-- Credentials card -->
      <div style="background-color:#FAF7F2; border:1px solid #D8D2C8; border-radius:8px; padding:20px; margin-bottom:24px;">
        <p style="margin:0 0 12px; font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#7A7468;">
          Your Login
        </p>
        <p style="margin:0 0 8px; font-size:16px; color:#1C1C1C;">
          <strong>Email:</strong> ${email}
        </p>
        <p style="margin:0; font-size:16px; color:#1C1C1C;">
          <strong>Password:</strong> <code style="background:#F0EBE3; padding:2px 8px; border-radius:4px; font-family:monospace; font-size:15px;">${password}</code>
        </p>
      </div>

      <p style="margin:0; font-size:14px; color:#7A7468; line-height:1.5;">
        Log in, lock your predictions before each episode, and may the best drafter win.
      </p>
    </div>

    <!-- Footer -->
    <p style="margin:24px 0 0; text-align:center; font-size:12px; color:#B8B0A6;">
      NLC Fantasy Draft S5
    </p>
  </div>
</body>
</html>`;
}

export async function POST() {
  const resend = getResend();
  const results: { name: string; success: boolean; error?: string }[] = [];

  for (const cred of CREDENTIALS) {
    try {
      const html = buildEmailHtml(cred.name, cred.email, cred.password);

      await resend.emails.send({
        from: 'NLC Draft <partners@ops.ppds.studio>',
        to: cred.email,
        subject: 'Your NLC Fantasy Draft Login',
        html,
      });

      results.push({ name: cred.name, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      results.push({ name: cred.name, success: false, error: message });
    }
  }

  return NextResponse.json({ results });
}
