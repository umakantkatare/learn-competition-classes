import {
  Body,
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
        <Body className="m-0 bg-[#F8F5EC] font-sans text-[#1F1F1F]">
          <Container className="mx-auto my-[32px] max-w-[600px] px-4">
            <Section className="overflow-hidden rounded-[12px] border border-solid border-[#E8DFC8] bg-white shadow-sm">
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

              <Section className="px-[24px] py-[32px] sm:px-[40px]">
                <Heading className="m-0 text-[24px] font-bold leading-[32px] text-[#171717]">
                  Verify your email address
                </Heading>

                <Text className="mt-5 text-[15px] leading-[26px] text-[#4B5563]">
                  Hello{userName ? ` ${userName}` : ""}!
                </Text>

                <Text className="mt-3 text-[15px] leading-[26px] text-[#4B5563]">
                  Thank you for joining Learn Competition Classes (LCC). To
                  complete your registration and activate your account, please
                  verify your email address using the verification code below.
                </Text>

                <Section className="my-[28px] rounded-[10px] border border-solid border-[#E8D49A] bg-[#FFF9E8] px-[16px] py-[24px] text-center">
                  <Text className="m-0 text-[13px] font-semibold uppercase tracking-[1px] text-[#786329]">
                    Your verification code
                  </Text>

                  <Text className="my-[16px] text-[36px] font-bold tracking-[8px] text-[#A78015]">
                    {verificationCode}
                  </Text>

                  <Text className="m-0 text-[13px] leading-[22px] text-[#786329]">
                    This code is valid for 5 minutes.
                  </Text>
                </Section>

                <Text className="text-[14px] leading-[24px] text-[#4B5563]">
                  Enter this code on the LCC verification page to complete your
                  email verification.
                </Text>

                <Text className="mt-4 text-[14px] leading-[24px] text-[#4B5563]">
                  If you did not create an LCC account, you can safely ignore
                  this email. Your email address will not be verified through
                  this message alone.
                </Text>

                <Hr className="my-[28px] border-[#E8DFC8]" />

                <Text className="m-0 text-[13px] font-semibold text-[#292929]">
                  Security notice
                </Text>

                <Text className="mt-2 text-[13px] leading-[22px] text-[#6B6658]">
                  Never share your verification code with anyone. LCC will never
                  ask you to disclose your password or verification code over
                  email or phone.
                </Text>
              </Section>
            </Section>

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

VerifyEmailTemplate.PreviewProps = {
  verificationCode: "",
  userName: "Student",
} satisfies VerifyEmailTemplateProps;
