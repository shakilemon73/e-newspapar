const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-wTZrHXM3.js","assets/main-C23CMhgB.css"])))=>i.map(i=>d[i]);
import{supabaseDirectAPI as u}from"./supabase-direct-api-Dy_0KAwh.js";import{_ as p,s as c,Q as w}from"./main-wTZrHXM3.js";const g=[{name:"ঢাকা",lat:23.8103,lon:90.4125,english:"Dhaka"},{name:"চট্টগ্রাম",lat:22.3569,lon:91.7832,english:"Chittagong"},{name:"খুলনা",lat:22.8456,lon:89.5403,english:"Khulna"},{name:"রাজশাহী",lat:24.3636,lon:88.6241,english:"Rajshahi"},{name:"সিলেট",lat:24.8949,lon:91.8687,english:"Sylhet"},{name:"বরিশাল",lat:22.701,lon:90.3535,english:"Barisal"},{name:"রংপুর",lat:25.7439,lon:89.2752,english:"Rangpur"},{name:"ময়মনসিংহ",lat:24.7471,lon:90.4203,english:"Mymensingh"}];class y{constructor(){this.API_KEY="your-weather-api-key",this.BASE_URL="https://api.openweathermap.org/data/2.5"}async fetchExternalWeather(t){try{const e=Math.floor(Math.random()*10)+25,r=["Clear","Partly Cloudy","Cloudy","Light Rain"],a=r[Math.floor(Math.random()*r.length)];return{city:t,temperature:e,condition:a,icon:this.getWeatherIcon(a),forecast:null}}catch(e){return console.error(`Error fetching weather for ${t}:`,e),null}}getWeatherIcon(t){return{Clear:"☀️","Partly Cloudy":"⛅",Cloudy:"☁️","Light Rain":"🌦️",Rain:"🌧️",Thunderstorm:"⛈️"}[t]||"☀️"}async updateAllCitiesWeather(){console.log("[WeatherService] Starting weather update...");try{const t=[];for(const e of g){const r=await this.fetchExternalWeather(e.name);r&&(t.push({...r,city:e.name}),console.log(`[WeatherService] Updated weather for ${e.name}: ${r.temperature}°C`))}if(t.length>0)try{const{default:e}=await p(async()=>{const{default:a}=await import("./main-wTZrHXM3.js").then(o=>o.c);return{default:a}},__vite__mapDeps([0,1]));await e.from("weather").delete().neq("id",0);const{error:r}=await e.from("weather").insert(t);r?console.error("Error updating weather in database:",r):console.log(`[WeatherService] Successfully updated weather for ${t.length} cities`)}catch(e){console.error("Error accessing admin client for weather updates:",e)}}catch(t){console.error("Error in weather update process:",t)}}async getWeatherByCity(t){try{const{data:e,error:r}=await c.from("weather").select("*").eq("city",t).order("updated_at",{ascending:!1}).limit(1);return r?(console.error("Error fetching weather by city:",r),null):e?.[0]||null}catch(e){return console.error("Error getting weather by city:",e),null}}async getAllWeather(){try{const{data:t,error:e}=await c.from("weather").select("*").order("updated_at",{ascending:!1});return e?(console.error("Error fetching all weather:",e),[]):t||[]}catch(t){return console.error("Error getting all weather:",t),[]}}async getLocationFromIP(){try{const e=await(await fetch("https://ipapi.co/json/")).json();if(e.city&&e.latitude&&e.longitude){const r=parseFloat(e.latitude),a=parseFloat(e.longitude);let o=g[0],n=this.calculateDistance(r,a,o.lat,o.lon);for(const s of g){const l=this.calculateDistance(r,a,s.lat,s.lon);l<n&&(n=l,o=s)}return{city:o.name,latitude:r,longitude:a,country:e.country_name||"Bangladesh"}}return null}catch(t){return console.error("Error getting location from IP:",t),null}}calculateDistance(t,e,r,a){const n=this.degreesToRadians(r-t),s=this.degreesToRadians(a-e),l=Math.sin(n/2)*Math.sin(n/2)+Math.cos(this.degreesToRadians(t))*Math.cos(this.degreesToRadians(r))*Math.sin(s/2)*Math.sin(s/2);return 6371*(2*Math.atan2(Math.sqrt(l),Math.sqrt(1-l)))}degreesToRadians(t){return t*(Math.PI/180)}}class f{constructor(){this.intervalId=null,this.UPDATE_INTERVAL=60*60*1e3,this.scheduler=new y}start(){console.log("[WeatherScheduler] Starting automatic weather updates every hour"),this.updateWeather(),this.intervalId=setInterval(()=>{this.updateWeather()},this.UPDATE_INTERVAL)}stop(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=null,console.log("[WeatherScheduler] Stopped automatic weather updates"))}async updateWeather(){console.log("[WeatherScheduler] Starting scheduled weather update...");const t=Date.now();try{await this.scheduler.updateAllCitiesWeather();const e=Date.now()-t;console.log(`[WeatherScheduler] Weather update completed in ${e}ms`)}catch(e){console.error("[WeatherScheduler] Error during weather update:",e)}}}const h=new f;typeof window<"u"&&(h.start(),window.addEventListener("beforeunload",()=>{h.stop()}));class _{async getPersonalizedRecommendations(t,e=10){try{if(!t)return await this.getPopularArticles(e);const{data:r}=await c.from("user_reading_history").select("article_id, categories!inner(id, name)").eq("user_id",t).limit(50),a=this.analyzeCategoryPreferences(r||[]),{data:o}=await c.from("articles").select(`
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          view_count,
          categories (
            id,
            name,
            slug
          )
        `).in("category_id",a.map(n=>n.categoryId)).order("view_count",{ascending:!1}).order("published_at",{ascending:!1}).limit(e);return(o||[]).map((n,s)=>({id:n.id,title:n.title,slug:n.slug,excerpt:n.excerpt||"",image_url:n.image_url||"",published_at:n.published_at,relevance_score:this.calculateRelevanceScore(n,a),category_name:n.categories?.name||"সাধারণ"}))}catch(r){return console.error("Error getting personalized recommendations:",r),await this.getPopularArticles(e)}}analyzeCategoryPreferences(t){const e={};return t.forEach(r=>{const a=r.categories?.id;a&&(e[a]={categoryId:a,count:(e[a]?.count||0)+1})}),Object.values(e).sort((r,a)=>a.count-r.count).slice(0,5)}calculateRelevanceScore(t,e){let r=0;const a=e.find(l=>l.categoryId===t.category_id);a&&(r+=Math.min(a.count*10,50));const o=t.view_count||0;r+=Math.min(o/100,30);const n=new Date(t.published_at),s=(Date.now()-n.getTime())/(1e3*60*60*24);return r+=Math.max(20-s,0),Math.round(r)}async getPopularArticles(t=10,e="all"){try{let r=c.from("articles").select(`
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          view_count,
          categories (
            id,
            name,
            slug
          )
        `);if(e!=="all"){const o=this.getDateFilter(e);r=r.gte("published_at",o)}const{data:a}=await r.order("view_count",{ascending:!1}).order("published_at",{ascending:!1}).limit(t);return(a||[]).map((o,n)=>({id:o.id,title:o.title,slug:o.slug,excerpt:o.excerpt||"",image_url:o.image_url||"",published_at:o.published_at,relevance_score:100-n,category_name:o.categories?.name||"সাধারণ"}))}catch(r){return console.error("Error fetching popular articles:",r),[]}}async getTrendingArticles(t=10){try{const e=new Date;e.setDate(e.getDate()-7);const{data:r}=await c.from("articles").select(`
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          view_count,
          categories (
            id,
            name,
            slug
          )
        `).gte("published_at",e.toISOString()).order("view_count",{ascending:!1}).limit(t);return(r||[]).map((a,o)=>({id:a.id,title:a.title,slug:a.slug,excerpt:a.excerpt||"",image_url:a.image_url||"",published_at:a.published_at,relevance_score:this.calculateTrendingScore(a),category_name:a.categories?.name||"সাধারণ"}))}catch(e){return console.error("Error fetching trending articles:",e),[]}}calculateTrendingScore(t){const e=new Date(t.published_at),r=(Date.now()-e.getTime())/(1e3*60*60),o=(t.view_count||0)/Math.max(r,1),n=Math.max(168-r,0)/168;return Math.round(o*10+n*50)}async trackUserInteraction(t,e,r,a){try{await c.from("user_interactions").insert({user_id:t,article_id:e,interaction_type:r,metadata:a||{},created_at:new Date().toISOString()}),r==="read"&&await c.from("user_reading_history").upsert({user_id:t,article_id:e,read_at:new Date().toISOString(),read_duration:a?.duration||0}),console.log(`[Analytics] Tracked ${r} interaction for user ${t} on article ${e}`)}catch(o){console.error("Error tracking user interaction:",o)}}async advancedBengaliSearch(t,e=20,r=0){try{const a=t.trim().toLowerCase(),{data:o}=await c.from("articles").select(`
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          view_count,
          categories (
            id,
            name,
            slug
          )
        `).or(`title.ilike.%${a}%,content.ilike.%${a}%,excerpt.ilike.%${a}%`).order("view_count",{ascending:!1}).order("published_at",{ascending:!1}).range(r,r+e-1);return(o||[]).map(n=>({...n,relevance_score:this.calculateSearchRelevance(n,a)})).sort((n,s)=>s.relevance_score-n.relevance_score)}catch(a){return console.error("Error in Bengali search:",a),[]}}calculateSearchRelevance(t,e){let r=0;const a=e.toLowerCase(),o=(t.title||"").toLowerCase(),n=(t.excerpt||"").toLowerCase();return o.includes(a)&&(r+=100,o.startsWith(a)&&(r+=50)),n.includes(a)&&(r+=30),r+=Math.min((t.view_count||0)/10,20),r}async getUserAnalytics(t){try{const{data:e}=await c.from("user_reading_history").select(`
          *,
          articles (
            id,
            category_id,
            categories (
              name
            )  
          )
        `).eq("user_id",t).order("read_at",{ascending:!0});if(!e||e.length===0)return{totalReads:0,readingStreak:0,favoriteCategories:[],readingTime:0,engagementScore:0};const r=e.length,a=this.calculateReadingStreak(e),o=this.getFavoriteCategories(e),n=e.reduce((l,d)=>l+(d.read_duration||0),0),s=this.calculateEngagementScore(e);return{totalReads:r,readingStreak:a,favoriteCategories:o,readingTime:n,engagementScore:s}}catch(e){return console.error("Error fetching user analytics:",e),{totalReads:0,readingStreak:0,favoriteCategories:[],readingTime:0,engagementScore:0}}}calculateReadingStreak(t){const e=new Date;let r=0,a=new Date(e);for(let o=t.length-1;o>=0;o--){const n=new Date(t[o].read_at);if(Math.floor((a.getTime()-n.getTime())/(1e3*60*60*24))<=1)r++,a=n;else break}return r}getFavoriteCategories(t){const e={};return t.forEach(r=>{const a=r.articles?.categories?.name;a&&(e[a]=(e[a]||0)+1)}),Object.entries(e).sort(([,r],[,a])=>a-r).slice(0,3).map(([r])=>r)}calculateEngagementScore(t){const e=t.length,r=t.reduce((l,d)=>l+(d.read_duration||0),0)/e,a=t.filter(l=>{const d=new Date(l.read_at);return(Date.now()-d.getTime())/(1e3*60*60*24)<=30}).length,o=Math.min(e*2,40),n=Math.min(r/60,30),s=Math.min(a*3,30);return Math.round(o+n+s)}async getTrendingTopics(t=10){try{const{data:e}=await c.from("trending_topics").select("*").order("score",{ascending:!1}).limit(t);return e||[]}catch(e){return console.error("Error fetching trending topics:",e),[]}}async updateTrendingTopics(){try{const t=new Date;t.setDate(t.getDate()-1);const{data:e}=await c.from("articles").select(`
          id,
          title,
          view_count,
          published_at,
          categories (
            name
          )
        `).gte("published_at",t.toISOString()),r=this.analyzeTopics(e||[]);await c.from("trending_topics").delete().neq("id",0);const a=Object.entries(r).sort(([,o],[,n])=>n.score-o.score).slice(0,20).map(([o,n])=>({name:o,slug:this.generateSlug(o),score:n.score,article_count:n.count,growth_rate:n.growth}));a.length>0&&await c.from("trending_topics").insert(a),console.log(`[TrendingTopics] Updated ${a.length} trending topics`)}catch(t){console.error("Error updating trending topics:",t)}}analyzeTopics(t){const e={};return t.forEach(r=>{const a=this.extractKeywords(r.title),o=Math.log10((r.view_count||0)+1)*10;a.forEach(s=>{e[s]||(e[s]={score:0,count:0,growth:0}),e[s].score+=o,e[s].count+=1,e[s].growth+=this.calculateGrowthRate(r)});const n=r.categories?.name;n&&(e[n]||(e[n]={score:0,count:0,growth:0}),e[n].score+=o*.5,e[n].count+=1)}),e}extractKeywords(t){return t.split(/\s+/).filter(r=>r.length>2).slice(0,3)}calculateGrowthRate(t){const e=new Date(t.published_at),r=(Date.now()-e.getTime())/(1e3*60*60);return(t.view_count||0)/Math.max(r,1)}generateSlug(t){return t.toLowerCase().replace(/[^\w\s\u0980-\u09FF]/g,"").replace(/\s+/g,"-").trim()}getDateFilter(t){const e=new Date;let r=0;switch(t){case"today":r=1;break;case"week":r=7;break;case"month":r=30;break;default:return"1900-01-01"}const a=new Date;return a.setDate(e.getDate()-r),a.toISOString()}}const m=new _;typeof window<"u"&&setInterval(()=>{m.updateTrendingTopics()},60*60*1e3);new w({defaultOptions:{queries:{staleTime:1e3*60*5,gcTime:1e3*60*30,retry:3,refetchOnWindowFocus:!1,refetchOnMount:!0},mutations:{retry:1}}});const b={getAll:async i=>{const{limit:t=10,offset:e=0,category:r,featured:a}=i||{};return await u.articles.getAll(t,e,r,a)},getLatest:async(i=10)=>await u.articles.getLatest(i),getPopular:async(i=5,t="all")=>await u.articles.getPopular(i),search:async(i,t=10,e=0)=>await m.advancedBengaliSearch(i,t,e),getBySlug:async i=>await u.articles.getBySlug(i),trackView:async i=>await u.articles.trackView(i)},E={getAll:async()=>await u.categories.getAll(),getBySlug:async i=>await u.categories.getBySlug(i)};export{b as articlesApiDirect,E as categoriesApiDirect};
//# sourceMappingURL=queryClient-direct-C1pxtlk8.js.map
