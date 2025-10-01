import { useQuery } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPen } from "lucide-react";

export default function TaskManagement() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const getProductImage = (product: Product) => {
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
              {product.name.split(" ").map((word, i) => (
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
          <h2 className="text-xl font-semibold">Task Management</h2>
          <Button data-testid="button-create-product">Create Product</Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <Label className="text-muted-foreground">Product Name:</Label>
            <Input data-testid="input-product-name" className="mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Product Price:</Label>
            <div className="flex gap-2 mt-1">
              <Input data-testid="input-price-min" type="number" defaultValue="0" />
              <span className="flex items-center">-</span>
              <Input data-testid="input-price-max" type="number" defaultValue="0" />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button data-testid="button-filter-products" className="px-8">Filter</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-muted-foreground">#</TableHead>
              <TableHead className="text-muted-foreground">Product Image</TableHead>
              <TableHead className="text-muted-foreground">Product Name</TableHead>
              <TableHead className="text-muted-foreground">Product Price</TableHead>
              <TableHead className="text-muted-foreground">Product Code</TableHead>
              <TableHead className="text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product, index) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`} className="hover:bg-muted/50">
                <TableCell className="text-sm">{214 + index}</TableCell>
                <TableCell>{getProductImage(product)}</TableCell>
                <TableCell className="text-sm">{product.name}</TableCell>
                <TableCell className="text-sm">{product.price}</TableCell>
                <TableCell className="text-sm">{product.code}</TableCell>
                <TableCell>
                  <button
                    data-testid={`button-edit-product-${product.id}`}
                    className="text-primary hover:text-primary/80"
                  >
                    <UserPen className="w-5 h-5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page:</span>
            <Select defaultValue="100">
              <SelectTrigger data-testid="select-rows-per-page" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            1-{products?.length} of {products?.length}
          </div>
        </div>
      </div>
    </div>
  );
}
