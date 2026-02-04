import { Product } from "@shared/schema";
import { Link } from "wouter";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-white">
        {/* Descriptive alt text and Unsplash handling happens in parent/data, here we use what's given */}
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground">
            No Image
          </div>
        )}
        
        {(product.isFeatured || product.isTrending) && (
          <div className="absolute top-2 left-2 flex gap-1">
            {product.isFeatured && (
              <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Featured
              </span>
            )}
            {product.isTrending && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Trending
              </span>
            )}
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-display font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-muted-foreground">
            {product.rating ? Number(product.rating).toFixed(1) : "New"}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            ({product.reviewsCount} reviews)
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <span className="font-display font-bold text-xl text-primary">
            KES {(product.price / 100).toLocaleString()}
          </span>
          <Button size="sm" onClick={handleAddToCart} className="gap-2 rounded-full">
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
