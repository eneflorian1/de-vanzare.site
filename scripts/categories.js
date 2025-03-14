// scripts/categories.js
const categoriesStructure = [
  {
    name: "Auto, moto și ambarcațiuni",
    slug: "auto-moto",
    iconName: "car",
    subcategories: [
      { name: "Autoturisme", slug: "autoturisme" },
      { name: "Autoutilitare", slug: "autoutilitare" },
      { name: "Motociclete", slug: "motociclete" },
      { name: "Camioane", slug: "camioane" },
      { name: "Piese auto", slug: "piese-auto" },
      { name: "Ambarcațiuni", slug: "ambarcatiuni" },
      { name: "Remorci", slug: "remorci" },
      { name: "Vehicule electrice", slug: "vehicule-electrice" },
      { name: "ATV-uri", slug: "atv-uri" },
      { name: "Accesorii auto", slug: "accesorii-auto" },
      { name: "Anvelope și jante", slug: "anvelope-jante" },
      { name: "Servicii auto", slug: "servicii-auto" }
    ]
  },
  {
    name: "Imobiliare",
    slug: "imobiliare",
    iconName: "building",
    subcategories: [
      { name: "Apartamente de vânzare", slug: "apartamente-vanzare" },
      { name: "Apartamente de închiriat", slug: "apartamente-inchiriere" },
      { name: "Case și vile de vânzare", slug: "case-vile-vanzare" },
      { name: "Case și vile de închiriat", slug: "case-vile-inchiriere" },
      { name: "Terenuri", slug: "terenuri" },
      { name: "Spații comerciale", slug: "spatii-comerciale" },
      { name: "Garaje", slug: "garaje" },
      { name: "Birouri", slug: "birouri" },
      { name: "Ansambluri rezidențiale", slug: "ansambluri-rezidentiale" }
    ]
  },
  {
    name: "Electronice și electrocasnice",
    slug: "electronice-electrocasnice",
    iconName: "smartphone",
    subcategories: [
      { name: "Telefoane", slug: "telefoane" },
      { name: "Laptop, PC, Tablete", slug: "laptop-pc-tablete" },
      { name: "TV, Audio, Video", slug: "tv-audio-video" },
      { name: "Foto & Video", slug: "foto-video" },
      { name: "Electrocasnice", slug: "electrocasnice" },
      { name: "Piese și accesorii", slug: "piese-accesorii-electronice" },
      { name: "Console și jocuri video", slug: "console-jocuri" },
      { name: "Climatizare", slug: "climatizare" }
    ]
  },
  {
    name: "Modă și frumusețe",
    slug: "moda-frumusete",
    iconName: "shopping-bag",
    subcategories: [
      { name: "Haine damă", slug: "haine-dama" },
      { name: "Haine bărbați", slug: "haine-barbati" },
      { name: "Haine copii", slug: "haine-copii" },
      { name: "Încălțăminte", slug: "incaltaminte" },
      { name: "Accesorii & Bijuterii", slug: "accesorii-bijuterii" },
      { name: "Cosmetice", slug: "cosmetice" },
      { name: "Ceasuri", slug: "ceasuri" },
      { name: "Genți", slug: "genti" }
    ]
  },
  {
    name: "Casă și grădină",
    slug: "casa-gradina",
    iconName: "home",
    subcategories: [
      { name: "Mobilă", slug: "mobila" },
      { name: "Decorațiuni", slug: "decoratiuni" },
      { name: "Unelte de grădină", slug: "unelte-gradina" },
      { name: "Plante", slug: "plante" },
      { name: "Materiale de construcții", slug: "materiale-constructii" },
      { name: "Uși, ferestre, acoperișuri", slug: "usi-ferestre-acoperisuri" },
      { name: "Textile casă", slug: "textile-casa" },
      { name: "Iluminat", slug: "iluminat" },
      { name: "Instalații sanitare și termice", slug: "sanitare-termice" },
      { name: "Bricolaj și scule", slug: "bricolaj-scule" }
    ]
  },
  {
    name: "Mame și copii",
    slug: "mama-copil",
    iconName: "baby",
    subcategories: [
      { name: "Articole pentru bebeluși", slug: "articole-bebelusi" },
      { name: "Jucării", slug: "jucarii" },
      { name: "Haine copii", slug: "haine-copii-2" },
      { name: "Cărucioare și accesorii", slug: "carucioare-accesorii" },
      { name: "Mobilier copii", slug: "mobilier-copii" },
      { name: "Articole școlare", slug: "articole-scolare" }
    ]
  },
  {
    name: "Sport, timp liber și artă",
    slug: "sport-timp-liber",
    iconName: "activity",
    subcategories: [
      { name: "Articole sportive", slug: "articole-sportive" },
      { name: "Biciclete", slug: "biciclete" },
      { name: "Echipament outdoor", slug: "echipament-outdoor" },
      { name: "Cărți", slug: "carti" },
      { name: "Antichități", slug: "antichitati" },
      { name: "Instrumente muzicale", slug: "instrumente-muzicale" },
      { name: "Colecții", slug: "colectii" },
      { name: "Filmări și artă", slug: "filmari-arta" },
      { name: "Bilete evenimente", slug: "bilete-evenimente" }
    ]
  },
  {
    name: "Animale de companie",
    slug: "animale",
    iconName: "paw",
    subcategories: [
      { name: "Câini", slug: "caini" },
      { name: "Pisici", slug: "pisici" },
      { name: "Păsări", slug: "pasari" },
      { name: "Accesorii animale", slug: "accesorii-animale" },
      { name: "Hrană animale", slug: "hrana-animale" },
      { name: "Alte animale", slug: "alte-animale" }
    ]
  },
  {
    name: "Agricultură și industrie",
    slug: "agricultura-industrie",
    iconName: "tractor",
    subcategories: [
      { name: "Utilaje agricole", slug: "utilaje-agricole" },
      { name: "Utilaje industriale", slug: "utilaje-industriale" },
      { name: "Produse agricole", slug: "produse-agricole" },
      { name: "Animale de fermă", slug: "animale-ferma" },
      { name: "Terenuri agricole", slug: "terenuri-agricole" },
      { name: "Echipamente profesionale", slug: "echipamente-profesionale" }
    ]
  },
  {
    name: "Locuri de muncă",
    slug: "locuri-munca",
    iconName: "briefcase",
    subcategories: [
      { name: "Full time", slug: "full-time" },
      { name: "Part time", slug: "part-time" },
      { name: "Freelance", slug: "freelance" },
      { name: "Sezonier", slug: "sezonier" },
      { name: "Internship", slug: "internship" },
      { name: "Cursuri și training", slug: "cursuri-training" }
    ]
  },
  {
    name: "Servicii",
    slug: "servicii",
    iconName: "tool",
    subcategories: [
      { name: "Transport și curierat", slug: "transport-curierat" },
      { name: "Construcții și amenajări", slug: "constructii-amenajari" },
      { name: "Servicii medicale", slug: "servicii-medicale" },
      { name: "Servicii auto", slug: "servicii-auto-2" },
      { name: "Cursuri și meditații", slug: "cursuri-meditatii" },
      { name: "Servicii IT", slug: "servicii-it" },
      { name: "Organizare evenimente", slug: "organizare-evenimente" },
      { name: "Frumusețe și îngrijire", slug: "frumusete-ingrijire" },
      { name: "Reparații electrocasnice", slug: "reparatii-electrocasnice" },
      { name: "Servicii juridice", slug: "servicii-juridice" }
    ]
  },
  {
    name: "Afaceri, echipamente firme",
    slug: "afaceri-firme",
    iconName: "briefcase",
    subcategories: [
      { name: "Echipamente firme", slug: "echipamente-firme" },
      { name: "Afaceri de vânzare", slug: "afaceri-vanzare" },
      { name: "Servicii pentru afaceri", slug: "servicii-afaceri" },
      { name: "Colaborări afaceri", slug: "colaborari-afaceri" }
    ]
  }
];

// Function to convert this structure to database seeds
function convertToSeeds() {
  let seeds = [];
  let id = 1;
  
  categoriesStructure.forEach((category, index) => {
    // Add main category
    const parentId = id;
    seeds.push({
      id: parentId,
      name: category.name,
      slug: category.slug,
      parentId: null,
      description: `Anunțuri din categoria ${category.name}`,
      iconName: category.iconName || null,
      order: index + 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    id++;
    
    // Add subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach((subcat, subIndex) => {
        seeds.push({
          id: id,
          name: subcat.name,
          slug: subcat.slug,
          parentId: parentId,
          description: `Anunțuri din subcategoria ${subcat.name}`,
          iconName: null,
          order: subIndex + 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        id++;
      });
    }
  });
  
  return seeds;
}

module.exports = {
  categoriesStructure,
  convertToSeeds
};
