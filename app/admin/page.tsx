import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { getAdminSession } from '@/lib/auth';

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <AdminLoginForm />
    </div>
  );
}
