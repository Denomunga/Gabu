import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES } from "@shared/schema";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Shop() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  
  // Debounce search ideally, but for now direct state
  const { data: products, isLoading } = useProducts({ 
    search: search || undefined,
    category: category 
  });

  const clearFilters = () => {
    setSearch("");
    setCategory(undefined);
  };

  const Filters = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-display font-bold text-lg mb-4">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => setCategory(undefined)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !category ? "bg-primary text-primary-foreground font-medium" : "hover:bg-secondary text-muted-foreground"
            }`}
          >
            All Products
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                category === cat ? "bg-primary text-primary-foreground font-medium" : "hover:bg-secondary text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-secondary/30 border-b border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-display font-bold mb-4">Shop</h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse our extensive collection of medical supplies, supplements, and wellness products.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Filters />
          </aside>

          {/* Mobile Filter & Search Bar */}
          <div className="flex-grow">
            <div className="flex gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="mt-8">
                    <Filters />
                  </div>
                </SheetContent>
              </Sheet>

              {(category || search) && (
                <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[400px] bg-secondary/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border">
                <h3 className="text-lg font-medium text-muted-foreground">No products found</h3>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                <Button variant="link" onClick={clearFilters} className="mt-4 text-primary">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
