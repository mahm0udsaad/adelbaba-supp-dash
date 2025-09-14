"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, UploadCloud } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

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
      onNewFiles(Array.from(e.target.files));
    }
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
          <Input id="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
          <Label htmlFor="file-upload" className="mt-2 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer">
            {t.browseFiles}
          </Label>
        </div>
        {(existingMedia.length > 0 || newFiles.length > 0) && (
          <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {existingMedia.map(media => (
              <div key={media.id} className="relative group">
                <img src={media.url} alt={media.name} className="h-24 w-24 object-cover rounded-md" />
                <Button variant="destructive" size="icon" className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => onRemoveExisting(media.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {newFiles.map((file, i) => (
              <div key={i} className="relative group">
                <img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-24 object-cover rounded-md" />
                 <Button variant="destructive" size="icon" className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => onRemoveNew(file)}>
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
