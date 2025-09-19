// components/cart/CartPage.jsx
"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { 
  removeFromCart, 
  updateQuantity,
  selectCartItems,
  selectCartTotals,
  selectIsCartEmpty
} from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";

const CartPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const { totalQuantity, totalPrice } = useSelector(selectCartTotals);
  const isCartEmpty = useSelector(selectIsCartEmpty);
  const user = useSelector((state) => state.user.user);

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleQuantityChange = (id, newQuantity) => {
    dispatch(updateQuantity({ id, quantity: newQuantity }));
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };
  useEffect(()=>{
    if(!user){
        toast.error("Please Login ")
        router.push("/login")
    }
  },[user])

  if (isCartEmpty) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some delicious sweets to your cart!</p>
          <Button 
            onClick={() => router.push("/")}
            className="bg-theme-color hover:bg-theme-color/90"
          >
            Browse Sweets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button 
        onClick={() => router.back()} 
        variant="ghost" 
        className="mb-6 hover:bg-theme-color/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2 text-theme-color" />
        Continue Shopping
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={item.posterURL} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-theme-color font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="font-bold text-lg w-20 text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="rounded-2xl sticky top-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQuantity} items)</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">$2.99</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-semibold">${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-theme-color">
                    ${(totalPrice + 2.99 + (totalPrice * 0.08)).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-theme-color to-purple-600 hover:from-theme-color/90 hover:to-purple-600/90 py-6 text-lg font-medium rounded-xl"
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;