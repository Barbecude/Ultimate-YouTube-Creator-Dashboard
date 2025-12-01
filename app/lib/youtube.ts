const API_KEY = process.env.GOOGLE_API_KEY;

// ============================================
// YOUTUBE DATA API v3 - PUBLIC DATA
// All YouTube Data API v3 calls centralized here
// ============================================

export async function getChannelStatistics(channelId: string) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${API_KEY}`;

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error('Failed to fetch channel statistics');
  }

  const data = await res.json();
  return data.items[0].statistics;
}

export async function getChannelInfo(channelId: string) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${API_KEY}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error('Failed to fetch channel info');
  }

  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found');
  }

  const channel = data.items[0];

  return {
    id: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl || '',
    thumbnails: channel.snippet.thumbnails,
    subscriberCount: channel.statistics.subscriberCount,
    videoCount: channel.statistics.videoCount,
    viewCount: channel.statistics.viewCount,
  };
}

export async function getMostPopularVideos(channelId: string) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=viewCount&type=video&maxResults=1&key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  return data.items;
}

export async function getRecentVideos(channelId: string) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=9&type=video`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) throw new Error("Failed to fetch recent videos");

  const data = await res.json();
  return data.items;
}

export async function getRecentVideosWithPagination(channelId: string, pageToken?: string) {
  let url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`;

  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error('Failed to fetch videos');
  }

  const data = await res.json();

  return {
    items: data.items || [],
    nextPageToken: data.nextPageToken || null
  };
}

export async function getVideoStatistics(videoIds: string[]) {
  const idsString = videoIds.join(',');
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${idsString}&key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  return data.items || [];
}

export async function getComments(videoId: string) {
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=3&key=${API_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error('Failed to fetch comments');
    }

    const data = await res.json();

    const cleanComments = data.items.map((item: any) => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        id: item.id,
        name: snippet.authorDisplayName,
        date: new Date(snippet.publishedAt).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'short', year: 'numeric'
        }),
        content: snippet.textOriginal,
        imageUrl: snippet.authorProfileImageUrl,
      };
    });

    return cleanComments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

// ============================================
// TYPES & INTERFACES
// ============================================

export interface RawVideo {
  id: string | { videoId: string };
  snippet?: any;
  [key: string]: any;
}

export interface EnrichedVideo extends RawVideo {
  id: string;
  statistics: any;
  comments: any[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export async function enrichVideosWithDetails(rawVideos: RawVideo[]): Promise<EnrichedVideo[]> {
  if (!rawVideos || rawVideos.length === 0) return [];

  // Normalize video IDs
  const videoIds = rawVideos.map((v) =>
    typeof v.id === 'string' ? v.id : v.id.videoId
  );

  // Fetch statistics & comments in parallel
  const [videoStats, videoComments] = await Promise.all([
    getVideoStatistics(videoIds),
    Promise.all(videoIds.map((id) => getComments(id)))
  ]);

  // Create map for O(1) lookup
  const statsMap = new Map(videoStats.map((s: any) => [s.id, s.statistics]));

  // Combine data
  return rawVideos.map((video, index) => {
    const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;

    return {
      ...video,
      id: videoId,
      statistics: statsMap.get(videoId) || null,
      comments: videoComments[index] || []
    };
  });
}