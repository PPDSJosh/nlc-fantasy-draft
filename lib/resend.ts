import 'server-only';
import { Resend } from 'resend';

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY not set. Email sending will fail.');
    }
    _resend = new Resend(apiKey ?? 're_placeholder');
  }
  return _resend;
}
