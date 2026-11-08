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
    <div>
     <UserProfileDetails
                user={{
                  name: userName,
                  email: userEmail,
                  phoneNumber: phoneNumber,
                  image: userImage,
                  role,
                  emailVerified,
                  createdAt,
                }}
              />
    </div>
  );
}
