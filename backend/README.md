# Fotografo Backend API

Backend API built with TypeScript, Express.js, PostgreSQL, and Prisma.

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**
   Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fotografo_db?schema=public"
NODE_ENV=development
PORT=3000
```

3. **Start PostgreSQL with Docker:**
   From the project root:

```bash
docker-compose up -d
```

4. **Generate Prisma Client:**

```bash
npm run prisma:generate
```

5. **Run database migrations:**

```bash
npm run prisma:migrate
```

6. **Start the development server:**

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without emitting files

## API Endpoints

- `GET /api/v1/health` - Health check endpoint

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers/handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models (Prisma)
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic layer
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Helper functions
│   ├── validators/      # Input validation (Zod)
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   └── schema.prisma    # Prisma schema
└── dist/                # Compiled JavaScript (generated)
```
