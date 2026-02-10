import { Link } from "wouter";
import { Package, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-white">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                <Package className="w-5 h-5" />
              </div>
              Dr Gabriel
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted partner for premium health and wellness products. We deliver quality healthcare solutions directly to your doorstep.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/shop" className="hover:text-primary transition-colors">Shop Products</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Our Services</Link></li>
              <li><Link href="/news" className="hover:text-primary transition-colors">Latest News</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>123 Health Avenue, Medical Plaza<br />Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>support@Dr_Gabriel.co.ke</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white mb-6">Newsletter</h4>
            <p className="text-slate-400 text-sm mb-4">Subscribe to receive updates and exclusive offers.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="bg-slate-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-1 focus:ring-primary"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Join
              </button>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="#" className="hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Dr Gabriel Kenya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
