import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

interface ServiceOffice {
  _id: string;
  name: string;
  address?: string;
  county?: string;
  subCounty?: string;
  area?: string;
  phone?: string;
}

export function AdminServiceOfficesContent() {
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
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/service-offices`);
      setOffices(res.data);
    } catch (error) {
      console.error("Error fetching service offices:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/service-offices/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/service-offices`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchOffices();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        address: "",
        county: "",
        subCounty: "",
        area: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error saving service office:", error);
    }
  };

  const handleEdit = (office: ServiceOffice) => {
    setFormData({
      name: office.name,
      address: office.address || "",
      county: office.county || "",
      subCounty: office.subCounty || "",
      area: office.area || "",
      phone: office.phone || "",
    });
    setEditingId(office._id);
    setShowForm(true);
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
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Service Offices Management</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service Office
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-bold mb-4">
            {editingId ? "Edit Service Office" : "Add New Service Office"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Office Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border rounded-md"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
            </div>
            
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />

            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="County"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                placeholder="Sub-County"
                value={formData.subCounty}
                onChange={(e) => setFormData({ ...formData, subCounty: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                placeholder="Area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? "Update" : "Create"} Service Office
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {offices.map((office) => (
          <div key={office._id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{office.name}</h4>
                {office.address && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Address:</strong> {office.address}
                  </p>
                )}
                <div className="text-sm text-gray-600 space-y-1">
                  {office.county && (
                    <p><strong>County:</strong> {office.county}</p>
                  )}
                  {office.subCounty && (
                    <p><strong>Sub-County:</strong> {office.subCounty}</p>
                  )}
                  {office.area && (
                    <p><strong>Area:</strong> {office.area}</p>
                  )}
                  {office.phone && (
                    <p><strong>Phone:</strong> {office.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
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
          </div>
        ))}
      </div>
    </div>
  );
}
