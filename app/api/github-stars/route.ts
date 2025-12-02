import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const response = await fetch(
            'https://api.github.com/repos/Barbecude/Ultimate-YouTube-Creator-Dashboard',
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                },
                next: { revalidate: 3600 } // Cache for 1 hour on server
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub API responded with status: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json({
            stars: data.stargazers_count || 0
        });
    } catch (error) {
        console.error('Error fetching GitHub stars:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub stars' },
            { status: 500 }
        );
    }
}
