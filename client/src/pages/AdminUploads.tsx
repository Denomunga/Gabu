import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AdminUploads() {
  const token = localStorage.getItem("token");
  const [files, setFiles] = useState<any[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    (async () => {
      if (!token) return navigate("/login");
      try {
        const res = await axios.get('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } });
        const role = res.data?.role;
        if (!(role === 'admin' || role === 'super_admin')) return navigate('/');
      } catch (err) { return navigate('/login'); }
      fetchFiles();
    })();
  }, []);

  const fetchFiles = async () => {
    const res = await axios.get('/api/uploads/list');
    setFiles(res.data);
  };

  const remove = async (filename: string) => {
    if (!confirm('Delete this image?')) return;
    await axios.delete(`/api/uploads/${filename}`);
    fetchFiles();
  };

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Uploaded Images</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {files.map((f) => (
          <div key={f.filename} className="p-2 border rounded">
            <img src={f.url} alt={f.filename} className="w-full h-40 object-cover rounded mb-2" />
            <div className="flex items-center justify-between text-sm">
              <div className="truncate">{f.filename}</div>
              <div className="flex gap-2">
                <a href={f.url} target="_blank" rel="noreferrer" className="text-primary">Open</a>
                <Button variant="destructive" size="sm" onClick={() => remove(f.filename)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
