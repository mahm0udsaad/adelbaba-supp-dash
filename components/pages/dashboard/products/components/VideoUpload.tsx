"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, UploadCloud, FileVideo, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { toast } from 'sonner';

interface VideoUploadProps {
  videoFile: File | null;
  onVideoChange: (file: File | null) => void;
  existingVideoUrl?: string | null;
  onExistingVideoClear?: () => void;
  maxSizeMB?: number;
}

export function VideoUpload({ videoFile, onVideoChange, existingVideoUrl, onExistingVideoClear, maxSizeMB = 250 }: VideoUploadProps) {
  const { t } = useI18n();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.startsWith('video/')) {
        toast.error(t.invalidFileType, {
          description: t.invalidVideoFile
        });
        e.target.value = '';
        return;
      }

      // Check file size (250MB limit)
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(t.fileTooLarge, {
          description: t.videoSizeMustBeLess.replace('{maxSizeMB}', String(maxSizeMB))
        });
        e.target.value = '';
        return;
      }
      
      onVideoChange(file);
      onExistingVideoClear?.();
      
      toast.success(t.videoAdded, {
        description: `${file.name} ${t.videoReadyToUpload}`,
      });
      
      // Reset input value to allow re-selecting the same file if needed (though we handle state externally)
      e.target.value = '';
    }
  };

  const handleBrowseClick = () => {
    document.getElementById('video-upload')?.click();
  };

  const handleRemove = () => {
    onVideoChange(null);
    toast.info(t.videoRemoved);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-medium">🎥</div>
            <CardTitle className="text-lg">{t.productVideo}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t.uploadProductVideo.replace('{maxSizeMB}', String(maxSizeMB))}
        </p>
      </CardHeader>
      <CardContent>
        {!videoFile && !existingVideoUrl ? (
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">{t.dragDropVideo}</p>
            <p className="text-xs text-muted-foreground mt-2">{t.supportedVideoFormats}</p>
            <Input 
              id="video-upload" 
              type="file" 
              accept="video/mp4,video/quicktime,video/webm" 
              className="sr-only" 
              onChange={handleFileChange} 
            />
            <Button 
              type="button" 
              onClick={handleBrowseClick} 
              variant="outline"
              className="mt-4"
            >
              {t.selectVideo}
            </Button>
          </div>
        ) : videoFile ? (
          <div className="relative border rounded-lg p-4 bg-muted/20">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-background rounded-md flex items-center justify-center border shadow-sm">
                <FileVideo className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{videoFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                    <AlertCircle className="h-3 w-3" />
                    {t.videoWillBeUploaded}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive" 
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-border overflow-hidden">
              <video controls src={existingVideoUrl ?? undefined} className="w-full bg-black">
                <track kind="captions" />
              </video>
            </div>
            <Button type="button" variant="outline" onClick={handleBrowseClick}>
              {t.selectVideo}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

