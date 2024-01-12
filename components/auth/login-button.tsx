'use client';

import { useRouter } from 'next/navigation';

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
    return <span>TODO: Implement modal</span>;
  }

  return (
    <span className='cursor-pointer' onClick={handleOnClick}>
      {children}
    </span>
  );
}
export default LoginButton;
