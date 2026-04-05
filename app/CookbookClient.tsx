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
      // URL mit Hash aktualisieren für teilbare Links
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const shareRecipe = async (recipe: Recipe) => {
    const recipeUrl = `${window.location.origin}${window.location.pathname}#section-${recipe.startLine}`;
    const shareText = `🌱 ${recipe.title}\n\nVeganes Langlebigkeits-Kochbuch\n${recipeUrl}`;
    
    // Mobile Share API (funktioniert auf mobilen Geräten)
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: shareText,
          url: recipeUrl
        });
      } catch (err) {
        // Fallback: Link kopieren
        copyToClipboard(recipeUrl);
      }
    } else {
      // Desktop: Link kopieren
      copyToClipboard(recipeUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('✅ Link kopiert! Jetzt in WhatsApp einfügen.');
    } catch (err) {
      alert(`Link: ${text}`);
    }
  };

  // Beim Laden: Zu Hash-Link scrollen
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, []);

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
        <header className="text-center mb-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-xl p-4 sm:p-8 text-white">
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-3">
            🌱 Veganes Kochbuch
          </h1>
          <p className="text-base sm:text-xl mb-4 sm:mb-6 text-green-50">
            108 gesunde Rezepte
          </p>
          
          {/* Suchfeld */}
          <div className="max-w-3xl mx-auto mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Rezepte suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg text-gray-800 border-2 border-white rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 text-xl sm:text-2xl font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter-Chips - Mobile optimiert */}
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3">
            {/* Kategorie-Filter - Horizontal scrollbar auf Mobile */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max px-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-md whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-white text-green-700 scale-105'
                        : 'bg-green-500 bg-opacity-30 text-white hover:bg-white hover:text-green-700'
                    }`}
                  >
                    {cat === 'alle' ? '🍽️ Alle' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Score & Diät-Filter - Mobile Stack */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2">
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-green-700 bg-white shadow-md cursor-pointer hover:scale-105 transition"
              >
                <option value="alle">⭐ Alle Scores</option>
                <option value="top">⭐⭐⭐⭐⭐ Top (≥90)</option>
                <option value="gut">⭐⭐⭐⭐ Gut (≥80)</option>
              </select>

              <select
                value={dietFilter}
                onChange={(e) => setDietFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-green-700 bg-white shadow-md cursor-pointer hover:scale-105 transition"
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
                  className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-red-500 text-white shadow-md hover:bg-red-600 transition"
                >
                  ✕ Zurücksetzen
                </button>
              )}
            </div>
          </div>

          {/* Ergebnis-Anzeige */}
          <div className="mt-3 sm:mt-4 text-green-100 text-xs sm:text-sm">
            {filteredSections.length} {filteredSections.length === 1 ? 'Rezept' : 'Rezepte'} gefunden
          </div>

          {/* Action Buttons - Mobile Stack */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
            <a 
              href="/Veganes_Langlebigkeits_Kochbuch_KOMPLETT.pdf" 
              className="bg-white text-green-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition shadow-lg hover:shadow-xl hover:scale-105"
              download
            >
              📥 PDF herunterladen
            </a>
            <button
              onClick={() => setShowToc(!showToc)}
              className="bg-green-700 bg-opacity-50 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition shadow-lg hover:bg-opacity-70"
            >
              {showToc ? '📖 Liste ausblenden' : '📖 Rezept-Liste'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Sidebar mit Rezept-Liste - Mobile: Full Width, Desktop: Sidebar */}
          {showToc && (
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-4 bg-white rounded-xl shadow-lg p-3 sm:p-5 max-h-[60vh] lg:max-h-[calc(100vh-2rem)] overflow-y-auto">
                <h2 className="text-lg sm:text-xl font-bold text-green-800 mb-2 sm:mb-3 sticky top-0 bg-white pb-2 sm:pb-3 border-b-2 border-green-200">
                  📑 Rezepte ({filteredSections.length})
                </h2>
                <nav className="space-y-2">
                  {filteredSections.map((section, idx) => {
                    const recipe = recipes.find(r => r.title === section.title);
                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition group">
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className="block w-full text-left p-2 sm:p-3"
                          title={section.title}
                        >
                          <div className="font-semibold text-green-700 text-xs sm:text-sm mb-1 group-hover:text-green-800">
                            {section.title.replace(/^\d+\.\s*/, '')}
                          </div>
                          {recipe && (
                            <div className="flex flex-wrap gap-1 sm:gap-2 text-xs">
                              {recipe.score && (
                                <span className="bg-yellow-100 text-yellow-800 px-1.5 sm:px-2 py-0.5 rounded text-xs">
                                  ⭐ {recipe.score}
                                </span>
                              )}
                              {recipe.calories && (
                                <span className="bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 rounded text-xs">
                                  🔥 {recipe.calories}
                                </span>
                              )}
                              {recipe.protein && (
                                <span className="bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 rounded text-xs">
                                  💪 {recipe.protein}g
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                        {/* WhatsApp Share Button */}
                        {recipe && (
                          <div className="border-t border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 flex gap-2">
                            <button
                              onClick={() => shareRecipe(recipe)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm py-1 sm:py-1.5 rounded font-semibold transition flex items-center justify-center gap-1"
                            >
                              <span>📱</span>
                              <span className="hidden sm:inline">Teilen</span>
                            </button>
                            <button
                              onClick={() => {
                                const url = `${window.location.origin}${window.location.pathname}#section-${recipe.startLine}`;
                                copyToClipboard(url);
                              }}
                              className="px-2 sm:px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs sm:text-sm py-1 sm:py-1.5 rounded font-semibold transition"
                              title="Link kopieren"
                            >
                              🔗
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            </aside>
          )}

          {/* Hauptinhalt */}
          <article className={`${showToc ? 'lg:col-span-3' : 'lg:col-span-4'} bg-white rounded-xl shadow-lg p-4 sm:p-8`}>
            <div className="prose prose-sm sm:prose-lg max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl sm:text-4xl font-bold text-green-800 mt-6 sm:mt-8 mb-3 sm:mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl sm:text-3xl font-bold text-green-700 mt-4 sm:mt-6 mb-2 sm:mb-3 border-b-2 border-green-200 pb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg sm:text-2xl font-semibold text-green-600 mt-3 sm:mt-4 mb-2" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto"><table {...props} /></div>,
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
