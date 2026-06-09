import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'AlgoVerse — Learn. Visualize. Master.',
  description: 'The world\'s most advanced interactive algorithm visualization and computer science learning platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col">
        {/* Glow backdrop decorative layout elements */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <Navbar />
        
        {/* Add space below navbar */}
        <main className="flex-1 pt-16 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
