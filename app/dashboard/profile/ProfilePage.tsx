import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <UserProfile routing="hash" />
    </div>
  );
}
