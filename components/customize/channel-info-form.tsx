'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChannelInfoFormProps {
    channelId: string;
    initialDescription?: string;
    initialKeywords?: string;
    onUpdateSuccess?: () => void;
}

export default function ChannelInfoForm({
    channelId,
    initialDescription = '',
    initialKeywords = '',
    onUpdateSuccess
}: ChannelInfoFormProps) {
    const [description, setDescription] = useState(initialDescription);
    // Parse initial keywords string into array, filtering out empty strings
    const [keywords, setKeywords] = useState<string[]>(
        initialKeywords ? initialKeywords.split(',').map(k => k.trim()).filter(k => k) : []
    );
    const [currentKeyword, setCurrentKeyword] = useState('');
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const maxDescriptionLength = 1000;
    const descriptionLength = description.length;

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (newValue.length <= maxDescriptionLength) {
            setDescription(newValue);
            setIsDirty(true);
        }
    };

    const handleKeywordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentKeyword(e.target.value);
    };

    const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addKeyword();
        }
    };

    const addKeyword = () => {
        const trimmed = currentKeyword.trim();
        if (trimmed && !keywords.includes(trimmed)) {
            setKeywords([...keywords, trimmed]);
            setCurrentKeyword('');
            setIsDirty(true);
        } else if (trimmed === '') {
            setCurrentKeyword('');
        }
    };

    const removeKeyword = (keywordToRemove: string) => {
        setKeywords(keywords.filter(k => k !== keywordToRemove));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/channel', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    channelId,
                    description,
                    keywords: keywords.join(', '),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update channel');
            }

            toast.success('Channel information updated successfully');

            setIsDirty(false);
            if (onUpdateSuccess) {
                onUpdateSuccess();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update channel');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setDescription(initialDescription);
        setKeywords(initialKeywords ? initialKeywords.split(',').map(k => k.trim()).filter(k => k) : []);
        setCurrentKeyword('');
        setIsDirty(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Channel Information</CardTitle>
                <CardDescription>
                    Update your channel's description and keywords for better discoverability
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Tell viewers about your channel..."
                        value={description}
                        onChange={handleDescriptionChange}
                        rows={6}
                        className="resize-none"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Describe what your channel is about</span>
                        <span className={descriptionLength > maxDescriptionLength * 0.9 ? 'text-orange-500' : ''}>
                            {descriptionLength} / {maxDescriptionLength}
                        </span>
                    </div>
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                    <Label htmlFor="keywords">Channel Keywords</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {keywords.map((keyword, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full text-sm font-medium"
                            >
                                {keyword}
                                <button
                                    onClick={() => removeKeyword(keyword)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    type="button"
                                >
                                    <X className="w-3 h-3" />
                                    <span className="sr-only">Remove {keyword}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            id="keywords"
                            placeholder="Add a keyword (press Enter or comma)"
                            value={currentKeyword}
                            onChange={handleKeywordInput}
                            onKeyDown={handleKeywordKeyDown}
                            onBlur={addKeyword}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={addKeyword}
                            disabled={!currentKeyword.trim()}
                        >
                            Add
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Keywords help YouTube understand your channel's content.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className="flex-1"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        disabled={saving || !isDirty}
                    >
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
