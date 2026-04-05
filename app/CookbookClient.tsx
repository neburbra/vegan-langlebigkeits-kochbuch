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
  category: string;
  score?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  isLowCarb?: boolean;
  isHighProtein?: boolean;
}

export default function CookbookClient({ content, sections }: CookbookClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContent, setFilteredContent] = useState(content);
  const [showToc, setShowToc] = useState(true);
  const [filteredSections, setFilteredSections] = useState(sections);
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const [scoreFilter, setScoreFilter] = useState<string>('alle');
  const [dietFilter, setDietFilter] = useState<string>('alle');

  // Rezepte in Sections aufteilen und Metadaten extrahieren
  const recipes = useMemo(() => {
    const lines = content.split('\n');
    const recipeList: Recipe[] = [];
    let currentRecipe: Recipe | null = null;
    let currentCategory = '';
    
    lines.forEach((line, index) => {
      // Kategorie erkennen (# TEIL X: ...)
      const categoryMatch = line.match(/^#\s+TEIL\s+\d+:\s+(.+)$/i);
      if (categoryMatch) {
        currentCategory = categoryMatch[1];
      }
      
      // Rezept-Titel (## Nummer. Name)
      const recipeMatch = line.match(/^##\s+(\d+)\.\s+(.+)$/);
      if (recipeMatch) {
        if (currentRecipe) {
          recipeList.push(currentRecipe);
        }
        currentRecipe = {
          title: `${recipeMatch[1]}. ${recipeMatch[2]}`,
          content: line + '\n',
          startLine: index,
          category: currentCategory
        };
      } else if (currentRecipe) {
        currentRecipe.content += line + '\n';
        
        // Score extrahieren
        const scoreMatch = line.match(/\*\*Gesamt:\s*(\d+)\/100\*\*/);
        if (scoreMatch) {
          currentRecipe.score = parseInt(scoreMatch[1]);
        }
        
        // Kalorien extrahieren
        const calMatch = line.match(/Kalorien\s*\|\s*(\d+)\s*kcal/);
        if (calMatch) {
          currentRecipe.calories = parseInt(calMatch[1]);
        }
        
        // Protein extrahieren
        const proteinMatch = line.match(/Protein\s*\|\s*(\d+)g/);
        if (proteinMatch) {
          currentRecipe.protein = parseInt(proteinMatch[1]);
          currentRecipe.isHighProtein = currentRecipe.protein >= 20;
        }
        
        // Kohlenhydrate extrahieren
        const carbMatch = line.match(/Netto:\s*(\d+)g\)/);
        if (carbMatch) {
          currentRecipe.carbs = parseInt(carbMatch[1]);
          currentRecipe.isLowCarb = currentRecipe.carbs <= 30;
        }
      }
    });
    
    if (currentRecipe) {
      recipeList.push(currentRecipe);
    }
    
    return recipeList;
  }, [content]);

  // Kategorien für Filter
  const categories = useMemo(() => {
    const cats = new Set(recipes.map(r => r.category).filter(Boolean));
    return ['alle', ...Array.from(cats)];
  }, [recipes]);

  useEffect(() => {
    let matchingRecipes = recipes;
    
    // Textsuche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      matchingRecipes = matchingRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.content.toLowerCase().includes(searchLower)
      );
    }
    
    // Kategorie-Filter
    if (selectedCategory !== 'alle') {
      matchingRecipes = matchingRecipes.filter(r => r.category === selectedCategory);
    }
    
    // Score-Filter
    if (scoreFilter === 'top') {
      matchingRecipes = matchingRecipes.filter(r => (r.score || 0) >= 90);
    } else if (scoreFilter === 'gut') {
      matchingRecipes = matchingRecipes.filter(r => (r.score || 0) >= 80);
    }
    
    // Diät-Filter
    if (dietFilter === 'lowcarb') {
      matchingRecipes = matchingRecipes.filter(r => r.isLowCarb);
    } else if (dietFilter === 'highprotein') {
      matchingRecipes = matchingRecipes.filter(r => r.isHighProtein);
    } else if (dietFilter === 'lowcal') {
      matchingRecipes = matchingRecipes.filter(r => (r.calories || 0) <= 400);
    }
    
    // Content aktualisieren
    const filtered = matchingRecipes.map(r => r.content).join('\n---\n\n');
    setFilteredContent(filtered || '# 🔍 Keine Ergebnisse gefunden\n\nVersuche andere Filter oder Suchbegriffe.');
    
    // Inhaltsverzeichnis: NUR Rezepte (##-Ebene)
    const matchingTitles = new Set(matchingRecipes.map(r => r.title));
    const filteredSecs = sections.filter(s => s.level === 2 && matchingTitles.has(s.title));
    setFilteredSections(filteredSecs);
  }, [searchTerm, selectedCategory, scoreFilter, dietFilter, recipes, sections]);

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
        <header className="text-center mb-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-xl p-8 text-white">
          <h1 className="text-5xl font-bold mb-3">
            🌱 Veganes Langlebigkeits-Kochbuch
          </h1>
          <p className="text-xl mb-6 text-green-50">
            108 wissenschaftlich fundierte Rezepte für maximale Gesundheit
          </p>
          
          {/* Suchfeld */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Suche nach Rezepten, Zutaten oder Gerichten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 text-lg text-gray-800 border-2 border-white rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg"
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
          </div>

          {/* Filter-Chips */}
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Kategorie-Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-md ${
                    selectedCategory === cat
                      ? 'bg-white text-green-700 scale-105'
                      : 'bg-green-500 bg-opacity-30 text-white hover:bg-white hover:text-green-700'
                  }`}
                >
                  {cat === 'alle' ? '🍽️ Alle' : cat}
                </button>
              ))}
            </div>

            {/* Score & Diät-Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="px-4 py-2 rounded-full text-sm font-semibold text-green-700 bg-white shadow-md cursor-pointer hover:scale-105 transition"
              >
                <option value="alle">⭐ Alle Scores</option>
                <option value="top">⭐⭐⭐⭐⭐ Top (≥90)</option>
                <option value="gut">⭐⭐⭐⭐ Sehr gut (≥80)</option>
              </select>

              <select
                value={dietFilter}
                onChange={(e) => setDietFilter(e.target.value)}
                className="px-4 py-2 rounded-full text-sm font-semibold text-green-700 bg-white shadow-md cursor-pointer hover:scale-105 transition"
              >
                <option value="alle">🥗 Alle Rezepte</option>
                <option value="lowcarb">🥑 Low-Carb (≤30g)</option>
                <option value="highprotein">💪 High-Protein (≥20g)</option>
                <option value="lowcal">🔥 Low-Cal (≤400 kcal)</option>
              </select>

              {(selectedCategory !== 'alle' || scoreFilter !== 'alle' || dietFilter !== 'alle' || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedCategory('alle');
                    setScoreFilter('alle');
                    setDietFilter('alle');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-red-500 text-white shadow-md hover:bg-red-600 transition"
                >
                  ✕ Filter zurücksetzen
                </button>
              )}
            </div>
          </div>

          {/* Ergebnis-Anzeige */}
          <div className="mt-4 text-green-100 text-sm">
            {filteredSections.length} {filteredSections.length === 1 ? 'Rezept' : 'Rezepte'} gefunden
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 flex-wrap mt-6">
            <a 
              href="/Veganes_Langlebigkeits_Kochbuch_KOMPLETT.pdf" 
              className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl hover:scale-105"
              download
            >
              📥 PDF herunterladen
            </a>
            <button
              onClick={() => setShowToc(!showToc)}
              className="bg-green-700 bg-opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:bg-opacity-70"
            >
              {showToc ? '📖 Inhalt ausblenden' : '📖 Inhalt anzeigen'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar mit Rezept-Liste */}
          {showToc && (
            <aside className="lg:col-span-1">
              <div className="sticky top-4 bg-white rounded-xl shadow-lg p-5 max-h-[calc(100vh-2rem)] overflow-y-auto">
                <h2 className="text-xl font-bold text-green-800 mb-3 sticky top-0 bg-white pb-3 border-b-2 border-green-200">
                  📑 Rezepte ({filteredSections.length})
                </h2>
                <nav className="space-y-2">
                  {filteredSections.map((section, idx) => {
                    const recipe = recipes.find(r => r.title === section.title);
                    return (
                      <button
                        key={idx}
                        onClick={() => scrollToSection(section.id)}
                        className="block w-full text-left p-3 rounded-lg transition hover:bg-green-50 border border-gray-200 hover:border-green-300 hover:shadow-md group"
                        title={section.title}
                      >
                        <div className="font-semibold text-green-700 text-sm mb-1 group-hover:text-green-800">
                          {section.title.replace(/^\d+\.\s*/, '')}
                        </div>
                        {recipe && (
                          <div className="flex gap-2 text-xs text-gray-600">
                            {recipe.score && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                ⭐ {recipe.score}
                              </span>
                            )}
                            {recipe.calories && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                🔥 {recipe.calories}
                              </span>
                            )}
                            {recipe.protein && (
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                💪 {recipe.protein}g
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
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
