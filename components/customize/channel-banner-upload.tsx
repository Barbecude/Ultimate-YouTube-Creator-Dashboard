'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ChannelBannerUploadProps {
    channelId: string;
    currentBannerUrl?: string;
    onUploadSuccess?: (newBannerUrl: string) => void;
}

export default function ChannelBannerUpload({
    channelId,
    currentBannerUrl,
    onUploadSuccess
}: ChannelBannerUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = (file: File) => {
        // Validate file size (max 6MB)
        const maxSize = 6 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File too large - Banner image must be less than 6MB');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type - Please upload a JPEG or PNG image');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        setSelectedFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        validateAndSetFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('banner', selectedFile);
            formData.append('channelId', channelId);

            const response = await fetch('/api/channel/banner', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload banner');
            }

            toast.success('Banner uploaded successfully');

            if (onUploadSuccess) {
                onUploadSuccess(data.url);
            }

            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload banner');
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Channel Banner</CardTitle>
                <CardDescription>
                    Upload a new banner image for your channel (16:9 ratio, min 2048x1152px, max 6MB)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current/Preview Banner with Drag & Drop */}
                <div
                    className={`
                        relative w-full max-w-3xl mx-auto aspect-[16/9] 
                        rounded-lg overflow-hidden border-2 border-dashed transition-colors
                        ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-200 bg-gray-50'}
                        ${!previewUrl && !currentBannerUrl ? 'flex items-center justify-center' : ''}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="Banner preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 800px"
                        />
                    ) : currentBannerUrl ? (
                        <Image
                            src={currentBannerUrl}
                            alt="Current banner"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 800px"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                            <Upload className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm font-medium">Drag and drop your banner here</p>
                            <p className="text-xs mt-1">or click "Choose New Banner" below</p>
                        </div>
                    )}

                    {/* Overlay when dragging over existing image */}
                    {isDragging && (previewUrl || currentBannerUrl) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <p className="text-white font-medium flex items-center">
                                <Upload className="w-5 h-5 mr-2" />
                                Drop to replace
                            </p>
                        </div>
                    )}
                </div>

                {/* Upload Controls */}
                <div className="flex gap-2 max-w-3xl mx-auto">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {!selectedFile ? (
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="w-full"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose New Banner
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex-1"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Banner
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                disabled={uploading}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </>
                    )}
                </div>

                {/* Helper text */}
                <p className="text-xs text-muted-foreground text-center">
                    For best results, use an image with a 16:9 aspect ratio and at least 2048x1152 pixels.
                    Recommended size is 2560x1440 pixels.
                </p>
            </CardContent>
        </Card>
    );
}
