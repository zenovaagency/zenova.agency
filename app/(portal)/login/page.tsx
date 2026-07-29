import { Suspense } from 'react';
import { Login } from '@/views/Login';

export const metadata = { title: 'Sign in | Zenova', robots: { index: false, follow: false } };

export default function Page() {
  // Login reads ?redirect= through useSearchParams, which Next requires to sit
  // under a Suspense boundary so the rest of the document can still render
  // statically.
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
