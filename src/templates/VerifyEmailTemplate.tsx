import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface VerifyEmailTemplateProps {
  verificationCode: string;
  userName?: string;
}

export default function VerifyEmailTemplate({
  verificationCode,
  userName,
}: VerifyEmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />

      <Preview>
        Verify your email address for Learn Competition Classes (LCC).
      </Preview>

      <Tailwind>
        <Body className="m-0 bg-[#f4f6f9] font-sans text-[#1f2937]">
          <Container className="mx-auto my-[32px] max-w-[600px] px-4">
            <Section className="overflow-hidden rounded-[12px] bg-white shadow-sm">
              <Section className="bg-[#123b6d] px-[24px] py-[28px] text-center">
                <Heading className="m-0 text-[28px] font-bold tracking-[1px] text-white">
                  LCC
                </Heading>

                <Text className="m-0 mt-2 text-[13px] font-medium text-[#dbeafe]">
                  LEARN COMPETITION CLASSES
                </Text>

                <Text className="m-0 mt-2 text-[13px] text-[#e0e7ff]">
                  Your Success, Our Mission
                </Text>
              </Section>

              <Section className="px-[24px] py-[32px] sm:px-[40px]">
                <Heading className="m-0 text-[24px] font-bold leading-[32px] text-[#111827]">
                  Verify your email address
                </Heading>

                <Text className="mt-5 text-[15px] leading-[26px] text-[#4b5563]">
                  Hello{userName ? ` ${userName}` : ""}!
                </Text>

                <Text className="mt-3 text-[15px] leading-[26px] text-[#4b5563]">
                  Thank you for joining Learn Competition Classes (LCC). To
                  complete your registration and activate your account, please
                  verify your email address using the verification code below.
                </Text>

                <Section className="my-[28px] rounded-[10px] border border-solid border-[#dbeafe] bg-[#f8fafc] px-[16px] py-[24px] text-center">
                  <Text className="m-0 text-[13px] font-semibold uppercase tracking-[1px] text-[#64748b]">
                    Your verification code
                  </Text>

                  <Text className="my-[16px] text-[36px] font-bold tracking-[8px] text-[#123b6d]">
                    {verificationCode}
                  </Text>

                  <Text className="m-0 text-[13px] leading-[22px] text-[#64748b]">
                    This code is valid for 10 minutes.
                  </Text>
                </Section>

                <Text className="text-[14px] leading-[24px] text-[#4b5563]">
                  Enter this code on the LCC verification page to complete your
                  email verification.
                </Text>

                <Text className="mt-4 text-[14px] leading-[24px] text-[#4b5563]">
                  If you did not create an LCC account, you can safely ignore
                  this email. Your email address will not be verified through
                  this message alone.
                </Text>

                <Hr className="my-[28px] border-[#e5e7eb]" />

                <Text className="m-0 text-[13px] font-semibold text-[#374151]">
                  Security notice
                </Text>

                <Text className="mt-2 text-[13px] leading-[22px] text-[#6b7280]">
                  Never share your verification code with anyone. LCC will never
                  ask you to disclose your password or verification code over
                  email or phone.
                </Text>
              </Section>
            </Section>

            <Section className="px-[16px] py-[24px] text-center">
              <Text className="m-0 text-[13px] font-semibold text-[#123b6d]">
                Learn Competition Classes (LCC)
              </Text>

              <Text className="mt-2 text-[12px] leading-[20px] text-[#6b7280]">
                Your learning journey starts here.
              </Text>

              <Text className="mt-4 text-[12px] leading-[20px] text-[#9ca3af]">
                This is an automated email. Please do not reply to this message.
              </Text>

              <Text className="mt-2 text-[11px] leading-[18px] text-[#9ca3af]">
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

// Default preview props for React Email
VerifyEmailTemplate.PreviewProps = {
  verificationCode: "596853",
  userName: "Umakant",
} satisfies VerifyEmailTemplateProps;
