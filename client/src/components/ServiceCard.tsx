import { Service } from "@shared/schema";
import { Link } from "wouter";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const primaryImage = service.images?.[0];
  const imageSrc = primaryImage
    ? primaryImage.startsWith("http")
      ? primaryImage
      : primaryImage.startsWith("/")
        ? primaryImage
        : `${API_URL}${primaryImage}`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
    >
      <Link href={`/services/${service._id || service.id}`} className="block">
        {imageSrc ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={imageSrc}
              alt={service.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {service.isFeatured && (
              <div className="absolute top-2 left-2">
                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
                  Featured
                </span>
              </div>
            )}
            {service.isTrending && (
              <div className="absolute top-2 right-2">
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
                  Trending
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 bg-secondary/30 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🏥</div>
              <p>No Image</p>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            {service.category && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {service.category}
              </span>
            )}
            {service.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(service.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
            )}
          </div>
          
          <h3 className="font-display font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {service.name}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {service.description}
          </p>

          {service.benefits && service.benefits.length > 0 && (
            <div className="space-y-1 mb-4">
              {service.benefits.slice(0, 2).map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="line-clamp-1">{benefit}</span>
                </div>
              ))}
              {service.benefits.length > 2 && (
                <div className="text-xs text-muted-foreground ml-4">
                  +{service.benefits.length - 2} more benefits
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-primary font-medium text-sm group-hover:text-primary/80">
              View Details <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Available
            </div>
          </div>
        </div>
      </Link>
      
      <div className="px-6 pb-6">
        <Button className="w-full group-hover:bg-primary/90" asChild>
          <Link href={`/services/${service._id || service.id}`}>
            Book Appointment
            <Calendar className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
