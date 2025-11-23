export async function getChannelStatistics() {
  const API_KEY = process.env.GOOGLE_API_KEY;
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  // 1. Siapkan alamat tujuan (Endpoint API YouTube)
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`;

  // 2. Pergi mengambil data
  const res = await fetch(url, { next: { revalidate: 60 } }); 
  // (revalidate: 60 artinya: data akan diperbarui tiap 60 detik, biar server ga capek)

  if (!res.ok) {
    throw new Error('Gagal mengambil data dari YouTube');
  }

  const data = await res.json();
  
  // 3. Kembalikan hanya bagian yang kita butuhkan
  return data.items[0].statistics;
}