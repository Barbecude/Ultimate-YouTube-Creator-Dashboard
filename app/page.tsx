import { getChannelStatistics } from "./lib/youtube";
import AuthProfile from "@/components/AuthProfile";

// 👇 1. Fungsi pembantu untuk menyingkat angka
const formatNumber = (num: string) => {
  return new Intl.NumberFormat('en-US', { // Gunakan 'id-ID' jika ingin format Indonesia (misal: 1,2 jt)
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1 // Membatasi desimal, misal 1.5M bukan 1.53M
  }).format(parseInt(num));
};

export default async function Home() {
  const stats = await getChannelStatistics();

  return (
    <div>
      <h1>YouTube Dashboard 🚀</h1>
      
      <AuthProfile />

      <hr style={{ margin: "30px 0" }} />

      <h2>Statistik Channel</h2>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        
        {/* Kartu Subscribers */}
        <div>
          <h3>Subscribers</h3>
          {/* 👇 2. Panggil fungsi formatNumber di sini */}
          <p>{formatNumber(stats.subscriberCount)}</p>
        </div>

        {/* Kartu Views */}
        <div>
          <h3>Total Views</h3>
          <p>{formatNumber(stats.viewCount)}</p>
        </div>

        {/* Kartu Video */}
        <div>
          <h3>Total Video</h3>
          <p>{formatNumber(stats.videoCount)}</p>
        </div>

      </div>
    </div>
  );
}
