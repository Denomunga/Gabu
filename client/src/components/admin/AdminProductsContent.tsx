import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isFeatured: boolean;
  isTrending: boolean;
  rating: number;
}

export function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Immune Boosters",
    images: [""],
    isFeatured: false,
    isTrending: false,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images.filter(img => img !== ""), res.data.url]
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        images: formData.images.filter(img => img !== ""),
      };

      if (editingId) {
        await axios.put(`${API_URL}/api/products/${editingId}`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/products`, productData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchProducts();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "Immune Boosters",
        images: [""],
        isFeatured: false,
        isTrending: false,
      });
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      images: product.images.length > 0 ? product.images : [""],
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Products Management</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-bold mb-4">
            {editingId ? "Edit Product" : "Add New Product"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border rounded-md"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="px-3 py-2 border rounded-md"
                required
              />
            </div>
            
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              required
            />
            
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="Immune Boosters">Immune Boosters</option>
              <option value="Sport Fit">Sport Fit</option>
              <option value="Women's Beauty">Women's Beauty</option>
              <option value="Heart & Blood Fit">Heart & Blood Fit</option>
              <option value="Smart Kids">Smart Kids</option>
              <option value="Men's Power">Men's Power</option>
              <option value="Suma Fit">Suma Fit</option>
              <option value="Suma Living">Suma Living</option>
            </select>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Images</label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  {image ? (
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <img src={image} alt="Preview" className="w-16 h-16 object-cover" />
                      <span className="text-sm text-gray-600 flex-1">{image}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1"
                      />
                      {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
                    </div>
                  )}
                </div>
              ))}
              {formData.images.filter(img => img !== "").length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, images: [...formData.images, ""] })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              )}
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                Featured Product
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                />
                Trending Product
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? "Update" : "Create"} Product
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
            <div className="flex items-center gap-4">
              {product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-sm text-gray-600">KES {product.price}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(product)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(product._id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
