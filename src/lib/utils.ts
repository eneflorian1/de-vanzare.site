export const formatPrice = (price: number): string => {
  // Pentru valori mici (sub 10), folosim două zecimale pentru a afișa corect valorile convertite
  if (price < 10) {
    return new Intl.NumberFormat('ro-RO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(price);
  }
  
  // Pentru valori mai mari, nu afișăm zecimale
  return new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  }).format(price);
};

// Funcții utilitare adiționale pentru viitor
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // înlocuiește spațiile cu -
    .replace(/[^\w\-]+/g, '') // elimină caracterele speciale
    .replace(/\-\-+/g, '-');  // elimină - multiple consecutive
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}; 