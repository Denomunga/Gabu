import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Check, Truck, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ProductDetails() {
  const [, params] = useRoute("/products/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: product, isLoading } = useProduct(id);
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border/50 overflow-hidden aspect-square flex items-center justify-center p-8">
              <img 
                src={product.images?.[activeImage] || ""} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 bg-white rounded-lg border-2 flex-shrink-0 p-2 ${
                      activeImage === idx ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
                {product.category}
              </span>
              {product.isFeatured && (
                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= Number(product.rating || 0) ? "fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">({product.reviewsCount} reviews)</span>
            </div>

            <div className="text-3xl font-bold text-primary mb-8">
              KES {(product.price / 100).toLocaleString()}
            </div>

            <div className="prose prose-slate max-w-none mb-8 text-muted-foreground">
              <p>{product.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" onClick={handleAddToCart} className="flex-1 rounded-full text-base h-12">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="flex-1 rounded-full text-base h-12">
                Add to Wishlist
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-8">
              <div className="flex items-start gap-3">
                <Truck className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Fast Delivery</h4>
                  <p className="text-xs text-muted-foreground">Within 24-48 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Authentic Products</h4>
                  <p className="text-xs text-muted-foreground">100% Quality Guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
