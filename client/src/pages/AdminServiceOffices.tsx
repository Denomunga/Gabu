import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, MapPin, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/api";

interface ServiceOffice {
  _id: string;
  name: string;
  address: string;
  county: string;
  subCounty: string;
  area: string;
  phone: string;
  isActive: boolean;
}

export default function AdminServiceOffices() {
  const [offices, setOffices] = useState<ServiceOffice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    county: "",
    subCounty: "",
    area: "",
    phone: "",
    isActive: true,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/service-offices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffices(res.data);
    } catch (error) {
      console.error("Error fetching service offices:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "put" : "post";
      const url = editingId
        ? `${API_URL}/api/service-offices/${editingId}`
        : `${API_URL}/api/service-offices`;

      await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({
        name: "",
        address: "",
        county: "",
        subCounty: "",
        area: "",
        phone: "",
        isActive: true,
      });
      setEditingId(null);
      setShowForm(false);
      fetchOffices();
    } catch (error) {
      console.error("Error saving service office:", error);
      alert("Failed to save service office");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service office?")) return;
    try {
      await axios.delete(`${API_URL}/api/service-offices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOffices();
    } catch (error) {
      console.error("Error deleting service office:", error);
      alert("Failed to delete service office");
    }
  };

  const handleEdit = (office: ServiceOffice) => {
    setFormData({
      name: office.name,
      address: office.address,
      county: office.county,
      subCounty: office.subCounty,
      area: office.area,
      phone: office.phone,
      isActive: office.isActive,
    });
    setEditingId(office._id);
    setShowForm(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch(
        `${API_URL}/api/service-offices/${id}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOffices();
    } catch (error) {
      console.error("Error updating office status:", error);
      alert("Failed to update office status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Offices</h2>
          <p className="text-muted-foreground">Manage locations where your services are available</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Office
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Office Name *</label>
                <Input
                  placeholder="e.g., Nairobi Main Branch"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <Input
                  placeholder="e.g., +254 700 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <Input
                placeholder="e.g., 123 Healthcare Avenue, Building 5"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">County *</label>
                <Input
                  placeholder="e.g., Nairobi"
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sub-County *</label>
                <Input
                  placeholder="e.g., Westlands"
                  value={formData.subCounty}
                  onChange={(e) => setFormData({ ...formData, subCounty: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Area *</label>
                <Input
                  placeholder="e.g., Kileleshwa"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active (visible to customers)
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600">
                {editingId ? "Update Office" : "Add Office"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    name: "",
                    address: "",
                    county: "",
                    subCounty: "",
                    area: "",
                    phone: "",
                    isActive: true,
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {offices.length === 0 ? (
          <Card className="p-8 text-center">
            <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Service Offices Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first service office to let customers know where they can access your services.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Office
            </Button>
          </Card>
        ) : (
          offices.map((office) => (
            <Card key={office._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{office.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        office.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {office.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{office.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{office.phone}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {office.area}, {office.subCounty}, {office.county}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(office._id, office.isActive)}
                    className={office.isActive ? "text-orange-600" : "text-green-600"}
                  >
                    {office.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(office)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(office._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
