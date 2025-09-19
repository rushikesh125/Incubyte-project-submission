// components/dashboard/AdminDashboard.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar
} from "lucide-react";
import { getAllTransactions } from "@/lib/api/transaction";
import { getAllSweets } from "@/lib/api/sweets";
import { getAllUsers } from "@/lib/api/users";
import Loading from "@/app/loading";

// Color palette for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

const AdminDashboard = () => {
  const router = useRouter();
  const isAdmin = useSelector((state) => state.user.isAdmin);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    totalSweets: 0,
    totalUsers: 0,
    lowStockItems: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topSweets, setTopSweets] = useState([]);
  const [stockData, setStockData] = useState([]);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, router]);

  // Fetch all data
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [transactions, sweets, users] = await Promise.all([
          getAllTransactions(),
          getAllSweets(),
          getAllUsers()
        ]);

        // Calculate statistics
        const totalRevenue = transactions.reduce((sum, t) => sum + (t.sweet.price * t.quantity), 0);
        const lowStockItems = sweets.filter(sweet => sweet.quantity < 5).length;
        
        setStats({
          totalRevenue,
          totalTransactions: transactions.length,
          totalSweets: sweets.length,
          totalUsers: users.length,
          lowStockItems
        });

        // Process revenue data by date
        const revenueByDate = {};
        transactions.forEach(transaction => {
          const date = new Date(transaction.timestamp).toLocaleDateString();
          const amount = transaction.sweet.price * transaction.quantity;
          revenueByDate[date] = (revenueByDate[date] || 0) + amount;
        });

        const revenueChartData = Object.entries(revenueByDate)
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7); // Last 7 days

        setRevenueData(revenueChartData);

        // Process category data
        const categoryMap = {};
        transactions.forEach(transaction => {
          const category = transaction.sweet.category;
          const amount = transaction.sweet.price * transaction.quantity;
          categoryMap[category] = (categoryMap[category] || 0) + amount;
        });

        const categoryChartData = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        setCategoryData(categoryChartData);

        // Process top sweets
        const sweetMap = {};
        transactions.forEach(transaction => {
          const sweetName = transaction.sweet.name;
          const quantity = transaction.quantity;
          sweetMap[sweetName] = (sweetMap[sweetName] || 0) + quantity;
        });

        const topSweetsData = Object.entries(sweetMap)
          .map(([name, quantity]) => ({ name, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        setTopSweets(topSweetsData);

        // Process stock data
        const stockChartData = sweets
          .map(sweet => ({
            name: sweet.name.length > 15 ? `${sweet.name.substring(0, 15)}...` : sweet.name,
            quantity: sweet.quantity
          }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10);

        setStockData(stockChartData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-8xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toFixed(2)}`} 
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-green-100 text-green-600"
          change="+12.5%"
        />
        <StatCard 
          title="Transactions" 
          value={stats.totalTransactions} 
          icon={<ShoppingCart className="w-6 h-6" />}
          color="bg-blue-100 text-blue-600"
          change="+8.2%"
        />
        <StatCard 
          title="Total Sweets" 
          value={stats.totalSweets} 
          icon={<Package className="w-6 h-6" />}
          color="bg-purple-100 text-purple-600"
          change="+3.1%"
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<Users className="w-6 h-6" />}
          color="bg-yellow-100 text-yellow-600"
          change="+5.7%"
        />
        <StatCard 
          title="Low Stock" 
          value={stats.lowStockItems} 
          icon={<Activity className="w-6 h-6" />}
          color="bg-red-100 text-red-600"
          change="-2.3%"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-theme-color" />
              Revenue Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-theme-color" />
              Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Sweets */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-theme-color" />
              Top Selling Sweets
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSweets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" name="Quantity Sold" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Levels */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-theme-color" />
              Stock Levels (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="quantity" 
                  name="Stock Quantity" 
                  stroke="#ff8042" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-theme-color" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => router.push("/dashboard/manage-sweets")}
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <Package className="w-6 h-6" />
                Manage Sweets
              </Button>
              <Button 
                onClick={() => router.push("/dashboard/manage-users")}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <Users className="w-6 h-6" />
                Manage Users
              </Button>
              <Button 
                onClick={() => router.push("/dashboard/transactions")}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <ShoppingCart className="w-6 h-6" />
                View Transactions
              </Button>
              <Button 
                onClick={() => router.push("/dashboard/add-sweet")}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <DollarSign className="w-6 h-6" />
                Add New Sweet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, change }) => {
  const isPositive = !change.startsWith('-');
  
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`ml-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
          <span className="ml-2 text-sm text-gray-500">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;