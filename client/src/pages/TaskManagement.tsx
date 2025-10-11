import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { UserPen, X, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TaskManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: null as File | null,
    imagePreview: ""
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    price: "",
    image: null as File | null,
    imagePreview: ""
  });
  const [filters, setFilters] = useState({
    name: "",
    minPrice: "",
    maxPrice: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch campaigns from MongoDB
  const { data: campaignsResponse, isLoading: campaignsLoading } = useQuery<{
    success: boolean;
    data: any[];
    total: number;
  }>({
    queryKey: ["/api/frontend/campaigns"],
  });

  // Note: Products are now stored in campaigns collection
  // No need to fetch from separate products collection

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: { name: string; price: string; image?: string }) => {
      const response = await fetch("/api/frontend/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create product");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/campaigns"] });
      toast({
        title: t("success") || "Success",
        description: t("productCreatedSuccessfully") || "Product created successfully",
      });
      setIsDialogOpen(false);
      setFormData({ name: "", price: "", image: null, imagePreview: "" });
    },
    onError: (error: Error) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; price: string; image?: string } }) => {
      const response = await fetch(`/api/frontend/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update product");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/campaigns"] });
      toast({
        title: t("success") || "Success",
        description: t("productUpdatedSuccessfully") || "Product updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      setEditFormData({ name: "", price: "", image: null, imagePreview: "" });
    },
    onError: (error: Error) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/frontend/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete product");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/campaigns"] });
      toast({
        title: t("success") || "Success",
        description: t("productDeletedSuccessfully") || "Product deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("error") || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Convert campaigns to products format
  const campaignProducts = campaignsResponse?.data?.map((campaign: any, index: number) => ({
    id: campaign._id,
    name: campaign.brand,
    code: campaign.code,
    price: campaign.baseAmount?.toString() || "0",
    image: campaign.logo || "",
    imageType: "white-text" as const,
    createdAt: new Date(campaign.createdAt),
  })) || [];

  // All products come from campaigns collection only
  const allProducts = [...campaignProducts];

  // Apply filters
  const filteredProducts = allProducts.filter((product) => {
    // Filter by name
    if (filters.name && !product.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    // Filter by price range
    const productPrice = Number(product.price);
    if (filters.minPrice && productPrice < Number(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && productPrice > Number(filters.maxPrice)) {
      return false;
    }

    return true;
  });

  // Apply pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData(prev => ({
          ...prev,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: t("error") || "Error",
        description: t("pleaseProvidedAllRequiredFields") || "Please provide all required fields",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      name: formData.name,
      price: formData.price,
      image: formData.imagePreview,
    });
  };

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price.toString(),
      image: null,
      imagePreview: product.image || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData.name || !editFormData.price) {
      toast({
        title: t("error") || "Error",
        description: t("pleaseProvidedAllRequiredFields") || "Please provide all required fields",
        variant: "destructive",
      });
      return;
    }

    updateProductMutation.mutate({
      id: selectedProduct.id,
      data: {
        name: editFormData.name,
        price: editFormData.price,
        image: editFormData.imagePreview,
      }
    });
  };

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    // Filters are applied automatically through the displayProducts calculation
    toast({
      title: t("success") || "Success",
      description: t("filtersApplied") || "Filters applied successfully",
    });
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      minPrice: "",
      maxPrice: ""
    });
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  if (isLoading || campaignsLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const getProductImage = (product: any) => {
    // Check if product has an uploaded image (base64 or URL)
    if (product.image && product.image.length > 0) {
      return (
        <img
          src={product.image}
          alt={product.name}
          className="w-16 h-16 object-cover rounded border border-border"
        />
      );
    }

    // Fall back to imageType-based display
    switch (product.imageType) {
      case "black-text":
        return (
          <div className="w-16 h-16 bg-black rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">{product.name}</span>
          </div>
        );
      case "white-text":
        return (
          <div className="w-16 h-16 bg-white border border-border rounded flex items-center justify-center">
            <span className="font-bold text-sm">{product.name}</span>
          </div>
        );
      case "white-multi":
        return (
          <div className="w-16 h-16 bg-white border border-border rounded flex items-center justify-center p-1">
            <div className="text-center text-xs">
              {product.name.split(" ").map((word: string, i: number) => (
                <div key={i} className="font-bold leading-tight">{word}</div>
              ))}
            </div>
          </div>
        );
      case "red-text":
        return (
          <div className="w-16 h-16 bg-white border border-border rounded flex items-center justify-center">
            <span className="font-bold text-red-600 italic text-sm">{product.name.split(" ")[0]}</span>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('taskManagement')}</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-product">{t('createProduct')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>{t('createProduct')}</DialogTitle>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-full p-1 hover:bg-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      {t('productName')} :
                    </Label>
                    <Input
                      className="mt-1"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('enterProductName') || "Enter product name"}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      {t('productPrice')} :
                    </Label>
                    <Input
                      className="mt-1"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-start">
                  <div>
                    <Label className="text-muted-foreground">
                      {t('productImage')} :
                    </Label>
                    <Input
                      className="mt-1"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  <div>
                    {formData.imagePreview && (
                      <div className="mt-6">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded border border-border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    className="px-8"
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? t('creating') || "Creating..." : t('createProduct')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <Label className="text-muted-foreground">{t('productName')}:</Label>
            <Input 
              data-testid="input-product-name" 
              className="mt-1"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder={t('searchByName') || 'Search by name...'}
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('productPrice')}:</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                data-testid="input-price-min" 
                type="number" 
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Min"
              />
              <span className="flex items-center">-</span>
              <Input 
                data-testid="input-price-max" 
                type="number" 
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button 
            data-testid="button-filter-products" 
            className="px-8"
            onClick={handleApplyFilter}
          >
            {t('filter')}
          </Button>
          {(filters.name || filters.minPrice || filters.maxPrice) && (
            <Button 
              variant="outline"
              className="px-8"
              onClick={handleClearFilters}
            >
              {t('clearFilters') || 'Clear Filters'}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-muted-foreground">#</TableHead>
              <TableHead className="text-muted-foreground">{t('productImage')}</TableHead>
              <TableHead className="text-muted-foreground">{t('productName')}</TableHead>
              <TableHead className="text-muted-foreground">{t('productPrice')}</TableHead>
              <TableHead className="text-muted-foreground">{t('productCode')}</TableHead>
              <TableHead className="text-muted-foreground">{t('action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProducts?.map((product: any, index: number) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`} className="hover:bg-muted/50">
                <TableCell className="text-sm">{214 + index}</TableCell>
                <TableCell>{getProductImage(product)}</TableCell>
                <TableCell className="text-sm">{product.name}</TableCell>
                <TableCell className="text-sm">{product.price}</TableCell>
                <TableCell className="text-sm">{product.code}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        data-testid={`button-actions-product-${product.id}`}
                        className="text-primary hover:text-primary/80 p-1 rounded hover:bg-muted"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditClick(product)}
                        className="cursor-pointer"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        {t('edit') || 'Edit'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(product)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('delete') || 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('rowsPerPage')}:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger data-testid="select-rows-per-page" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} 
              ({filteredProducts.length} total products)
              {(filters.name || filters.minPrice || filters.maxPrice) && allProducts.length !== filteredProducts.length && (
                <span className="ml-2 text-primary">
                  (filtered from {allProducts.length})
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>{t('editProduct') || 'Edit Product'}</DialogTitle>
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">
                  {t('productName')} :
                </Label>
                <Input
                  className="mt-1"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('enterProductName') || "Enter product name"}
                  required
                />
              </div>
              <div>
                <Label className="text-muted-foreground">
                  {t('productPrice')} :
                </Label>
                <Input
                  className="mt-1"
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-start">
              <div>
                <Label className="text-muted-foreground">
                  {t('productImage')} :
                </Label>
                <Input
                  className="mt-1"
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
              </div>
              <div>
                {editFormData.imagePreview && (
                  <div className="mt-6">
                    <img
                      src={editFormData.imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border border-border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                className="px-8"
                disabled={updateProductMutation.isPending}
              >
                {updateProductMutation.isPending ? t('updating') || "Updating..." : t('updateProduct') || 'Update Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure') || 'Are you sure?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteProductConfirmation') || 'This action cannot be undone. This will permanently delete the product'} 
              {selectedProduct && ` "${selectedProduct.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? t('deleting') || "Deleting..." : t('delete') || 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
