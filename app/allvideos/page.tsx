'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useChannel } from "@/app/context/ChannelContext";
import Image from "next/image";


export default function AllVideosPage() {
    const { channelId } = useChannel();
    const [allVideos, setAllVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Fetch initial videos
    const fetchVideos = useCallback(async (isInitial = false) => {
        if (!channelId) return;

        if (isInitial) {
            setLoading(true);
            setAllVideos([]);
            setNextPageToken(null);
            setHasMore(true);
        } else {
            setLoadingMore(true);
        }

        try {
            let url = `/api/videos?channelId=${channelId}`;
            if (!isInitial && nextPageToken) {
                url += `&pageToken=${nextPageToken}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch videos');
            }

            const data = await response.json();

            if (isInitial) {
                setAllVideos(data.videos || []);
            } else {
                setAllVideos(prev => [...prev, ...(data.videos || [])]);
            }

            setNextPageToken(data.nextPageToken);
            setHasMore(!!data.nextPageToken);
        } catch (error) {
            console.error('Error fetching videos:', error);
            if (isInitial) {
                setAllVideos([]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [channelId, nextPageToken]);

    // Initial fetch when channel changes
    useEffect(() => {
        fetchVideos(true);
    }, [channelId]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    fetchVideos(false);
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loadingMore, loading, fetchVideos]);

    return (
 
            <div className="mx-auto">
                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        <p className="text-gray-500 text-lg mt-4">Loading videos...</p>
                    </div>
                )}

                {/* Videos Grid - Column Layout */}
                {!loading && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allVideos.map((video: any) => {
                                const videoId = typeof video.id === 'string' ? video.id : video.id?.videoId;
                                const thumbnail = video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url;
                                const title = video.snippet?.title || 'Untitled Video';
                                const publishedAt = new Date(video.snippet?.publishedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                });

                                return (
                                    <div
                                        key={videoId}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                    >
                                        {/* Thumbnail */}
                                        <a
                                            href={`https://www.youtube.com/watch?v=${videoId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block relative aspect-video bg-gray-200"
                                        >
                                            {thumbnail && (
                                                <Image
                                                    src={thumbnail}
                                                    alt={title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            )}
                                        </a>

                                        {/* Video Info */}
                                        <div className="p-4">
                                            <a
                                                href={`https://www.youtube.com/watch?v=${videoId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                                                    {title}
                                                </h3>
                                            </a>

                                            <p className="text-sm text-gray-500 mb-3">{publishedAt}</p>

                                            {/* Statistics */}
                                            {video.statistics && (
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span>{parseInt(video.statistics.viewCount || 0).toLocaleString()}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                        </svg>
                                                        <span>{parseInt(video.statistics.likeCount || 0).toLocaleString()}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                        </svg>
                                                        <span>{parseInt(video.statistics.commentCount || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Infinite Scroll Trigger */}
                        {hasMore && (
                            <div ref={observerTarget} className="text-center py-12">
                                {loadingMore && (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                        <p className="text-gray-500 mt-4">Loading more videos...</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* End of Videos Message */}
                        {!hasMore && allVideos.length > 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">🎉 You've reached the end! All videos loaded.</p>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!loading && allVideos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No videos found</p>
                    </div>
                )}
            </div>
     
    );
}