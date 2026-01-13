ChefStream PRD
--------------

**Product:** ChefStream (working name)**Platform:** iOS (iOS 17+)**Document owner:** Stef**Audience:** AI coding agents and human engineers building the full project**Status:** v1 (MVP-focused, production-ready baseline)

1) Vision and rationale
-----------------------

### Vision

ChefStream is a dedicated, recipe-first YouTube experience. Users should be able to discover _only cooking/recipe videos_, watch them in a compliant embedded YouTube player, and immediately follow a structured recipe card (ingredients, steps, nutrition) displayed underneath the video—automatically translated into the app language (initially English).

### Why this exists

YouTube is the largest repository of cooking content, but it is not a recipe tool. Videos are long, steps are scattered, and users waste time scrubbing, pausing, and rewatching. ChefStream’s job is to convert video content into a “kitchen-usable” format without breaking YouTube’s rules.

### Core promise (MVP)

*   Find recipe videos fast
    
*   Open a video and see a usable recipe instantly (player + skeleton immediately, recipe soon after)
    
*   Output is translated to the app language
    
*   When no recipe can be extracted, the app clearly states “No recipe available” (and still allows viewing the video)
    

2) Product principles (hard constraints)
----------------------------------------

1.  **YouTube compliance is non-negotiable**
    
    *   Use YouTube embedded playback (IFrame-based wrapper).
        
    *   **Never overlay** UI elements on top of any part of the player. Recipe content must render below the player.
        
2.  **Speed-first UX**
    
    *   Detail screen must render immediately with player placeholder + skeleton recipe card.
        
    *   Cached recipes must load in milliseconds.
        
3.  **Curation-first quality**
    
    *   The app should primarily surface recipes, not “anything on YouTube.”
        
    *   Search must include guardrails to heavily bias toward real recipe/cooking videos.
        
4.  **Translation is default**
    
    *   Recipe content is always returned in the app language (English first).
        
5.  **Guest mode first**
    
    *   Browsing and viewing recipes must not require login.
        
    *   Login is only required when gating features (e.g., save/favorites, collections, user submissions later).
        

3) MVP scope (what agents must build)
-------------------------------------

### In scope (MVP)

**A. Discovery**

*   Home: curated categories (e.g., “High Protein,” “15-minute meals,” “Italian,” “Vegetarian,” “Meal Prep”).
    
*   Search: query-based search with recipe guardrails.
    
*   Results list: thumbnails + titles + channel name (no nutrition shown in list).
    

**B. Video detail**

*   Embedded YouTube player at top
    
*   Skeleton recipe card underneath immediately
    
*   Recipe card loads from cache or triggers extraction
    
*   Recipe includes:
    
    *   Ingredients (structured list)
        
    *   Steps (ordered)
        
    *   Nutrition fields (calories, protein at minimum; best-effort)
        
    *   Notes/metadata (servings/time if derivable)
        
*   If extraction fails or content is not a recipe: show **“No recipe available for this video.”**
    

**C. Backend caching**

*   Cache recipe output by video\_id
    
*   Cache search results (24h) for quota safety
    
*   Store recipe source inputs used (description + transcript if available)
    

**D. Authentication (MVP minimal)**

*   Guest mode by default
    
*   Prepare auth for later gated features
    
*   Implement: Sign in with Apple + Google (email later, not blocking MVP)
    

4) Out of scope (explicitly not in MVP)
---------------------------------------

*   Step-to-timestamp video jumping
    
*   In-app editing of recipes by users
    
*   Shopping list / pantry features
    
*   Paid subscriptions / monetization flows (only architecture hooks)
    
*   Full nutrition computation via ingredient databases (only best-effort extraction from available text)
    

5) Target users and primary jobs-to-be-done
-------------------------------------------

### Personas

1.  **Busy home cook**
    
    *   Wants reliable recipes fast, minimal fluff, clear steps
        
2.  **Fitness-focused eater**
    
    *   Cares about calories/protein, high-protein recipes
        
3.  **International content explorer**
    
    *   Wants recipes from any language, but readable in English
        

### Jobs-to-be-done

*   “Help me quickly pick a recipe video I trust.”
    
*   “Make the cooking process followable without rewatching the whole video.”
    
*   “Translate and structure the recipe so I can cook immediately.”
    

6) UX flows (MVP)
-----------------

### Flow 1: Curated browse → detail

1.  User opens app → sees curated categories
    
2.  User taps a category → sees list of videos
    
3.  User taps a video:
    
    *   Immediately shows player area + skeleton recipe card
        
    *   App requests cached recipe by video\_id
        
    *   If cached: render recipe
        
    *   If not cached: trigger extraction, then render
        

