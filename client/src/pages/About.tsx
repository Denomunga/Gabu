import { useEffect, useState } from "react";

export default function About() {
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    fetch('/api/pages/about').then((r) => {
      if (!r.ok) return null;
      return r.json();
    }).then(setPage).catch(() => setPage(null));
  }, []);

  if (!page) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      {page.imageUrl && <img src={page.imageUrl} alt={page.title} className="w-full rounded mb-6" />}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
