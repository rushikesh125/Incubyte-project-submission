'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsAdmin } from '@/store/slices/userSlice';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const router = useRouter();

  useEffect(() => {
    // Redirect logic
    if (!isAuthenticated) {
      router.push('/login');
    } else if (adminOnly && !isAdmin) {
      router.push('/sweets');
    }
  }, [isAuthenticated, isAdmin, adminOnly, router]);

  // Show loading while checking auth
  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  return <>{children}</>;
}