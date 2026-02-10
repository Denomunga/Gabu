import { useEffect, useState } from "react";
import { Link } from "wouter";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, ArrowRight, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";

export default function NewsList() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "news" | "offer">("all");

  useEffect(() => {
    axios.get(`${API_URL}/api/news`)
      .then((r) => {
        setItems(r.data);
        setFilteredItems(r.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = items;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, filterType]);

  const getTypeColor = (type: string) => {
    return type === 'offer' 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getTypeIcon = (type: string) => {
    return type === 'offer' ? "🎁" : "📰";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80')] opacity-5 bg-cover bg-center" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Latest News & Offers
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Stay updated with our latest announcements, health tips, and exclusive offers
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search news and offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-primary/20 focus:border-primary"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { value: "all", label: "All" },
                { value: "news", label: "News"},
                { value: "offer", label: "Offers" }
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={filterType === filter.value ? "default" : "outline"}
                  onClick={() => setFilterType(filter.value as any)}
                  className="gap-0 rounded-2x1"
                >
                  <span></span>
                  {filter.label}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Count */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </p>
          {searchTerm && (
            <Button variant="ghost" onClick={() => setSearchTerm("")}>
              Clear search
            </Button>
          )}
        </div>
      </section>

      {/* News Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "Try adjusting your search terms" : "No news or offers available at the moment"}
            </p>
            {(searchTerm || filterType !== "all") && (
              <Button onClick={() => {
                setSearchTerm("");
                setFilterType("all");
              }}>
                Clear all filters
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
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  {/* Card Header */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `${API_URL}${item.imageUrl}`}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl">{getTypeIcon(item.type)}</div>
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${getTypeColor(item.type)} border backdrop-blur-sm`}>
                        {item.type === 'offer' ? 'Offer' : 'News'}
                      </Badge>
                    </div>

                    {/* Urgent Badge */}
                    {item.isUrgent && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <Link href={`/news/${item._id || item.id}`}>
                      <h3 className="font-display font-bold text-xl mb-3 group-hover:text-primary transition-colors line-clamp-2">
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

                    <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                      {item.content}
                    </p>

                    <Link href={`/news/${item._id || item.id}`}>
                      <Button className="w-full group-hover:bg-primary/90 transition-colors">
                        Read More
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
