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
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [scoreFilter, setScoreFilter] = useState<string>('alle');
  const [dietFilters, setDietFilters] = useState<string[]>([]);
  const [showOnlyRecipes, setShowOnlyRecipes] = useState(true);
  const [expandedRecipes, setExpandedRecipes] = useState<Set<number>>(new Set());

  const toggleExpanded = (idx: number) => {
    setExpandedRecipes(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

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

  // Rezepte extrahieren  
  const recipes = useMemo(() => {
    const lines = content.split('\n');
    const recipeList: Recipe[] = [];
    let currentRecipe: Recipe | null = null;
    let currentCategory = '';
    let isInRecipeSection = false;
    
    lines.forEach((line, index) => {
      // Einfachstes Pattern: Zeile beginnt mit "# TEIL"
      if (line.startsWith('# TEIL')) {
        isInRecipeSection = true;
        // Alles nach dem Doppelpunkt ist die Kategorie
        const parts = line.split(':');
        if (parts.length > 1) {
          currentCategory = parts[1].trim();
        } else {
          currentCategory = line.replace(/^#\s+TEIL\s+\d+\s*/, '').trim();
        }
        console.log('Kategorie START:', currentCategory, '(von Zeile:', line.substring(0, 50), ')');
        return;
      }
      
      // Rezepte: ## gefolgt von Nummer und Punkt
      if (isInRecipeSection && line.startsWith('## ')) {
        const match = line.match(/^##\s+(\d+)\.\s+(.+)/); // Kein $ am Ende
        if (match) {
          if (currentRecipe) {
            recipeList.push(currentRecipe);
          }
          currentRecipe = {
            title: `${match[1]}. ${match[2].trim()}`,
            content: line + '\n',
            startLine: index,
            category: currentCategory
          };
        }
      } else if (currentRecipe) {
        currentRecipe.content += line + '\n';
        
        const scoreMatch = line.match(/\*\*Gesamt:\s*(\d+)\/100\*\*/);
        if (scoreMatch) currentRecipe.score = parseInt(scoreMatch[1]);
        
        const calMatch = line.match(/Kalorien\s*\|\s*(\d+)\s*kcal/);
        if (calMatch) currentRecipe.calories = parseInt(calMatch[1]);
        
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
    
    if (currentRecipe) recipeList.push(currentRecipe);
    console.log(`FINAL: ${recipeList.length} Rezepte`);
    if (recipeList.length > 0) {
      console.log('Erste 3 Rezepte:', recipeList.slice(0, 3).map(r => `${r.title} (${r.category})`));
    }
    return recipeList;
  }, [content]);

  const categories = useMemo(() => {
    const cats = new Set(recipes.map(r => r.category));
    return Array.from(cats).sort();
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
    setFilteredContent(filtered || '# Keine Ergebnisse\n\nVersuche andere Filter.');
    
    const matchingTitles = new Set(matchingRecipes.map(r => r.title));
    console.log('Suche:', searchTerm, 'Matching Recipes:', matchingRecipes.length, 'Titel Sample:', Array.from(matchingTitles).slice(0, 3));
    const recipeSections = sections.filter(s => {
      const isRecipeSection = s.level === 2 && s.title.match(/^\d+\./);
      const hasMatch = matchingTitles.has(s.title);
      if (!hasMatch && isRecipeSection && matchingRecipes.length > 0 && sections.indexOf(s) < 5) {
        console.log('Section nicht gefunden:', s.title, 'Vergleich mit:', Array.from(matchingTitles).slice(0, 2));
      }
      return isRecipeSection && hasMatch;
    });
    console.log('Filtered Sections:', recipeSections.length);
    setFilteredSections(recipeSections);
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
    const shareText = `${recipe.title}\n\n${recipeUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, text: shareText, url: recipeUrl });
      } catch {
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
    } catch {
      alert(`Link: ${text}`);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  const contentWithIds = filteredContent.split('\n').map((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      return `${match[1]} <span id="section-${index}">${match[2]}</span>`;
    }
    return line;
  }).join('\n');

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-6 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white sticky top-0 z-50">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Veganes Langlebigkeits-Kochbuch
          </h1>
          <p className="text-base sm:text-lg mb-4 text-green-100">
            108 wissenschaftlich fundierte Rezepte
          </p>
          
          {/* Toggle */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={() => setShowOnlyRecipes(true)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                showOnlyRecipes
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'bg-green-700 bg-opacity-50 text-white'
              }`}
            >
              Rezepte
            </button>
            <button
              onClick={() => setShowOnlyRecipes(false)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                !showOnlyRecipes
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'bg-green-700 bg-opacity-50 text-white'
              }`}
            >
              Komplett
            </button>
          </div>

          {showOnlyRecipes && (
            <>
              {/* Suchfeld */}
              <div className="max-w-2xl mx-auto mb-4">
                <input
                  type="text"
                  placeholder="Rezepte durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 text-slate-800 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              {/* Filter */}
              <div className="max-w-4xl mx-auto space-y-3">
                {/* Kategorien */}
                <div className="bg-green-700 bg-opacity-30 rounded-xl p-4">
                  <div className="text-sm font-medium mb-3 text-green-100">
                    Kategorien {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedCategories.length > 0 && (
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-green-700 hover:bg-green-50"
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
                            ? 'bg-white text-green-700 ring-2 ring-yellow-300'
                            : 'bg-green-600 text-white hover:bg-green-500'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Analytische Filter */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-800 bg-white"
                  >
                    <option value="alle">Alle Qualitäten</option>
                    <option value="top">Exzellent (≥90)</option>
                    <option value="gut">Sehr gut (≥80)</option>
                  </select>

                  {['lowcarb', 'highprotein', 'lowcal'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => toggleDietFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        dietFilters.includes(filter)
                          ? 'bg-yellow-400 text-slate-800 ring-2 ring-yellow-300'
                          : 'bg-white text-slate-700 hover:bg-green-50'
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
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                    >
                      Zurücksetzen
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 text-green-100 text-sm">
                {filteredSections.length} Rezepte
              </div>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <a 
              href="/Veganes_Langlebigkeits_Kochbuch_KOMPLETT.pdf" 
              className="px-6 py-2 rounded-lg text-sm font-semibold bg-white text-green-700 hover:bg-green-50 shadow-lg"
              download
            >
              PDF Download
            </a>
            <button
              onClick={() => setShowToc(!showToc)}
              className="px-6 py-2 rounded-lg text-sm font-semibold bg-green-700 bg-opacity-50 text-white hover:bg-green-700 shadow-lg"
            >
              {showToc ? 'Liste ausblenden' : 'Liste anzeigen'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          {showToc && (
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-32 bg-white rounded-xl shadow-lg p-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <h2 className="text-lg font-bold text-green-800 mb-3 pb-3 border-b-2 border-green-200 sticky top-0 bg-white">
                  {showOnlyRecipes ? `Rezepte (${filteredSections.length})` : 'Inhaltsverzeichnis'}
                </h2>
                <nav className="space-y-2">
                  {showOnlyRecipes ? (
                    filteredSections.map((section, idx) => {
                      const recipe = recipes.find(r => r.title === section.title);
                      const isExpanded = expandedRecipes.has(idx);
                      return (
                        <div key={idx} className="border border-green-200 rounded-lg hover:border-green-400 transition bg-white">
                          <button
                            onClick={() => scrollToSection(section.id)}
                            className="block w-full text-left p-3 hover:bg-green-50 rounded-t-lg"
                          >
                            <div className="font-semibold text-green-700 text-sm">
                              {section.title.replace(/^\d+\.\s*/, '')}
                            </div>
                            {recipe && !isExpanded && (
                              <div className="flex flex-wrap gap-1.5 text-xs mt-2">
                                {recipe.score && (
                                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                    {recipe.score}
                                  </span>
                                )}
                                {recipe.calories && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    {recipe.calories} kcal
                                  </span>
                                )}
                                {recipe.protein && (
                                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    {recipe.protein}g
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                          
                          {recipe && (
                            <>
                              <button
                                onClick={() => toggleExpanded(idx)}
                                className="w-full text-xs text-green-600 hover:text-green-700 hover:bg-green-50 py-2 border-t border-green-200 font-medium"
                              >
                                {isExpanded ? '▲ Weniger' : '▼ Details'}
                              </button>
                              
                              {isExpanded && (
                                <div className="px-3 py-3 bg-green-50 text-xs space-y-2 border-t border-green-200">
                                  <table className="w-full">
                                    <tbody>
                                      {recipe.score && (
                                        <tr className="border-b border-green-200">
                                          <td className="py-1 text-slate-600">Score</td>
                                          <td className="py-1 text-right font-semibold">{recipe.score}/100</td>
                                        </tr>
                                      )}
                                      {recipe.calories && (
                                        <tr className="border-b border-green-200">
                                          <td className="py-1 text-slate-600">Kalorien</td>
                                          <td className="py-1 text-right font-semibold">{recipe.calories} kcal</td>
                                        </tr>
                                      )}
                                      {recipe.protein && (
                                        <tr className="border-b border-green-200">
                                          <td className="py-1 text-slate-600">Protein</td>
                                          <td className="py-1 text-right font-semibold">{recipe.protein}g</td>
                                        </tr>
                                      )}
                                      {recipe.carbs && (
                                        <tr>
                                          <td className="py-1 text-slate-600">Carbs (netto)</td>
                                          <td className="py-1 text-right font-semibold">{recipe.carbs}g</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                  
                                  {recipe.score && (
                                    <div>
                                      <div className="text-xs text-slate-600 mb-1">Qualität</div>
                                      <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all ${
                                            recipe.score >= 90 ? 'bg-green-500' : 
                                            recipe.score >= 80 ? 'bg-yellow-500' : 'bg-orange-500'
                                          }`}
                                          style={{width: `${recipe.score}%`}}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {recipe.protein && (
                                    <div>
                                      <div className="text-xs text-slate-600 mb-1">Protein</div>
                                      <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full transition-all"
                                          style={{width: `${Math.min((recipe.protein / 50) * 100, 100)}%`}}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="border-t border-green-200 px-3 py-2 flex gap-2">
                                <button
                                  onClick={() => shareRecipe(recipe)}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1.5 rounded font-medium"
                                >
                                  Teilen
                                </button>
                                <button
                                  onClick={() => copyToClipboard(`${window.location.origin}${window.location.pathname}#section-${recipe.startLine}`)}
                                  className="px-3 bg-green-100 hover:bg-green-200 text-green-700 text-xs py-1.5 rounded font-medium"
                                >
                                  Link
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    filteredSections.map((section, idx) => (
                      <button
                        key={idx}
                        onClick={() => scrollToSection(section.id)}
                        className={`block w-full text-left py-2 px-3 rounded-lg hover:bg-green-50 ${
                          section.level === 1 ? 'font-bold text-green-800 text-base mt-3 bg-green-50' :
                          section.level === 2 ? 'font-semibold text-green-700 pl-4 text-sm border-l-4 border-green-300' :
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
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-green-800 mt-6 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-green-700 mt-5 mb-3 border-b-2 border-green-200 pb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-green-600 mt-4 mb-2" {...props} />,
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
