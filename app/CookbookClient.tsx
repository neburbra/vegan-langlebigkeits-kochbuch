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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [scoreFilter, setScoreFilter] = useState<string>('alle');
  const [dietFilters, setDietFilters] = useState<string[]>([]);
  const [showOnlyRecipes, setShowOnlyRecipes] = useState(true);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleDietFilter = (filter: string) => {
    setDietFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  // Rezepte in Sections aufteilen und Metadaten extrahieren
  const recipes = useMemo(() => {
    const lines = content.split('\n');
    const recipeList: Recipe[] = [];
    let currentRecipe: Recipe | null = null;
    let currentCategory = '';
    
    lines.forEach((line, index) => {
      const categoryMatch = line.match(/^#\s+TEIL\s+\d+:\s+(.+)$/i);
      if (categoryMatch) {
        currentCategory = categoryMatch[1];
      }
      
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
        
        const scoreMatch = line.match(/\*\*Gesamt:\s*(\d+)\/100\*\*/);
        if (scoreMatch) {
          currentRecipe.score = parseInt(scoreMatch[1]);
        }
        
        const calMatch = line.match(/Kalorien\s*\|\s*(\d+)\s*kcal/);
        if (calMatch) {
          currentRecipe.calories = parseInt(calMatch[1]);
        }
        
        const proteinMatch = line.match(/Protein\s*\|\s*(\d+)g/);
        if (proteinMatch) {
          currentRecipe.protein = parseInt(proteinMatch[1]);
          currentRecipe.isHighProtein = currentRecipe.protein >= 20;
        }
        
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

  const categories = useMemo(() => {
    const cats = new Set(recipes.map(r => r.category).filter(Boolean));
    return Array.from(cats);
  }, [recipes]);

  useEffect(() => {
    if (!showOnlyRecipes) {
      setFilteredContent(content);
      setFilteredSections(sections);
      return;
    }

    let matchingRecipes = recipes;
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      matchingRecipes = matchingRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.content.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedCategories.length > 0) {
      matchingRecipes = matchingRecipes.filter(r => selectedCategories.includes(r.category));
    }
    
    if (scoreFilter === 'top') {
      matchingRecipes = matchingRecipes.filter(r => (r.score || 0) >= 90);
    } else if (scoreFilter === 'gut') {
      matchingRecipes = matchingRecipes.filter(r => (r.score || 0) >= 80);
    }
    
    if (dietFilters.includes('lowcarb')) {
      matchingRecipes = matchingRecipes.filter(r => r.isLowCarb);
    }
    if (dietFilters.includes('highprotein')) {
      matchingRecipes = matchingRecipes.filter(r => r.isHighProtein);
    }
    if (dietFilters.includes('lowcal')) {
      matchingRecipes = matchingRecipes.filter(r => (r.calories || 0) <= 400);
    }
    
    const filtered = matchingRecipes.map(r => r.content).join('\n---\n\n');
    setFilteredContent(filtered || '# Keine Ergebnisse gefunden\n\nVersuche andere Filter oder Suchbegriffe.');
    
    const matchingTitles = new Set(matchingRecipes.map(r => r.title));
    const filteredSecs = sections.filter(s => s.level === 2 && matchingTitles.has(s.title));
    setFilteredSections(filteredSecs);
  }, [searchTerm, selectedCategories, scoreFilter, dietFilters, showOnlyRecipes, recipes, sections, content]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const shareRecipe = async (recipe: Recipe) => {
    const recipeUrl = `${window.location.origin}${window.location.pathname}#section-${recipe.startLine}`;
    const shareText = `${recipe.title}\n\nVeganes Langlebigkeits-Kochbuch\n${recipeUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: shareText,
          url: recipeUrl
        });
      } catch (err) {
        copyToClipboard(recipeUrl);
      }
    } else {
      copyToClipboard(recipeUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link kopiert!');
    } catch (err) {
      alert(`Link: ${text}`);
    }
  };

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
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-6 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-xl p-6 text-white">
          <h1 className="text-4xl font-bold mb-2">
            Veganes Langlebigkeits-Kochbuch
          </h1>
          <p className="text-lg mb-5 text-slate-300">
            108 wissenschaftlich fundierte Rezepte
          </p>
          
          {/* View Toggle */}
          <div className="flex justify-center gap-3 mb-5">
            <button
              onClick={() => setShowOnlyRecipes(true)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                showOnlyRecipes
                  ? 'bg-white text-slate-800 shadow-lg'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Rezepte
            </button>
            <button
              onClick={() => setShowOnlyRecipes(false)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                !showOnlyRecipes
                  ? 'bg-white text-slate-800 shadow-lg'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              Komplett
            </button>
          </div>

          {showOnlyRecipes && (
            <>
              {/* Suchfeld */}
              <div className="max-w-2xl mx-auto mb-5">
                <input
                  type="text"
                  placeholder="Rezepte durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 text-slate-800 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                />
              </div>

              {/* Filter */}
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Kategorien */}
                <div className="bg-slate-700 bg-opacity-40 rounded-xl p-4">
                  <div className="text-sm font-medium mb-3 text-slate-200">
                    Kategorien {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedCategories.length > 0 && (
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-800 hover:bg-slate-100 transition"
                      >
                        Alle
                      </button>
                    )}
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedCategories.includes(cat)
                            ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                            : 'bg-slate-600 text-slate-200 hover:bg-slate-500'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Analytische Filter */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="alle">Alle Qualitäten</option>
                    <option value="top">Exzellent (≥90)</option>
                    <option value="gut">Sehr gut (≥80)</option>
                  </select>

                  {['lowcarb', 'highprotein', 'lowcal'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => toggleDietFilter(filter)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                        dietFilters.includes(filter)
                          ? 'bg-green-500 text-white ring-2 ring-green-300'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {filter === 'lowcarb' && 'Low-Carb'}
                      {filter === 'highprotein' && 'High-Protein'}
                      {filter === 'lowcal' && 'Low-Cal'}
                    </button>
                  ))}

                  {(selectedCategories.length > 0 || scoreFilter !== 'alle' || dietFilters.length > 0 || searchTerm) && (
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setScoreFilter('alle');
                        setDietFilters([]);
                        setSearchTerm('');
                      }}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
                    >
                      Zurücksetzen
                    </button>
                  )}
                </div>
              </div>

              {/* Ergebnis */}
              <div className="mt-4 text-slate-300 text-sm font-medium">
                {filteredSections.length} {filteredSections.length === 1 ? 'Rezept' : 'Rezepte'}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <a 
              href="/Veganes_Langlebigkeits_Kochbuch_KOMPLETT.pdf" 
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition shadow-lg"
              download
            >
              PDF Download
            </a>
            <button
              onClick={() => setShowToc(!showToc)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-600 text-white hover:bg-slate-500 transition shadow-lg"
            >
              {showToc ? 'Liste ausblenden' : 'Liste anzeigen'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          {showToc && (
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-4 bg-white rounded-xl shadow-lg p-4 max-h-[70vh] lg:max-h-[calc(100vh-2rem)] overflow-y-auto">
                <h2 className="text-lg font-bold text-slate-800 mb-3 pb-3 border-b-2 border-slate-200">
                  {showOnlyRecipes ? `Rezepte (${filteredSections.length})` : 'Inhaltsverzeichnis'}
                </h2>
                <nav className="space-y-2">
                  {showOnlyRecipes ? (
                    filteredSections.map((section, idx) => {
                      const recipe = recipes.find(r => r.title === section.title);
                      return (
                        <div key={idx} className="border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition">
                          <button
                            onClick={() => scrollToSection(section.id)}
                            className="block w-full text-left p-3"
                          >
                            <div className="font-semibold text-slate-700 text-sm mb-1.5">
                              {section.title.replace(/^\d+\.\s*/, '')}
                            </div>
                            {recipe && (
                              <div className="flex flex-wrap gap-1.5 text-xs">
                                {recipe.score && (
                                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                                    {recipe.score}
                                  </span>
                                )}
                                {recipe.calories && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                                    {recipe.calories} kcal
                                  </span>
                                )}
                                {recipe.protein && (
                                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                                    {recipe.protein}g
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                          {recipe && (
                            <div className="border-t border-slate-200 px-3 py-2 flex gap-2">
                              <button
                                onClick={() => shareRecipe(recipe)}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 rounded font-medium transition"
                              >
                                Teilen
                              </button>
                              <button
                                onClick={() => {
                                  const url = `${window.location.origin}${window.location.pathname}#section-${recipe.startLine}`;
                                  copyToClipboard(url);
                                }}
                                className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs py-1.5 rounded font-medium transition"
                              >
                                Link
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    filteredSections.map((section, idx) => (
                      <button
                        key={idx}
                        onClick={() => scrollToSection(section.id)}
                        className={`block w-full text-left py-2 px-3 rounded-lg transition hover:bg-slate-50 ${
                          section.level === 1 ? 'font-bold text-slate-800 text-base mt-3 bg-slate-50' :
                          section.level === 2 ? 'font-semibold text-slate-700 pl-4 text-sm border-l-4 border-blue-300' :
                          'text-slate-600 pl-6 text-xs'
                        }`}
                      >
                        {section.title}
                      </button>
                    ))
                  )}
                </nav>
              </div>
            </aside>
          )}

          {/* Content */}
          <article className={`${showToc ? 'lg:col-span-3' : 'lg:col-span-4'} bg-white rounded-xl shadow-lg p-6`}>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-slate-800 mt-6 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-700 mt-5 mb-3 border-b-2 border-slate-200 pb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-slate-600 mt-4 mb-2" {...props} />,
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
