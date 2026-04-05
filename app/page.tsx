import { promises as fs } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default async function Home() {
  const filePath = path.join(process.cwd(), 'KOCHBUCH_VOLLSTÄNDIG_FINAL.md');
  const content = await fs.readFile(filePath, 'utf8');

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-800 mb-4">
            🌱 Veganes Langlebigkeits-Kochbuch
          </h1>
          <p className="text-xl text-gray-700">
            108 wissenschaftlich fundierte Rezepte für maximale Gesundheit
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a 
              href="/Veganes_Langlebigkeits_Kochbuch_KOMPLETT.pdf" 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              download
            >
              📥 PDF herunterladen (9.7 MB)
            </a>
          </div>
        </header>
        
        <article className="prose prose-lg prose-green max-w-none bg-white rounded-lg shadow-lg p-8">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
