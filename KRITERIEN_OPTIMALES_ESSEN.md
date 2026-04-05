# 🎯 KRITERIEN FÜR OPTIMALES ESSEN

## Bewertungsmatrix für Rezepte im Kochbuch

Jedes Rezept wird nach folgenden 8 Hauptkriterien bewertet und optimiert:

---

## 1. 📉 BLUTZUCKER-OPTIMIERUNG (höchste Priorität)

### 1.1 Glykämischer Index (GI) und Glykämische Last (GL)

**Zielwerte:**
- **GI:** < 55 (niedrig) = optimal | 56-69 (mittel) = akzeptabel | >70 (hoch) = vermeiden
- **GL pro Portion:** < 10 (niedrig) = optimal | 10-19 (mittel) = akzeptabel | >20 (hoch) = vermeiden

**Formel:**
```
GL = (GI × Kohlenhydrate in Gramm) / 100
```

**Strategien zur Senkung:**
- Ballaststoffe erhöhen (>10g pro Mahlzeit)
- Protein hinzufügen (Protein-Fett-Effekt)
- Essig/Zitronensaft verwenden (senkt GI um 20-30%)
- Kühlung von gekochten Kohlenhydraten (resistente Stärke)
- Fette kombinieren (verlangsamt Absorption)
- Mahlzeitenreihenfolge: Gemüse → Protein → Kohlenhydrate

**Beispiel-Tabelle (Agent 4 muss recherchieren):**
| Lebensmittel | GI | GL (100g) |
|--------------|-----|-----------|
| Linsen | 29 | 5 |
| Kichererbsen | 28 | 8 |
| Quinoa | 53 | 13 |
| Vollkornbrot | 74 | 9 |
| Weißbrot | 75 | 10 |
| Blumenkohl-Reis | ~15 | 1 |
| Konjaknudeln | 0 | 0 |

**Messung & Validierung:**
- CGM-Daten (Continuous Glucose Monitor) berücksichtigen
- Postprandiale Glukose-Spikes < 30 mg/dl über Baseline
- Time in Range (TIR) > 70% (70-180 mg/dl)

---

## 2. 🔥 KALORIENDICHTE & LOW-CALORIE (höchste Priorität)

### 2.1 Kaloriendichte-Klassifizierung

**Definition:** Kalorien pro Gramm Lebensmittel (kcal/g)

**Zielwerte für Hauptmahlzeiten:**
- **Sehr niedrig:** < 0.6 kcal/g (optimal für Gewichtskontrolle)
- **Niedrig:** 0.6-1.5 kcal/g (gut)
- **Mittel:** 1.5-3.0 kcal/g (moderat)
- **Hoch:** > 3.0 kcal/g (sparsam verwenden)

**Beispiele:**
| Kategorie | Lebensmittel | kcal/g |
|-----------|--------------|--------|
| Sehr niedrig | Gurke, Salat, Brokkoli, Tomaten | 0.1-0.3 |
| Niedrig | Beeren, Tofu, Tempeh, Pilze | 0.5-0.8 |
| Mittel | Vollkornbrot, Kartoffeln, Linsen | 1.0-1.2 |
| Hoch | Nüsse, Samen, Öle, Avocado | 4.0-9.0 |

### 2.2 Kalorien pro Mahlzeit (Zielwerte)

**Tagesbedarf (Referenz):**
- Kalorienrestriktion für Langlebigkeit: 1600-1800 kcal/Tag
- Mit Sport: 1800-2000 kcal/Tag
- Makros: 30% Protein, 35% Carbs, 35% Fett

**Mahlzeitenverteilung:**
| Mahlzeit | Kalorien | Protein (g) | Carbs (g) | Fett (g) |
|----------|----------|-------------|-----------|----------|
| Frühstück | 350-450 | 25-30 | 30-40 | 15-20 |
| Mittagessen | 500-600 | 30-40 | 40-50 | 20-25 |
| Abendessen | 400-500 | 25-35 | 30-40 | 15-20 |
| Snacks (2x) | 150-200 | 10-15 | 10-15 | 8-12 |
| **Gesamt** | **1600-1800** | **120-135** | **140-160** | **66-77** |

### 2.3 Volumen & Sättigung

