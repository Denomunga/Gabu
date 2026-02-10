import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UrgentBanner } from "@/components/UrgentBanner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Pages
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetails from "@/pages/ProductDetails";
import ServiceDetails from "@/pages/ServiceDetails";
import Services from "@/pages/Services";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import UserProfile from "@/pages/UserProfile";
import NewsDetail from "@/pages/NewsDetail";
import NewsList from "@/pages/NewsList";
import OffersList from "@/pages/OffersList";
import PagesList from "@/pages/PagesList";
import PageDetail from "@/pages/PageDetail";
import About from "@/pages/About";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProducts from "@/pages/AdminProducts";
import AdminServices from "@/pages/AdminServices";
import AdminServiceOffices from "@/pages/AdminServiceOffices";
import AdminPages from "@/pages/AdminPages";
import AdminNews from "@/pages/AdminNews";
import AdminUploads from "@/pages/AdminUploads";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/products/:id" component={ProductDetails} />
      <Route path="/services" component={Services} />
      <Route path="/services/:id" component={ServiceDetails} />
      <Route path="/cart" component={Cart} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/news/:id" component={NewsDetail} />
      <Route path="/news" component={NewsList} />
      <Route path="/offers" component={OffersList} />
      <Route path="/about" component={About} />
      <Route path="/pages" component={PagesList} />
      <Route path="/pages/:slug" component={PageDetail} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin-products" component={AdminProducts} />
      <Route path="/admin-services" component={AdminServices} />
      <Route path="/admin-service-offices" component={AdminServiceOffices} />
      <Route path="/admin-pages" component={AdminPages} />
      <Route path="/admin-news" component={AdminNews} />
      <Route path="/admin-uploads" component={AdminUploads} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen font-sans">
          <UrgentBanner />
          <Navbar />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
