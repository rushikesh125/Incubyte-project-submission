// components/home/LandingPage.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getAllSweets, searchSweets } from "@/lib/api/sweets";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Star, 
  Filter,
  X
} from "lucide-react";

const LandingPage = () => {
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  // Fetch all sweets
  useEffect(() => {
    const fetchSweets = async () => {
      try {
        const data = await getAllSweets();
        setSweets(data);
        setFilteredSweets(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(sweet => sweet.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch sweets:", error);
        toast.error("Failed to load sweets");
      } finally {
        setLoading(false);
      }
    };

    fetchSweets();
  }, []);

  // Filter sweets based on search term and category
  useEffect(() => {
    let result = sweets;
    
    if (searchTerm) {
      result = result.filter(sweet => 
        sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      result = result.filter(sweet => sweet.category === selectedCategory);
    }
    
    setFilteredSweets(result);
  }, [searchTerm, selectedCategory, sweets]);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredSweets(sweets);
      return;
    }

    try {
      const data = await searchSweets(searchTerm);
      setFilteredSweets(data);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    }
  };

  // Handle sweet click
  const handleSweetClick = (sweetId) => {
    router.push(`/sweets/${sweetId}`);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
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

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-theme-color/5 to-white">
      {/* Hero Section */}
      <div className="relative py-16 px-4 bg-gradient-to-r from-theme-color to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sweet Delights</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover the most delicious sweets made with love and premium ingredients
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search sweets..."
                className="pl-10 py-6 rounded-full bg-white/90 text-gray-800 placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-white text-theme-color hover:bg-gray-100 rounded-full px-6"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="text-theme-color" />
            <span className="font-medium">Filter by:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(searchTerm || selectedCategory !== "all") && (
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredSweets.length} sweet{filteredSweets.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Sweets Grid */}
        {filteredSweets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🍰</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No sweets found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <Button onClick={resetFilters} variant="outline">
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSweets.map((sweet) => (
              <SweetCard 
                key={sweet.id} 
                sweet={sweet} 
                onClick={() => handleSweetClick(sweet.id)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

// Sweet Card Component
const SweetCard = ({ sweet, onClick }) => {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={sweet.posterURL} 
          alt={sweet.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Button 
            size="sm" 
            variant="secondary" 
            className="rounded-full p-2 bg-white/80 hover:bg-white"
          >
            <Heart className="w-4 h-4 text-theme-color" />
          </Button>
        </div>
        {sweet.quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg py-2 px-4">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg truncate">{sweet.name}</h3>
          <Badge variant="secondary" className="bg-theme-color/10 text-theme-color">
            {sweet.category}
          </Badge>
        </div>
        
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">(4.8)</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-theme-color">
            ${sweet.price.toFixed(2)}
          </span>
          <Button 
            size="sm" 
            disabled={sweet.quantity === 0}
            className="bg-theme-color hover:bg-theme-color/90"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
        
        <div className="mt-3 text-sm text-gray-500">
          {sweet.quantity > 0 ? (
            <span className="text-green-600">In Stock ({sweet.quantity} available)</span>
          ) : (
            <span className="text-red-600">Out of Stock</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LandingPage;