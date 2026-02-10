import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Clock, User, LogOut, ShoppingBag } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  county?: string;
  subCounty?: string;
  area?: string;
}

interface UserOrder {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface UserAppointment {
  _id: string;
  serviceId: { name: string };
  date: string;
  status: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    county: "",
    subCounty: "",
    area: "",
  });
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userRes, ordersRes, appointmentsRes, favoritesRes] = await Promise.all([
        axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUser(userRes.data);
      setFormData({
        username: userRes.data.username,
        phone: userRes.data.phone || "",
        county: userRes.data.county || "",
        subCounty: userRes.data.subCounty || "",
        area: userRes.data.area || "",
      });
      setOrders(ordersRes.data);
      setAppointments(appointmentsRes.data);
      setFavorites(favoritesRes.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({ title: "Error", description: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/api/users/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Success", description: "Profile updated!" });
      setEditMode(false);
      fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: "Failed to update profile" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    toast({ title: "Success", description: "Logged out successfully" });
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!user) return <div className="p-20 text-center">User not found</div>;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Profile Info */}
          <div className="md:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
                <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase">
                  {user.role}
                </span>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                {user.phone && (
                  <p><strong>Phone:</strong> {user.phone}</p>
                )}
                {user.county && (
                  <p><strong>Location:</strong> {user.area}, {user.subCounty}, {user.county}</p>
                )}
              </div>

              {!editMode ? (
                <Button onClick={() => setEditMode(true)} className="w-full mb-2">
                  Edit Profile
                </Button>
              ) : null}

              <Button variant="destructive" onClick={handleLogout} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </Card>
          </div>

          {/* Edit Form */}
          {editMode && (
            <div className="md:col-span-2">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">County</label>
                    <input
                      type="text"
                      value={formData.county}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>

        {/* Main Content */}
        {!editMode && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Orders */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Recent Orders
              </h3>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <Card className="p-4 text-center text-gray-600">
                    No orders yet
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order._id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">Order #{order._id.slice(-8)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-lg font-bold">KES {order.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Appointments */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                My Appointments
              </h3>
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <Card className="p-4 text-center text-gray-600">
                    No appointments booked
                  </Card>
                ) : (
                  appointments.map((apt) => (
                    <Card key={apt._id} className="p-4">
                      <p className="font-semibold">{apt.serviceId?.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(apt.date).toLocaleDateString()} {new Date(apt.date).toLocaleTimeString()}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                        {apt.status}
                      </span>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Favorites */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6" />
                Favorites ({favorites.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {favorites.length === 0 ? (
                  <p className="text-gray-600">No favorites yet</p>
                ) : (
                  favorites.map((fav: any) => (
                    <Card key={fav._id} className="p-3 text-center hover:shadow-lg transition">
                      <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold line-clamp-2">Favorite Item</p>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

