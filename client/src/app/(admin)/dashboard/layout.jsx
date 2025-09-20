"use client";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { logout } from "@/store/userSlice"; // Your Redux logout
import { logoutUser } from "@/lib/api/auth"; // Your custom logout API
import ProtectedRoute from "@/components/ProtectedRoute"; // Your protected route component
import { selectUser, selectIsAdmin } from "@/store/userSlice"; // Your selectors
import { 
  Users, 
  TextSelect, 
  TextSearch, 
  Bot, 
  FileSliders, 
  CircleFadingArrowUpIcon, 
  Settings, 
  Menu, 
  X, 
  Settings2,
  BarChart3,
  FileSlidersIcon,
  Edit3,
  PlusCircleIcon,
  Users2,
  ShieldUser,
  BadgeDollarSign
} from "lucide-react";
import Link from "next/link";
// import DashNav from "@/components/DashNav"; // Assuming this is your top nav component
// import Logo from "@/components/Logo";
import { DynamicBreadcrumb } from "@/components/DynamicBreadcrumb";
import { Button } from "@/components/ui/button";

const DashboardLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // Admin validation - redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Access denied - Admin only");
      router.push("/"); // Redirect to user page
    }
  }, [isAdmin, router]);

  // Close sidebar on click outside (mobile)
  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Sweet Shop Admin Menu Items
  const menuItems = [
  {
    link: "/dashboard",
    id: "Dashboard",
    label: "Dashboard",
    icon: Users2,
  },
  {
    link: "/dashboard/add-sweet",
    id: "AddSweet",
    label: "Add Sweet",
    icon: PlusCircleIcon, // Add this import: import { PlusCircle } from "lucide-react";
  },
  {
    link: "/dashboard/manage-sweets",
    id: "ManageSweets",
    label: "Manage Sweets",
    icon: Edit3,
  },
  {
    link: "/dashboard/manage-users",
    id: "manage-user",
    label: "Manage Users",
    icon: ShieldUser,
  },
  {
    link: "/dashboard/transactions",
    id: "transactions",
    label: "Transactions",
    icon: BadgeDollarSign,
  },
];

  // Function to determine if a menu item is active based on current path
  const isActive = (itemLink) => {
    // Exact match for dashboard home
    if (itemLink === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    // Partial match for sub-routes
    if (pathname.startsWith(itemLink)) {
      return true;
    }
    return false;
  };

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside
          ref={drawerRef}
          className={`
            fixed top-0 left-0 z-40 h-screen transition-transform
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 w-64 bg-white border-r border-gray-200
          `}
        >
          <div className="flex items-center justify-between h-16 px-4">
            <Link href="/">
              <div className="flex items-center gap-2">
                {/* <Logo /> */}
                <span className="text-xl font-bold text-purple-600">Sweet Shop Admin</span>
              </div>
            </Link>
            <button className="md:hidden" onClick={() => setIsMenuOpen(false)}>
              <X className="w-6 h-6 text-gray-800" />
            </button>
          </div>

          <nav className="px-4 mt-8 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.link);
              
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  className={`
                    flex items-center w-full px-4 py-3 rounded-lg transition-colors
                    ${active 
                      ? "bg-purple-50 text-purple-600" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-purple-600"
                    }
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="md:ml-64">

          <div className="px-4 py-3 bg-white border-b border-gray-200">
            <DynamicBreadcrumb />
          </div>

          {/* Content Area */}
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;