**Sättigungsindex (SI) optimieren:**
- Hoher Wassergehalt (Suppen, Gemüse)
- Hoher Ballaststoffgehalt (>30g/Tag)
- Hoher Proteingehalt (thermic effect)
- Langsames Essen (mindestens 20 Minuten)

**Strategien:**
- Mahlzeiten mit Suppe oder Salat beginnen
- Mindestens 50% Volumen = nicht-stärkehaltiges Gemüse
- Protein zu jeder Mahlzeit (Sättigung +30%)

---

## 3. 💪 PROTEINGEHALT & QUALITÄT

### 3.1 Proteinziele

**Tagesbedarf:**
- Minimum: 1.2 g/kg Körpergewicht (75 kg = 90g)
- Optimal für Langlebigkeit: 1.6-1.8 g/kg (75 kg = 120-135g)
- Mit Sport: 1.8-2.0 g/kg

**Pro Mahlzeit:**
- Frühstück: min. 25g
- Mittagessen: min. 30g
- Abendessen: min. 25g
- Snacks: min. 10g

### 3.2 Aminosäurenprofil (Vollständigkeit)

**Essenzielle Aminosäuren (EAA) pro Mahlzeit:**
- Leucin: min. 2.5g (Muskelproteinsynthese)
- Lysin: oft limitierend bei vegan (Hülsenfrüchte!)
- Methionin: in Soja, Nüssen, Samen

**Vegane Proteinquellen (pro 100g):**
| Quelle | Protein (g) | Leucin (mg) | DIAAS-Score |
|--------|-------------|-------------|-------------|
| Seitan | 75 | 5000 | 0.4 |
| Soja (Tofu) | 15 | 1300 | 1.0 |
| Tempeh | 19 | 1500 | 1.0 |
| Linsen | 9 | 700 | 0.6 |
| Kichererbsen | 9 | 650 | 0.6 |
| Lupinen | 36 | 2800 | 0.9 |
| Erbsenprotein | 80 | 6400 | 0.9 |

**Kombinationen für vollständiges Profil:**
- Hülsenfrüchte + Vollkorn (Reis + Linsen)
- Soja + Nüsse (Tofu + Mandeln)
- Seitan + Kichererbsen

### 3.3 Protein-Timing

**Optimale Verteilung:**
- Nicht alles auf einmal (max. 40g pro Mahlzeit absorbierbar)
- Gleichmäßig über den Tag verteilen
- Post-Workout: innerhalb 2 Stunden (25-30g)

---

## 4. 🥦 NÄHRSTOFFDICHTE (Vitamine, Mineralstoffe, Phytonährstoffe)

### 4.1 Nährstoffdichte-Score

**Definition:** Mikronährstoffe pro Kalorie

**Formel (ANDI-Score von Fuhrman):**
```
Score = (Vitamine + Mineralstoffe + Phytonährstoffe) / Kalorien
```

**Beispiele (Score 0-1000):**
| Lebensmittel | ANDI-Score |
|--------------|------------|
| Grünkohl | 1000 |
| Spinat | 707 |
| Brokkoli | 340 |
| Blaubeeren | 132 |
| Tofu | 82 |
| Linsen | 104 |
| Vollkornbrot | 30 |
| Nüsse | 20 |

**Ziel pro Mahlzeit:**
- Mindestens 2 Lebensmittel mit Score >300
- Durchschnittlicher Score >100

### 4.2 Kritische Mikronährstoffe bei veganer Ernährung

**Täglich sicherstellen:**
| Nährstoff | Tagesbedarf | Vegane Quellen | Hinweis |
|-----------|-------------|----------------|---------|
| Vitamin B12 | 2.4 mcg | Angereicherte Lebensmittel, Supplement | MUSS supplementiert werden |
| Vitamin D | 20 mcg (800 IU) | Sonne, Supplement | 80% haben Mangel |
| Omega-3 (EPA/DHA) | 250 mg | Algenöl | ALA (Leinsamen) reicht nicht |
| Eisen | 18 mg (Frauen), 8 mg (Männer) | Linsen, Spinat + Vitamin C | Nicht-Häm-Eisen |
| Zink | 11 mg (Männer), 8 mg (Frauen) | Kürbiskerne, Haferflocken | Mit Phytase |
| Kalzium | 1000 mg | Grünkohl, Sesam, Mandeln | Oxalsäure beachten |
| Jod | 150 mcg | Algen, jodiertes Salz | Nicht überdosieren |
| Selen | 55 mcg | Paranüsse (2 Stück/Tag) | Schilddrüse |

