'use client';

import { useEffect, useState } from 'react';
import { useChannel } from '@/app/context/ChannelContext';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import ChannelReadonlyNotice from '@/components/customize/channel-readonly-notice';
import ChannelBannerUpload from '@/components/customize/channel-banner-upload';
import ChannelInfoForm from '@/components/customize/channel-info-form';

interface ChannelData {
    id: string;
    snippet: {
        title: string;
        description: string;
        customUrl?: string;
        thumbnails: any;
    };
    brandingSettings: {
        channel?: {
            description?: string;
            keywords?: string;
        };
        image?: {
            bannerExternalUrl?: string;
        };
    };
    statistics: any;
}

export default function CustomizePage() {
    const { channelId } = useChannel();
    const { data: session } = useSession();
    const [channelData, setChannelData] = useState<ChannelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChannelData = async () => {
            if (!channelId) return;

            setLoading(true);
            setError(null);

            try {
                // Fetch detailed channel data with authentication
                const response = await fetch(`/api/channel?channelId=${channelId}&detailed=true`);

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Please sign in to customize your channel');
                    }
                    throw new Error('Failed to load channel data');
                }

                const data = await response.json();
                setChannelData(data.data);
            } catch (err: any) {
                setError(err.message);
                console.error('Error fetching channel data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChannelData();
    }, [channelId]);

    const handleBannerUploadSuccess = (newBannerUrl: string) => {
        // Update local state with new banner URL
        if (channelData) {
            setChannelData({
                ...channelData,
                brandingSettings: {
                    ...channelData.brandingSettings,
                    image: {
                        bannerExternalUrl: newBannerUrl
                    }
                }
            });
        }
    };

    const handleInfoUpdateSuccess = () => {
        // Optionally refetch channel data to get latest updates
        // For now, we'll just show a success message via the toast in the component
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Loading channel settings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    {!session && (
                        <p className="text-gray-500">
                            Please sign in to access channel customization settings.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (!channelData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">No channel data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* API Limitations Notice */}
            <ChannelReadonlyNotice />

            {/* Channel Banner Upload */}
            <ChannelBannerUpload
                channelId={channelId || ''}
                currentBannerUrl={channelData.brandingSettings?.image?.bannerExternalUrl}
                onUploadSuccess={handleBannerUploadSuccess}
            />

            {/* Channel Information Form */}
            <ChannelInfoForm
                channelId={channelId || ''}
                initialDescription={channelData.brandingSettings?.channel?.description || channelData.snippet.description || ''}
                initialKeywords={channelData.brandingSettings?.channel?.keywords || ''}
                onUpdateSuccess={handleInfoUpdateSuccess}
            />

            {/* Channel Stats (Read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Channel Name</p>
                    <p className="text-lg font-semibold">{channelData.snippet.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Edit in YouTube Studio</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Custom URL</p>
                    <p className="text-lg font-semibold">
                        {channelData.snippet.customUrl || 'Not set'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Edit in YouTube Studio</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Subscribers</p>
                    <p className="text-lg font-semibold">
                        {parseInt(channelData.statistics?.subscriberCount || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Read-only</p>
                </div>
            </div>
        </div>
    );
}
