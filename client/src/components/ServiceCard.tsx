import { Service } from "@shared/schema";
import { Link } from "wouter";
import { Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        {service.images?.[0] ? (
          <img
            src={service.images[0]}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
        <h3 className="absolute bottom-4 left-4 font-display font-bold text-xl text-white">
          {service.name}
        </h3>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <p className="text-muted-foreground mb-6 line-clamp-3 flex-grow">
          {service.description}
        </p>

        <div className="space-y-2 mb-6">
          {service.benefits?.slice(0, 3).map((benefit, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              {benefit}
            </div>
          ))}
        </div>

        <Link href={`/services/${service.id}`} className="mt-auto">
          <Button className="w-full group-hover:bg-primary/90" variant="outline">
            Book Appointment
            <Calendar className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
