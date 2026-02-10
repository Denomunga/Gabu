import { useEffect, useState } from "react";
import { Link } from "wouter";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, ArrowRight, Clock, User, Tag, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";

export default function OffersList() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    axios.get(`${API_URL}/api/news?type=offer`)
      .then((r) => {
        setItems(r.data);
        setFilteredItems(r.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = items;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredItems(filtered);
  }, [items, searchTerm, sortBy]);

  const getOfferColor = (isUrgent: boolean) => {
    return isUrgent 
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-green-100 text-green-800 border-green-200";
  };

  const getDaysRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-secondary/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-background to-emerald-500/10 py-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082318824-0a96f2a4b9da?auto=format&fit=crop&q=80')] opacity-5 bg-cover bg-center" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
                <Gift className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Exclusive Offers
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover amazing deals and special offers on our premium healthcare products and services
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-green-500/20 focus:border-green-500"
              />
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { value: "newest", label: "Newest First", icon: "🆕" },
                { value: "oldest", label: "Oldest First", icon: "📅" }
              ].map((sort) => (
                <Button
                  key={sort.value}
                  variant={sortBy === sort.value ? "default" : "outline"}
                  onClick={() => setSortBy(sort.value as any)}
                  className="gap-2 rounded-full"
                >
                  <span>{sort.icon}</span>
                  {sort.label}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200"
          >
            <div className="text-3xl font-bold text-green-600 mb-2">{filteredItems.length}</div>
            <div className="text-muted-foreground">Active Offers</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200"
          >
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {items.filter(item => item.isUrgent).length}
            </div>
            <div className="text-muted-foreground">Urgent Deals</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
          >
            <div className="text-3xl font-bold text-purple-600 mb-2">🎁</div>
            <div className="text-muted-foreground">Special Promotions</div>
          </motion.div>
        </div>
      </section>

      {/* Results Count */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'offer' : 'offers'}
          </p>
          {searchTerm && (
            <Button variant="ghost" onClick={() => setSearchTerm("")}>
              Clear search
            </Button>
          )}
        </div>
      </section>

      {/* Offers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold mb-2">No offers available</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Check back later for new special offers"}
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm("")}>
                Clear search
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative">
                  {/* Ribbon for urgent offers */}
                  {item.isUrgent && (
                    <div className="absolute top-4 right-0 z-10">
                      <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 transform rotate-45 translate-x-2 -translate-y-1 shadow-lg">
                        URGENT
                      </div>
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="relative h-56 bg-gradient-to-br from-green-500/20 to-emerald-500/20 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL}${item.imageUrl}`}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-8xl">🎁</div>
                      </div>
                    )}
                    
                    {/* Offer Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${getOfferColor(item.isUrgent)} border backdrop-blur-sm text-sm font-bold px-3 py-1`}>
                        <Tag className="w-3 h-3 mr-1" />
                        Special Offer
                      </Badge>
                    </div>

                    {/* Time Indicator */}
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary" className="backdrop-blur-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        {getDaysRemaining(item.createdAt)} days ago
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <Link href={`/news/${item._id || item.id}`}>
                      <h3 className="font-display font-bold text-xl mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                      {item.authorName && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {item.authorName}
                        </div>
                      )}
                    </div>

                    <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                      {item.content}
                    </p>

                    <div className="flex gap-3">
                      <Link href={`/news/${item._id || item.id}`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0">
                          View Offer
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Don't Miss Out on These Deals!
            </h2>
            <p className="text-green-100 mb-8 text-lg">
              Subscribe to our newsletter to get exclusive offers delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                Subscribe to Newsletter
              </Button>
              <Link href="/shop">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  Shop Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
