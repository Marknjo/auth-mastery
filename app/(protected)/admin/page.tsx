'use client';

import { UserRole } from '@prisma/client';
import { toast } from 'sonner';

import { admin } from '@/actions/admin';
import { RoleGate } from '@/components/auth/role-gate';
import FormSuccess from '@/components/form-success';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function AdminPage() {
  const handleServerActionClick = async () => {
    const response = await admin();

    if (response?.error) {
      toast.warning(response.error);
    }

    if (response?.success) {
      toast.success(response.success);
    }
  };

  const handleApiRouteClick = async () => {
    const res = await fetch('/api/admin');

    const data: { message: string } = await res.json();

    if (res.status === 403) {
      toast.warning(data.message);
    }

    toast.success(data.message);
  };

  return (
    <Card className='w-[600px]'>
      <CardHeader>
        <p className='text-2xl font-semibold text-center'>🔑 Admin</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSuccess message='You are allowed to see this content!' />
        </RoleGate>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-md'>
          <p className='text-sm font-medium'>Admin-only API Route</p>
          <Button onClick={handleApiRouteClick}>Click to test</Button>
        </div>
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-md'>
          <p className='text-sm font-medium'>Admin-only Server Action</p>
          <Button onClick={handleServerActionClick}>Click to test</Button>
        </div>
      </CardContent>
    </Card>
  );
}
export default AdminPage;
