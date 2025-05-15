import { FC } from 'react';

declare module '@/components/auth/ensure-user' {
  interface EnsureUserProps {
    onUserEnsured?: (userId: string) => void;
    onError?: (error: string) => void;
  }

  const EnsureUser: FC<EnsureUserProps>;
  export default EnsureUser;
}
