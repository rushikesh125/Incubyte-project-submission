// components/dashboard/ManageSweets.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Image,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import { getAllSweets, deleteSweet, updateSweet } from "@/lib/api/sweets";

const ManageSweets = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAdmin = useSelector((state) => state.user.isAdmin);
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sweetToDelete, setSweetToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  // Categories for dropdown
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

  // Fetch all sweets
  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
      return;
    }

    const fetchSweets = async () => {
      try {
        const data = await getAllSweets();
        setSweets(data);
        setFilteredSweets(data);
      } catch (error) {
        console.error("Failed to fetch sweets:", error);
        toast.error("Failed to load sweets");
      } finally {
        setLoading(false);
      }
    };

    fetchSweets();
  }, [isAdmin, router]);

  // Filter sweets based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSweets(sweets);
      return;
    }

    const filtered = sweets.filter(
      (sweet) =>
        sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSweets(filtered);
  }, [searchTerm, sweets]);

  // Handle delete sweet
  const handleDeleteSweet = async () => {
    try {
      await deleteSweet(sweetToDelete.id);
      setSweets(sweets.filter((sweet) => sweet.id !== sweetToDelete.id));
      setFilteredSweets(
        filteredSweets.filter((sweet) => sweet.id !== sweetToDelete.id)
      );
      toast.success("Sweet deleted successfully");
    } catch (error) {
      console.error("Failed to delete sweet:", error);
      toast.error("Failed to delete sweet");
    } finally {
      setDeleteDialogOpen(false);
      setSweetToDelete(null);
    }
  };

  // Open edit dialog
  const openEditDialog = (sweet) => {
    setEditingSweet(sweet);
    setEditFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
      description: sweet.description || "",
    });
    setErrors({});
    setEditDialogOpen(true);
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle number inputs for edit form
  const handleEditNumberChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value === "" ? "" : Math.max(0, parseFloat(value));
    setEditFormData((prev) => ({ ...prev, [name]: numericValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate edit form
 const validateEditForm = () => {
  const newErrors = {};

  if (!editFormData.name.trim()) {
    newErrors.name = "Sweet name is required";
  }

  if (!editFormData.category) {
    newErrors.category = "Category is required";
  }

  if (
    !editFormData.price ||
    isNaN(editFormData.price) ||
    parseFloat(editFormData.price) <= 0
  ) {
    newErrors.price = "Price must be a positive number";
  }

  if (
    editFormData.quantity === "" ||
    isNaN(editFormData.quantity) ||
    parseInt(editFormData.quantity) < 0
  ) {
    newErrors.quantity = "Quantity must be a non-negative number";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  // Handle update sweet
  const handleUpdateSweet = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    try {
      const updatedData = {
        ...editFormData,
        price: parseFloat(editFormData.price),
        quantity: parseInt(editFormData.quantity),
      };

      const updatedSweet = await updateSweet(editingSweet.id, updatedData);

      // Update state with new data
      const updatedSweets = sweets.map((sweet) =>
        sweet.id === editingSweet.id ? { ...sweet, ...updatedSweet } : sweet
      );

      setSweets(updatedSweets);
      setFilteredSweets(updatedSweets);
      setEditDialogOpen(false);
      toast.success("Sweet updated successfully");
    } catch (error) {
      console.error("Failed to update sweet:", error);
      toast.error("Failed to update sweet");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-color"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-8xl">
      <Card className="bg-white/80 backdrop-blur-sm border-theme-color/30 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-theme-color flex items-center gap-2">
                <Image className="w-6 h-6" />
                Manage Sweets
              </CardTitle>
              <CardDescription className="text-theme-color/70">
                View, edit, and delete sweets in your shop
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push("/dashboard/add-sweet")}
              className="bg-gradient-to-r from-theme-color to-purple-600 hover:from-theme-color/90 hover:to-purple-600/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Sweet
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search sweets by name or category..."
                className="pl-10 py-6"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Sweets Table */}
          <div className="rounded-md border border-theme-color/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-theme-color/10">
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSweets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Image className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-500">No sweets found</p>
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
                  filteredSweets.map((sweet) => (
                    <TableRow key={sweet.id}>
                      <TableCell>
                        <img
                          src={sweet.posterURL}
                          alt={sweet.name}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {sweet.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sweet.category}</Badge>
                      </TableCell>
                      <TableCell>${sweet.price.toFixed(2)}</TableCell>
                      <TableCell>{sweet.quantity}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/update-sweet?id=${sweet.id}`
                              )
                            }
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSweetToDelete(sweet);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sweet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{sweetToDelete?.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSweet}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sweet Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sweet</DialogTitle>
            <DialogDescription>
              Update the details for {editingSweet?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSweet} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Sweet Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editFormData.category}
                onValueChange={(value) =>
                  setEditFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.price}
                  onChange={handleEditNumberChange}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={editFormData.quantity}
                  onChange={handleEditNumberChange}
                  className={errors.quantity ? "border-red-500" : ""}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.quantity}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Sweet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageSweets;
