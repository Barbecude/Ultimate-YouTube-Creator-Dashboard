// app/lib/formaters.ts

export const formatNumber = (num: string | number | undefined) => {
  // 1. Cek jika kosong
  if (num === undefined || num === null) return '0';
  
  // 2. Konversi ke Number (lebih aman dari parseInt untuk jaga-jaga)
  const val = Number(num);
  
  // 3. Cek jika hasil konversi bukan angka (misal string "abc")
  if (isNaN(val)) return '0';
  
  // 4. Format
  return new Intl.NumberFormat('en-US', {
    notation: "compact", 
    compactDisplay: "short", 
    maximumFractionDigits: 1
  }).format(val);
};

export const formatDuration = (seconds: number | undefined) => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};