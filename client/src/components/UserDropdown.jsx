// components/UserDropdown.jsx
"use client";
import {
  ChevronDown,
  HelpCircle,
  History,
  LogOut,
  Settings,
  Shield,
  ShoppingCart,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { logout, selectUser } from "@/store/userSlice";
import { clearCart } from "@/store/cartSlice"; // Import clearCart action
import { logoutUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";

const UserDropdown = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout with complete state cleanup
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Clear API token and all Redux state
      logoutUser(); // Your API logout function
      
      // Dispatch both logout and clearCart actions
      dispatch(logout()); // Clear user state
      dispatch(clearCart()); // Clear cart state

      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading or redirect if no user
  if (!user) {
    return null;
  }

  // Extract user data from Redux state
  const { fullName, email, role } = user;
  const imgSrc = "/profile.png";

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-50"
          aria-label="User menu"
        >
          <img
            src={imgSrc}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full border border-gray-200"
            onError={(e) => {
              e.target.src = "/profile.png";
            }}
          />
          <div className="hidden sm:block">
            <span className="text-sm font-medium text-gray-700 truncate max-w-32">
              {fullName || email || "User"}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={imgSrc}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full border border-gray-200"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {fullName || email || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-32">
                    {email}
                  </p>
                </div>
              </div>
              {/* Role Badge */}
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${
                  role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {role === "admin" ? "Admin" : "Customer"}
              </span>
            </div>

            {/* Navigation Links */}
            <div className="py-2">
              <Link
                href="/profile"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Profile Settings</span>
              </Link>

              {role === "admin" && (
                <Link
                  href="/dashboard"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <Link
                href="/cart"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
              </Link>
              <Link
                href="/orders"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <History className="w-4 h-4" />
                <span>Orders</span>
              </Link>
            </div>

            {/* Logout Section */}
            <div className="border-t border-gray-100 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  );
};

export default UserDropdown;