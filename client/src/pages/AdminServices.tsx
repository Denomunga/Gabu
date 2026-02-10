import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  benefits?: string[];
  isFeatured: boolean;
  isTrending: boolean;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Consultation",
    images: [] as string[],
    benefits: [""] as string[],
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
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images.filter(img => img !== ""), res.data.absoluteUrl || res.data.url]
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "put" : "post";
      const url = editingId
        ? `${API_URL}/api/services/${editingId}`
        : `${API_URL}/api/services`;

      const data = {
        ...formData,
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ""),
        images: formData.images.filter(img => img !== ""),
      };

      await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({
        name: "",
        description: "",
        category: "Consultation",
        images: [] as string[],
        benefits: [""] as string[],
        isFeatured: false,
        isTrending: false,
      });
      setEditingId(null);
      setShowForm(false);
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category || "Consultation",
      images: service.images || [],
      benefits: service.benefits?.length ? service.benefits : [""],
      isFeatured: service.isFeatured || false,
      isTrending: service.isTrending || false,
    });
    setEditingId(service._id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Services</h2>
        <Button onClick={() => setShowForm(!showForm)} disabled={uploading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg border space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Service Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border rounded p-2"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border rounded p-2 w-full"
            >
              <option value="Consultation">Consultation</option>
              <option value="Training">Training</option>
              <option value="Checkups">Checkups</option>
            </select>
          </div>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border rounded p-2 w-full"
            required
          />

          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Service Images</label>
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="service-image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="service-image-upload"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Image"}
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {formData.images.filter(img => img !== "").map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.startsWith("http") ? image : image.startsWith("/") ? image : `${API_URL}${image}`}
                    alt={`Service ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Benefits</label>
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter a benefit"
                  value={benefit}
                  onChange={(e) => updateBenefit(index, e.target.value)}
                  className="border rounded p-2 flex-1"
                />
                {formData.benefits.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
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
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Benefit
            </Button>
          </div>

          <div className="flex gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
              />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isTrending}
                onChange={(e) =>
                  setFormData({ ...formData, isTrending: e.target.checked })
                }
              />
              Trending
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-blue-600">
              {editingId ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {services.map((service) => (
          <div
            key={service._id}
            className="flex items-center justify-between bg-white p-4 rounded-lg border"
          >
            <div className="flex-1">
              <h3 className="font-semibold">{service.name}</h3>
              <p className="text-sm text-gray-600">{service.category}</p>
              <div className="flex gap-2 mt-1">
                {service.isFeatured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Featured</span>
                )}
                {service.isTrending && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Trending</span>
                )}
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
