'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Section {
  id: string;
  title: string;
  level: number;
}

interface CookbookClientProps {
  content: string;
  sections: Section[];
}

export default function CookbookClient({ content, sections }: CookbookClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContent, setFilteredContent] = useState(content);
  const [showToc, setShowToc] = useState(true);

  useEffect(() => {
    if (searchTerm) {
      const lines = content.split('\n');
      const filtered = lines.filter(line => 
        line.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContent(filtered.join('\n'));
    } else {
      setFilteredContent(content);
    }
  }, [searchTerm, content]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Content mit IDs für Überschriften
  const contentWithIds = filteredContent.split('\n').map((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const hashes = match[1];
      const text = match[2];
      return `${hashes} <span id="section-${index}">${text}</span>`;
    }
    return line;
  }).join('\n');

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12 bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-5xl font-bold text-green-800 mb-4">
            🌱 Veganes Langlebigkeits-Kochbuch
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            108 wissenschaftlich fundierte Rezepte für maximale Gesundheit
          </p>
          
          {/* Suchfeld */}
          <div className="max-w-2xl mx-auto mb-6">
            <input
              type="text"
              placeholder="🔍 Rezepte durchsuchen (z.B. 'Pfannkuchen', 'Protein', 'Low-Carb')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-sm text-green-600 hover:text-green-800"
              >
                ✕ Suche zurücksetzen
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <a 
              href="/Veganes_Langlebigkeits_Kochbuch_KOMPLETT.pdf" 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
              download
            >
              📥 PDF herunterladen (9.7 MB)
            </a>
            <button
              onClick={() => setShowToc(!showToc)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
            >
              {showToc ? '📖 Inhalt ausblenden' : '📖 Inhalt anzeigen'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar mit Inhaltsverzeichnis */}
          {showToc && (
            <aside className="lg:col-span-1">
              <div className="sticky top-4 bg-white rounded-lg shadow-lg p-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
                <h2 className="text-2xl font-bold text-green-800 mb-4 sticky top-0 bg-white pb-2">📑 Inhalt</h2>
                <nav className="space-y-1">
                  {sections.map((section, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToSection(section.id)}
                      className={`block w-full text-left py-2 px-3 rounded transition hover:bg-green-50 ${
                        section.level === 1 ? 'font-bold text-green-800 text-base mt-3' :
                        section.level === 2 ? 'font-semibold text-green-700 pl-4 text-sm' :
                        'text-gray-600 pl-8 text-xs'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Hauptinhalt */}
          <article className={`${showToc ? 'lg:col-span-3' : 'lg:col-span-4'} bg-white rounded-lg shadow-lg p-8`}>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl font-bold text-green-800 mt-8 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-green-700 mt-6 mb-3 border-b-2 border-green-200 pb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-2xl font-semibold text-green-600 mt-4 mb-2" {...props} />,
                }}
              >
                {contentWithIds}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
