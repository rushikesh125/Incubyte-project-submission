"use client";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "@/store/userSlice";
import UserDropdown from "./UserDropdown";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from "lucide-react";

export default function Navbar() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-purple-600">🍭 SweetShop</span>
          </Link>

         

          {/* Right Side - Auth/Cart */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            {/* <Link href="/cart" className="relative p-2 text-gray-600 hover:text-purple-600">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Link> */}

            {/* Auth Section */}
            {isAuthenticated ? (
              <UserDropdown user={user} />
            ) : (
              <div className="flex space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className={`bg-theme-color cursor-pointer hover:bg-theme-color/[0.6]`}>
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}