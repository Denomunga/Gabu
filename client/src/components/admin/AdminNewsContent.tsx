import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";

interface News {
  _id: string;
  title: string;
  content: string;
  type: "news" | "offer";
  imageUrl?: string;
  isUrgent?: boolean;
  authorName?: string;
  createdAt: string;
}

export function AdminNewsContent() {
  const [news, setNews] = useState<News[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "news" as "news" | "offer",
    imageUrl: "",
    isUrgent: false,
    authorName: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/news`);
      setNews(res.data);
    } catch (error) {
      console.error("Error fetching news:", error);
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

      setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/news/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/news`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchNews();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        content: "",
        type: "news",
        imageUrl: "",
        isUrgent: false,
        authorName: "",
      });
    } catch (error) {
      console.error("Error saving news:", error);
    }
  };

  const handleEdit = (item: News) => {
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type || "news",
      imageUrl: item.imageUrl || "",
      isUrgent: item.isUrgent || false,
      authorName: item.authorName || "",
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`${API_URL}/api/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNews();
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">News & Offers Management</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add News/Offer
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-bold mb-4">
            {editingId ? "Edit News/Offer" : "Add New News/Offer"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-3 py-2 border rounded-md"
                required
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "news" | "offer" })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="news">News</option>
                <option value="offer">Offer</option>
              </select>
            </div>
            
            <textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
              required
            />

            <input
              type="text"
              placeholder="Author Name"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Image</label>
              {formData.imageUrl ? (
                <div className="flex items-center gap-2 p-2 border rounded">
                  <img src={formData.imageUrl} alt="Preview" className="w-16 h-16 object-cover" />
                  <span className="text-sm text-gray-600 flex-1">{formData.imageUrl}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
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

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isUrgent}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
              />
              Mark as Urgent
            </label>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? "Update" : "Create"} {formData.type === "news" ? "News" : "Offer"}
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
        {news.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{item.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    item.type === "news" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  }`}>
                    {item.type}
                  </span>
                  {item.isUrgent && (
                    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.content}</p>
                {item.authorName && (
                  <p className="text-xs text-gray-500">By: {item.authorName}</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item._id)}
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
