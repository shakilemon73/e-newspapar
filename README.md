# প্রথম আলো - Bengali News Website

A modern Bengali news website with responsive design, e-paper functionality, and personalized content recommendations.

## Features

- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **User Authentication**: Secure login/registration system powered by Supabase
- **Content Management**: Articles, categories, e-papers, and breaking news
- **E-Paper Support**: Digital newspaper reading experience
- **Personalized Recommendations**: Content tailored to user reading habits
- **Reading History**: Track and display user reading patterns
- **Dark/Light Mode**: UI theme switching for better reading experience
- **Multimedia Support**: Videos, audio articles, and image galleries
- **Weather Widget**: Current weather information for multiple cities
- **Breaking News Ticker**: Highlight important breaking news

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Routing**: wouter
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation

## Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/bangla-news-website.git
cd bangla-news-website
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_connection_string
```

4. Start the development server
```bash
npm run dev
```

## Deployment

This project is configured for easy deployment to Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy

## License

[MIT License](LICENSE)