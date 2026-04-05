'use client';

import { useState, useEffect, useMemo } from 'react';
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

interface Recipe {
  title: string;
  content: string;
  startLine: number;
}

export default function CookbookClient({ content, sections }: CookbookClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContent, setFilteredContent] = useState(content);
  const [showToc, setShowToc] = useState(true);
  const [filteredSections, setFilteredSections] = useState(sections);

  // Rezepte in Sections aufteilen
  const recipes = useMemo(() => {
    const lines = content.split('\n');
    const recipeList: Recipe[] = [];
    let currentRecipe: Recipe | null = null;
    
    lines.forEach((line, index) => {
      const match = line.match(/^##\s+(.+)$/);
      if (match) {
        if (currentRecipe) {
          recipeList.push(currentRecipe);
        }
        currentRecipe = {
          title: match[1],
          content: line + '\n',
          startLine: index
        };
      } else if (currentRecipe) {
        currentRecipe.content += line + '\n';
      }
    });
    
    if (currentRecipe) {
      recipeList.push(currentRecipe);
    }
    
    return recipeList;
  }, [content]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      
      // Finde alle Rezepte, die den Suchbegriff enthalten
      const matchingRecipes = recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.content.toLowerCase().includes(searchLower)
      );
      
      // Zeige nur die gefundenen Rezepte komplett an
      const filtered = matchingRecipes.map(r => r.content).join('\n---\n\n');
      setFilteredContent(filtered || '# Keine Ergebnisse gefunden\n\nVersuche einen anderen Suchbegriff.');
      
      // Filtere auch das Inhaltsverzeichnis
      const matchingTitles = new Set(matchingRecipes.map(r => r.title));
      const filteredSecs = sections.filter(s => 
        matchingTitles.has(s.title) || s.title.toLowerCase().includes(searchLower)
      );
      setFilteredSections(filteredSecs);
    } else {
      setFilteredContent(content);
      setFilteredSections(sections);
    }
  }, [searchTerm, content, recipes, sections]);

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
            <div className="relative">
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 text-2xl font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-600 bg-green-50 px-4 py-2 rounded">
                {filteredSections.length > 0 
                  ? `${filteredSections.length} Ergebnis(se) gefunden - Komplette Rezepte werden angezeigt`
                  : 'Keine Ergebnisse gefunden'}
              </div>
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
                <h2 className="text-2xl font-bold text-green-800 mb-4 sticky top-0 bg-white pb-2 border-b-2 border-green-200">
                  📑 Inhalt
                  {searchTerm && (
                    <div className="text-xs font-normal text-gray-500 mt-1">
                      ({filteredSections.length} gefiltert)
                    </div>
                  )}
                </h2>
                <nav className="space-y-1">
                  {filteredSections.map((section, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToSection(section.id)}
                      className={`block w-full text-left py-2 px-3 rounded transition hover:bg-green-100 ${
                        section.level === 1 ? 'font-bold text-green-800 text-base mt-4 bg-green-50' :
                        section.level === 2 ? 'font-semibold text-green-700 pl-3 text-sm mt-2 border-l-4 border-green-300' :
                        'text-gray-600 pl-6 text-xs hover:text-green-700'
                      }`}
                      title={section.title}
                    >
                      <span className={section.level === 2 ? 'line-clamp-2' : ''}>
                        {section.title}
                      </span>
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
