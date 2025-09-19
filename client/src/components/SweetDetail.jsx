// components/sweets/SweetDetail.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
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
  Minus
} from "lucide-react";

const SweetDetail = () => {
  const router = useRouter();
  const params = useParams();
  const sweetId = params.id;
  const user = useSelector((state) => state.user);
  
  const [sweet, setSweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch sweet details
  useEffect(() => {
    if (!sweetId) return;

    const fetchSweet = async () => {
      try {
        const data = await getSweetById(sweetId);
        setSweet(data);
      } catch (error) {
        console.error("Failed to fetch sweet:", error);
        toast.error("Failed to load sweet details");
        router.push("/sweets");
      } finally {
        setLoading(false);
      }
    };

    fetchSweet();
  }, [sweetId, router]);

  // Handle quantity changes
  const incrementQuantity = () => {
    if (sweet && quantity < sweet.quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!user.token) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }
    
    // Implement add to cart logic here
    toast.success(`${sweet.name} added to cart!`);
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!user.token) {
      toast.error("Please login to purchase");
      router.push("/login");
      return;
    }
    
    // Implement buy now logic here
    toast.success(`Proceeding to checkout for ${sweet.name}`);
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
          onClick={() => router.push("/sweets")} 
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
    <div className="container mx-auto px-4 py-8">
      <Button 
        onClick={() => router.push("/sweets")} 
        variant="ghost" 
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Sweets
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sweet Images */}
        <div>
          <div className="relative rounded-lg overflow-hidden mb-4">
            <img 
              src={sweet.posterURL} 
              alt={sweet.name}
              className="w-full h-96 object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="rounded-full p-2 bg-white/80 hover:bg-white"
              >
                <Heart className="w-4 h-4 text-theme-color" />
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                className="rounded-full p-2 bg-white/80 hover:bg-white"
              >
                <Share2 className="w-4 h-4 text-theme-color" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[sweet.posterURL].map((img, index) => (
              <div 
                key={index}
                className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                  selectedImage === index ? 'border-theme-color' : 'border-transparent'
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

        {/* Sweet Details */}
        <div>
          <div className="mb-4">
            <Badge variant="secondary" className="bg-theme-color/10 text-theme-color text-base mb-2">
              {sweet.category}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{sweet.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-gray-600 ml-2">(128 reviews)</span>
            </div>
            
            <p className="text-4xl font-bold text-theme-color mb-6">
              ${sweet.price.toFixed(2)}
            </p>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Indulge in the rich flavors of our {sweet.name}. Made with premium ingredients 
                and crafted with care, this sweet is perfect for any occasion.
              </p>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Quantity</span>
              <span className="text-sm text-gray-500">
                {sweet.quantity} available
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="rounded-r-none"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={incrementQuantity}
                  disabled={quantity >= sweet.quantity}
                  className="rounded-l-none"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {sweet.quantity < 5 && sweet.quantity > 0 && (
                <span className="text-orange-500 text-sm">
                  Only {sweet.quantity} left!
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button 
              onClick={handleAddToCart}
              disabled={sweet.quantity === 0}
              className="flex-1 bg-theme-color hover:bg-theme-color/90 py-6"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <Button 
              onClick={handleBuyNow}
              disabled={sweet.quantity === 0}
              variant="outline"
              className="flex-1 border-theme-color text-theme-color hover:bg-theme-color hover:text-white py-6"
            >
              Buy Now
            </Button>
          </div>

          {/* Additional Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Product Details</h3>
              <ul className="space-y-2">
                <li className="flex">
                  <span className="font-medium w-32">Category:</span>
                  <span>{sweet.category}</span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32">In Stock:</span>
                  <span className={sweet.quantity > 0 ? "text-green-600" : "text-red-600"}>
                    {sweet.quantity > 0 ? `${sweet.quantity} available` : "Out of Stock"}
                  </span>
                </li>
                <li className="flex">
                  <span className="font-medium w-32">Added:</span>
                  <span>{new Date(sweet.createdAt).toLocaleDateString()}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SweetDetail;