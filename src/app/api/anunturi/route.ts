// ... (restul importurilor rămân la fel)

// În funcția POST, modifică partea cu location:
const location = await prisma.location.upsert({
  where: {
    county_city: {
      county: data.county,
      city: data.city
    }
  },
  update: {},
  create: {
    county: data.county,
    city: data.city
  }
});