import { resend } from "@/lib/resend";
import { render } from "@react-email/components";
import VerifyEmailTemplate from "@/templates/VerifyEmailTemplate";

interface SendVerificationEmailParams {
  to: string;
  verificationCode: string;
  userName?: string;
}

export async function sendVerificationEmail({
  to,
  verificationCode,
  userName,
}: SendVerificationEmailParams) {
  const html = await render(
    VerifyEmailTemplate({
      verificationCode,
      userName,
    }),
  );

  const { data, error } = await resend.emails.send({
    from: `LCC Institute <${process.env.RESEND_FROM_EMAIL}>`,
    to,
    subject: "Verify your email | LCC Institute",
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send verification email");
  }

  return data;
}
