// Type definitions for YouTube channel data and customization

export interface ChannelBrandingSettings {
    channel?: {
        title?: string;
        description?: string;
        keywords?: string;
        defaultTab?: string;
        trackingAnalyticsAccountId?: string;
        moderateComments?: boolean;
        unsubscribedTrailer?: string;
        defaultLanguage?: string;
        country?: string;
    };
    image?: {
        bannerExternalUrl?: string;
        bannerImageUrl?: string;
        bannerMobileImageUrl?: string;
        bannerTabletLowImageUrl?: string;
        bannerTabletImageUrl?: string;
        bannerTabletHdImageUrl?: string;
        bannerTabletExtraHdImageUrl?: string;
        bannerMobileLowImageUrl?: string;
        bannerMobileMediumHdImageUrl?: string;
        bannerMobileHdImageUrl?: string;
        bannerMobileExtraHdImageUrl?: string;
        bannerTvImageUrl?: string;
        bannerTvLowImageUrl?: string;
        bannerTvMediumImageUrl?: string;
        bannerTvHighImageUrl?: string;
    };
}

export interface ChannelLink {
    title: string;
    url: string;
}

export interface ChannelDetails {
    id: string;
    snippet: {
        title: string;
        description: string;
        customUrl?: string;
        publishedAt: string;
        thumbnails: {
            default?: { url: string };
            medium?: { url: string };
            high?: { url: string };
        };
        localized?: {
            title: string;
            description: string;
        };
        country?: string;
    };
    brandingSettings: ChannelBrandingSettings;
    statistics: {
        viewCount: string;
        subscriberCount: string;
        videoCount: string;
    };
}

export interface UpdateChannelPayload {
    id: string;
    brandingSettings?: {
        channel?: {
            description?: string;
            keywords?: string;
            defaultLanguage?: string;
            country?: string;
        };
        image?: {
            bannerExternalUrl?: string;
        };
    };
}

export interface BannerUploadResponse {
    url: string;
}

export interface ChannelUpdateResponse {
    success: boolean;
    message?: string;
    data?: ChannelDetails;
}
