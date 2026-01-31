'use client';

import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthForm
      type="login"
      onSuccess={() => router.push('/')}
    />
  );
}
