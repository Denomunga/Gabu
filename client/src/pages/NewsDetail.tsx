import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Share2, Calendar, AlertCircle, Maximize2 } from "lucide-react";
import ImageModal from "@/components/ImageModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface NewsItem {
  _id?: string;
  id?: string | number;
  title: string;
  content: string;
  type: "news" | "offer";
  isUrgent: boolean;
  imageUrl?: string;
  authorName?: string;
  createdAt: string;
}

export default function NewsDetail() {
  const [, params] = useRoute("/news/:id");
  const [, navigate] = useLocation();
  const id = params?.id;

  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

  useEffect(() => {
    if (id) fetchNews();
  }, [id]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log("Fetching news with ID:", id); // Debug log
      const res = await axios.get(`${API_URL}/api/news/${id}`);
      console.log("News response:", res.data); // Debug log
      setNews(res.data);
    } catch (error: any) {
      console.error("Error fetching news:", error);
      console.error("Error details:", error.response?.data); // Debug log
      navigate("/news");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!news) return;
    const message = `Hi, I saw your news: "${news.title}". I'd like to know more about this.`;
    const whatsappUrl = `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!news) return <div className="p-20 text-center">News not found</div>;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Urgent Banner */}
        {news.isUrgent && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-900">Urgent Update</p>
              <p className="text-sm text-red-800">This is marked as urgent news</p>
            </div>
          </div>
        )}

        {/* News Card */}
        <Card className="overflow-hidden mb-8">
          {/* Featured Image */}
          {news.imageUrl && (
            <div className="w-full h-96 overflow-hidden relative group">
              <img
                src={(() => {
                  const finalSrc = news.imageUrl.startsWith('http') ? news.imageUrl : `${API_URL}${news.imageUrl}`;
                  console.log("NewsDetail - imageUrl:", news.imageUrl);
                  console.log("NewsDetail - final src:", finalSrc);
                  return finalSrc;
                })()}
                alt={news.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => {
                  if (news.imageUrl) {
                    const finalSrc = news.imageUrl.startsWith('http') ? news.imageUrl : `${API_URL}${news.imageUrl}`;
                    setModalImage(finalSrc);
                    setIsModalOpen(true);
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (news.imageUrl) {
                    const finalSrc = news.imageUrl.startsWith('http') ? news.imageUrl : `${API_URL}${news.imageUrl}`;
                    setModalImage(finalSrc);
                    setIsModalOpen(true);
                  }
                }}
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  news.type === 'offer'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {news.type}
                </span>
                {news.isUrgent && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-800">
                    Urgent
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4 text-foreground">{news.title}</h1>

              {/* Meta Info */}
              <div className="flex items-center gap-6 text-sm text-gray-600 pb-6 border-b">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                </div>
                {news.authorName && (
                  <div>
                    <span className="font-semibold text-foreground">By {news.authorName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-slate max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                {news.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 border-t pt-6">
              <Button
                onClick={handleWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat on WhatsApp
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </Card>

        {/* Related News */}
        <div>
          <h2 className="text-2xl font-bold mb-6">More {news.type}</h2>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full"
          >
            Back to Home
          </Button>
        </div>

        {/* Image Modal */}
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={modalImage}
          alt={news.title}
        />
      </div>
    </div>
  );
}
