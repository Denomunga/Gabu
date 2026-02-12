import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, ShoppingBag, Package, BarChart3, FileText, Megaphone, Stethoscope, Building } from "lucide-react";
import { API_URL } from "@/lib/api";
import { useUser } from "@/hooks/use-auth";
import { AdminProductsContent } from "@/components/admin/AdminProductsContent";
import { AdminNewsContent } from "@/components/admin/AdminNewsContent";
import { AdminServicesContent } from "@/components/admin/AdminServicesContent";
import { AdminServiceOfficesContent } from "@/components/admin/AdminServiceOfficesContent";

interface Analytics {
  totalUsers: number;
  totalProducts: number;
  totalServices: number;
  totalOrders: number;
  totalAppointments: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { data: user, isLoading: userLoading } = useUser();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/login");
      return;
    }
    
    if (!userLoading && user && user.role !== "admin" && user.role !== "super_admin") {
      setError("You do not have permission to access the admin dashboard");
      return;
    }
    
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      fetchAnalytics();
    }
  }, [user, userLoading, navigate]);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const res = await axios.get(`${API_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      if (error.response?.status === 403) {
        setError("You do not have permission to access the admin dashboard");
      } else {
        setError("Failed to load analytics");
      }
    }
  };

  if (userLoading) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  const data = [
    { name: "Users", value: analytics.totalUsers },
    { name: "Products", value: analytics.totalProducts },
    { name: "Services", value: analytics.totalServices },
    { name: "Orders", value: analytics.totalOrders },
  ];

  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "services", label: "Services", icon: Stethoscope },
    { id: "service-offices", label: "Service Offices", icon: Building },
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "news", label: "News", icon: Megaphone },
    { id: "pages", label: "Pages", icon: FileText },
    { id: "uploads", label: "Uploads", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold">DR Gabriel</h1>
            <p className="text-sm text-gray-400">Admin Panel</p>
          </div>

          <nav className="mt-8 space-y-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-600"
                      : "hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold mt-2">{analytics.totalUsers}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500 opacity-50" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Products</p>
                    <p className="text-3xl font-bold mt-2">{analytics.totalProducts}</p>
                  </div>
                  <Package className="w-10 h-10 text-green-500 opacity-50" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold mt-2">{analytics.totalOrders}</p>
                  </div>
                  <ShoppingBag className="w-10 h-10 text-yellow-500 opacity-50" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">KES {analytics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-purple-500 opacity-50" />
                </div>
              </Card>
            </div>

            {/* Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Tab Content */}
            <div className="mt-8">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <Card className="p-6">
                    <h3 className="font-bold mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Services</p>
                        <p className="text-2xl font-bold">{analytics.totalServices}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Appointments</p>
                        <p className="text-2xl font-bold">{analytics.totalAppointments}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "products" && <AdminProductsContent />}

              {activeTab === "services" && <AdminServicesContent />}

              {activeTab === "service-offices" && <AdminServiceOfficesContent />}

              {activeTab === "users" && (
                <Card className="p-6">
                  <h3 className="font-bold mb-4">User Management</h3>
                  <p className="text-gray-600">User management features coming soon</p>
                </Card>
              )}

              {activeTab === "news" && <AdminNewsContent />}

              {activeTab === "orders" && (
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Orders</h3>
                  <p className="text-gray-600">Order management features coming soon</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
