'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChannelReadonlyNotice() {
    return (
        <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>YouTube API Limitations</AlertTitle>
            <AlertDescription className="mt-2">
                <p className="text-sm text-muted-foreground mb-3">
                    Due to YouTube API restrictions, some channel settings can only be changed directly through YouTube Studio:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-3">
                    <li><strong>Channel Name</strong> - Must be changed in YouTube Studio</li>
                    <li><strong>Profile Picture</strong> - Must be changed in YouTube Studio</li>
                </ul>
                <p className="text-sm text-muted-foreground mb-3">
                    You can update the following settings here:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
                    <li><strong>Channel Banner</strong> - Upload and update your channel's banner image</li>
                    <li><strong>Description</strong> - Edit your channel description</li>
                    <li><strong>Keywords</strong> - Update your channel's SEO keywords</li>
                </ul>
                <Button variant="outline" size="sm" asChild>
                    <a
                        href="https://studio.youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                    >
                        Open YouTube Studio
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </Button>
            </AlertDescription>
        </Alert>
    );
}
