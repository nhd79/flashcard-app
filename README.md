# Chinese Flashcards App 🇨🇳

A modern, interactive flashcard application for learning Chinese vocabulary with Vietnamese translations. Built with Next.js and featuring a clean, responsive design.

## ✨ Features

- **Interactive Flashcards**: Click to flip between Chinese characters and Vietnamese translations
- **Audio Pronunciation**: Text-to-speech functionality for Chinese characters
- **Pinyin Support**: Optional pinyin phonetic transcription for better pronunciation
- **Example Sentences**: Context sentences to understand word usage
- **Card Management**: Add, edit, and delete flashcards easily
- **Multiple Lists**: Organize flashcards into different study lists
- **Local Storage**: Your progress is saved locally in your browser
- **Progressive Web App (PWA)**: Install on your device for offline access and native app-like experience
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🚀 Demo

The app includes default vocabulary covering:

- Basic greetings (你好, 谢谢, 再见)
- Common phrases (早上好, 对不起, 我爱你)
- Question words (你好吗？, 多少钱？)

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend**: [Supabase](https://supabase.com/) (optional for cloud sync)

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/flashcard-app.git
   cd flashcard-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables** (optional)

   ```bash
   cp .env.example .env.local
   ```

   Add your Supabase credentials if you want cloud sync functionality.

4. **Run the development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Creating Flashcards

1. Navigate to "Quản lý thẻ" (Manage Cards)
2. Fill in the form with:
   - **Chinese characters** (required)
   - **Pinyin** (optional)
   - **Example sentence** (optional)
   - **Vietnamese translation** (required)
3. Click "Thêm thẻ" to add the card

### Studying

1. Select a flashcard list from the main page
2. Click cards to flip between Chinese and Vietnamese
3. Use the speaker icon for audio pronunciation
4. Navigate with "Thẻ tiếp theo" (Next Card) button

### Managing Cards

- **Edit**: Click the pencil icon to modify existing cards
- **Delete**: Click the trash icon to remove cards
- **Lists**: Create multiple lists to organize different topics

## 🌐 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: Environment variables are optional. The app works with local storage only.

## 📱 Screenshots

### Main Interface

- Clean, card-based design
- Vietnamese interface with Chinese vocabulary
- Audio pronunciation support

### Card Management

- Easy-to-use forms for adding new vocabulary
- Edit existing cards with modal dialogs
- Organize cards into themed lists

---

**Happy Learning! 学习愉快！**
