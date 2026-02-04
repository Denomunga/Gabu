import { useServices } from "@/hooks/use-services";
import { ServiceCard } from "@/components/ServiceCard";

export default function Services() {
  const { data: services, isLoading } = useServices();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
        {/* Background texture or image */}
        <div className="absolute inset-0 bg-primary/20 pattern-grid-lg opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Our Medical Services</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Comprehensive healthcare solutions tailored to your needs. Book an appointment with our specialists today.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-card rounded-2xl shadow-sm animate-pulse border border-border/50" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services?.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
