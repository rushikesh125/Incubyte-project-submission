// Enhanced OrderHistory with better order grouping
// components/user/OrderHistory.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ShoppingCart, 
  Calendar, 
  Package, 
  DollarSign,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader
} from "lucide-react";
import { getUserTransactions } from "@/lib/api/transaction";

const OrderHistory = () => {
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user.token) {
      router.push("/login");
    }
  }, [user.token, router]);

  // Fetch user transactions
  useEffect(() => {
    if (!user.token) return;

    const fetchTransactions = async () => {
      try {
        const data = await getUserTransactions();
        // Group transactions by timestamp (within 1 minute = same order)
        const groupedTransactions = groupTransactionsByOrder(data);
        setTransactions(groupedTransactions);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        toast.error("Failed to load order history");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user.token]);

  // Group transactions by timestamp to create orders
  const groupTransactionsByOrder = (transactions) => {
    const orderMap = new Map();
    
    transactions.forEach(transaction => {
      const transactionTime = new Date(transaction.timestamp);
      let orderId = null;
      
      // Find existing order within 1 minute
      for (let [id, order] of orderMap) {
        const orderTime = new Date(order.timestamp);
        const timeDiff = Math.abs(transactionTime - orderTime);
        
        // If within 1 minute, consider it the same order
        if (timeDiff <= 60000) {
          orderId = id;
          break;
        }
      }
      
      // If no existing order found, create new order ID
      if (!orderId) {
        orderId = `ORD-${transactionTime.getTime()}-${Math.random().toString(36).substr(2, 5)}`;
      }
      
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          id: orderId,
          timestamp: transaction.timestamp,
          items: [],
          totalAmount: 0
        });
      }
      
      const order = orderMap.get(orderId);
      order.items.push(transaction);
      order.totalAmount += transaction.sweet.price * transaction.quantity;
    });
    
    // Convert map to array and sort by timestamp (newest first)
    return Array.from(orderMap.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Toggle order details
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading) {
    return (
    <Loader/>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button 
        onClick={() => router.back()} 
        variant="ghost" 
        className="mb-6 text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
        <CardHeader className="pb-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <ShoppingCart className="w-7 h-7 text-primary-600" />
                Order History
              </CardTitle>
              <p className="text-gray-500 mt-1">
                View your past orders and transaction details
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">You haven't placed any orders yet. Why not treat yourself?</p>
              <Button 
                onClick={() => router.push("/sweets")}
                className="bg-primary-600 hover:bg-primary-700 transition-colors text-white px-6 py-3 text-lg font-medium"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {transactions.map((order) => (
                <Card 
                  key={order.id} 
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary-400"
                >
                  {/* Order Summary */}
                  <div 
                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white transition-colors duration-200 hover:bg-gray-50"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-100 p-3 rounded-xl">
                        <Package className="w-7 h-7 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">Order #{order.id.substring(0, 8).toUpperCase()}</h3>
                        <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 gap-2">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                          </div>
                          <span>•</span>
                          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <p className="font-extrabold text-xl text-primary-600">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">Total</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all">
                        {expandedOrderId === order.id ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            View Details
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Order Details (Expanded) */}
                  {expandedOrderId === order.id && (
                    <div className="border-t border-gray-200 bg-gray-50 transition-all duration-300 ease-in-out animate-slide-down">
                      <div className="p-6">
                        <h4 className="font-bold text-lg mb-4 text-gray-800">Order Items</h4>
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md">
                              <img 
                                src={item.sweet.posterURL} 
                                alt={item.sweet.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 items-center w-full">
                                <div>
                                  <h5 className="font-medium text-gray-800">{item.sweet.name}</h5>
                                  <p className="text-sm text-gray-500">{item.sweet.category}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end text-sm">
                                  <span className="bg-gray-100 px-3 py-1 rounded-full font-light">
                                    Qty: <span className="font-medium text-gray-700">{item.quantity}</span>
                                  </span>
                                  <span className="bg-gray-100 px-3 py-1 rounded-full font-light">
                                    Price: <span className="font-medium text-gray-700">${item.sweet.price.toFixed(2)} each</span>
                                  </span>
                                </div>
                              </div>
                              <div className="font-bold text-lg text-primary-600 w-full sm:w-auto mt-2 sm:mt-0 text-right sm:text-left">
                                ${(item.sweet.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Order Summary */}
                        <div className="mt-8 pt-6 border-t border-gray-200 max-w-sm ml-auto">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-gray-600">
                              <span className="font-light">Subtotal</span>
                              <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                              <span className="font-light">Delivery Fee</span>
                              <span className="font-medium">$2.99</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                              <span className="font-light">Tax (8%)</span>
                              <span className="font-medium">${(order.totalAmount * 0.08).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-300">
                              <span>Total</span>
                              <span className="text-primary-600">
                                ${(order.totalAmount + 2.99 + (order.totalAmount * 0.08)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

};

export default OrderHistory;