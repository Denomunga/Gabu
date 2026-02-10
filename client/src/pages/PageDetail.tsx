import { useEffect, useState } from "react";
import { useRoute } from "wouter";

export default function PageDetail() {
  const [, params] = useRoute("/pages/:slug");
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    if (!params?.slug) return;
    fetch(`/api/pages/${params.slug}`).then((r) => r.json()).then(setPage).catch(() => setPage(null));
  }, [params]);

  if (!page) return <div className="max-w-4xl mx-auto py-12">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      {page.imageUrl && <img src={page.imageUrl} alt={page.title} className="w-full rounded mb-6" />}
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
