// lib/youtube-analytics.ts

export async function getGeoAnalytics(accessToken: string) {
  if (!accessToken) return [];

  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1); // Data 1 tahun terakhir

  const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?` + 
    `ids=channel==MINE&` + 
    `startDate=${start.toISOString().split('T')[0]}&` + 
    `endDate=${end.toISOString().split('T')[0]}&` + 
    `metrics=views&` + 
    `dimensions=country&` +  // 👈 Kuncinya di sini (Grouping by Country)
    `sort=-views&` +         // Urutkan dari yang terbanyak
    `maxResults=200`,        // Ambil data semua negara
    {
      headers: {
        Authorization: `Bearer ${accessToken}`, 
        Accept: 'application/json',
      },
      next: { revalidate: 93600 } 
    }
  );

  const data = await res.json();

  // Format data biar enak dipakai di Peta
  // Output: [ { id: "ID", value: 5000 }, { id: "US", value: 3000 } ]
  return data.rows?.map((row: any) => ({
    id: row[0],   // Kode Negara (misal: "ID", "US")
    value: row[1] // Jumlah Views
  })) || [];
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];

// 👇 UBAH DI SINI: Terima parameter accessToken
export async function getTotalViewsAnalytics(accessToken: string) {


  // Cek kalau token kosong, langsung stop
  if (!accessToken) return [];

  // Set rentang waktu: 1 Tahun ke belakang
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1);

  const startDate = formatDate(start);
  const endDate = formatDate(end);

  // Request ke YouTube Analytics API
const res = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?` + 
    `ids=channel==MINE&` + 
    `startDate=${startDate}&` + 
    `endDate=${endDate}&` + 
    `metrics=views&` + 
    `dimensions=day&` +  // 👈 UBAH DARI 'month' JADI 'day'
    `sort=day`,
    {
      headers: {
        // 👇 GUNAKAN TOKEN DARI PARAMETER
        Authorization: `Bearer ${accessToken}`, 
        Accept: 'application/json',
      },
      // Cache dimatikan atau pendek saja karena ini data sensitif per user
      next: { revalidate: 0 } 
    }
  );

  const data = await res.json();

  const chartData = data.rows?.map((row: any) => {
    return {
      date: row[0], 
      views: row[1]
    };
  }) || [];

  return chartData;
  
}

export async function getVideoAnalytics(accessToken: string, videoId: string) {
  if (!accessToken) return null;

  // GANTI METRIC: Hapus annotationClickThroughRate, ganti jadi averageViewPercentage
  const metrics = "averageViewDuration,averageViewPercentage"; 

  const url = `https://youtubeanalytics.googleapis.com/v2/reports?` +
    `ids=channel==MINE&` +
    `metrics=${metrics}&` +
    `startDate=2020-01-01&endDate=${new Date().toISOString().split('T')[0]}&` +
    `filters=video==${videoId}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  
  // --- DEBUGGING: TAMBAHKAN INI ---
  // Lihat terminal VSCode kamu saat refresh halaman
  if (data.error) {
    console.error("🔥 YOUTUBE ANALYTICS ERROR:", JSON.stringify(data.error, null, 2));
    return { averageViewDuration: 0, clickRatio: 0 };
  }
  
  if (!data.rows || data.rows.length === 0) {
    console.warn("⚠️ DATA KOSONG (Mungkin video baru upload < 48 jam?) ID:", videoId);
    return { averageViewDuration: 0, clickRatio: 0 };
  }
  // --------------------------------

  // Format return
  // averageViewPercentage biasanya return angka 0-100 (misal 45.5)
  // Kita bagi 100 biar jadi desimal (0.455) agar sesuai format persen di componentmu
  return {
    averageViewDuration: data.rows[0][0], // Detik
    clickRatio: data.rows[0][1] / 100     // Persen Retensi (pengganti CTR)
  };
}