**Rezept-Anforderung:**
- Jedes Rezept muss mindestens 3 kritische Mikronährstoffe abdecken
- % des Tagesbedarfs angeben

### 4.3 Phytonährstoffe & Antioxidantien

**Täglich einbauen:**
- Polyphenole (Beeren, grüner Tee, Kakao)
- Carotinoide (Karotten, Süßkartoffeln, Tomaten)
- Sulforaphan (Brokkoli, Rosenkohl)
- Allicin (Knoblauch, Zwiebeln)
- Curcumin (Kurkuma + schwarzer Pfeffer)
- Quercetin (Äpfel, Zwiebeln, Beeren)

**Farbvielfalt als Regel:**
- Jede Mahlzeit mindestens 3 verschiedene Farben
- "Eat the Rainbow" für breites Phytonährstoff-Spektrum

---

## 5. 🌾 BALLASTSTOFFE & DARMGESUNDHEIT

### 5.1 Ballaststoff-Ziele

**Tagesbedarf:**
- Minimum: 30g
- Optimal: 40-50g
- Mit Langlebigkeit korreliert: >50g

**Verteilung:**
- Lösliche Ballaststoffe: 10-15g (Präbiotika)
- Unlösliche Ballaststoffe: 25-35g (Darmtransit)

**Pro Mahlzeit:**
- Frühstück: min. 10g
- Mittagessen: min. 15g
- Abendessen: min. 12g

### 5.2 Präbiotika & Probiotika

**Präbiotische Lebensmittel (täglich):**
- Zwiebeln, Knoblauch, Lauch
- Spargel, Topinambur
- Chicorée, Artischocken
- Bananen (unreif), Haferflocken

**Probiotische Lebensmittel (fermentiert):**
- Sauerkraut (roh)
- Kimchi
- Tempeh
- Miso
- Kombucha
- Veganer Joghurt (mit lebenden Kulturen)

**Ziel:**
- Mindestens 1 präbiotisches Lebensmittel pro Mahlzeit
- 1-2 probiotische Lebensmittel pro Tag

### 5.3 Kurzkettenfettsäuren (SCFA)

**Butyrat-produzierende Lebensmittel:**
- Resistente Stärke (gekühlte Kartoffeln, grüne Bananen)
- Haferflocken
- Hülsenfrüchte
- Leinsamen

---

## 6. 🔄 VERARBEITUNGSGRAD (je weniger, desto besser)

### 6.1 NOVA-Klassifizierung

**Gruppe 1 - Unverarbeitet/minimal verarbeitet (OPTIMAL):**
- Frisches Gemüse, Obst
- Hülsenfrüchte, Vollkorngetreide
- Nüsse, Samen
- **Ziel:** 70% der Ernährung

**Gruppe 2 - Verarbeitete Zutaten:**
- Öle, Salz, Zucker
- **Ziel:** Sparsam verwenden

**Gruppe 3 - Verarbeitete Lebensmittel:**
- Konserven, Vollkornbrot
- Tofu, Tempeh
- **Ziel:** 20% der Ernährung

**Gruppe 4 - Hochverarbeitet (VERMEIDEN):**
- Fertiggerichte
- Vegane Fleischersatz-Produkte mit vielen Zusatzstoffen
- Süßigkeiten, Chips
- **Ziel:** <10% der Ernährung

### 6.2 Zusatzstoffe & E-Nummern

**Grundregel:**
- Zutatenliste so kurz wie möglich
- Keine unaussprechlichen Zutaten
- Max. 5-7 Zutaten pro Produkt

**Vermeiden:**
- Gehärtete Fette (Transfette)
- Zuckeraustauschstoffe (Aspartam, Sucralose)
- Konservierungsstoffe
- Farbstoffe
- Geschmacksverstärker

**Erlaubt (natürlich):**
- Zitronensäure
- Pektin (Geliermittel)
- Agar-Agar
- Xanthan (in Maßen)

---

## 7. 🫀 ANTI-INFLAMMATORISCH & HERZGESUND

### 7.1 Omega-3/Omega-6-Verhältnis

**Ziel:** 1:4 oder besser (aktuell typisch: 1:15)

