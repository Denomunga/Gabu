import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { API_URL } from "@/lib/api";

export default function AdminNews() {
  const token = localStorage.getItem("token");
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [, navigate] = useLocation();

  useEffect(() => { fetchNews(); }, []);

  useEffect(() => {
    (async () => {
      if (!token) return navigate("/login");
      try {
        const res = await axios.get(`${API_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
        const role = res.data?.role;
        if (!(role === "admin" || role === "super_admin")) navigate("/");
      } catch (err) {
        navigate("/login");
      }
    })();
  }, []);

  const fetchNews = async () => {
    const res = await axios.get(`${API_URL}/api/news`);
    setItems(res.data);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this news item?")) return;
    await axios.delete(`${API_URL}/api/news/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchNews();
  };

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage News & Offers</h1>
        <Button onClick={() => setEditing({})}>Add News/Offer</Button>
      </div>

      <div className="grid gap-4">
        {items.map((n) => (
          <div key={n._id} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm text-muted-foreground">{n.type} • {new Date(n.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(n)}>Edit</Button>
              <Button variant="destructive" onClick={() => remove(n._id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-8 bg-white p-6 border rounded">
          <h2 className="text-lg font-semibold mb-4">{editing._id ? "Edit" : "New"} News</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formEl = e.target as HTMLFormElement;
            const form = new FormData(formEl);
            let imageUrl = String(form.get("imageUrl") || "");

            const file = (formEl.querySelector('input[type=file]') as HTMLInputElement | null)?.files?.[0];
            if (file) {
              const upload = new FormData();
              upload.append('file', file);
              const upRes = await axios.post(`${API_URL}/api/upload`, upload, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
              imageUrl = upRes.data.url;
            }

            const body: any = {
              title: form.get("title"),
              content: form.get("content"),
              type: form.get("type"),
              isUrgent: form.get("isUrgent") === "on",
              imageUrl,
              authorName: form.get("authorName"),
            };
            if (editing._id) {
              await axios.put(`${API_URL}/api/news/${editing._id}`, body, { headers: { Authorization: `Bearer ${token}` } });
            } else {
              await axios.post(`${API_URL}/api/news`, body, { headers: { Authorization: `Bearer ${token}` } });
            }
            setEditing(null);
            fetchNews();
          }}>
            <div className="grid gap-2">
              <input name="title" defaultValue={editing.title || ''} placeholder="Title" className="input" />
              <input name="authorName" defaultValue={editing.authorName || ''} placeholder="Author" className="input" />
              <select name="type" defaultValue={editing.type || 'news'} className="input">
                <option value="news">News</option>
                <option value="offer">Offer</option>
              </select>
              <input type="file" name="file" accept="image/*" className="" />
              <input type="text" name="imageUrl" defaultValue={editing.imageUrl || ''} placeholder="Or image URL" className="input" />
              <label className="flex items-center gap-2"><input type="checkbox" name="isUrgent" defaultChecked={editing.isUrgent} /> Mark as urgent</label>
              <textarea name="content" defaultValue={editing.content || ''} placeholder="Content" className="textarea" />
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