### Flow 2: Search → detail

1.  User enters query and taps Search (no live keystroke search)
    
2.  Backend performs guarded YouTube search (or serves cached results)
    
3.  User taps a video → same detail behavior as above
    

### Flow 3: Non-recipe content

*   If extraction returns “not a recipe”:
    
    *   Show the video
        
    *   Show a card: “No recipe available for this video.”
        

### Flow 4: Gated action (future hook)

*   User taps “Save” or “Add to collection” (feature may be stubbed)
    
*   Prompt login (Apple/Google)
    
*   After login: proceed
    

7) Functional requirements
--------------------------

### Search guardrails (“Only recipes” bias)

Backend must enforce:

*   Query augmentation (invisible to user): append terms like recipe, cooking, ingredients
    
*   Restrict category where possible (e.g., How-to & Style)
    
*   SafeSearch strict
    
*   Optional additional heuristics:
    
    *   Prefer videos with “recipe”/“ingredients”/“serves” in description/title
        
    *   Prefer channels with cooking signals (later enhancement)
        

### Recipe extraction (best-effort)

Inputs to extraction:

*   Video description (always)
    
*   Transcript/captions when available (optional)Output:
    
*   Strict JSON schema (versioned)
    
*   Translated to target language (English)
    
*   Nutrition fields best-effort:
    
    *   Use provided macros if present
        
    *   Otherwise estimate only if model is instructed and confidence is marked (do not pretend accuracy)
        

### Rendering

*   Skeleton recipe card must appear instantly
    
*   Recipe card must support partial availability:
    
    *   ingredients ready, steps loading (optional improvement)
        
    *   show “estimated” labels if needed
        

8) Non-functional requirements
------------------------------

### Performance

*   Cold start: acceptable iOS norms
    
*   Detail screen: player placeholder + skeleton within ~100ms UI time
    
*   Cached recipe retrieval: target sub-second end-to-end (backend + render)
    
*   Extraction time: allowed a few seconds; must not block initial UI
    

### Reliability

*   Must handle:
    
    *   YouTube API failures (show error state, allow retry)
        
    *   Extraction failures (show “No recipe available” + retry)
        
    *   Partial data (show what exists)
        

### Compliance & safety

*   Strict no-overlay rule on YouTube player
    
*   No downloading videos
    
*   Do not present extracted content as official YouTube metadata
    
*   Clear labeling when content is inferred/estimated
    

9) Tech stack (mandated for agents)
-----------------------------------

### iOS

*   SwiftUI (iOS 17+)
    
*   Async/await concurrency
    
*   Image loading/caching: Nuke (or equivalent fast caching; pick one and standardize)
    
*   YouTube embed: a compliant IFrame-based wrapper library
    
*   Local persistence: SwiftData (or Core Data) for lightweight offline caching (optional but recommended)
    

### Backend

*   Supabase:
    
    *   Postgres
        
    *   Edge Functions (TypeScript preferred)
        
    *   Auth (Apple + Google)
        
    *   Row Level Security policies
        

### AI Extraction

*   Use a fast/cheap model tier for structured JSON extraction
    
*   Must support:
    
    *   JSON-mode or strong structured output constraints
        
    *   Translation requirement (output in English)
        
    *   “Not a recipe” classification
        

10) Data model (minimum viable schema)
--------------------------------------

### Tables

**videos** (curated + discovered index)

*   video\_id (PK)
    
*   title
    
*   channel\_title
    
*   thumbnail\_url
    
*   source enum: curated | search | user (user later)
    
*   tags (JSONB or text array)
    
*   language\_hint (nullable)
    
*   created\_at, updated\_at
    

**recipes**

*   video\_id (PK, FK → videos.video\_id)
    
*   status enum: ready | generating | failed | not\_recipe
    
*   recipe\_version (int)
    
*   recipe\_json (JSONB)
    
*   confidence (float, optional)
    
*   source\_hash (text) — hash of combined inputs to know when to re-extract
    
*   created\_at, updated\_at
    

**recipe\_sources**

*   id (PK)
    
*   video\_id (FK)
    
*   source\_type enum: description | transcript | chapters
    
*   payload (text)
    
*   created\_at
    

**search\_cache**

*   query\_key (PK) — normalized query + locale
    
*   results\_json (JSONB)
    
*   expires\_at
    

### Future tables (not MVP but plan for)

*   user\_favorites
    
*   collections
    
*   user\_submissions
    
*   moderation\_queue
    

11) API design (Edge Functions)
-------------------------------

### GET /search

**Purpose:** return recipe-biased YouTube results, cached**Params:** q, locale, pageToken?**Behavior:**

