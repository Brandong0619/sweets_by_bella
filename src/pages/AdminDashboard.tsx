import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Package,
  ShoppingCart,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

interface Order {
  id: string;
  customerName: string;
  email: string;
  address: string;
  total: number;
  status: string;
  date: string;
  items: OrderItem[];
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

const AdminDashboard = () => {
  // State for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for UI scaffolding
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // State for products management
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Chocolate Chip Cookie",
      description:
        "Classic chocolate chip cookies made with premium chocolate.",
      price: 2.99,
      image:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80",
      stock: 24,
    },
    {
      id: "2",
      name: "Double Chocolate Cookie",
      description: "Rich chocolate cookies with chocolate chunks.",
      price: 3.49,
      image:
        "https://images.unsplash.com/photo-1618923850107-d1a234d7a73a?w=400&q=80",
      stock: 18,
    },
    {
      id: "3",
      name: "Oatmeal Raisin Cookie",
      description: "Hearty oatmeal cookies with plump raisins.",
      price: 2.79,
      image:
        "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80",
      stock: 12,
    },
  ]);

  // State for orders management
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ord-001",
      customerName: "John Smith",
      email: "john@example.com",
      address: "123 Main St, Anytown, USA",
      total: 11.96,
      status: "Completed",
      date: "2023-06-15",
      items: [
        {
          productId: "1",
          productName: "Chocolate Chip Cookie",
          quantity: 4,
          price: 2.99,
        },
      ],
    },
    {
      id: "ord-002",
      customerName: "Sarah Johnson",
      email: "sarah@example.com",
      address: "456 Oak Ave, Somewhere, USA",
      total: 13.96,
      status: "Processing",
      date: "2023-06-16",
      items: [
        {
          productId: "2",
          productName: "Double Chocolate Cookie",
          quantity: 4,
          price: 3.49,
        },
      ],
    },
  ]);

  // State for product form
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    price: 0,
    image: "",
    stock: 0,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would validate credentials against a backend
    setIsAuthenticated(true);
  };

  // Product form handlers
  const handleProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [name]:
          name === "price" || name === "stock" ? parseFloat(value) : value,
      });
    } else {
      setNewProduct({
        ...newProduct,
        [name]:
          name === "price" || name === "stock" ? parseFloat(value) : value,
      });
    }
  };

  const handleProductSubmit = () => {
    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? editingProduct : p)),
      );
    } else {
      // Add new product
      const newId = `${products.length + 1}`;
      setProducts([...products, { id: newId, ...newProduct }]);
    }
    setIsProductDialogOpen(false);
    setEditingProduct(null);
    setNewProduct({ name: "", description: "", price: 0, image: "", stock: 0 });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts(products.filter((p) => p.id !== productToDelete));
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Order handlers
  const viewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Login to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard UI
  return (
    <div className="container mx-auto py-8 bg-background">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package size={16} />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart size={16} />
            Orders
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Products</CardTitle>
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setNewProduct({
                      name: "",
                      description: "",
                      price: 0,
                      image: "",
                      stock: 0,
                    });
                    setIsProductDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  Add Product
                </Button>
              </div>
              <CardDescription>
                Add, edit, or remove products from your store.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {product.description}
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Manage Orders</CardTitle>
              <CardDescription>View and update order statuses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${order.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewOrderDetails(order.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the product details below."
                : "Fill in the details for your new product."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editingProduct ? editingProduct.name : newProduct.name}
                onChange={handleProductChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={
                  editingProduct
                    ? editingProduct.description
                    : newProduct.description
                }
                onChange={handleProductChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={editingProduct ? editingProduct.price : newProduct.price}
                onChange={handleProductChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={editingProduct ? editingProduct.stock : newProduct.stock}
                onChange={handleProductChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                name="image"
                value={editingProduct ? editingProduct.image : newProduct.image}
                onChange={handleProductChange}
                className="col-span-3"
              />
            </div>
            {(editingProduct?.image || newProduct.image) && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">Preview</div>
                <div className="col-span-3">
                  <img
                    src={
                      editingProduct ? editingProduct.image : newProduct.image
                    }
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProductDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleProductSubmit}>
              {editingProduct ? "Update" : "Add"} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Details Dialog */}
      {selectedOrderId && (
        <Dialog
          open={!!selectedOrderId}
          onOpenChange={() => setSelectedOrderId(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Order ID: {selectedOrderId}</DialogDescription>
            </DialogHeader>
            {(() => {
              const order = orders.find((o) => o.id === selectedOrderId);
              if (!order) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Customer Information</h3>
                      <p>{order.customerName}</p>
                      <p>{order.email}</p>
                      <p className="whitespace-pre-line">{order.address}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Order Summary</h3>
                      <p>Date: {order.date}</p>
                      <p>Total: ${order.total.toFixed(2)}</p>
                      <p>
                        Status:
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className="ml-2 border rounded p-1"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Order Items</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })()}
            <DialogFooter>
              <Button onClick={() => setSelectedOrderId(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminDashboard;
