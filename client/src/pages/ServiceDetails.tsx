import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Share2, Calendar, MapPin, Clock, Phone, CheckCircle, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";
import ImageModal from "@/components/ImageModal";

interface Service {
  _id: string;
  id?: string | number;
  name: string;
  description: string;
  category: string;
  images: string[];
  benefits?: string[];
  isFeatured: boolean;
  isTrending: boolean;
  createdAt: string;
}

interface ServiceOffice {
  _id: string;
  id?: string | number;
  name: string;
  address: string;
  county: string;
  subCounty: string;
  area: string;
  phone: string;
  isActive: boolean;
}

export default function ServiceDetails() {
  const [match, params] = useRoute("/services/:id");
  const [, navigate] = useLocation();
  const id = params?.id;
  
  console.log("Route match:", match, "Params:", params, "ID:", id); // Debug log
  
  const [service, setService] = useState<Service | null>(null);
  const [offices, setOffices] = useState<ServiceOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState<ServiceOffice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [appointmentData, setAppointmentData] = useState({
    date: "",
    time: "",
    notes: ""
  });
  const { toast } = useToast();

  const token = localStorage.getItem("token");

  const primaryImage = service?.images?.[0];
  const imageSrc = primaryImage
    ? primaryImage.startsWith("http")
      ? primaryImage
      : primaryImage.startsWith("/")
        ? primaryImage
        : `${API_URL}${primaryImage}`
    : "";

  useEffect(() => {
    if (id) {
      console.log("Fetching data for ID:", id); // Debug log
      fetchService();
      fetchOffices();
    } else {
      console.log("No ID found in params"); // Debug log
      setLoading(false);
    }
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      console.log("Fetching service with ID:", id);
      console.log("API URL:", `${API_URL}/api/services/${id}`);
      const res = await axios.get(`${API_URL}/api/services/${id}`);
      console.log("Service response:", res.data);
      setService(res.data);
    } catch (error) {
      console.error("Error fetching service:", error);
      // Don't navigate immediately, show error state
      setService(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffices = async () => {
    try {
      console.log("Fetching service offices...");
      const res = await axios.get(`${API_URL}/api/service-offices`);
      console.log("Offices response:", res.data);
      const activeOffices = res.data.filter((office: ServiceOffice) => office.isActive);
      console.log("Active offices:", activeOffices);
      setOffices(activeOffices);
    } catch (error) {
      console.error("Error fetching offices:", error);
      setOffices([]);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({ title: "Error", description: "Please login to book an appointment" });
      navigate("/login");
      return;
    }

    if (!selectedOffice) {
      toast({ title: "Error", description: "Please select a service office" });
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/appointments`,
        {
          serviceId: service?._id || service?.id,
          date: appointmentData.date,
          time: appointmentData.time,
          office: selectedOffice.name,
          officeId: selectedOffice._id,
          location: `${selectedOffice.address}, ${selectedOffice.area}, ${selectedOffice.county}`,
          notes: appointmentData.notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: "Success", description: "Appointment booked successfully!" });
      setAppointmentData({ date: "", time: "", notes: "" });
      setSelectedOffice(null);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({ title: "Error", description: "Failed to book appointment" });
    }
  };

  const handleWhatsApp = () => {
    if (!service) return;
    const message = `Hi, I'm interested in booking an appointment for "${service.name}". Please provide available slots.`;
    const whatsappUrl = `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center">Service not found</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Service Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border/50 overflow-hidden aspect-square flex items-center justify-center p-8 relative group">
              {imageSrc ? (
                <>
                  <img 
                    src={imageSrc}
                    alt={service.name}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => {
                      setModalImage(imageSrc);
                      setIsModalOpen(true);
                    }}
                  />
                  <Button
                    onClick={() => {
                      setModalImage(imageSrc);
                      setIsModalOpen(true);
                    }}
                    variant="secondary"
                    size="icon"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="w-full h-full bg-secondary/30 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏥</div>
                    <p>No Image Available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
                {service.category}
              </span>
              {service.isFeatured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                  Featured
                </span>
              )}
              {service.isTrending && (
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  Trending
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
              {service.name}
            </h1>

            <div className="prose prose-slate max-w-none mb-8 text-muted-foreground">
              <p>{service.description}</p>
            </div>

            {/* Benefits */}
            {service.benefits && service.benefits.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Benefits:</h3>
                <div className="space-y-3">
                  {service.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mb-8">
              <Button
                onClick={handleWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 rounded-full text-base h-12"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Inquire via WhatsApp
              </Button>
              <Button size="lg" variant="outline" className="w-full rounded-full text-base h-12">
                <Share2 className="mr-2 h-5 w-5" />
                Share Service
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-8">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Flexible Hours</h4>
                  <p className="text-xs text-muted-foreground">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-bold text-sm">Multiple Locations</h4>
                  <p className="text-xs text-muted-foreground">Find us near you</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Booking Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Service Offices */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Service Locations</h2>
            <div className="space-y-4">
              {offices.map((office) => (
                <Card 
                  key={office._id} 
                  className={`p-6 cursor-pointer transition-all ${
                    selectedOffice?._id === office._id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedOffice(office)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{office.name}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{office.address}, {office.area}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{office.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{office.county}, {office.subCounty}</span>
                        </div>
                      </div>
                    </div>
                    {selectedOffice?._id === office._id && (
                      <CheckCircle className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Book Appointment</h2>
              
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Selected Location</label>
                  <div className="p-3 bg-secondary/20 rounded-lg">
                    {selectedOffice ? (
                      <div>
                        <p className="font-medium">{selectedOffice.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedOffice.address}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Please select a location above</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Date</label>
                    <input
                      type="date"
                      required
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                      className="border rounded p-2 w-full"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Time</label>
                    <input
                      type="time"
                      required
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                      className="border rounded p-2 w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Additional Notes</label>
                  <textarea
                    placeholder="Any specific requirements or concerns..."
                    value={appointmentData.notes}
                    onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                    className="border rounded p-2 w-full"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={!selectedOffice}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAppointmentData({ date: "", time: "", notes: "" });
                      setSelectedOffice(null);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </form>

              {!token && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please <a href="/login" className="underline font-medium">login</a> to book appointments.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Image Modal */}
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={modalImage}
          alt={service.name}
        />
      </div>
    </div>
  );
}
