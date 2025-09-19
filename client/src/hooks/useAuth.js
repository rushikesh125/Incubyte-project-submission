'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateToken } from '@/lib/api/auth';
import { setUser, logout, setLoading } from '@/store/userSlice';
import { selectToken } from '@/store/userSlice';
import toast from 'react-hot-toast';

export const useAuthValidation = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        dispatch(setLoading(true));
        const response = await validateToken();
        
        // Token is valid - update user data (might be stale from localStorage)
        dispatch(setUser({ 
          user: response.user, 
          token // Keep existing token
        }));
        
        setIsValid(true);
        // toast.success('Welcome back!', { duration: 2000 });
      } catch (error) {
        console.log('Token validation failed:', error.message);
        
        // Token invalid - clear everything
        localStorage.removeItem('authToken');
        dispatch(logout());
        toast.error('Session expired. Please log in again.');
        setIsValid(false);
      } finally {
        setIsValidating(false);
        dispatch(setLoading(false));
      }
    };

    validateAuth();
  }, [token, dispatch]);

  return { isValidating, isValid };
};