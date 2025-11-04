"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, UploadCloud } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { toast } from 'sonner';

interface MediaUploadProps {
  existingMedia: { id: number; url: string; name: string }[];
  onNewFiles: (files: File[]) => void;
  onRemoveExisting: (id: number) => void;
  onRemoveNew: (file: File) => void;
  newFiles: File[];
}

export function MediaUpload({ existingMedia = [], onNewFiles, onRemoveExisting, onRemoveNew, newFiles = [] }: MediaUploadProps) {
  const { t } = useI18n();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      
      // Check file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
      const invalidFiles = files.filter(f => !validTypes.includes(f.type))
      
      if (invalidFiles.length > 0) {
        toast.error("Invalid File Type", {
          description: `${invalidFiles.length} file(s) skipped. Only images and videos are allowed.`
        })
      }
      
      const validFiles = files.filter(f => validTypes.includes(f.type))
      
      if (validFiles.length > 0) {
        // Append new files to existing files instead of replacing
        onNewFiles([...newFiles, ...validFiles]);
        
        toast.success(`${validFiles.length} file(s) added`, {
          description: validFiles.length === 1 
            ? validFiles[0].name 
            : `${validFiles.length} media files ready to upload`,
          duration: 3000
        })
      }
      
      // Reset input
      e.target.value = ''
    }
  };
  const handleBrowseClick = () => {
    document.getElementById('file-upload')?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.media}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">{t.dragAndDropOrClick}</p>
          <Input id="file-upload" type="file" accept="image/*,video/*" multiple className="sr-only" onChange={handleFileChange} />
          <Button  type="button" onClick={handleBrowseClick} className="mt-2 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer">
            {t.browseFiles}
          </Button>
        </div>
        {(existingMedia.length > 0 || newFiles.length > 0) && (
          <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {existingMedia.map(media => (
              <div key={media.id} className="relative group">
                <img src={media.url} alt={media.name} className="h-24 w-24 object-cover rounded-md" />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100" 
                  onClick={() => {
                    onRemoveExisting(media.id)
                    toast.info("Media marked for removal", {
                      description: "This file will be deleted when you save the product",
                      duration: 3000
                    })
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {newFiles.map((file, i) => (
              <div key={i} className="relative group">
                <img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-24 object-cover rounded-md" />
                 <Button 
                   variant="destructive" 
                   size="icon" 
                   className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100" 
                   onClick={() => {
                     onRemoveNew(file)
                     toast("File removed", {
                       description: file.name,
                       duration: 2000
                     })
                   }}
                 >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
