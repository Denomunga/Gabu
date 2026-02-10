import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

interface Service {
  _id: string;
  name: string;
  description: string;
  category?: string;
  images?: string[];
  benefits?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  createdAt: string;
}

export function AdminServicesContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Consultation",
    images: [""],
    benefits: [""],
    isFeatured: false,
    isTrending: false,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/services`);
      setServices(res.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images.filter(img => img !== ""), res.data.url]
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        ...formData,
        images: formData.images.filter(img => img !== ""),
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ""),
      };

      if (editingId) {
        await axios.put(`${API_URL}/api/services/${editingId}`, serviceData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/services`, serviceData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchServices();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        category: "Consultation",
        images: [""],
        benefits: [""],
        isFeatured: false,
        isTrending: false,
      });
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category || "Consultation",
      images: service.images?.length ? service.images : [""],
      benefits: service.benefits?.length ? service.benefits : [""],
      isFeatured: service.isFeatured || false,
      isTrending: service.isTrending || false,
    });
    setEditingId(service._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      await axios.delete(`${API_URL}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, ""]
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Services Management</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-bold mb-4">
            {editingId ? "Edit Service" : "Add New Service"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Service Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border rounded-md"
                required
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="Consultation">Consultation</option>
                <option value="Training">Training</option>
                <option value="Checkups">Checkups</option>
              </select>
            </div>
            
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Benefits</label>
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter a benefit"
                    value={benefit}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  {formData.benefits.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeBenefit(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addBenefit}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Benefit
              </Button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Images</label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  {image ? (
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <img src={image} alt="Preview" className="w-16 h-16 object-cover" />
                      <span className="text-sm text-gray-600 flex-1">{image}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1"
                      />
                      {uploading && <span className="text-sm text-gray-600">Uploading...</span>}
                    </div>
                  )}
                </div>
              ))}
              {formData.images.filter(img => img !== "").length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, images: [...formData.images, ""] })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              )}
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                Featured Service
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                />
                Trending Service
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? "Update" : "Create"} Service
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
        {services.map((service) => (
          <div key={service._id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
            <div className="flex items-center gap-4">
              {service.images?.[0] && (
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <h4 className="font-semibold">{service.name}</h4>
                {service.category && (
                  <p className="text-sm text-gray-600">{service.category}</p>
                )}
                <p className="text-sm text-gray-600 line-clamp-1">{service.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(service)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(service._id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
