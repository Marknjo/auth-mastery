'use client';

import { logout } from '@/actions/logout';
import { signOut } from '@/auth';

type LogoutButtonProps = {
  children: React.ReactNode;
};

function LogoutButton({ children }: LogoutButtonProps) {
  function handleLogout() {
    logout();
  }

  return (
    <span
      onClick={handleLogout}
      className='cursor-pointer flex flex-nowrap w-full'>
      {children}
    </span>
  );
}
export default LogoutButton;
