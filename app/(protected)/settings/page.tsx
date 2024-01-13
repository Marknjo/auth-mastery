import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';

async function SettingsPage() {
  const session = await auth();

  return (
    <div className='flex flex-col h-full items-center justify-center space-y-2'>
      <h2 className='font-medium uppercase text-slate-500'>User details</h2>
      <pre className='bg-slate-400 text-slate-200 border-slate-300 border-2 py-2 px-4 rounded-md text-md min-w-60 max-w-96 text-wrap break-words hyphens-auto'>
        {JSON.stringify(session)}
      </pre>
      <form
        action={async () => {
          'use server';
          await signOut();
        }}>
        <Button type='submit'>Sign Out</Button>
      </form>
    </div>
  );
}
export default SettingsPage;
