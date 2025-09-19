// components/dashboard/AdminTransactions.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ShoppingCart, User, Calendar } from "lucide-react";
import { getAllTransactions } from "@/lib/api/transaction";
import Loading from "@/app/loading";
const AdminTransactions = () => {
  const router = useRouter();
  const isAdmin = useSelector((state) => state.user.isAdmin);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, router]);

  // Fetch all transactions
  useEffect(() => {
    if (!isAdmin) return;

    const fetchTransactions = async () => {
      try {
        const data = await getAllTransactions();
        setTransactions(data);
        setFilteredTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isAdmin]);

  // Filter transactions based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter(
      (transaction) =>
        transaction.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-8xl">
      <Card className="bg-white/80 backdrop-blur-sm border-theme-color/30 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-theme-color flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Transaction History
              </CardTitle>
              <p className="text-theme-color/70">
                View all customer transactions and order details
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by customer name, email, sweet name, or transaction ID..."
                className="pl-10 py-6"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-theme-color/10 p-4 rounded-lg">
              <p className="text-sm text-theme-color font-medium">Total Transactions</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <div className="bg-theme-color/10 p-4 rounded-lg">
              <p className="text-sm text-theme-color font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${transactions.reduce((sum, t) => sum + (t.sweet.price * t.quantity), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-theme-color/10 p-4 rounded-lg">
              <p className="text-sm text-theme-color font-medium">Unique Customers</p>
              <p className="text-2xl font-bold">
                {[...new Set(transactions.map(t => t.userId))].length}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border border-theme-color/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-theme-color/10">
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sweet</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">No transactions found</p>
                        {searchTerm && (
                          <Button
                            variant="link"
                            onClick={() => setSearchTerm("")}
                            className="mt-2"
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-theme-color" />
                          <div>
                            <p className="font-medium">{transaction.user.fullName}</p>
                            <p className="text-sm text-gray-500">{transaction.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={transaction.sweet.posterURL}
                            alt={transaction.sweet.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{transaction.sweet.name}</p>
                            <p className="text-sm text-gray-500">{transaction.sweet.category}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-theme-color/10 text-theme-color px-2 py-1 rounded-full text-sm">
                          {transaction.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-theme-color">
                        ${(transaction.sweet.price * transaction.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTransactions;