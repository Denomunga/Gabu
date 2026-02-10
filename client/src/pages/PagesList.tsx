import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function PagesList() {
  const { data: pages } = useQuery({
    queryKey: ["pages"],
    queryFn: () => fetch('/api/pages').then(r => r.json())
  });

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Pages</h1>
      <div className="grid gap-4">
        {pages?.map((p: any) => (
          <Link key={p._id} href={`/pages/${p.slug}`}>
            <a className="p-4 border rounded-md hover:shadow">{p.title}</a>
          </Link>
        )) || []}
      </div>
    </div>
  );
}
