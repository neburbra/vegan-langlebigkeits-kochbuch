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
  bloodSugar?: number;
  bloodSugarMax?: number;
  calorieDensity?: number;
  calorieDensityMax?: number;
  protein?: number;
  proteinMax?: number;
  nutrientDensity?: number;
  nutrientDensityMax?: number;
  fiber?: number;
  fiberMax?: number;
  processing?: number;
  processingMax?: number;
  antiInflammatory?: number;
  antiInflammatoryMax?: number;
  sustainability?: number;
  sustainabilityMax?: number;
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
        
        // Score-Breakdown extrahieren - EXAKTES Format aus Markdown
        let match;
        
        // Listenformat: "- Blutzucker (GI/GL): 21/22.5"
        if ((match = line.match(/^-\s*Blutzucker.*?(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/))) {
          currentRecipe.scoreBreakdown!.bloodSugar = parseFloat(match[1]);
          currentRecipe.scoreBreakdown!.bloodSugarMax = parseFloat(match[2]);
        }
        
        if ((match = line.match(/^-\s*Kaloriendichte.*?(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/))) {
          currentRecipe.scoreBreakdown!.calorieDensity = parseFloat(match[1]);
          currentRecipe.scoreBreakdown!.calorieDensityMax = parseFloat(match[2]);
        }
        
        if ((match = line.match(/^-\s*Protein:\s*(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/))) {
          currentRecipe.scoreBreakdown!.protein = parseFloat(match[1]);
          currentRecipe.scoreBreakdown!.proteinMax = parseFloat(match[2]);
        }
        
        if ((match = line.match(/^-\s*Nährstoffdichte.*?(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/))) {
          currentRecipe.scoreBreakdown!.nutrientDensity = parseFloat(match[1]);
          currentRecipe.scoreBreakdown!.nutrientDensityMax = parseFloat(match[2]);
        }
        
        if ((match = line.match(/^-\s*Ballaststoffe:\s*(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/))) {
          currentRecipe.scoreBreakdown!.fiber = parseFloat(match[1]);
          currentRecipe.scoreBreakdown!.fiberMax = parseFloat(match[2]);
        }
        
        if ((match = line.match(/^-\s*Verarbeitungsgrad.*?(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/))) {
          currentRecipe.scoreBreakdown!.processing = parseFloat(match[1]);
          currentRecipe.scoreBreakdown!.processingMax = parseFloat(match[2]);
        }
        
        if ((match = line.match(/^-\s*Anti-inflammatorisch.*?(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/))) {
          currentRecipe.scoreBreakdown!.antiInflammatory = parseFloat(match[1]);
          currentRecipe.scoreBreakdown!.antiInflammatoryMax = parseFloat(match[2]);
        }
        
        if ((match = line.match(/^-\s*Nachhaltigkeit.*?(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/))) {
          currentRecipe.scoreBreakdown!.sustainability = parseFloat(match[1]);
          currentRecipe.scoreBreakdown!.sustainabilityMax = parseFloat(match[2]);
        }
        
        if ((match = line.match(/\*\*Gesamt:\s*(\d+)\/100\*\*/))) {
          currentRecipe.score = parseInt(match[1]);
          currentRecipe.scoreBreakdown!.total = parseInt(match[1]);
        }
        
        // Nährwerte extrahieren
        if ((match = line.match(/Kalorien\s*\|\s*(\d+)\s*kcal/))) {
          currentRecipe.calories = parseInt(match[1]);
        }
        
        if ((match = line.match(/Protein\s*\|\s*(\d+)g/))) {
          currentRecipe.protein = parseInt(match[1]);
          currentRecipe.isHighProtein = currentRecipe.protein >= 20;
        }
        
        if ((match = line.match(/Netto:\s*(\d+)g\)/))) {
          currentRecipe.carbs = parseInt(match[1]);
          currentRecipe.isLowCarb = currentRecipe.carbs <= 30;
        }
        
        if ((match = line.match(/Ballaststoffe\s*\|\s*(\d+)g/))) {
          currentRecipe.fiber = parseInt(match[1]);
        }
      }
    });
    
    if (currentRecipe) recipeList.push(currentRecipe);
    console.log('EXTRAHIERT:', recipeList.length, 'Rezepte');
    if (recipeList.length > 0) {
      console.log('Erste 3:', recipeList.slice(0, 3).map(r => r.title));
      console.log('Score-Beispiel (Rezept 1):', recipeList[0].scoreBreakdown);
    }
    return recipeList;
  }, [content]);

  const categories = useMemo(() => {
    const cats = new Set(recipes.map(r => r.category));
    return Array.from(cats).sort();
  }, [recipes]);

  // Filtering mit useMemo statt useEffect
  const filteredRecipes = useMemo(() => {
    if (!showOnlyRecipes) {
      return [];
    }

    let matching = recipes;
    
    // Suchbegriff
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      matching = matching.filter(recipe => 
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.content.toLowerCase().includes(searchLower)
      );
    }
    
    // Kategorien
    if (selectedCategories.length > 0) {
      matching = matching.filter(r => selectedCategories.includes(r.category));
    }
    
    // Score-Range
    matching = matching.filter(r => {
      const score = r.score || 0;
      return score >= minScore && score <= maxScore;
    });
    
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
    
    return matching;
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
        {/* Header - MINIMAL auf Mobile */}
        <header className="text-center mb-2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-lg shadow-xl p-2 text-white sticky top-0 z-50">
          <h1 className="text-base sm:text-3xl md:text-4xl font-bold mb-1">
            Veganes Kochbuch
          </h1>
          
          {/* Toggle - inline auf Mobile */}
          <div className="flex justify-center gap-1 sm:gap-3 mb-1">
            <button
              onClick={() => setShowOnlyRecipes(true)}
              className={`px-2 sm:px-6 py-1 sm:py-2 rounded text-xs sm:text-base font-semibold ${
                showOnlyRecipes ? 'bg-white text-green-700' : 'bg-green-700 bg-opacity-50 text-white'
              }`}
            >
              Rezepte
            </button>
            <button
              onClick={() => setShowOnlyRecipes(false)}
              className={`px-2 sm:px-6 py-1 sm:py-2 rounded text-xs sm:text-base font-semibold ${
                !showOnlyRecipes ? 'bg-white text-green-700' : 'bg-green-700 bg-opacity-50 text-white'
              }`}
            >
              Wissen
            </button>
            <a 
              href="/Veganes_Langlebigkeits_Kochbuch_KOMPLETT.pdf" 
              className="px-2 sm:px-6 py-1 sm:py-2 rounded text-xs sm:text-sm font-semibold bg-white text-green-700"
              download
            >
              PDF
            </a>
            {showOnlyRecipes && (
              <button
                onClick={() => setShowToc(!showToc)}
                className="px-2 sm:px-6 py-1 sm:py-2 rounded text-xs sm:text-sm font-semibold bg-green-700 bg-opacity-50 text-white"
              >
                {showToc ? '✕' : '☰'}
              </button>
            )}
          </div>

          {showOnlyRecipes && (
            <>
              {/* Suchfeld - direkt unter Header */}
              <div className="mb-1">
                <input
                  type="text"
                  placeholder="Suche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-xs sm:text-base text-slate-800 bg-white rounded focus:outline-none focus:ring-1 focus:ring-green-300"
                />
              </div>

              {/* ALLE Filter in EINEM versteckten Bereich */}
              <details className="text-xs sm:text-sm">
                <summary className="cursor-pointer text-white hover:text-green-100 py-1">
                  ⚙️ Filter ({filteredRecipes.length}/{recipes.length})
                </summary>
                <div className="mt-2 space-y-2 bg-green-700 bg-opacity-30 rounded p-2">
                  {/* Score */}
                  <div className="text-xs">
                    <div className="text-white mb-1">Score: {minScore}-{maxScore}</div>
                    <div className="flex gap-2 items-center">
                      <input type="range" min="0" max="100" value={minScore} onChange={(e) => setMinScore(parseInt(e.target.value))} className="flex-1" />
                      <input type="range" min="0" max="100" value={maxScore} onChange={(e) => setMaxScore(parseInt(e.target.value))} className="flex-1" />
                      <button onClick={() => { setMinScore(90); setMaxScore(100); }} className="px-2 py-1 bg-yellow-400 text-slate-800 rounded text-xs">90+</button>
                    </div>
                  </div>

                  {/* Kategorien */}
                  <div className="flex flex-wrap gap-1">{categories.map(cat => (
                    <button key={cat} onClick={() => toggleCategory(cat)} className={`px-2 py-1 rounded text-xs ${selectedCategories.includes(cat) ? 'bg-white text-green-700' : 'bg-green-600 text-white'}`}>
                      {cat}
                    </button>
                  ))}</div>

                  {/* Diet */}
                  <div className="flex flex-wrap gap-1">
                    {['lowcarb', 'highprotein', 'lowcal'].map(filter => (
                      <button key={filter} onClick={() => toggleDietFilter(filter)} className={`px-2 py-1 rounded text-xs ${dietFilters.includes(filter) ? 'bg-yellow-400 text-slate-800' : 'bg-white text-slate-700'}`}>
                        {filter === 'lowcarb' && 'Low-Carb'}
                        {filter === 'highprotein' && 'Protein'}
                        {filter === 'lowcal' && 'Low-Cal'}
                      </button>
                    ))}
                    {(selectedCategories.length > 0 || minScore > 0 || maxScore < 100 || dietFilters.length > 0 || searchTerm) && (
                      <button onClick={() => { setSelectedCategories([]); setMinScore(0); setMaxScore(100); setDietFilters([]); setSearchTerm(''); }} className="px-2 py-1 rounded text-xs bg-red-500 text-white">
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </details>
            </>
          )}
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
                        
                        {/* Score Breakdown mit visuellen Balken */}
                        {recipe.scoreBreakdown && recipe.score && (
                          <div className="bg-green-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-bold text-green-700">
                                Gesamt-Score: {recipe.score}/100
                              </span>
                              <span className={`px-4 py-2 rounded-lg font-bold text-white ${
                                recipe.score >= 90 ? 'bg-green-500' :
                                recipe.score >= 80 ? 'bg-yellow-500' :
                                recipe.score >= 70 ? 'bg-orange-500' : 'bg-red-500'
                              }`}>
                                {recipe.score >= 90 ? '⭐⭐⭐⭐⭐' :
                                 recipe.score >= 80 ? '⭐⭐⭐⭐' :
                                 recipe.score >= 70 ? '⭐⭐⭐' : '⭐⭐'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              {recipe.scoreBreakdown.bloodSugar !== undefined && recipe.scoreBreakdown.bloodSugarMax && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-700 font-medium">🩸 Blutzucker (GI/GL)</span>
                                    <span className="font-bold text-green-700">{recipe.scoreBreakdown.bloodSugar}/{recipe.scoreBreakdown.bloodSugarMax}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all shadow-sm"
                                      style={{width: `${(recipe.scoreBreakdown.bloodSugar / recipe.scoreBreakdown.bloodSugarMax) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.calorieDensity !== undefined && recipe.scoreBreakdown.calorieDensityMax && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-700 font-medium">🔥 Kaloriendichte</span>
                                    <span className="font-bold text-green-700">{recipe.scoreBreakdown.calorieDensity}/{recipe.scoreBreakdown.calorieDensityMax}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all shadow-sm"
                                      style={{width: `${(recipe.scoreBreakdown.calorieDensity / recipe.scoreBreakdown.calorieDensityMax) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.protein !== undefined && recipe.scoreBreakdown.proteinMax && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-700 font-medium">💪 Protein</span>
                                    <span className="font-bold text-green-700">{recipe.scoreBreakdown.protein}/{recipe.scoreBreakdown.proteinMax}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all shadow-sm"
                                      style={{width: `${(recipe.scoreBreakdown.protein / recipe.scoreBreakdown.proteinMax) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.nutrientDensity !== undefined && recipe.scoreBreakdown.nutrientDensityMax && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-700 font-medium">🌟 Nährstoffdichte</span>
                                    <span className="font-bold text-green-700">{recipe.scoreBreakdown.nutrientDensity}/{recipe.scoreBreakdown.nutrientDensityMax}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all shadow-sm"
                                      style={{width: `${(recipe.scoreBreakdown.nutrientDensity / recipe.scoreBreakdown.nutrientDensityMax) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.fiber !== undefined && recipe.scoreBreakdown.fiberMax && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-700 font-medium">🌾 Ballaststoffe</span>
                                    <span className="font-bold text-green-700">{recipe.scoreBreakdown.fiber}/{recipe.scoreBreakdown.fiberMax}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all shadow-sm"
                                      style={{width: `${(recipe.scoreBreakdown.fiber / recipe.scoreBreakdown.fiberMax) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.processing !== undefined && recipe.scoreBreakdown.processingMax && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-700 font-medium">🥗 Verarbeitungsgrad</span>
                                    <span className="font-bold text-green-700">{recipe.scoreBreakdown.processing}/{recipe.scoreBreakdown.processingMax}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all shadow-sm"
                                      style={{width: `${(recipe.scoreBreakdown.processing / recipe.scoreBreakdown.processingMax) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.antiInflammatory !== undefined && recipe.scoreBreakdown.antiInflammatoryMax && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-700 font-medium">🛡️ Anti-inflammatorisch</span>
                                    <span className="font-bold text-green-700">{recipe.scoreBreakdown.antiInflammatory}/{recipe.scoreBreakdown.antiInflammatoryMax}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-rose-500 to-rose-600 h-3 rounded-full transition-all shadow-sm"
                                      style={{width: `${(recipe.scoreBreakdown.antiInflammatory / recipe.scoreBreakdown.antiInflammatoryMax) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {recipe.scoreBreakdown.sustainability !== undefined && recipe.scoreBreakdown.sustainabilityMax && (
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-slate-700 font-medium">♻️ Nachhaltigkeit</span>
                                    <span className="font-bold text-green-700">{recipe.scoreBreakdown.sustainability}/{recipe.scoreBreakdown.sustainabilityMax}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all shadow-sm"
                                      style={{width: `${(recipe.scoreBreakdown.sustainability / recipe.scoreBreakdown.sustainabilityMax) * 100}%`}}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Mobile: Score kompakt mit TOP 3 wichtigsten Werten */}
                        <div className="sm:hidden bg-green-50 rounded-lg p-3 mb-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-base font-bold text-green-700">
                              Score: {recipe.score}/100
                            </span>
                            <span className={`px-3 py-1 rounded-lg font-bold text-white text-sm ${
                              (recipe.score || 0) >= 90 ? 'bg-green-500' :
                              (recipe.score || 0) >= 80 ? 'bg-yellow-500' : 'bg-orange-500'
                            }`}>
                              {(recipe.score || 0) >= 90 ? '⭐⭐⭐⭐⭐' : (recipe.score || 0) >= 80 ? '⭐⭐⭐⭐' : '⭐⭐⭐'}
                            </span>
                          </div>
                          
                          {/* Nur die 3 wichtigsten auf Mobile */}
                          <div className="space-y-1.5 text-xs">
                            {recipe.scoreBreakdown?.bloodSugar !== undefined && recipe.scoreBreakdown.bloodSugarMax && (
                              <div>
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-slate-600">🩸 Blutzucker</span>
                                  <span className="font-semibold text-green-700">{recipe.scoreBreakdown.bloodSugar}/{recipe.scoreBreakdown.bloodSugarMax}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(recipe.scoreBreakdown.bloodSugar / recipe.scoreBreakdown.bloodSugarMax) * 100}%`}} />
                                </div>
                              </div>
                            )}
                            
                            {recipe.scoreBreakdown?.protein !== undefined && recipe.scoreBreakdown.proteinMax && (
                              <div>
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-slate-600">💪 Protein</span>
                                  <span className="font-semibold text-green-700">{recipe.scoreBreakdown.protein}/{recipe.scoreBreakdown.proteinMax}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(recipe.scoreBreakdown.protein / recipe.scoreBreakdown.proteinMax) * 100}%`}} />
                                </div>
                              </div>
                            )}
                            
                            {recipe.scoreBreakdown?.calorieDensity !== undefined && recipe.scoreBreakdown.calorieDensityMax && (
                              <div>
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-slate-600">🔥 Kalorien</span>
                                  <span className="font-semibold text-green-700">{recipe.scoreBreakdown.calorieDensity}/{recipe.scoreBreakdown.calorieDensityMax}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(recipe.scoreBreakdown.calorieDensity / recipe.scoreBreakdown.calorieDensityMax) * 100}%`}} />
                                </div>
                              </div>
                            )}
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
