import { Resend } from 'resend';
import { isProd } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = isProd ? process.env.PROD_URL : process.env.DEV_URL;
  const confirmLink = `${url}/auth/new-verification?token=${token}`;

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Confirm your email',
      html: `<p>Click <a href="${confirmLink}">Here</a> to confirm your account<p>`,
    });

    return {
      success: 'Confirmation email sent!',
    };
  } catch (error) {
    return { error: 'Error while trying to verify your account' };
  }
};
