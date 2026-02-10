import { News } from "@shared/schema";
import { Link } from "wouter";
import { Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";

interface NewsCardProps {
  news: News;
}

export function NewsCard({ news }: NewsCardProps) {
  const newsId = news._id || news.id;
  console.log("NewsCard - news item:", news); // Debug log
  console.log("NewsCard - using ID:", newsId); // Debug log
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
    >
      <Link href={`/news/${newsId}`} className="block">
        {news.imageUrl ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={news.imageUrl.startsWith('http') ? news.imageUrl : `${API_URL}${news.imageUrl}`}
              alt={news.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {news.isUrgent && (
              <div className="absolute top-2 left-2">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase">
                  Urgent
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 bg-secondary/30 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📰</div>
              <p>No Image</p>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="w-4 h-4" />
            {news.createdAt && new Date(news.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
            {news.type === 'offer' && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Offer
              </span>
            )}
          </div>
          
          <h3 className="font-display font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {news.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {news.content}
          </p>
          
          <div className="flex items-center text-primary font-medium text-sm group-hover:text-primary/80">
            Read More <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
