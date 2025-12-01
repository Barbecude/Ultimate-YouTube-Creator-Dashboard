import { NextRequest, NextResponse } from 'next/server';
import { getRecentVideosWithPagination, enrichVideosWithDetails } from '@/app/lib/youtube';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const channelId = searchParams.get('channelId');
        const pageToken = searchParams.get('pageToken') || undefined;

        if (!channelId) {
            return NextResponse.json(
                { error: 'Channel ID is required' },
                { status: 400 }
            );
        }

        // Call centralized functions from youtube.ts
        const { items, nextPageToken } = await getRecentVideosWithPagination(channelId, pageToken);
        const videos = await enrichVideosWithDetails(items);

        return NextResponse.json({
            videos,
            nextPageToken
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}
