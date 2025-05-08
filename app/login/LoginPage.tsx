import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Added redirectUrl to redirect to the dashboard after successful signup */}
      <SignUp routing="hash" redirectUrl="/dashboard" />
    </div>
  );
}
