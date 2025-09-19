'use client';
import { useState, useEffect } from 'react';  // Add useEffect for redirect
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { registerUser } from '../../../lib/api/auth'; // Adjust path
import { selectLoading, selectError, selectIsAuthenticated } from '../../../store/userSlice';
import { setError, setLoading, setUser } from '../../../store/userSlice';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, Loader } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button'; // Adjust path

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ 
    fullName: '', 
    email: '', 
    password: '' 
  });
  const dispatch = useDispatch();
  const router = useRouter();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated); // Add this

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/sweets');
      return;
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
      const response = await registerUser(credentials);
      dispatch(setUser({ user: response.user, token: response.token }));
      toast.success('Registration successful!');
      
      // Auto-redirect after delay to show success message
      setTimeout(() => {
        if (response.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/sweets');
        }
      }, 1500);
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Show loading if checking auth
  if (loading && !error && !credentials.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Join us today to start your journey</p>
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
              {/* Full Name Input */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={credentials.fullName}
                  onChange={(e) => setCredentials({ ...credentials, fullName: e.target.value })}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                    bg-white text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                  placeholder="Full Name"
                  required
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                    bg-white text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                  placeholder="Email address"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg 
                    bg-white text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <Button
              disabled={loading}
              type="submit"
              className="w-full cursor-pointer py-2 px-4 bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 
                text-white rounded-lg hover:opacity-90 transform hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin mr-2" size={20} /> : null}
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>

            {/* Divider - Remove social login for now */}
            {/* <div className="relative my-6">...</div> */}

            {/* Login Link */}
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}