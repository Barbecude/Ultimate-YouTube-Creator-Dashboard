'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useChannel } from "@/app/context/ChannelContext";
import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Channel {
  id: string;
  name: string;
  subscribers: number;
  profileImage: string;
  description?: string;
}

export default function AuthProfile() {
  const { data: session } = useSession();
  const { setChannelId, setChannelName } = useChannel();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowPopup(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search-channels?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.items) {
        setSearchResults(data.items);
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error searching channels:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    performSearch(searchQuery);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleChannelSelect = (channel: Channel) => {
    setChannelId(channel.id);
    setChannelName(channel.name);
    setSearchQuery("");
    setSearchResults([]);
    setShowPopup(false);
  };

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <div className="space-y-5 mb-6">
      {/* Auth Section */}
      <Card className="p-4">
        {session ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Welcome, <span className="font-semibold text-gray-900">{session.user?.name}</span> 👋
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOut()}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => signIn("google")}
            variant="outline"
            className="w-full"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-4 h-4 mr-2"
            />
            Sign in with Google
          </Button>
        )}
      </Card>

      {/* Search Section */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search YouTube channel..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition"
              />
              {showPopup && searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              size="default"
            >
              <Search size={16} className="mr-2" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search Results Popup */}
          {showPopup && searchResults.length > 0 && (
            <Card className="absolute w-full top-full left-0 mt-2 shadow-lg z-50 p-0 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelSelect(channel)}
                    className="w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition flex gap-3 items-center"
                  >
                    {channel.profileImage && (
                      <img
                        src={channel.profileImage}
                        alt={channel.name}
                        className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {channel.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatSubscribers(channel.subscribers)} subscribers
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </form>
      </Card>
    </div>
  );
}