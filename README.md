<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TimeFlow AI - 想い出を動画に

AIで写真が、動き出す。静止した想い出を、動きのある物語に変えましょう。

View your app in AI Studio: https://ai.studio/apps/drive/1xymZlG-nhmH0P2s87jvM5xdvK0NCMgKg

## 🚀 Features

- **User Authentication**: Clerk authentication for secure user management
- **Video Generation**: Transform static images into animated videos using Veo AI
- **Video Gallery**: Save and manage your generated videos
- **Cloud Storage**: Videos are stored in Vercel Blob
- **Database**: Video metadata is stored in Vercel Postgres

## 📋 Prerequisites

- Node.js (v18 or higher)
- Gemini API Key
- Clerk Account
- Vercel Account (for deployment)

## 🛠️ Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Copy `.env.local.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.local.example .env.local
   ```

   Required environment variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `CLERK_SECRET_KEY`: Your Clerk secret key

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🚢 Deployment to Vercel

1. **Push your code to GitHub**

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import your repository
   - Vercel will automatically detect the framework (Vite)

3. **Set up Vercel Postgres:**
   - Go to your project settings in Vercel
   - Navigate to "Storage" tab
   - Create a new Postgres database
   - Vercel will automatically set `POSTGRES_URL`

4. **Set up Vercel Blob:**
   - In the "Storage" tab
   - Create a new Blob storage
   - Vercel will automatically set `BLOB_READ_WRITE_TOKEN`

5. **Set environment variables:**
   Add the following environment variables in Vercel:
   - `GEMINI_API_KEY`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

6. **Deploy:**
   Click "Deploy" and your app will be live!

## 📁 Project Structure

```
.
├── api/                    # Vercel Serverless Functions
│   ├── generate-video.ts  # Generate and save videos
│   ├── get-videos.ts      # Fetch user videos
│   └── delete-video.ts    # Delete videos
├── components/            # React components
│   ├── VideoGallery.tsx   # Video gallery view
│   ├── VideoPlayer.tsx    # Video player
│   └── ...
├── services/              # Services
│   ├── geminiService.ts   # Client-side video generation
│   └── videoApiService.ts # API service for video generation
├── types.ts               # TypeScript type definitions
├── App.tsx                # Main application component
└── vite.config.ts         # Vite configuration
```

## 🔑 Environment Variables

### Frontend (Vite)
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk publishable key for authentication

### Backend (Serverless Functions)
- `GEMINI_API_KEY`: Gemini API key for video generation
- `CLERK_SECRET_KEY`: Clerk secret key for authentication
- `POSTGRES_URL`: Postgres connection URL (auto-configured on Vercel)
- `BLOB_READ_WRITE_TOKEN`: Blob storage token (auto-configured on Vercel)

## 📝 License

This project is licensed under the MIT License.
