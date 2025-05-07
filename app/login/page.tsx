// app/login/page.tsx
import { Suspense } from 'react';
import LoginPage from './LoginPage';
import { Loader2 } from 'lucide-react';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
