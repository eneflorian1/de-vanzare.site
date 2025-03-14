# DeVanzare.site - Classified Ads Website

## About

DeVanzare.site is a modern classified ads platform for Romania, built with Next.js, Prisma, and MySQL.

## Getting Started

### Prerequisites

- Node.js (14.x or newer)
- MySQL server 
- npm or yarn

### Setting Up the Database

Make sure you have the MySQL server running and the connection string is set in your `.env` file.

### Installation

1. Clone the repository
2. Install dependencies
```bash
npm install
```
3. Push the database schema to your database
```bash
npm run prisma:push
```

### Seeding Categories

Before running the application, you need to seed the categories to ensure all functionality works correctly:

```bash
npm run seed:categories
```

This will populate your database with a complete hierarchy of categories and subcategories.

### Running the Application

To start the development server:

```bash
npm run dev
```

Or, to seed categories and run the development server with a single command:

```bash
npm run start:full
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Features

- Full category hierarchy for Romanian classified ads
- Location-based search with counties and cities
- Advanced search and filtering
- Responsive design with mobile support
- User authentication and account management

## How It Works

- The homepage displays popular categories and featured listings
- Use the search bar or browse by categories to find items
- Create an account to post your own listings
- Contact sellers directly through the platform

## Project Structure

- `/src` - Application source code
  - `/app` - Next.js app router
  - `/components` - React components
  - `/lib` - Utility functions
  - `/providers` - Context providers
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/scripts` - Database seeding scripts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
