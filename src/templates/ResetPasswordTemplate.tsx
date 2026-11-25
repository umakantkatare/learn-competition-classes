import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface ResetPasswordTemplateProps {
  resetUrl: string;
  userName?: string;
}

export default function ResetPasswordTemplate({
  resetUrl,
  userName,
}: ResetPasswordTemplateProps) {
  return (
    <Html lang="en">
      <Head />

      <Preview>
        Reset your password for Learn Competition Classes.
      </Preview>

      <Tailwind>
        <Body className="m-0 bg-[#F8F5EC] font-sans text-[#1F1F1F]">
          <Container className="mx-auto my-[32px] max-w-[600px] px-4">
            <Section className="overflow-hidden rounded-[12px] border border-solid border-[#E8DFC8] bg-white shadow-sm">
              {/* Header */}
              <Section className="bg-[#171717] px-[24px] py-[28px] text-center">
                <Heading className="m-0 text-[28px] font-bold tracking-[1px] text-[#D4AF37]">
                  LCC
                </Heading>

                <Text className="m-0 mt-2 text-[13px] font-medium tracking-[1px] text-[#F5E7B2]">
                  LEARN COMPETITION CLASSES
                </Text>

                <Text className="m-0 mt-2 text-[13px] text-[#E8DFC8]">
                  Your Success, Our Mission
                </Text>

                <Section className="mx-auto mt-5 h-[2px] w-[60px] bg-[#D4AF37]" />
              </Section>

              {/* Main Content */}
              <Section className="px-[24px] py-[32px] sm:px-[40px]">
                <Heading className="m-0 text-[24px] font-bold leading-[32px] text-[#171717]">
                  Reset your password
                </Heading>

                <Text className="mt-5 text-[15px] leading-[26px] text-[#4B5563]">
                  Hello{userName ? ` ${userName}` : ""}!
                </Text>

                <Text className="mt-3 text-[15px] leading-[26px] text-[#4B5563]">
                  We received a request to reset the password associated with
                  your Learn Competition Classes account. Click the button
                  below to create a new password.
                </Text>

                {/* Reset Password Card */}
                <Section className="my-[28px] rounded-[10px] border border-solid border-[#E8D49A] bg-[#FFF9E8] px-[16px] py-[24px] text-center">

                  <Section className="my-[20px]">
                    <Button
                      href={resetUrl}
                      className="rounded-[8px] bg-[#D4AF37] px-[28px] py-[14px] text-[14px] font-bold text-[#171717] no-underline"
                    >
                      Reset Password
                    </Button>
                  </Section>

                  <Text className="m-0 text-[13px] leading-[22px] text-[#786329]">
                    This password reset link is valid for 10 minutes.
                  </Text>
                </Section>

                <Text className="text-[14px] leading-[24px] text-[#4B5563]">
                  Click the button above to securely set a new password for your
                  account.
                </Text>

                <Text className="mt-4 text-[14px] leading-[24px] text-[#4B5563]">
                  If you did not request a password reset, you can safely ignore
                  this email. Your existing password will remain unchanged.
                </Text>

                <Hr className="my-[28px] border-[#E8DFC8]" />

                {/* Security Notice */}
                <Text className="m-0 text-[13px] font-semibold text-[#292929]">
                  Security notice
                </Text>

                <Text className="mt-2 text-[13px] leading-[22px] text-[#6B6658]">
                  Never share your password reset link with anyone. LCC will
                  never ask you to disclose your password over email or phone.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="px-[16px] py-[24px] text-center">
              <Text className="m-0 text-[13px] font-semibold text-[#A78015]">
                Learn Competition Classes (LCC)
              </Text>

              <Text className="mt-2 text-[12px] leading-[20px] text-[#6B6658]">
                Your learning journey starts here.
              </Text>

              <Text className="mt-4 text-[12px] leading-[20px] text-[#9CA3AF]">
                This is an automated email. Please do not reply to this message.
              </Text>

              <Text className="mt-2 text-[11px] leading-[18px] text-[#9CA3AF]">
                © {new Date().getFullYear()} Learn Competition Classes. All
                rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

ResetPasswordTemplate.PreviewProps = {
  resetUrl: "https://example.com/reset-password?token=preview",
  userName: "Student",
} satisfies ResetPasswordTemplateProps;
