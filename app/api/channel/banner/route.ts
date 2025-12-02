import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { uploadChannelBanner, updateChannelInfo } from '@/app/lib/youtube';

export async function POST(request: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions);

        if (!session || !session.accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const channelId = formData.get('channelId') as string;
        const imageFile = formData.get('banner') as File;

        if (!channelId) {
            return NextResponse.json(
                { error: 'Channel ID is required' },
                { status: 400 }
            );
        }

        if (!imageFile) {
            return NextResponse.json(
                { error: 'Banner image is required' },
                { status: 400 }
            );
        }

        // Validate file size (max 6MB)
        const maxSize = 6 * 1024 * 1024;
        if (imageFile.size > maxSize) {
            return NextResponse.json(
                { error: 'File size must be less than 6MB' },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(imageFile.type)) {
            return NextResponse.json(
                { error: 'File must be a JPEG or PNG image' },
                { status: 400 }
            );
        }

        // Convert file to ArrayBuffer
        const arrayBuffer = await imageFile.arrayBuffer();

        // Step 1: Upload banner to YouTube
        const bannerUrl = await uploadChannelBanner(arrayBuffer, session.accessToken);

        // Step 2: Update channel with the new banner URL
        await updateChannelInfo(
            channelId,
            { bannerUrl },
            session.accessToken
        );

        return NextResponse.json({
            success: true,
            message: 'Banner uploaded successfully',
            url: bannerUrl
        });
    } catch (error: any) {
        console.error('Error uploading banner:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload banner' },
            { status: 500 }
        );
    }
}
