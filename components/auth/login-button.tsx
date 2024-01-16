'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import LoginForm from './login-form';

type LoginButtonProps = {
  children: React.ReactNode;
  mode?: 'modal' | 'redirect';
  asChild?: boolean;
};

function LoginButton({
  children,
  asChild,
  mode = 'redirect',
}: LoginButtonProps) {
  const router = useRouter();

  const handleOnClick = () => {
    router.push('/auth/login');
  };

  if (mode === 'modal') {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent className='p-0 w-auto bg-transparent border-none'>
          <LoginForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <span className='cursor-pointer' onClick={handleOnClick}>
      {children}
    </span>
  );
}
export default LoginButton;
