// LocationData.ts - Romanian counties and cities data

export interface Location {
  county: string;
  cities: string[];
}

// List of Romanian counties with major cities
export const romanianLocations: Location[] = [
  {
    county: 'Alba',
    cities: ['Alba Iulia', 'Aiud', 'Blaj', 'Sebeș', 'Cugir']
  },
  {
    county: 'Arad',
    cities: ['Arad', 'Ineu', 'Lipova', 'Nădlac', 'Pecica']
  },
  {
    county: 'Argeș',
    cities: ['Pitești', 'Câmpulung', 'Curtea de Argeș', 'Mioveni', 'Costești']
  },
  {
    county: 'Bacău',
    cities: ['Bacău', 'Onești', 'Moinești', 'Comănești', 'Buhuși']
  },
  {
    county: 'Bihor',
    cities: ['Oradea', 'Salonta', 'Beiuș', 'Marghita', 'Aleșd']
  },
  {
    county: 'Bistrița-Năsăud',
    cities: ['Bistrița', 'Năsăud', 'Beclean', 'Sângeorz-Băi']
  },
  {
    county: 'Botoșani',
    cities: ['Botoșani', 'Dorohoi', 'Darabani', 'Săveni', 'Bucecea']
  },
  {
    county: 'Brașov',
    cities: ['Brașov', 'Făgăraș', 'Săcele', 'Zărnești', 'Codlea']
  },
  {
    county: 'Brăila',
    cities: ['Brăila', 'Ianca', 'Însurăței', 'Făurei']
  },
  {
    county: 'București',
    cities: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6']
  },
  {
    county: 'Buzău',
    cities: ['Buzău', 'Râmnicu Sărat', 'Nehoiu', 'Pogoanele', 'Pătârlagele']
  },
  {
    county: 'Caraș-Severin',
    cities: ['Reșița', 'Caransebeș', 'Oravița', 'Moldova Nouă', 'Băile Herculane']
  },
  {
    county: 'Călărași',
    cities: ['Călărași', 'Oltenița', 'Budești', 'Lehliu Gară', 'Fundulea']
  },
  {
    county: 'Cluj',
    cities: ['Cluj-Napoca', 'Turda', 'Dej', 'Câmpia Turzii', 'Gherla']
  },
  {
    county: 'Constanța',
    cities: ['Constanța', 'Mangalia', 'Medgidia', 'Cernavodă', 'Năvodari']
  },
  {
    county: 'Covasna',
    cities: ['Sfântu Gheorghe', 'Târgu Secuiesc', 'Covasna', 'Baraolt', 'Întorsura Buzăului']
  },
  {
    county: 'Dâmbovița',
    cities: ['Târgoviște', 'Moreni', 'Pucioasa', 'Găești', 'Titu']
  },
  {
    county: 'Dolj',
    cities: ['Craiova', 'Băilești', 'Calafat', 'Filiași', 'Dăbuleni']
  },
  {
    county: 'Galați',
    cities: ['Galați', 'Tecuci', 'Târgu Bujor', 'Berești']
  },
  {
    county: 'Giurgiu',
    cities: ['Giurgiu', 'Bolintin-Vale', 'Mihăilești']
  },
  {
    county: 'Gorj',
    cities: ['Târgu Jiu', 'Motru', 'Rovinari', 'Târgu Cărbunești', 'Novaci']
  },
  {
    county: 'Harghita',
    cities: ['Miercurea Ciuc', 'Odorheiu Secuiesc', 'Gheorgheni', 'Toplița', 'Bălan']
  },
  {
    county: 'Hunedoara',
    cities: ['Deva', 'Hunedoara', 'Petroșani', 'Orăștie', 'Brad']
  },
  {
    county: 'Ialomița',
    cities: ['Slobozia', 'Fetești', 'Urziceni', 'Țăndărei', 'Amara']
  },
  {
    county: 'Iași',
    cities: ['Iași', 'Pașcani', 'Târgu Frumos', 'Hârlău', 'Podu Iloaiei']
  },
  {
    county: 'Ilfov',
    cities: ['Voluntari', 'Pantelimon', 'Buftea', 'Popești-Leordeni', 'Bragadiru']
  },
  {
    county: 'Maramureș',
    cities: ['Baia Mare', 'Sighetu Marmației', 'Borșa', 'Vișeu de Sus', 'Târgu Lăpuș']
  },
  {
    county: 'Mehedinți',
    cities: ['Drobeta-Turnu Severin', 'Orșova', 'Strehaia', 'Vânju Mare', 'Baia de Aramă']
  },
  {
    county: 'Mureș',
    cities: ['Târgu Mureș', 'Sighișoara', 'Reghin', 'Târnăveni', 'Luduș']
  },
  {
    county: 'Neamț',
    cities: ['Piatra Neamț', 'Roman', 'Târgu Neamț', 'Bicaz', 'Roznov']
  },
  {
    county: 'Olt',
    cities: ['Slatina', 'Caracal', 'Balș', 'Corabia', 'Scornicești']
  },
  {
    county: 'Prahova',
    cities: ['Ploiești', 'Câmpina', 'Sinaia', 'Azuga', 'Bușteni']
  },
  {
    county: 'Satu Mare',
    cities: ['Satu Mare', 'Carei', 'Negrești-Oaș', 'Tășnad', 'Ardud']
  },
  {
    county: 'Sălaj',
    cities: ['Zalău', 'Șimleu Silvaniei', 'Jibou', 'Cehu Silvaniei']
  },
  {
    county: 'Sibiu',
    cities: ['Sibiu', 'Mediaș', 'Cisnădie', 'Avrig', 'Agnita']
  },
  {
    county: 'Suceava',
    cities: ['Suceava', 'Fălticeni', 'Rădăuți', 'Câmpulung Moldovenesc', 'Vatra Dornei']
  },
  {
    county: 'Teleorman',
    cities: ['Alexandria', 'Turnu Măgurele', 'Roșiori de Vede', 'Zimnicea', 'Videle']
  },
  {
    county: 'Timiș',
    cities: ['Timișoara', 'Lugoj', 'Sânnicolau Mare', 'Jimbolia', 'Buziaș']
  },
  {
    county: 'Tulcea',
    cities: ['Tulcea', 'Babadag', 'Măcin', 'Isaccea', 'Sulina']
  },
  {
    county: 'Vaslui',
    cities: ['Vaslui', 'Bârlad', 'Huși', 'Negrești', 'Murgeni']
  },
  {
    county: 'Vâlcea',
    cities: ['Râmnicu Vâlcea', 'Drăgășani', 'Băbeni', 'Călimănești', 'Brezoi']
  },
  {
    county: 'Vrancea',
    cities: ['Focșani', 'Adjud', 'Mărășești', 'Panciu', 'Odobești']
  }
];