**Omega-3 (EPA/DHA) täglich:**
- 250-500 mg EPA+DHA (Algenöl)
- 2-3g ALA (Leinsamen, Walnüsse)

**Omega-6 reduzieren:**
- Sonnenblumenöl vermeiden
- Maiskeimöl vermeiden
- Sojaöl minimieren

**Beste Öle:**
- Olivenöl (extra virgin)
- Leinöl (kaltgepresst, nicht erhitzen)
- Rapsöl (zum Kochen)
- Walnussöl

### 7.2 Blutdrucksenkende Faktoren

**Kalium/Natrium-Verhältnis:**
- Kalium: >4700 mg/Tag
- Natrium: <2300 mg/Tag (besser <1500 mg bei Hypertonie)
- Verhältnis: >2:1

**Top Kalium-Quellen:**
- Kartoffeln mit Schale (926 mg/200g)
- Spinat (839 mg/180g)
- Linsen (731 mg/200g)
- Bananen (422 mg/Stück)
- Avocado (487 mg/100g)

**Nitratreiche Lebensmittel (senken Blutdruck):**
- Rote Bete-Saft (400 ml = -5 mmHg systolisch)
- Spinat
- Rucola
- Sellerie

**Magnesium:**
- 400-420 mg/Tag (Männer), 310-320 mg/Tag (Frauen)
- Kürbiskerne, Mandeln, Spinat, schwarze Bohnen

### 7.3 Cholesterin & Herzgesundheit

**LDL senken, HDL erhöhen:**
- Lösliche Ballaststoffe (Haferflocken, Flohsamen)
- Phytosterine (Nüsse, Samen)
- Antioxidantien (Beeren, grüner Tee)

---

## 8. 🌍 NACHHALTIGKEIT & UMWELT

### 8.1 CO2-Fußabdruck

**Durchschnittswerte (kg CO2e/kg Lebensmittel):**
| Lebensmittel | CO2e |
|--------------|------|
| Rindfleisch | 27.0 |
| Käse | 13.5 |
| Tofu | 2.0 |
| Linsen | 0.9 |
| Gemüse (regional) | 0.3-0.5 |
| Nüsse | 2.3 |

**Ziel pro Rezept:**
- Durchschnitt <1.5 kg CO2e pro Mahlzeit

### 8.2 Regionalität & Saisonalität

**Priorität:**
1. Regional + saisonal (beste Wahl)
2. Regional + gelagert
3. National + saisonal
4. Import nur bei hoher Nährstoffdichte

**Bayerische/deutsche Saisonprodukte:**
- Frühling: Spargel, Spinat, Bärlauch
- Sommer: Tomaten, Paprika, Zucchini, Beeren
- Herbst: Kürbis, Kohl, Pilze, Äpfel
- Winter: Wurzelgemüse, Kohl, Lagergemüse

### 8.3 Verpackung & Verschwendung

**Grundregeln:**
- Unverpackt bevorzugen
- Glas vor Plastik
- Meal Prep zur Vermeidung von Verschwendung
- Reste verwerten (Gemüsebrühe aus Schalen)

---

## 📊 GESAMT-BEWERTUNG PRO REZEPT

Jedes Rezept erhält einen **Optimierungs-Score (0-100 Punkte):**

| Kriterium | Punkte | Gewichtung |
|-----------|--------|------------|
| 1. Blutzucker (GI/GL) | 0-15 | x 1.5 = max. 22.5 |
| 2. Kaloriendichte | 0-15 | x 1.5 = max. 22.5 |
| 3. Proteingehalt | 0-15 | x 1.0 = max. 15 |
| 4. Nährstoffdichte | 0-10 | x 1.0 = max. 10 |
| 5. Ballaststoffe | 0-10 | x 1.0 = max. 10 |
| 6. Verarbeitungsgrad | 0-10 | x 1.0 = max. 10 |
| 7. Anti-inflammatorisch | 0-5 | x 1.0 = max. 5 |
| 8. Nachhaltigkeit | 0-5 | x 1.0 = max. 5 |
| **GESAMT** | | **100 Punkte** |

**Bewertung:**
- 90-100 Punkte: ⭐⭐⭐⭐⭐ Optimal
- 80-89 Punkte: ⭐⭐⭐⭐ Sehr gut
- 70-79 Punkte: ⭐⭐⭐ Gut
- 60-69 Punkte: ⭐⭐ Akzeptabel
- <60 Punkte: ⭐ Überarbeiten

