import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AdminPages() {
  const token = localStorage.getItem("token");
  const [pages, setPages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  // Ensure only admins can access
  const [, navigate] = useLocation();
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      try {
        const res = await axios.get(`/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
        const role = res.data?.role;
        if (!(role === "admin" || role === "super_admin")) navigate("/");
      } catch (err) {
        navigate("/login");
      }
    })();
  }, []);

  const fetchPages = async () => {
    const res = await axios.get(`/api/pages`);
    setPages(res.data);
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    await axios.delete(`/api/pages/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchPages();
  };

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Pages</h1>
        <Button onClick={() => setEditing({})}>Add Page</Button>
      </div>

      <div className="grid gap-4">
        {pages.map((p) => (
          <div key={p._id} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-muted-foreground">/{p.slug}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
              <Button variant="destructive" onClick={() => deletePage(p._id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-8 bg-white p-6 border rounded">
          <h2 className="text-lg font-semibold mb-4">{editing._id ? "Edit" : "New"} Page</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formEl = e.target as HTMLFormElement;
            const form = new FormData(formEl);
            let imageUrl = String(form.get("imageUrl") || "");

            const file = (formEl.querySelector('input[type=file]') as HTMLInputElement | null)?.files?.[0];
            if (file) {
              const upload = new FormData();
              upload.append('file', file);
              const upRes = await axios.post('/api/upload', upload, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
              imageUrl = upRes.data.url;
            }

            const body: any = {
              title: form.get("title"),
              slug: form.get("slug"),
              content: form.get("content"),
              imageUrl,
            };
            if (editing._id) {
              await axios.put(`/api/pages/${editing._id}`, body, { headers: { Authorization: `Bearer ${token}` } });
            } else {
              await axios.post(`/api/pages`, body, { headers: { Authorization: `Bearer ${token}` } });
            }
            setEditing(null);
            fetchPages();
          }}>
            <div className="grid gap-2">
              <input name="title" defaultValue={editing.title || ''} placeholder="Title" className="input" />
              <input name="slug" defaultValue={editing.slug || ''} placeholder="slug (about)" className="input" />
              <input type="file" name="file" accept="image/*" className="" />
              <input name="imageUrl" defaultValue={editing.imageUrl || ''} placeholder="Or image URL" className="input" />
              <textarea name="content" defaultValue={editing.content || ''} placeholder="HTML content" className="textarea" />
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
