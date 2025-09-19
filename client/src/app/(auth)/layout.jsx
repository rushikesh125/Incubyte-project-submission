"use client"
import { selectIsAuthenticated } from '@/store/userSlice';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';

const AuthLayout = ({children}) => {
        const isAuthenticated = useSelector(selectIsAuthenticated);
        const router = useRouter();
    // Redirect if already logged in
      useEffect(() => {
        if (isAuthenticated) {
          router.push('/');
          return;
        }
      }, [isAuthenticated, router]);

  return (
    <div>{children}</div>
  )
}

export default AuthLayout