*   Normalize and build query\_key
    
*   If cached and not expired: return cached results
    
*   Else call YouTube search with guardrails, store 24h cache, return results
    

### GET /recipe

**Purpose:** return cached recipe or generate one synchronously**Params:** videoId, locale**Behavior:**

*   Check recipes by videoId
    
    *   if ready: return recipe\_json
        
    *   if not\_recipe: return flag
        
    *   if missing/failed: attempt generation (best-effort sync)
        
*   Generation path:
    
    *   fetch description (+ transcript if available)
        
    *   call model with strict schema and translation
        
    *   store and return
        

### POST /extract (optional if you want explicit trigger)

**Purpose:** force extraction (admin tools later)

12) Recipe JSON schema (strict, versioned)
------------------------------------------

**recipe\_json\_v1**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "title": "string",    "language": "en",    "ingredients": [      { "item": "string", "quantity": "string|null", "unit": "string|null", "notes": "string|null" }    ],    "steps": [      { "order": 1, "text": "string" }    ],    "nutrition": {      "calories": "number|null",      "protein": "string|null",      "note": "string|null"    },    "meta": {      "servings": "string|null",      "prep_time": "string|null",      "cook_time": "string|null",      "total_time": "string|null",      "source": ["description", "transcript"]    },    "flags": {      "is_recipe": true,      "is_estimated": false    }  }   `

If not a recipe:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "flags": { "is_recipe": false },    "reason": "string"  }   `

13) iOS architecture guidance (for agents)
------------------------------------------

### Recommended structure

*   MVVM with explicit async state
    
*   Views:
    
    *   HomeView (curated categories)
        
    *   SearchView (explicit Search button)
        
    *   VideoGridView (reusable)
        
    *   RecipeDetailView (player + skeleton + recipe)
        
*   Services:
    
    *   YouTubeService (search)
        
    *   RecipeService (recipe fetch/extract)
        
    *   AuthService (later gated)
        
*   State:
    
    *   RecipeDetailState: .loadingSkeleton, .loaded(recipe), .notRecipe, .error
        

### Detail screen rendering rules

*   Render player container immediately (no overlay)
    
*   Render skeleton immediately beneath
    
*   Trigger recipe fetch on appear
    
*   Fade skeleton out when recipe loads
    

14) Quota and cost strategy (must implement)
--------------------------------------------

1.  **Search caching** (24h) keyed by normalized query + locale
    
2.  **Curated home** to reduce need for search and to push already-extracted recipes
    
3.  **Recipe caching** by video\_id so extraction runs once per video per version
    
4.  **Graceful fallback** when YouTube or model fails
    

15) Milestones (delivery plan)
------------------------------

### Milestone 1: Foundation (ship a working app)

*   SwiftUI app shell + navigation
    
*   Home categories (static seeded list from DB)
    
*   Video grid UI
    
*   Detail screen: player + skeleton
    

### Milestone 2: Search + caching

*   Edge /search with caching
    
*   Search UI with explicit submit button
    
*   Results display
    

### Milestone 3: Recipe extraction pipeline

*   Edge /recipe with cache check + generation
    
*   LLM prompt + strict JSON schema + translation
    
*   Store recipe + sources
    

### Milestone 4: Hardening + release readiness

*   Error states, retries
    
*   Basic analytics hooks (events)
    
*   Basic auth scaffolding (Apple/Google) but not required for viewing
    

16) Acceptance criteria (MVP must pass)
---------------------------------------

1.  Users can browse curated categories and open videos.
    
2.  Detail view always shows player + skeleton immediately.
    
3.  If recipe cached, it appears quickly.
    
4.  If recipe not cached, app attempts to generate and then displays it.
    
5.  If generation fails or not a recipe, app displays “No recipe available.”
    
6.  Output is always in English (translated when source is not English).
    
7.  No UI overlays on top of player (strict).
    
8.  Search does not exhaust quota rapidly due to caching + explicit search action.
    

17) Open questions (explicitly parked)
--------------------------------------

*   How accurate should nutrition be, and how will you communicate confidence?
    
*   Will you eventually build an admin curation tool (web dashboard) for adding/editing tags and forcing re-extraction?
    
*   Will you allow user submissions in MVP+1 and how will moderation work?
    

18) “Master build instruction” for coding agents
------------------------------------------------

Build the MVP exactly as defined above. Prioritize:

1.  compliant video playback + fast UI
    
2.  cached recipe delivery
    
3.  guarded search + caching
    
4.  translation baked into extraction
    
5.  guest mode with future auth hooks
    

Avoid adding “nice-to-haves” until the MVP acceptance criteria are met.