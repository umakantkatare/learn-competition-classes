import { resend } from "@/lib/resend";
import ResetPasswordTemplate from "@/templates/ResetPasswordTemplate";
import { render } from "@react-email/components";

interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName?: string;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: SendPasswordResetEmailParams) {
  const html = await render(
    ResetPasswordTemplate({
      resetUrl,
      userName,
    }),
  );

  const { data, error } = await resend.emails.send({
    from: `LCC Institute <${process.env.RESEND_FROM_EMAIL}>`,
    to,
    subject: "Reset your password | LCC Institute",
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send password reset email");
  }

  return data;
}
