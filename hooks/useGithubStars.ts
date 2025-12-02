'use client';

import { useEffect, useState } from 'react';

interface GitHubStarsCache {
    stars: number;
    timestamp: number;
}

const CACHE_KEY = 'github-stars-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const FALLBACK_STARS = 12500; // 12.5k fallback

export function useGithubStars() {
    const [stars, setStars] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchStars() {
            try {
                // Check localStorage cache first
                const cachedData = localStorage.getItem(CACHE_KEY);

                if (cachedData) {
                    const parsed: GitHubStarsCache = JSON.parse(cachedData);
                    const isExpired = Date.now() - parsed.timestamp > CACHE_TTL;

                    if (!isExpired) {
                        // Use cached data
                        setStars(parsed.stars);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch fresh data from API
                const response = await fetch('/api/github-stars');

                if (!response.ok) {
                    throw new Error('Failed to fetch stars');
                }

                const data = await response.json();
                const starCount = data.stars || FALLBACK_STARS;

                // Update state
                setStars(starCount);
                setError(false);

                // Cache the result
                const cacheData: GitHubStarsCache = {
                    stars: starCount,
                    timestamp: Date.now(),
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            } catch (err) {
                console.error('Error fetching GitHub stars:', err);
                setError(true);
                setStars(FALLBACK_STARS); // Use fallback on error
            } finally {
                setLoading(false);
            }
        }

        fetchStars();
    }, []);

    return { stars, loading, error };
}
