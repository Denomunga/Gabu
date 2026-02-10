import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Truck, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ServiceCard } from "@/components/ServiceCard";
import { NewsCard } from "@/components/NewsCard";
import { useProducts } from "@/hooks/use-products";
import { useServices } from "@/hooks/use-services";
import { useNews } from "@/hooks/use-news";
import { useFavorites } from "@/hooks/use-favorites";
import { motion } from "framer-motion";

export default function Home() {
  const { data: featuredProducts, isLoading: loadingProducts } = useProducts({ isFeatured: true });
  const { data: services, isLoading: loadingServices } = useServices();
  const { data: news, isLoading: loadingNews } = useNews();
  const { sortProductsByFavorites } = useFavorites();

  const sortedFeaturedProducts = sortProductsByFavorites(featuredProducts);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/30 pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-[1.1] mb-6">
                Premium Healthcare <br />
                <span className="text-primary">Delivered to You</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Experience world-class wellness products and expert medical services from the comfort of your home. Trusted by thousands in Kenya.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop">
                  <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-2">
                    Book Service
                  </Button>
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span>Certified Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <span>Expert Support</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Abstract decorative blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/20 rounded-full blur-2xl -z-10" />
              
              {/* Hero Image from Unsplash - Medical Theme */}
              {/* Doctor consultation / pharmacy concept */}
              <img 
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=1000" 
                alt="Medical Professional" 
                className="relative z-10 w-full rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "Countrywide delivery within 24-48 hours." },
              { icon: ShieldCheck, title: "Quality Guaranteed", desc: "100% authentic products sourced directly." },
              { icon: Clock, title: "24/7 Support", desc: "Expert medical advice whenever you need it." },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked wellness essentials for you</p>
            </div>
            <Link href="/shop">
              <Button variant="ghost" className="hidden sm:flex group">
                View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[400px] bg-secondary/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedFeaturedProducts?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News & Offers Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold mb-2">Latest News & Offers</h2>
              <p className="text-muted-foreground">Stay updated with our latest announcements and special deals</p>
            </div>
            <Link href="/news">
              <Button variant="ghost" className="hidden sm:flex group">
                View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {loadingNews ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-secondary/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : news && news.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {news.slice(0, 3).map((newsItem) => (
                <NewsCard key={newsItem._id || newsItem.id} news={newsItem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border">
              <h3 className="text-lg font-medium text-muted-foreground">No news yet</h3>
              <p className="text-sm text-muted-foreground mt-2">Check back later for updates and offers.</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/news">
              <Button size="lg" className="rounded-full">
                View All News <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Professional Medical Services</h2>
            <p className="text-slate-400 text-lg">
              Book appointments with certified specialists. We bring quality healthcare closer to you.
            </p>
          </div>

          {loadingServices ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {services?.slice(0, 3).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/services">
              <Button size="lg" className="rounded-full px-8 bg-white text-slate-900 hover:bg-white/90">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
