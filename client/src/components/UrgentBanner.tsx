import { useNews } from "@/hooks/use-news";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function UrgentBanner() {
  const { data: news } = useNews();
  const [isVisible, setIsVisible] = useState(true);

  const urgentNews = news?.find((item) => item.isUrgent);

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
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium text-sm md:text-base">
              <span className="font-bold uppercase tracking-wider mr-2">Urgent:</span>
              {urgentNews.title} — {urgentNews.content}
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