**Ziel:**
- Mindestens 80% der Rezepte mit ≥80 Punkten
- Keine Rezepte unter 60 Punkten

---

## 🎯 SPEZIELLE ANFORDERUNGEN FÜR REZEPT-KATEGORIEN

### Frühstück
- Min. 25g Protein
- GL <15
- Ballaststoffe >10g
- Kalorien 350-450

### Mittagessen
- Min. 30g Protein
- GL <20
- Ballaststoffe >15g
- Kalorien 500-600
- Mindestens 300g Gemüse

### Abendessen
- Min. 25g Protein
- GL <15 (niedriger als Mittag!)
- Ballaststoffe >12g
- Kalorien 400-500
- Leicht verdaulich

### Snacks
- Min. 10g Protein
- GL <10
- Kalorien 100-150
- Sättigend

### Süßes & Kuchen
- Max. 250 kcal/Portion
- GL <15
- Min. 8g Protein
- Natürliche Süßungsmittel (Datteln, Bananen, Stevia)

### Suppen
- Min. 15g Protein
- Kaloriendichte <0.8 kcal/g
- Hoch sättigend
- Kalorien 300-400

---

## 📝 NÄHRWERT-TEMPLATE FÜR JEDES REZEPT

```markdown
## Rezeptname

**Kategorie:** Frühstück/Mittagessen/Abendessen/Snack/etc.
**Portionen:** 2 | **Zubereitungszeit:** 25 Min | **Schwierigkeit:** ⭐⭐

### Nährwerte (pro Portion)
| Makros | Wert | % Tagesbedarf |
|--------|------|---------------|
| Kalorien | 420 kcal | 23% (bei 1800 kcal) |
| Protein | 28g | 23% (bei 120g) |
| Kohlenhydrate | 38g (Netto: 28g) | 20% |
| - davon Ballaststoffe | 12g | 40% |
| Fette | 16g | 24% |
| - davon Omega-3 | 2.5g ALA | ✓ |

### Blutzucker & Kalorien
| Metrik | Wert | Bewertung |
|--------|------|-----------|
| GI (gewichtet) | 42 | ✓ Niedrig |
| GL (pro Portion) | 12 | ✓ Niedrig |
| Kaloriendichte | 0.9 kcal/g | ✓ Niedrig |
| Sättigungsindex | 3.5/5 | Hoch |

### Top-Mikronährstoffe
| Nährstoff | Wert | % Tagesbedarf |
|-----------|------|---------------|
| Eisen | 6.2 mg | 34% |
| Magnesium | 142 mg | 36% |
| Vitamin C | 45 mg | 50% |
| Folat | 180 mcg | 45% |
| Kalium | 950 mg | 20% |

### Score
**Optimierungs-Score:** 88/100 ⭐⭐⭐⭐
- Blutzucker: 21/22.5
- Kaloriendichte: 20/22.5
- Protein: 14/15
- Nährstoffdichte: 9/10
- Ballaststoffe: 10/10
- Verarbeitungsgrad: 9/10
- Anti-inflammatorisch: 4/5
- Nachhaltigkeit: 4/5
```

---

## 🔬 RECHERCHE-ANFORDERUNGEN FÜR AGENTEN

### Agent 4 (Diabetes & Blutzucker) - ERWEITERT
**Zusätzliche Aufgaben:**
1. GI/GL-Tabelle für ALLE verwendeten Zutaten erstellen
2. Protein-Fett-Effekt quantifizieren (Studien!)
3. Essig/Zitrone-Effekt auf GI dokumentieren
4. Resistente Stärke recherchieren
5. CGM-Studien zu veganer Low-Carb-Ernährung
6. Second-Meal-Effect erklären
7. Mahlzeitenreihenfolge-Studien

### Agent 7 (Rezept-Entwicklung) - ERWEITERT
**Zusätzliche Aufgaben:**
1. Cronometer für ALLE Rezepte nutzen
2. GI/GL berechnen (gewichtet nach Zutatenmenge)
3. Kaloriendichte berechnen
4. Optimierungs-Score für jedes Rezept
5. Varianten für verschiedene Kalorien-Ziele (1600/1800/2000 kcal)
6. Meal-Prep-Anleitung
7. Blutzucker-Tipps pro Rezept

---

**Ende der Kriterien**
