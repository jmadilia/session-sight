# SessionSight

A modern journaling and mood tracking application with AI-powered insights, built with Next.js and Supabase.

## Features

- **Personal Journaling**: Create and manage journal entries with rich text content
- **Mood Tracking**: Track your emotional state with numerical mood scores
- **Smart Tagging**: Organize entries with customizable colored tags
- **AI Insights**: Get automated sentiment analysis and key theme extraction
- **User Profiles**: Personalized experience with avatar support
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Data**: Powered by Supabase for instant updates

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd sessionsight
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**

   Create a `.env.local` file with your Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

4. **Set up the database**

   Run the SQL scripts in your Supabase SQL editor:
   \`\`\`bash

   # First, run the table creation script

   scripts/01-create-tables.sql

   # Then, run the seed data script

   scripts/02-seed-data.sql
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses 5 main tables:

- **`profiles`** - User profile information
- **`entries`** - Journal entries with mood scores
- **`tags`** - Reusable tags with colors
- **`entry_tags`** - Many-to-many relationship between entries and tags
- **`insights`** - AI-generated insights for entries

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Features Implementation

- **Authentication**: Uses Supabase Auth with email/password
- **Real-time Updates**: Leverages Supabase real-time subscriptions
- **Form Validation**: Zod schemas with React Hook Form
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## Deployment

The app is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

