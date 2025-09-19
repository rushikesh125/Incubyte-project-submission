// components/sweets/SweetDetail.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { getSweetById } from "@/lib/api/sweets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  ArrowLeft,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { addToCart } from "@/store/cartSlice"; // Assuming you have a cart slice

const SweetDetail = () => {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [sweet, setSweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch sweet details
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchSweet = async () => {
      try {
        const data = await getSweetById(id);
        setSweet(data);
      } catch (error) {
        console.error("Failed to fetch sweet:", error);
        toast.error("Failed to load sweet details");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchSweet();
  }, [id, router]);

  // Handle quantity changes
  const incrementQuantity = () => {
    if (sweet && quantity < sweet.quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!user?.token) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    // Dispatch to Redux store
    dispatch(addToCart({
      id: sweet.id,
      name: sweet.name,
      price: sweet.price,
      posterURL: sweet.posterURL,
      quantity: quantity,
      maxQuantity: sweet.quantity
    }));

    toast.success(`${sweet.name} added to cart!`);
  };

  // Handle buy now - redirects to checkout
  const handleBuyNow = () => {
    if (!user?.token) {
      toast.error("Please login to purchase");
      router.push("/login");
      return;
    }

    // Add item to cart first
    dispatch(addToCart({
      id: sweet.id,
      name: sweet.name,
      price: sweet.price,
      posterURL: sweet.posterURL,
      quantity: quantity,
      maxQuantity: sweet.quantity
    }));

    // Redirect to checkout
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-color"></div>
        </div>
      </div>
    );
  }

  if (!sweet) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Sweet not found</h2>
        <Button
          onClick={() => router.back()}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sweets
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Button 
        onClick={() => router.back()} 
        variant="ghost" 
        className="mb-6 hover:bg-theme-color/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2 text-theme-color" />
        Back to Sweets
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Sweet Images Section */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src={sweet.posterURL || sweet.imageUrl}
              alt={sweet.name}
              className="w-full h-96 object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full p-3 bg-white/90 hover:bg-white shadow-md backdrop-blur-sm"
              >
                <Heart className="w-5 h-5 text-theme-color" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full p-3 bg-white/90 hover:bg-white shadow-md backdrop-blur-sm"
              >
                <Share2 className="w-5 h-5 text-theme-color" />
              </Button>
            </div>
            
            {sweet.quantity === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge variant="destructive" className="text-xl py-3 px-6">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {[sweet.posterURL || sweet.imageUrl].map((img, index) => (
              <div
                key={index}
                className={`w-24 h-24 rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${
                  selectedImage === index 
                    ? "border-theme-color shadow-lg" 
                    : "border-transparent hover:border-theme-color/50"
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img 
                  src={img} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sweet Details Section */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge 
                variant="secondary" 
                className="bg-theme-color/10 text-theme-color text-base py-1 px-3 rounded-full"
              >
                {sweet.category}
              </Badge>
              <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-medium">4.8</span>
                <span className="text-gray-500 text-sm ml-1">(128)</span>
              </div>
              {sweet.quantity < 5 && sweet.quantity > 0 && (
                <Badge variant="outline" className="border-orange-500 text-orange-500">
                  Only {sweet.quantity} left!
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{sweet.name}</h1>
            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-theme-color">
                ${Number(sweet.price).toFixed(2)}
              </span>
              {sweet.quantity > 0 ? (
                <span className="text-green-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  In Stock
                </span>
              ) : (
                <span className="text-red-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Quantity</h3>
              <span className="text-sm text-gray-500">{sweet.quantity} available</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="rounded-r-none px-4 py-3"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-6 py-3 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={incrementQuantity}
                  disabled={quantity >= sweet.quantity}
                  className="rounded-l-none px-4 py-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {sweet.quantity === 0 && (
                <Badge variant="destructive">Currently Unavailable</Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={sweet.quantity === 0}
              className="flex-1 bg-theme-color hover:bg-theme-color/90 py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={sweet.quantity === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-theme-color hover:from-purple-700 hover:to-theme-color/90 py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Buy Now
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="p-2 bg-theme-color/10 rounded-lg">
                <Truck className="w-5 h-5 text-theme-color" />
              </div>
              <div>
                <p className="font-medium">Fast Delivery</p>
                <p className="text-sm text-gray-500">Within 2 hours</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="p-2 bg-theme-color/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-theme-color" />
              </div>
              <div>
                <p className="font-medium">Quality Assured</p>
                <p className="text-sm text-gray-500">Premium ingredients</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              <div className="p-2 bg-theme-color/10 rounded-lg">
                <RotateCcw className="w-5 h-5 text-theme-color" />
              </div>
              <div>
                <p className="font-medium">Easy Returns</p>
                <p className="text-sm text-gray-500">7-day guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Section - Moved to bottom and full width */}
      <div className="mt-12 w-full">
        <Card className="rounded-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-2xl mb-6 pb-2 border-b border-gray-200">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-5 rounded-xl">
                <h4 className="font-semibold text-gray-500 mb-2">Category</h4>
                <p className="text-lg font-medium">{sweet.category}</p>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl">
                <h4 className="font-semibold text-gray-500 mb-2">Availability</h4>
                <p className={sweet.quantity > 0 ? "text-green-600 font-medium text-lg" : "text-red-600 font-medium text-lg"}>
                  {sweet.quantity > 0 ? `${sweet.quantity} in stock` : "Out of Stock"}
                </p>
              </div>
              <div className="bg-gray-50 p-5 rounded-xl">
                <h4 className="font-semibold text-gray-500 mb-2">Added</h4>
                <p className="text-lg font-medium">
                  {new Date(sweet.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="font-semibold text-gray-500 mb-3">Description</h4>
              <p className="text-gray-700 text-lg leading-relaxed">
                Indulge in the rich flavors of our {sweet.name}. Made with premium ingredients
                and crafted with care, this sweet is perfect for any occasion. Experience the
                perfect balance of sweetness and texture in every bite.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SweetDetail;