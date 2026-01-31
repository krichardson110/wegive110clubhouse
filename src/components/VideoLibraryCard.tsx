import { useState } from "react";
import { Play, Clock, X } from "lucide-react";
import { Video } from "@/data/videos";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoLibraryCardProps {
  video: Video;
  categoryColor: string;
}

const VideoLibraryCard = ({ video, categoryColor }: VideoLibraryCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-secondary overflow-hidden">
          <img 
            src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback to hqdefault if maxresdefault doesn't exist
              e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
            }}
          />
          
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent`} />
          
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300 group-hover:bg-primary">
              <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
            </div>
          </div>
          
          {/* Duration badge */}
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/80 text-xs text-white flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {video.duration}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">
            {video.title}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {video.description}
          </p>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 bg-card border-border overflow-hidden">
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Video embed */}
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            
            {/* Video info */}
            <div className="p-6">
              <h3 className="font-display text-2xl text-foreground mb-2">{video.title}</h3>
              <p className="text-muted-foreground">{video.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoLibraryCard;
