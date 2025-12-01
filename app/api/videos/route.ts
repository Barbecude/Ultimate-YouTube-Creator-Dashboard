import { NextRequest, NextResponse } from 'next/server';
import { enrichVideosWithDetails } from '@/app/lib/youtube';

const API_KEY = process.env.GOOGLE_API_KEY;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const channelId = searchParams.get('channelId');
        const pageToken = searchParams.get('pageToken') || '';

        if (!channelId) {
            return NextResponse.json(
                { error: 'Channel ID is required' },
                { status: 400 }
            );
        }

        // Build YouTube API URL with pagination
        let url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`;

        if (pageToken) {
            url += `&pageToken=${pageToken}`;
        }

        // Fetch from YouTube API
        const response = await fetch(url, { next: { revalidate: 3600 } });

        if (!response.ok) {
            throw new Error('Failed to fetch from YouTube API');
        }

        const data = await response.json();

        // Enrich videos with statistics and comments
        const videos = await enrichVideosWithDetails(data.items || []);

        return NextResponse.json({
            videos,
            nextPageToken: data.nextPageToken || null
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}
