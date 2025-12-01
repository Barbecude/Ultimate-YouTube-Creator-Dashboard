import { NextRequest, NextResponse } from 'next/server';
import { getChannelInfo } from '@/app/lib/youtube';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const channelId = searchParams.get('channelId');

        if (!channelId) {
            return NextResponse.json(
                { error: 'Channel ID is required' },
                { status: 400 }
            );
        }

        // Call centralized function from youtube.ts
        const channelInfo = await getChannelInfo(channelId);

        return NextResponse.json(channelInfo);
    } catch (error) {
        console.error('Error fetching channel info:', error);
        return NextResponse.json(
            { error: 'Failed to fetch channel info' },
            { status: 500 }
        );
    }
}
