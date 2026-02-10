import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Star, ShoppingCart, Truck, Shield, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/use-favorites";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";
import ImageModal from "@/components/ImageModal";

interface Product {
  _id?: string;
  id?: string | number;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  features?: string[];
  benefits?: string[];
  rating?: number | string;
  reviewsCount?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  createdAt?: string;
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  userId?: {
    username?: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export default function ProductDetails() {
  const [, params] = useRoute("/products/:id");
  const [, navigate] = useLocation();
  const id = params?.id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const { toast } = useToast();
  const { toggleFavorite, isFavorite, isAuthenticated } = useFavorites();
  const [isProductFavorite, setIsProductFavorite] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      const productId = (product._id || product.id)?.toString() || '';
      const favoriteStatus = isFavorite(productId);
      console.log("ProductDetails - useEffect syncing:", { productId, favoriteStatus });
      setIsProductFavorite(favoriteStatus);
    }
  }, [product, isFavorite]);

  const handleToggleFavorite = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add favorites",
      });
      return;
    }

    const productId = (product._id || product.id)?.toString() || '';
    const currentFavoriteState = isFavorite(productId);
    console.log("ProductDetails - Before toggle:", { productId, currentFavoriteState, localState: isProductFavorite });
    
    try {
      await toggleFavorite(productId);
      const newFavoriteState = !currentFavoriteState;
      setIsProductFavorite(newFavoriteState);
      console.log("ProductDetails - After toggle:", { newFavoriteState, globalState: isFavorite(productId) });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
      });
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(res.data);
      await fetchReviews(res.data._id || res.data.id?.toString());
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/reviews/${productId}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.productId === (product._id || product.id));

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product._id || product.id,
        name: product.name,
        price: product.price , // Convert to shillings for cart display
        quantity,
        image: product.images[0],
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const message = `Hi, I'm interested in "${product.name}" (KES ${(product.price ).toLocaleString()}). I would like to order ${quantity} unit(s).`;
    const whatsappUrl = `https://wa.me/254713528288?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: "Error", description: "Please login to add a review" });
      navigate("/login");
      return;
    }

    try {
      const trimmedComment = reviewData.comment?.trim();
      await axios.post(
        `${API_URL}/api/reviews`,
        {
          productId: id,
          rating: reviewData.rating,
          comment: trimmedComment ? trimmedComment : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewData({ rating: 5, comment: "" });
      setShowReviewForm(false);
      fetchProduct();
      toast({ title: "Success", description: "Review posted successfully!" });
    } catch (error) {
      console.error("Error posting review:", error);
      toast({ title: "Error", description: "Failed to post review" });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border/50 overflow-hidden aspect-square flex items-center justify-center p-8 relative group">
              <img 
                src={product.images?.[activeImage] ? 
                  (product.images[activeImage].startsWith('http') ? product.images[activeImage] : `${API_URL}${product.images[activeImage]}`) : 
                  "https://via.placeholder.com/500"} 
                alt={product.name}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => {
                  setModalImage(product.images?.[activeImage] ? 
                    (product.images[activeImage].startsWith('http') ? product.images[activeImage] : `${API_URL}${product.images[activeImage]}`) : 
                    "https://via.placeholder.com/500"
                  );
                  setIsModalOpen(true);
                }}
              />
              <Button
                onClick={() => {
                  setModalImage(product.images?.[activeImage] ? 
                    (product.images[activeImage].startsWith('http') ? product.images[activeImage] : `${API_URL}${product.images[activeImage]}`) : 
                    "https://via.placeholder.com/500"
                  );
                  setIsModalOpen(true);
                }}
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImage(idx);
                      setModalImage(img.startsWith('http') ? img : `${API_URL}${img}`);
                      setIsModalOpen(true);
                    }}
                    className={`w-20 h-20 bg-white rounded-lg border-2 flex-shrink-0 p-2 relative group ${
                      activeImage === idx ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img 
                      src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                      alt="" 
                      className="w-full h-full object-contain" 
                    />
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImage(img.startsWith('http') ? img : `${API_URL}${img}`);
                        setIsModalOpen(true);
                      }}
                      variant="secondary"
                      size="icon"
                      className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-6 h-6"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
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
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(Number(product.rating || 0)) ? "fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-muted-foreground text-sm">({product.reviewsCount || 0} reviews)</span>
            </div>

            <div className="text-3xl font-bold text-primary mb-8">
              KES {(product.price ).toLocaleString()}
            </div>

            <div className="prose prose-slate max-w-none mb-8 text-muted-foreground">
              <p>{product.description}</p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-3">Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-3">Benefits:</h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleToggleFavorite}
                size="lg"
                variant={isProductFavorite ? "default" : "outline"}
              >
                <Heart className={`w-5 h-5 ${isProductFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mb-12">
              <Button size="lg" onClick={handleAddToCart} className="rounded-full text-base h-12">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                onClick={handleWhatsApp}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 rounded-full text-base h-12"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Order via WhatsApp
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base h-12">
                <Share2 className="mr-2 h-5 w-5" />
                Share
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

        {/* Reviews Section */}
        <div className="border-t pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            {token && (
              <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                Add Review
              </Button>
            )}
          </div>

          {showReviewForm && (
            <Card className="p-6 mb-8">
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <select
                    value={reviewData.rating}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, rating: parseInt(e.target.value) })
                    }
                    className="border rounded p-2 w-full"
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num}>
                        {num} Stars
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Share your experience..."
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                  className="border rounded p-2 w-full"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button type="submit">Post Review</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              reviews.map((review) => (
                <Card key={review._id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">
                        {review.userId?.username || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment?.trim() ? (
                    <p className="text-gray-700">{review.comment}</p>
                  ) : (
                    <p className="text-gray-500 italic">No comment</p>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Image Modal */}
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={modalImage}
          alt={product.name}
        />
      </div>
    </div>
  );
}
