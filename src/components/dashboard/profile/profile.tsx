import { UserProfileDetails } from "./user-profile-details";

interface ProfileProps {
  userName: string;
  userEmail: string;
  phoneNumber: string | null;
  userImage: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: Date | string;
}

export default function Profile({
  userName,
  userEmail,
  phoneNumber,
  userImage,
  role,
  emailVerified,
  createdAt,
}: ProfileProps) {
  return (
    <UserProfileDetails
      user={{
        name: userName,
        email: userEmail,
        phoneNumber,
        image: userImage,
        role,
        emailVerified,
        createdAt,
      }}
    />
  );
}
