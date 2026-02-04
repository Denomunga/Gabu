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
import Services from "@/pages/Services";
import Cart from "@/pages/Cart";
import NotFound from "@/pages/not-found";

// Auth (placeholder for now if pages not fully implemented)
const Login = () => <div className="p-20 text-center">Login Page Placeholder</div>;
const Register = () => <div className="p-20 text-center">Register Page Placeholder</div>;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/products/:id" component={ProductDetails} />
      <Route path="/services" component={Services} />
      <Route path="/cart" component={Cart} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* 404 Fallback */}
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
