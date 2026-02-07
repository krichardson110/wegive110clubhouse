import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Paperclip, X, FileText, Image, File, Loader2 } from "lucide-react";
import { EventAttachment } from "@/types/schedule";
import { useToast } from "@/hooks/use-toast";

interface EventAttachmentUploadProps {
  attachments: EventAttachment[];
  onChange: (attachments: EventAttachment[]) => void;
  disabled?: boolean;
}

const EventAttachmentUpload = ({ attachments, onChange, disabled }: EventAttachmentUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: EventAttachment[] = [];

    try {
      for (const file of Array.from(files)) {
        // 10MB limit
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive",
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("event-attachments")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("event-attachments")
          .getPublicUrl(filePath);

        newAttachments.push({
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size,
        });
      }

      if (newAttachments.length > 0) {
        onChange([...attachments, ...newAttachments]);
        toast({
          title: "Files uploaded",
          description: `${newAttachments.length} file(s) attached successfully`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    onChange(newAttachments);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (type.includes("pdf")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4 mr-2" />
          )}
          {isUploading ? "Uploading..." : "Attach Files"}
        </Button>
        <span className="text-xs text-muted-foreground">
          PDFs, images, documents (max 10MB each)
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 group"
            >
              {getFileIcon(attachment.type)}
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-foreground hover:text-primary truncate"
              >
                {attachment.name}
              </a>
              {attachment.size && (
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventAttachmentUpload;
