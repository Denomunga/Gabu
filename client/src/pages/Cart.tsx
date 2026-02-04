import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KENYA_COUNTIES } from "@/lib/kenya-data";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { useUser } from "@/hooks/use-auth";

export default function Cart() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const { data: user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [deliveryInfo, setDeliveryInfo] = useState({
    county: "",
    location: "",
    address: "",
    phone: user?.phone || "",
    name: user?.username || "",
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create order in DB
      const orderData = {
        items: items.map(i => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price
        })),
        totalAmount: total,
        deliveryInfo
      };

      await apiRequest(api.orders.create.method, api.orders.create.path, orderData);

      // 2. Prepare WhatsApp Message
      const message = `*New Order Request*\n\n` +
        `Name: ${deliveryInfo.name}\n` +
        `Phone: ${deliveryInfo.phone}\n` +
        `Location: ${deliveryInfo.location}, ${deliveryInfo.county}\n\n` +
        `*Items:*\n` +
        items.map(i => `- ${i.name} x${i.quantity} @ KES ${(i.price / 100).toLocaleString()}`).join('\n') +
        `\n\n*Total: KES ${(total / 100).toLocaleString()}*`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/254700000000?text=${encodedMessage}`;

      // 3. Clear cart and redirect
      clearCart();
      window.location.href = whatsappUrl;

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process order. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-card rounded-xl border border-border/50 shadow-sm">
                <div className="w-24 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                   {/* Fallback image */}
                  <img 
                    src={item.images?.[0] || ""} 
                    alt={item.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-primary font-bold">KES {(item.price / 100).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="ml-auto font-medium text-slate-600">
                      Subtotal: KES {((item.price * item.quantity) / 100).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border/50 shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-display font-bold mb-6">Delivery Details</h2>
              
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    required 
                    value={deliveryInfo.name}
                    onChange={e => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                    placeholder="John Doe" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    required 
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={e => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                    placeholder="0700 000 000" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>County</Label>
                  <Select 
                    required 
                    value={deliveryInfo.county} 
                    onValueChange={(val) => setDeliveryInfo({...deliveryInfo, county: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select County" />
                    </SelectTrigger>
                    <SelectContent>
                      {KENYA_COUNTIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location / Landmark</Label>
                  <Input 
                    required 
                    value={deliveryInfo.location}
                    onChange={e => setDeliveryInfo({...deliveryInfo, location: e.target.value})}
                    placeholder="e.g., Westlands, Near Sarit Centre" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Detailed Address</Label>
                  <Input 
                    required 
                    value={deliveryInfo.address}
                    onChange={e => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                    placeholder="Street, Building, House No." 
                  />
                </div>

                <hr className="my-6 border-dashed" />

                <div className="flex justify-between items-center text-lg font-bold mb-6">
                  <span>Total</span>
                  <span>KES {(total / 100).toLocaleString()}</span>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : (
                    <>
                      Checkout on WhatsApp <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  You will be redirected to WhatsApp to complete your order with our agent.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
