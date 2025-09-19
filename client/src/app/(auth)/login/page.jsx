'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api/auth';
import { selectLoading, selectError } from '@/store/userSlice';
import { setError, setLoading, setUser } from '@/store/userSlice';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const router = useRouter();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
      const response = await loginUser(credentials);
      dispatch(setUser({ user: response.user, token: response.token }));
      toast.success('Login successful!');

      // Redirect based on role
      if (response.user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.back();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 bg-clip-text text-transparent mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600">Sign in to continue your journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                    bg-white text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Email address"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg 
                    bg-white text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              disabled={loading}
              type="submit"
              className="w-full cursor-pointer py-2 px-4 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 
                text-white rounded-lg hover:opacity-90 transform hover:scale-[1.02] transition-all"
            >
                {loading?<Loader className='animate-spin'/>:""}
                {loading?"Signing in...":" Sign In"}
             
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

        

            {/* Sign Up Link */}
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-theme-color">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}