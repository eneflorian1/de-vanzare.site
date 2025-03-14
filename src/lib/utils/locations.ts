export const counties = [
  'Alba',
  'Arad',
  'Argeș',
  'Bacău',
  'Bihor',
  'Bistrița-Năsăud',
  'Botoșani',
  'Brașov',
  'Brăila',
  'București',
  'Buzău',
  'Caraș-Severin',
  'Călărași',
  'Cluj',
  'Constanța',
  'Covasna',
  'Dâmbovița',
  'Dolj',
  'Galați',
  'Giurgiu',
  'Gorj',
  'Harghita',
  'Hunedoara',
  'Ialomița',
  'Iași',
  'Ilfov',
  'Maramureș',
  'Mehedinți',
  'Mureș',
  'Neamț',
  'Olt',
  'Prahova',
  'Satu Mare',
  'Sălaj',
  'Sibiu',
  'Suceava',
  'Teleorman',
  'Timiș',
  'Tulcea',
  'Vaslui',
  'Vâlcea',
  'Vrancea'
];

export const citiesByCounty: { [key: string]: string[] } = {
  București: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'],
  Cluj: ['Cluj-Napoca', 'Turda', 'Dej', 'Câmpia Turzii', 'Gherla', 'Huedin'],
  Timiș: ['Timișoara', 'Lugoj', 'Sânnicolau Mare', 'Jimbolia', 'Deta', 'Făget'],
  // Adăugați restul orașelor pentru fiecare județ
};

export const getCountyOptions = () => {
  return counties.map(county => ({
    value: county,
    label: county
  }));
};

export const getCityOptions = (county: string) => {
  const cities = citiesByCounty[county] || [];
  return cities.map(city => ({
    value: city,
    label: city
  }));
};