"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createSweet } from "@/lib/api/sweets"; // Your API function
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Image, AlertCircle, CheckCircle, TextSearch, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ImgBB API configuration
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY; // Add to .env.local

const AddSweetForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAdmin = useSelector((state) => state.user.isAdmin);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Categories for dropdown (customize as needed)
  const categories = [
    "Chocolate",
    "Candy",
    "Dessert",
    "Cookies",
    "Gum",
    "Ice Cream",
    "Cakes",
    "Biscuits",
  ];

  // Handle image upload to ImgBB
  const handleImageUpload = async (file) => {
    if (!file || !IMGBB_API_KEY) {
      toast.error("Image upload failed - missing configuration");
      return;
    }

    setIsUploading(true);
    setErrors({ ...errors, image: null });

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("key", IMGBB_API_KEY);

      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.data.url);
        setImagePreview(URL.createObjectURL(file));
        toast.success("Image uploaded successfully!");
        setErrors({ ...errors, image: null });
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(`Image upload failed: ${error.message}`);
      setErrors({ ...errors, image: "Failed to upload image" });
      setImageUrl("");
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Sweet name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    if ( editFormData.quantity === "" ||
  isNaN(editFormData.quantity) ||
  parseInt(editFormData.quantity) < 0
) {
      newErrors.quantity = "Quantity must be a non-negative number";
    }

    if (!imageUrl) {
      newErrors.image = "Sweet image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    if (!isAdmin) {
      toast.error("Admin access required");
      router.push("/sweets");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API
      const sweetData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        posterURL: imageUrl, // From ImgBB upload
        description: formData.description.trim(),
      };

      // Call your API
      await createSweet(sweetData);
      
      toast.success("Sweet added successfully!");
      
      // Reset form
      setFormData({
        name: "",
        category: "",
        price: "",
        quantity: "",
        description: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setImageUrl("");

      // Navigate to manage sweets page
      router.push("/dashboard/manage-sweets");

    } catch (error) {
      console.error("Failed to add sweet:", error);
      const errorMsg = error.response?.data?.error || "Failed to add sweet";
      toast.error(errorMsg);
      setErrors({ ...errors, submit: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle number inputs
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Allow only non-negative numbers
    const numericValue = value === '' ? '' : Math.max(0, parseFloat(value));
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors({ ...errors, image: null });
      
      // Auto-upload to ImgBB
      handleImageUpload(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-white/80 backdrop-blur-sm border-theme-color/30 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-theme-color flex items-center gap-2">
            <TextSearch className="w-6 h-6" />
            Add New Sweet
          </CardTitle>
          <CardDescription className="text-theme-color/70">
            Fill in the details to add a delicious new sweet to your shop
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sweet Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Sweet Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Chocolate Fudge Cake"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "border-red-300 focus:ring-red-500" : ""}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger className={errors.category ? "border-red-300 focus:ring-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-theme-color/20">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 4.99"
                value={formData.price}
                onChange={handleNumberChange}
                className={errors.price ? "border-red-300 focus:ring-red-500" : ""}
                required
              />
              {errors.price && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.price}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Initial Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                placeholder="e.g., 25"
                value={formData.quantity}
                onChange={handleNumberChange}
                className={errors.quantity ? "border-red-300 focus:ring-red-500" : ""}
                required
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.quantity}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Sweet Image <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 block mt-1">
                  Max 5MB. JPG, PNG, WebP supported
                </span>
              </Label>
              
              <div className="space-y-3">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full p-1 bg-red-500 hover:bg-red-600"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setImageUrl("");
                      }}
                    >
                      <X className="w-3 h-3 text-white" />
                    </Button>
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center gap-3">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('image').click()}
                    variant="outline"
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Choose Image"}
                  </Button>
                </div>

                {errors.image && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.image}
                  </p>
                )}

                {imageUrl && !errors.image && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Image uploaded: {imageUrl.substring(0, 30)}...
                  </Badge>
                )}
              </div>
            </div>

            {/* Description (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your sweet... e.g., Rich chocolate cake with creamy frosting"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || isUploading || !imageUrl}
                className="flex-1 bg-gradient-to-r from-theme-color to-purple-600 hover:from-theme-color/90 hover:to-purple-600/90 text-white font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Sweet...
                  </>
                ) : (
                  <>
                    <Image className="w-4 h-4 mr-2" />
                    Add Sweet
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/manage-sweets")}
                className="flex-1 border-theme-color text-theme-color hover:bg-theme-color hover:text-white"
              >
                Cancel
              </Button>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddSweetForm;