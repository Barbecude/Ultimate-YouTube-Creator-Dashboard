import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getChannelInfo, getChannelDetails, updateChannelInfo } from '@/app/lib/youtube';

// GET channel info - can be public or authenticated
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const channelId = searchParams.get('channelId');
        const detailed = searchParams.get('detailed') === 'true';

        if (!channelId) {
            return NextResponse.json(
                { error: 'Channel ID is required' },
                { status: 400 }
            );
        }

        // If detailed version is requested, require authentication
        if (detailed) {
            const session: any = await getServerSession(authOptions);

            if (!session || !session.accessToken) {
                return NextResponse.json(
                    { error: 'Unauthorized - authentication required for detailed channel info' },
                    { status: 401 }
                );
            }

            const channelDetails = await getChannelDetails(channelId, session.accessToken);
            return NextResponse.json({ data: channelDetails });
        }

        // Otherwise, return public channel info
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

// PATCH to update channel info
export async function PATCH(request: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions);

        if (!session || !session.accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { channelId, description, keywords, defaultLanguage, country } = body;

        if (!channelId) {
            return NextResponse.json(
                { error: 'Channel ID is required' },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (description !== undefined) updateData.description = description;
        if (keywords !== undefined) updateData.keywords = keywords;
        if (defaultLanguage !== undefined) updateData.defaultLanguage = defaultLanguage;
        if (country !== undefined) updateData.country = country;

        const result = await updateChannelInfo(channelId, updateData, session.accessToken);

        return NextResponse.json({
            success: true,
            message: 'Channel updated successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Error updating channel:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update channel' },
            { status: 500 }
        );
    }
}
