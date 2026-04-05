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

interface ScoreBreakdown {
  calorieScore?: number;
  proteinScore?: number;
  carbScore?: number;
  fiberScore?: number;
  nutrientScore?: number;
  processScore?: number;
  sustainScore?: number;
  diabetesScore?: number;
  total?: number;
}

interface Recipe {
  title: string;
  content: string;
  startLine: number;
  category: string;
  score?: number;
  scoreBreakdown?: ScoreBreakdown;
  calories?: number;
  protein?: number;
  carbs?: number;
  fiber?: number;
  isLowCarb?: boolean;
  isHighProtein?: boolean;
}

export default function CookbookClient({ content, sections }: CookbookClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [showToc, setShowToc] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(100);
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

  // Rezepte extrahieren mit Score-Breakdown
  const recipes = useMemo(() => {
    console.log('Extrahiere Rezepte aus Content, Länge:', content.length);
    const lines = content.split('\n');
    const recipeList: Recipe[] = [];
    let currentRecipe: Recipe | null = null;
    let currentCategory = '';
    let isInRecipeSection = false;
    
    lines.forEach((line, index) => {
      if (line.startsWith('# TEIL')) {
        isInRecipeSection = true;
        const parts = line.split(':');
        if (parts.length > 1) {
          currentCategory = parts[1].trim();
        } else {
          currentCategory = line.replace(/^#\s+TEIL\s+\d+\s*/, '').trim();
        }
        console.log('Kategorie gefunden:', currentCategory);
        return;
      }
      
      if (isInRecipeSection && line.startsWith('## ')) {
        const match = line.match(/^##\s+(\d+)\.\s+(.+)/);
        if (match) {
          if (currentRecipe) {
            recipeList.push(currentRecipe);
          }
          currentRecipe = {
            title: `${match[1]}. ${match[2].trim()}`,
            content: line + '\n',
            startLine: index,
            category: currentCategory,
            scoreBreakdown: {}
          };
        }
      } else if (currentRecipe) {
        currentRecipe.content += line + '\n';
        
        // Score-Breakdown extrahieren
        const calorieMatch = line.match(/Kaloriendichte:\s*\*\*(\d+)\/15\*\*/);
        if (calorieMatch) currentRecipe.scoreBreakdown!.calorieScore = parseInt(calorieMatch[1]);
        
        const proteinMatch = line.match(/Proteingehalt:\s*\*\*(\d+)\/15\*\*/);
        if (proteinMatch) currentRecipe.scoreBreakdown!.proteinScore = parseInt(proteinMatch[1]);
        
        const carbMatch = line.match(/Kohlenhydrate & GI\/GL:\s*\*\*(\d+)\/15\*\*/);
        if (carbMatch) currentRecipe.scoreBreakdown!.carbScore = parseInt(carbMatch[1]);
        
        const fiberMatch = line.match(/Ballaststoffe:\s*\*\*(\d+)\/10\*\*/);
        if (fiberMatch) currentRecipe.scoreBreakdown!.fiberScore = parseInt(fiberMatch[1]);
        
        const nutrientMatch = line.match(/Nährstoffdichte:\s*\*\*(\d+)\/15\*\*/);
        if (nutrientMatch) currentRecipe.scoreBreakdown!.nutrientScore = parseInt(nutrientMatch[1]);
        
        const processMatch = line.match(/Verarbeitungsgrad:\s*\*\*(\d+)\/10\*\*/);
        if (processMatch) currentRecipe.scoreBreakdown!.processScore = parseInt(processMatch[1]);
        
        const sustainMatch = line.match(/Nachhaltigkeit:\s*\*\*(\d+)\/10\*\*/);
        if (sustainMatch) currentRecipe.scoreBreakdown!.sustainScore = parseInt(sustainMatch[1]);
        
        const diabetesMatch = line.match(/Diabetesfreundlichkeit:\s*\*\*(\d+)\/10\*\*/);
        if (diabetesMatch) currentRecipe.scoreBreakdown!.diabetesScore = parseInt(diabetesMatch[1]);
        
        const totalMatch = line.match(/\*\*Gesamt:\s*(\d+)\/100\*\*/);
        if (totalMatch) {
          currentRecipe.score = parseInt(totalMatch[1]);
          currentRecipe.scoreBreakdown!.total = parseInt(totalMatch[1]);
        }
        
        const calMatch = line.match(/Kalorien\s*\|\s*(\d+)\s*kcal/);
        if (calMatch) currentRecipe.calories = parseInt(calMatch[1]);
        
        const proteinValueMatch = line.match(/Protein\s*\|\s*(\d+)g/);
        if (proteinValueMatch) {
          currentRecipe.protein = parseInt(proteinValueMatch[1]);
          currentRecipe.isHighProtein = currentRecipe.protein >= 20;
        }
        
        const netCarbMatch = line.match(/Netto:\s*(\d+)g\)/);
        if (netCarbMatch) {
          currentRecipe.carbs = parseInt(netCarbMatch[1]);
          currentRecipe.isLowCarb = currentRecipe.carbs <= 30;
        }
        
        const fiberValueMatch = line.match(/Ballaststoffe\s*\|\s*(\d+)g/);
        if (fiberValueMatch) currentRecipe.fiber = parseInt(fiberValueMatch[1]);
      }
    });
    
    if (currentRecipe) recipeList.push(currentRecipe);
    console.log('EXTRAHIERT:', recipeList.length, 'Rezepte');
    if (recipeList.length > 0) {
      console.log('Erste 3:', recipeList.slice(0, 3).map(r => r.title));
    }
    return recipeList;
  }, [content]);

  const categories = useMemo(() => {
    const cats = new Set(recipes.map(r => r.category));
    return Array.from(cats).sort();
  }, [recipes]);

  // Filtering Logic
  useEffect(() => {
    if (!showOnlyRecipes) {
      setFilteredRecipes([]);
      return;
    }

    let matching = recipes;
    console.log('Filtering:', { totalRecipes: recipes.length, searchTerm, selectedCategories, minScore, maxScore });
    
    // Suchbegriff
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      matching = matching.filter(recipe => 
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.content.toLowerCase().includes(searchLower)
      );
      console.log('Nach Suche:', matching.length);
    }
    
    // Kategorien
    if (selectedCategories.length > 0) {
      matching = matching.filter(r => selectedCategories.includes(r.category));
      console.log('Nach Kategorien:', matching.length);
    }
    
    // Score-Range
    matching = matching.filter(r => {
      const score = r.score || 0;
      return score >= minScore && score <= maxScore;
    });
    console.log('Nach Score-Filter:', matching.length);
    
    // Diet-Filter
    if (dietFilters.includes('lowcarb')) {
      matching = matching.filter(r => r.isLowCarb);
    }
    if (dietFilters.includes('highprotein')) {
      matching = matching.filter(r => r.isHighProtein);
    }
    if (dietFilters.includes('lowcal')) {
      matching = matching.filter(r => (r.calories || 0) <= 400);
    }
    
    console.log('FINAL gefilterte Rezepte:', matching.length);
    setFilteredRecipes(matching);
  }, [searchTerm, selectedCategories, minScore, maxScore, dietFilters, showOnlyRecipes, recipes]);

  const scrollToRecipe = (recipe: Recipe) => {
    const recipeIdx = filteredRecipes.indexOf(recipe);
    const element = document.getElementById(`recipe-${recipeIdx}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#recipe-${recipeIdx}`);
    }
  };

  const shareRecipe = async (recipe: Recipe) => {
    const recipeUrl = `${window.location.origin}${window.location.pathname}#recipe-${filteredRecipes.indexOf(recipe)}`;
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header - kompakter auf Mobile */}
        <header className="text-center mb-4 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-6 text-white sticky top-0 z-50">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
            Veganes Langlebigkeits-Kochbuch
          </h1>
          <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-4 text-green-100">
            108 wissenschaftlich fundierte Rezepte
          </p>
          
          {/* Toggle - kompakter auf Mobile */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <button
              onClick={() => setShowOnlyRecipes(true)}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition ${
                showOnlyRecipes
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'bg-green-700 bg-opacity-50 text-white'
              }`}
            >
              Rezepte ({recipes.length})
            </button>
            <button
              onClick={() => setShowOnlyRecipes(false)}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition ${
                !showOnlyRecipes
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'bg-green-700 bg-opacity-50 text-white'
              }`}
            >
              Wissenschaft
            </button>
          </div>

          {showOnlyRecipes && (
            <>
              {/* Suchfeld - kompakter auf Mobile */}
              <div className="max-w-2xl mx-auto mb-2 sm:mb-4">
                <input
                  type="text"
                  placeholder="Suche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base text-slate-800 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              {/* Score-Range Filter - versteckbar auf Mobile */}
              <details className="max-w-4xl mx-auto mb-2 sm:mb-4 bg-green-700 bg-opacity-30 rounded-xl">
                <summary className="px-3 py-2 text-sm sm:text-base font-medium text-green-100 cursor-pointer hover:bg-green-700 hover:bg-opacity-20 rounded-xl">
                  Score-Filter (aktuell: {minScore}-{maxScore})
                </summary>
              <div className="p-3 sm:p-4">
                <div className="text-sm font-medium mb-3 text-green-100">
                  Qualitäts-Score: {minScore} - {maxScore} Punkte
                </div>
                <div className="flex gap-4 items-center justify-center">
                  <div className="flex-1 max-w-md">
                    <label className="text-xs text-green-100 mb-1 block">Min: {minScore}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={minScore}
                      onChange={(e) => setMinScore(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1 max-w-md">
                    <label className="text-xs text-green-100 mb-1 block">Max: {maxScore}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={maxScore}
                      onChange={(e) => setMaxScore(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={() => { setMinScore(90); setMaxScore(100); }}
                    className="px-3 py-2 bg-yellow-400 text-slate-800 rounded-lg text-xs font-medium hover:bg-yellow-300"
                  >
                    Top (90+)
                  </button>
                </div>
              </div>
              </details>

              {/* Kategorien - versteckbar auf Mobile */}
              <details open className="max-w-4xl mx-auto mb-2 sm:mb-4 bg-green-700 bg-opacity-30 rounded-xl">
                <summary className="px-3 py-2 text-sm sm:text-base font-medium text-green-100 cursor-pointer hover:bg-green-700 hover:bg-opacity-20 rounded-xl">
                  Kategorien {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                </summary>
              <div className="p-3 sm:p-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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
              </details>

              {/* Diet Filter - kompakter auf Mobile */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mb-2 sm:mb-3">
                {['lowcarb', 'highprotein', 'lowcal'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => toggleDietFilter(filter)}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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

                {(selectedCategories.length > 0 || minScore > 0 || maxScore < 100 || dietFilters.length > 0 || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setMinScore(0);
                      setMaxScore(100);
                      setDietFilters([]);
                      setSearchTerm('');
                    }}
                    className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="text-green-100 text-xs sm:text-sm mt-2">
                {filteredRecipes.length} von {recipes.length} Rezepten
              </div>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2 sm:mt-4">
            <a 
              href="/Veganes_Langlebigkeits_Kochbuch_KOMPLETT.pdf" 
              className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white text-green-700 hover:bg-green-50 shadow-lg"
              download
            >
              PDF
            </a>
            {showOnlyRecipes && (
              <button
                onClick={() => setShowToc(!showToc)}
                className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-green-700 bg-opacity-50 text-white hover:bg-green-700 shadow-lg"
              >
                {showToc ? '✕ Menü' : '☰ Menü'}
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - als Overlay auf Mobile */}
          {showToc && showOnlyRecipes && (
            <>
              {/* Mobile Overlay Backdrop */}
              <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${showToc ? 'block' : 'hidden'}`}
                onClick={() => setShowToc(false)}
              />
              
              <aside className={`
                lg:col-span-1 
                fixed lg:relative 
                inset-y-0 left-0 
                w-64 lg:w-auto 
                z-50 lg:z-auto
                transform lg:transform-none
                transition-transform duration-300
                ${showToc ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}>
                <div className="h-full lg:sticky lg:top-32 bg-white rounded-r-xl lg:rounded-xl shadow-2xl lg:shadow-lg p-4 overflow-y-auto">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-green-200 sticky top-0 bg-white">
                    <h2 className="text-lg font-bold text-green-800">
                      Rezepte ({filteredRecipes.length})
                    </h2>
                    <button 
                      onClick={() => setShowToc(false)}
                      className="lg:hidden text-slate-500 hover:text-slate-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                <nav className="space-y-2">
                  {filteredRecipes.map((recipe, idx) => (
                    <div key={idx} className="border border-green-200 rounded-lg hover:border-green-400 transition bg-white mb-2">
                      <button
                        onClick={() => {
                          scrollToRecipe(recipe);
                          // Auf Mobile Menü schließen nach Klick
                          if (window.innerWidth < 1024) {
                            setShowToc(false);
                          }
                        }}
                        className="block w-full text-left p-3 hover:bg-green-50 rounded-t-lg"
                      >
                        <div className="font-semibold text-green-700 text-sm">
                          {recipe.title.replace(/^\d+\.\s*/, '')}
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-xs mt-2">
                          {recipe.score && (
                            <span className={`px-2 py-0.5 rounded font-medium ${
                              recipe.score >= 90 ? 'bg-green-100 text-green-800' :
                              recipe.score >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {recipe.score}
                            </span>
                          )}
                          {recipe.calories && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {recipe.calories} kcal
                            </span>
                          )}
                          {recipe.protein && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              {recipe.protein}g
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </nav>
              </div>
            </aside>
            </>
          )}

          {/* Content */}
          <article className={`${showToc && showOnlyRecipes ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {showOnlyRecipes ? (
              <div className="space-y-6">
                {filteredRecipes.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-700 mb-2">Keine Rezepte gefunden</h2>
                    <p className="text-slate-600">Versuche andere Filter oder Suchbegriffe.</p>
                  </div>
                ) : (
                  filteredRecipes.map((recipe, idx) => (
                    <div key={idx} id={`recipe-${idx}`} className="bg-white rounded-xl shadow-lg p-6">
                      {/* Recipe Header mit Score-Visualisierung - KOMPAKT auf Mobile */}
                      <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b-2 border-green-200">
                        <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-2 sm:mb-3">{recipe.title}</h2>
                        
                        {/* Score Breakdown - NUR auf Desktop sichtbar */}
                        {recipe.scoreBreakdown && recipe.score && (
                          <div className="hidden sm:block bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-bold text-green-700">
                                Gesamt-Score: {recipe.score}/100
                              </span>
                              <span className={`px-4 py-2 rounded-lg font-bold text-white ${
                                recipe.score >= 90 ? 'bg-green-500' :
                                recipe.score >= 80 ? 'bg-yellow-500' :
                                recipe.score >= 70 ? 'bg-orange-500' : 'bg-red-500'
                              }`}>
                                {recipe.score >= 90 ? 'Exzellent' :
                                 recipe.score >= 80 ? 'Sehr gut' :
                                 recipe.score >= 70 ? 'Gut' : 'OK'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              {recipe.scoreBreakdown.calorieScore !== undefined && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">Kaloriendichte</span>
                                    <span className="font-semibold">{recipe.scoreBreakdown.calorieScore}/15</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full"
                                      style={{width: `${(recipe.scoreBreakdown.calorieScore / 15) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.proteinScore !== undefined && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">Proteingehalt</span>
                                    <span className="font-semibold">{recipe.scoreBreakdown.proteinScore}/15</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                      className="bg-purple-500 h-2 rounded-full"
                                      style={{width: `${(recipe.scoreBreakdown.proteinScore / 15) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.carbScore !== undefined && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">Kohlenhydrate</span>
                                    <span className="font-semibold">{recipe.scoreBreakdown.carbScore}/15</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{width: `${(recipe.scoreBreakdown.carbScore / 15) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.fiberScore !== undefined && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">Ballaststoffe</span>
                                    <span className="font-semibold">{recipe.scoreBreakdown.fiberScore}/10</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                      className="bg-amber-500 h-2 rounded-full"
                                      style={{width: `${(recipe.scoreBreakdown.fiberScore / 10) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.nutrientScore !== undefined && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">Nährstoffdichte</span>
                                    <span className="font-semibold">{recipe.scoreBreakdown.nutrientScore}/15</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                      className="bg-teal-500 h-2 rounded-full"
                                      style={{width: `${(recipe.scoreBreakdown.nutrientScore / 15) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.processScore !== undefined && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">Verarbeitung</span>
                                    <span className="font-semibold">{recipe.scoreBreakdown.processScore}/10</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                      className="bg-indigo-500 h-2 rounded-full"
                                      style={{width: `${(recipe.scoreBreakdown.processScore / 10) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.sustainScore !== undefined && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">Nachhaltigkeit</span>
                                    <span className="font-semibold">{recipe.scoreBreakdown.sustainScore}/10</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                      className="bg-emerald-500 h-2 rounded-full"
                                      style={{width: `${(recipe.scoreBreakdown.sustainScore / 10) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.diabetesScore !== undefined && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">Diabetesfreundlich</span>
                                    <span className="font-semibold">{recipe.scoreBreakdown.diabetesScore}/10</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div 
                                      className="bg-rose-500 h-2 rounded-full"
                                      style={{width: `${(recipe.scoreBreakdown.diabetesScore / 10) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Mobile: NUR Score-Zahl + Quick Stats */}
                        <div className="sm:hidden bg-green-50 rounded-lg p-3 mb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-green-700">
                              Score: {recipe.score}/100
                            </span>
                            <span className={`px-3 py-1 rounded-lg font-bold text-white text-sm ${
                              (recipe.score || 0) >= 90 ? 'bg-green-500' :
                              (recipe.score || 0) >= 80 ? 'bg-yellow-500' : 'bg-orange-500'
                            }`}>
                              {(recipe.score || 0) >= 90 ? 'Exzellent' : (recipe.score || 0) >= 80 ? 'Sehr gut' : 'Gut'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Quick Stats - größer auf Mobile */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                          {recipe.calories && (
                            <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                              {recipe.calories} kcal
                            </span>
                          )}
                          {recipe.protein && (
                            <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm font-medium">
                              {recipe.protein}g Protein
                            </span>
                          )}
                          {recipe.carbs !== undefined && (
                            <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs sm:text-sm font-medium">
                              {recipe.carbs}g Carbs
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => shareRecipe(recipe)}
                          className="mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium"
                        >
                          Teilen
                        </button>
                      </div>
                      
                      {/* Recipe Content - größerer Text auf Mobile */}
                      <div className="prose prose-sm sm:prose prose-slate max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            h2: ({node, ...props}) => <h2 className="text-base sm:text-xl font-bold text-green-700 mt-3 sm:mt-4 mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-sm sm:text-lg font-semibold text-green-600 mt-2 sm:mt-3 mb-1 sm:mb-2" {...props} />,
                            p: ({node, ...props}) => <p className="text-sm sm:text-base leading-relaxed mb-2 sm:mb-3" {...props} />,
                            li: ({node, ...props}) => <li className="text-sm sm:text-base mb-1" {...props} />,
                            table: ({node, ...props}) => <div className="overflow-x-auto text-xs sm:text-sm"><table {...props} /></div>,
                          }}
                        >
                          {recipe.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
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
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
