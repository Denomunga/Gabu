import { useNews } from "@/hooks/use-news";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";

export function UrgentBanner() {
  const { data: news } = useNews();
  const [isVisible, setIsVisible] = useState(true);
  const [, navigate] = useLocation();

  const urgentNews = news?.find((item) => item.isUrgent);

  const handleUrgentNewsClick = () => {
    if (urgentNews) {
      const newsId = urgentNews._id || urgentNews.id;
      navigate(`/news/${newsId}`);
    }
  };

  if (!urgentNews || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-red-500 text-white relative z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <button
              onClick={handleUrgentNewsClick}
              className="font-medium text-sm md:text-base text-left hover:underline transition-colors flex-1"
            >
              <span className="font-bold uppercase tracking-wider mr-2">Urgent:</span>
              {urgentNews.title} — {urgentNews.content}
            </button>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 ml-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
