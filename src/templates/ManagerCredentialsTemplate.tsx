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
  Button,
} from "@react-email/components";

interface ManagerCredentialsTemplateProps {
  userName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}

export default function ManagerCredentialsTemplate({
  userName,
  email,
  temporaryPassword,
  loginUrl,
}: ManagerCredentialsTemplateProps) {
  return (
    <Html lang="en">
      <Head />

      <Preview>
        Your Manager account is ready. Sign in to Learn Competition Classes
        (LCC).
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

              {/* Main content */}
              <Section className="px-[24px] py-[32px] sm:px-[40px]">
                <Heading className="m-0 text-[24px] font-bold leading-[32px] text-[#171717]">
                  Welcome to LCC!
                </Heading>

                <Text className="mt-5 text-[15px] leading-[26px] text-[#4B5563]">
                  Hello {userName}!
                </Text>

                <Text className="mt-3 text-[15px] leading-[26px] text-[#4B5563]">
                  Your Manager account at Learn Competition Classes (LCC) has
                  been created successfully. Use the credentials below to sign
                  in to your account.
                </Text>

                {/* Account credentials */}
                <Section className="my-[28px] rounded-[10px] border border-solid border-[#E8D49A] bg-[#FFF9E8] px-[16px] py-[24px]">
                  <Text className="m-0 text-[13px] font-semibold uppercase tracking-[1px] text-[#786329]">
                    Your login credentials
                  </Text>

                  <Hr className="my-[16px] border-[#E8D49A]" />

                  <Text className="m-0 text-[13px] font-medium text-[#786329]">
                    Email address
                  </Text>

                  <Text className="mt-1 break-all text-[15px] font-semibold text-[#292929]">
                    {email}
                  </Text>

                  <Text className="mt-5 text-[13px] font-medium text-[#786329]">
                    Temporary password
                  </Text>

                  <Text className="mt-2 break-all rounded-[6px] border border-solid border-[#E8D49A] bg-white px-3 py-3 text-[16px] font-bold tracking-[1px] text-[#A78015]">
                    {temporaryPassword}
                  </Text>

                  <Text className="mt-3 text-[12px] leading-[20px] text-[#786329]">
                    This is a temporary password. Keep it secure and do not
                    share it with anyone.
                  </Text>
                </Section>

                {/* Login button */}
                <Section className="my-[28px] text-center">
                  <Button
                    href={loginUrl}
                    className="rounded-[8px] bg-[#171717] px-[28px] py-[14px] text-[14px] font-semibold text-[#D4AF37] no-underline"
                  >
                    Login to Your Account
                  </Button>
                </Section>

                <Text className="text-[14px] leading-[24px] text-[#4B5563]">
                  After signing in, change your temporary password as soon as
                  possible to help secure your account.
                </Text>

                <Hr className="my-[28px] border-[#E8DFC8]" />

                {/* Security notice */}
                <Text className="m-0 text-[13px] font-semibold text-[#292929]">
                  Security notice
                </Text>

                <Text className="mt-2 text-[13px] leading-[22px] text-[#6B6658]">
                  Never share your password with anyone. LCC will never ask you
                  to disclose your password over email or phone.
                </Text>

                <Text className="mt-4 text-[13px] leading-[22px] text-[#6B6658]">
                  If you were not expecting this account, please contact your
                  LCC administrator.
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

ManagerCredentialsTemplate.PreviewProps = {
  userName: "Umakant",
  email: "manager@example.com",
  temporaryPassword: "Example-Temp-Password-123",
  loginUrl: "http://localhost:3000/login",
} satisfies ManagerCredentialsTemplateProps;
