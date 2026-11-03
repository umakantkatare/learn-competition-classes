import { resend } from "@/lib/resend";
import { render } from "@react-email/components";
import ManagerCredentialsTemplate from "@/templates/ManagerCredentialsTemplate";

interface SendTemporaryPasswordEmailParams {
  to: string;
  userName: string;
  temporaryPassword: string;
  loginUrl: string;
}

export async function sendTemporaryPasswordEmail({
  to,
  userName,
  temporaryPassword,
  loginUrl,
}: SendTemporaryPasswordEmailParams) {
  const html = await render(
    ManagerCredentialsTemplate({
      userName,
      email: to,
      temporaryPassword,
      loginUrl,
    }),
  );

  const { data, error } = await resend.emails.send({
    from: `LCC Institute <${process.env.RESEND_FROM_EMAIL}>`,
    to,
    subject: "Your Manager Account Credentials | LCC Institute",
    html,
  });

  if (error) {
    console.error("Resend error while sending manager credentials:", error);
    throw new Error("Failed to send manager credentials email");
  }

  return data;
}
