import{s as n}from"./main-BzCE1OI6.js";console.log("Direct API client using: ANON KEY");async function _(){const{data:r,error:e}=await n.from("categories").select("*").order("name",{ascending:!0});return e?(console.error("Error fetching categories:",e),[]):r||[]}async function m(r){const{data:e,error:t}=await n.from("categories").select("*").eq("slug",r).single();return t?(console.error("Error fetching category:",t),null):e}async function y(r={}){let e=n.from("articles").select(`
      id,
      title,
      slug,
      content,
      excerpt,
      image_url,
      view_count,
      published_at,
      is_featured,
      category_id,
      categories(id, name, slug)
    `).order("published_at",{ascending:!1});if(r.featured&&(e=e.eq("is_featured",!0)),r.category){const{data:s}=await n.from("categories").select("id").eq("slug",r.category).single();s&&(e=e.eq("category_id",s.id))}r.limit&&(e=e.limit(r.limit)),r.offset&&(e=e.range(r.offset,r.offset+(r.limit||10)-1));const{data:t,error:o}=await e;return o?(console.error("Error fetching articles:",o),[]):t||[]}async function h(r){const{data:e,error:t}=await n.from("articles").select(`
      id,
      title,
      slug,
      content,
      excerpt,
      image_url,
      view_count,
      published_at,
      is_featured,
      category_id,
      categories(id, name, slug)
    `).eq("slug",r).single();return t?(console.error("Error fetching article by slug:",t),null):e}async function g(r=5){try{console.log(`[Supabase] Fetching ${r} popular articles directly from database...`);const{data:e,error:t}=await n.from("articles").select(`
        id,
        title,
        slug,
        content,
        excerpt,
        image_url,
        view_count,
        published_at,
        is_featured,
        category_id,
        categories(id, name, slug)
      `).order("view_count",{ascending:!1}).limit(r);if(t)return console.error("[Supabase] Error fetching popular articles:",t),[];if(!e||e.length===0)return console.warn("[Supabase] No articles found in database"),[];const o=e.map(s=>({...s,imageUrl:s.image_url,viewCount:s.view_count,publishedAt:s.published_at,isFeatured:s.is_featured,categoryId:s.category_id,category:Array.isArray(s.categories)?s.categories[0]:s.categories}));return console.log(`[Supabase] Successfully fetched ${o.length} popular articles`),o}catch(e){return console.error("[Supabase] Failed to fetch popular articles:",e),[]}}async function w(r=10){try{const{data:e,error:t}=await n.from("articles").select(`
        id,
        title,
        slug,
        excerpt,
        image_url,
        view_count,
        published_at,
        is_featured,
        category_id,
        categories(id, name, slug)
      `).order("published_at",{ascending:!1}).limit(r);return t?(console.error("Error fetching latest articles from Supabase:",t),[]):(e||[]).map(o=>({...o,imageUrl:o.image_url,viewCount:o.view_count,publishedAt:o.published_at,isFeatured:o.is_featured,categoryId:o.category_id,category:Array.isArray(o.categories)?o.categories[0]:o.categories}))}catch(e){return console.error("Failed to fetch latest articles:",e),[]}}async function p(){const{data:r,error:e}=await n.from("weather").select("*").order("city",{ascending:!0});return e?(console.error("Error fetching weather:",e),[]):r||[]}async function b(r){const{data:e,error:t}=await n.from("weather").select("*").eq("city",r).single();return t?(console.error("Error fetching weather by city:",t),null):e}async function E(){try{const{data:r,error:e}=await n.from("breaking_news").select("*").eq("is_active",!0).order("created_at",{ascending:!1});return e?(console.error("Error fetching breaking news from Supabase:",e),[]):r||[]}catch(r){return console.error("Failed to fetch breaking news:",r),[]}}async function k(){const{data:r,error:e}=await n.from("epapers").select("*").order("publish_date",{ascending:!1});return e?(console.error("Error fetching e-papers:",e),[]):r||[]}async function v(){try{const{data:r,error:e}=await n.from("epapers").select("*").eq("is_latest",!0).order("publish_date",{ascending:!1}).limit(1);if(e){console.error("Error fetching latest e-paper (is_latest=true):",e);const{data:t,error:o}=await n.from("epapers").select("*").order("publish_date",{ascending:!1}).limit(1);return o?(console.error("Error fetching fallback latest e-paper:",o),null):(t==null?void 0:t[0])||null}return(r==null?void 0:r[0])||null}catch(r){return console.error("Error in getLatestEPaper:",r),null}}async function q(){const{data:r,error:e}=await n.from("video_content").select("*").order("published_at",{ascending:!1});return e?(console.error("Error fetching video content:",e),[]):r||[]}async function S(){try{const{data:r,error:e}=await n.from("system_settings").select("*").limit(1).maybeSingle();return e&&e.code!=="PGRST116"&&console.error("Error fetching site settings:",e),{siteName:(r==null?void 0:r.site_name)||"Bengali News",siteDescription:(r==null?void 0:r.site_description)||"বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম",logoUrl:(r==null?void 0:r.logo_url)||"",defaultLanguage:(r==null?void 0:r.default_language)||"bn",siteUrl:(r==null?void 0:r.site_url)||""}}catch(r){return console.error("Error in getSiteSettings:",r),{siteName:"Bengali News",siteDescription:"বাংলাদেশের নির্ভরযোগ্য সংবাদ মাধ্যম",logoUrl:"",defaultLanguage:"bn",siteUrl:""}}}async function A(r){const{data:e,error:t}=await n.from("video_content").select("*").eq("slug",r).single();return t?(console.error("Error fetching video by slug:",t),null):e}async function U(){const{data:r,error:e}=await n.from("audio_articles").select("*").order("published_at",{ascending:!1});return e?(console.error("Error fetching audio articles:",e),[]):r||[]}async function C(){const{data:r,error:e}=await n.from("social_media_posts").select("*").order("published_at",{ascending:!1});return e?(console.error("Error fetching social media posts:",e),[]):r||[]}async function P(r=10){const{data:e,error:t}=await n.from("trending_topics").select("*").order("trending_score",{ascending:!1}).limit(r);return t?(console.error("Error fetching trending topics:",t),[{name:"নির্বাচন",trending_score:.95,category:"রাজনীতি"},{name:"ক্রিকেট",trending_score:.87,category:"খেলাধুলা"},{name:"রাজনীতি",trending_score:.82,category:"রাজনীতি"},{name:"অর্থনীতি",trending_score:.76,category:"অর্থনীতি"},{name:"আবহাওয়া",trending_score:.71,category:"সাধারণ"}].slice(0,r)):e||[]}async function x(r){try{const{data:e,error:t}=await n.from("articles").select("view_count").eq("id",r).single();if(t)return console.error("Error fetching article for view count:",t),null;const o=((e==null?void 0:e.view_count)||0)+1,{error:s}=await n.from("articles").update({view_count:o}).eq("id",r);return s?(console.error("Error updating view count:",s),null):{viewCount:o}}catch(e){return console.error("Error incrementing view count:",e),null}}async function D(r){const{data:e,error:t}=await n.from("article_tags").select(`
      tags(id, name, slug, color)
    `).eq("article_id",r);return t?(console.error("Error fetching article tags:",t),[]):(e==null?void 0:e.map(o=>o.tags).filter(Boolean))||[]}async function F(r,e,t=20,o=0){let s=n.from("articles").select(`
      id,
      title,
      slug,
      content,
      excerpt,
      image_url,
      view_count,
      published_at,
      is_featured,
      category_id,
      categories(id, name, slug)
    `).textSearch("title",r,{type:"websearch"}).order("published_at",{ascending:!1});if(e){const{data:l}=await n.from("categories").select("id").eq("slug",e).single();l&&(s=s.eq("category_id",l.id))}s=s.limit(t),o>0&&(s=s.range(o,o+t-1));const{data:a,error:c}=await s;return c?(console.error("Error searching articles:",c),[]):transformArticleData(a||[])}async function B(r){try{const{data:e}=await n.from("newsletters").select("id").eq("email",r).single();if(e)return{success:!1,message:"এই ইমেইল ঠিকানা ইতিমধ্যে সাবস্ক্রাইব করা আছে"};const{error:t}=await n.from("newsletters").insert({email:r,is_active:!0,subscribed_at:new Date().toISOString()});return t?(console.error("Error subscribing to newsletter:",t),{success:!1,message:"সাবস্ক্রিপশনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।"}):{success:!0,message:"সফলভাবে নিউজলেটার সাবস্ক্রাইব হয়েছে!"}}catch(e){return console.error("Newsletter subscription error:",e),{success:!1,message:"সাবস্ক্রিপশনে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।"}}}async function L(r){try{const{count:e}=await n.from("user_reading_history").select("*",{count:"exact"}).eq("user_id",r),{count:t}=await n.from("user_bookmarks").select("*",{count:"exact"}).eq("user_id",r),{count:o}=await n.from("user_likes").select("*",{count:"exact"}).eq("user_id",r),{count:s}=await n.from("article_comments").select("*",{count:"exact"}).eq("user_id",r);return{totalReadArticles:e||0,totalBookmarks:t||0,totalLikes:o||0,totalComments:s||0,totalInteractions:(e||0)+(o||0)+(s||0),favoriteCategories:[]}}catch(e){return console.error("Error fetching user stats:",e),{totalReadArticles:0,totalBookmarks:0,totalLikes:0,totalComments:0,totalInteractions:0,favoriteCategories:[]}}}async function N(r){try{const{data:e,error:t}=await n.from("user_settings").select("*").eq("user_id",r).single();return t&&t.code!=="PGRST116"&&console.error("Error fetching user preferences:",t),e||{theme:"light",language:"bn",notifications:!0,autoPlay:!1,fontSize:"medium"}}catch(e){return console.error("Error fetching user preferences:",e),{theme:"light",language:"bn",notifications:!0,autoPlay:!1,fontSize:"medium"}}}async function R(r,e=10){return d(r,e)}async function d(r,e=10){try{const{data:t,error:o}=await n.from("user_bookmarks").select(`
        articles(
          id,
          title,
          slug,
          excerpt,
          image_url,
          view_count,
          published_at,
          is_featured,
          category_id,
          categories(id, name, slug)
        )
      `).eq("user_id",r).order("created_at",{ascending:!1}).limit(e);return o?(console.error("Error fetching saved articles:",o),[]):(t==null?void 0:t.map(s=>transformArticleData([s.articles])[0]).filter(Boolean))||[]}catch(t){return console.error("Error fetching saved articles:",t),[]}}async function O(r,e=10){try{const{data:t,error:o}=await n.from("articles").select(`
        id,
        title,
        slug,
        excerpt,
        image_url,
        view_count,
        published_at,
        is_featured,
        category_id,
        categories(id, name, slug)
      `).order("published_at",{ascending:!1}).limit(e);return o?(console.error("Error fetching reading history:",o),[]):(t||[]).map(s=>({...s,imageUrl:s.image_url,viewCount:s.view_count,publishedAt:s.published_at,isFeatured:s.is_featured,categoryId:s.category_id,category:s.categories}))}catch(t){return console.error("Error fetching reading history:",t),[]}}async function T(r,e){try{const{error:t}=await n.from("user_profiles").upsert({user_id:r,full_name:e.fullName,bio:e.bio,location:e.location,website:e.website,updated_at:new Date().toISOString()});return t?(console.error("Error updating profile:",t),{success:!1,message:"প্রোফাইল আপডেট করতে সমস্যা হয়েছে"}):{success:!0,message:"প্রোফাইল সফলভাবে আপডেট হয়েছে"}}catch(t){return console.error("Profile update error:",t),{success:!1,message:"প্রোফাইল আপডেট করতে সমস্যা হয়েছে"}}}async function z(r,e){try{const{error:t}=await n.from("user_bookmarks").insert({user_id:e,article_id:r.id,folder_name:"offline_reading"});return t?t.code==="23505"?{success:!1,message:"এই নিবন্ধটি ইতিমধ্যে সংরক্ষিত আছে"}:(console.error("Error saving article for offline:",t),{success:!1,message:"সংরক্ষণ করতে সমস্যা হয়েছে"}):{success:!0,message:"সংবাদটি অফলাইন পড়ার জন্য সংরক্ষিত হয়েছে"}}catch(t){return console.error("Error saving article for offline:",t),{success:!1,message:"সংরক্ষণ করতে সমস্যা হয়েছে"}}}async function H(r,e,t,o){try{const{error:s}=await n.from("user_feedback").insert({user_id:e,feedback_type:"article_report",content:t,metadata:{article_id:r,details:o||"",user_agent:navigator.userAgent},status:"submitted"});return s?(console.error("Error reporting article:",s),{success:!1,message:"রিপোর্ট করতে সমস্যা হয়েছে"}):{success:!0,message:"আপনার রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে"}}catch(s){return console.error("Error reporting article:",s),{success:!1,message:"রিপোর্ট করতে সমস্যা হয়েছে"}}}async function V(r,e=10){try{const{data:t,error:o}=await n.from("article_comments").select(`
        id,
        content,
        created_at,
        user_profiles(full_name),
        users(email)
      `).eq("article_id",r).eq("is_approved",!0).order("created_at",{ascending:!1}).limit(e);return o?(console.error("Error fetching comments:",o),[]):t||[]}catch(t){return console.error("Error fetching comments:",t),[]}}async function G(r,e){try{const{data:t,error:o}=await n.from("user_likes").select("id").eq("content_id",r).eq("content_type","article").eq("user_id",e).single(),{count:s,error:a}=await n.from("user_likes").select("*",{count:"exact"}).eq("content_id",r).eq("content_type","article");return o&&o.code!=="PGRST116"&&console.error("Error checking like status:",o),a&&console.error("Error counting likes:",a),{isLiked:!!t,likeCount:s||0}}catch(t){return console.error("Error getting user like status:",t),{isLiked:!1,likeCount:0}}}async function I(r,e,t){try{if(t){const{error:o}=await n.from("user_likes").insert({user_id:e,content_id:r,content_type:"article"});if(o){if(o.code==="23505")return{success:!0,alreadyExists:!0};throw o}}else{const{error:o}=await n.from("user_likes").delete().eq("user_id",e).eq("content_id",r).eq("content_type","article");if(o)throw o}return{success:!0}}catch(o){throw console.error("Error toggling article like:",o),o}}async function W(r,e,t){try{if(t){const{error:o}=await n.from("user_bookmarks").insert({user_id:e,article_id:r,folder_name:"default"});if(o){if(o.code==="23505")return{success:!0,alreadyExists:!0};throw o}}else{const{error:o}=await n.from("user_bookmarks").delete().eq("user_id",e).eq("article_id",r);if(o)throw o}return{success:!0}}catch(o){throw console.error("Error toggling bookmark:",o),o}}async function $(r,e,t){try{const{error:o}=await n.from("article_comments").insert({article_id:r,user_id:e,content:t,is_approved:!1});if(o)throw o;return{success:!0}}catch(o){throw console.error("Error adding comment:",o),o}}async function K(r,e,t){try{const{error:o}=await n.from("user_interactions").insert({user_id:e,article_id:r,interaction_type:"share",metadata:{platform:t}});return o&&console.error("Error tracking share, ignoring:",o),{success:!0}}catch(o){return console.error("Error tracking article share:",o),{success:!0}}}async function M(r=10){try{const{data:e,error:t}=await n.from("polls").select(`
        *,
        poll_options:poll_options(*)
      `).eq("is_active",!0).order("created_at",{ascending:!1}).limit(r);if(t)throw t;return e||[]}catch(e){return console.error("Error fetching polls:",e),[]}}async function Q(r,e,t){try{const{data:o}=await n.from("user_interactions").select("id").eq("user_id",t).eq("content_type","poll").eq("content_id",r).single();if(o)return{success:!1,message:"আপনি ইতিমধ্যে এই পোলে ভোট দিয়েছেন"};const{error:s}=await n.from("user_interactions").insert({user_id:t,content_type:"poll",content_id:r,interaction_type:"vote",metadata:{option_id:e}});return s?(console.error("Error voting on poll:",s),{success:!1,message:"ভোট দিতে সমস্যা হয়েছে"}):{success:!0,message:"আপনার ভোট সফলভাবে রেকর্ড করা হয়েছে"}}catch(o){return console.error("Error in voteOnPoll:",o),{success:!1,message:"ভোট দিতে সমস্যা হয়েছে"}}}async function Y(r,e,t,o={}){try{const{error:s}=await n.from("user_feedback").insert({user_id:r,feedback_type:e,content:t,metadata:o,status:"submitted"});if(s)throw s;return{success:!0}}catch(s){throw console.error("Error submitting user feedback:",s),s}}async function j(r,e=5){try{const{data:t,error:o}=await n.from("user_search_history").select("*").eq("user_id",r).order("created_at",{ascending:!1}).limit(e);return o?(console.error("Error fetching search history:",o),[]):t||[]}catch(t){return console.error("Failed to fetch user search history:",t),[]}}async function J(r,e,t){try{const{error:o}=await n.from("user_search_history").insert({user_id:r,search_query:e,search_results_count:t,search_timestamp:new Date().toISOString()});o&&console.error("Error saving search history:",o)}catch(o){console.error("Failed to save search history:",o)}}async function X(r,e,t,o={}){try{const{error:s}=await n.from("user_interactions").insert({user_id:r,content_id:e,content_type:"article",interaction_type:t,metadata:o});s&&console.error("Error recording user interaction:",s)}catch(s){console.error("Failed to record user interaction:",s)}}async function Z(r,e=3){try{const{data:t,error:o}=await n.from("articles").select("category_id").eq("id",r).single();if(o)return console.error("Error fetching current article:",o),[];const{data:s,error:a}=await n.from("articles").select(`
        id,
        title,
        slug,
        excerpt,
        image_url,
        view_count,
        published_at,
        category_id,
        categories(id, name, slug)
      `).eq("category_id",t.category_id).neq("id",r).order("published_at",{ascending:!1}).limit(e);return a?(console.error("Error fetching related articles:",a),[]):s||[]}catch(t){return console.error("Failed to fetch related articles:",t),[]}}async function ee(r,e){try{const{data:t,error:o}=await n.from("user_reading_history").insert({user_id:e,article_id:r,read_at:new Date().toISOString()});return o?(console.error("Error tracking reading history:",o),!1):!0}catch(t){return console.error("Failed to track reading history:",t),!1}}async function re(r,e,t){try{const{error:o}=await n.auth.updateUser({password:t});return o?(console.error("Error updating password:",o),{success:!1,message:"পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে"}):{success:!0,message:"পাসওয়ার্ড সফলভাবে আপডেট হয়েছে"}}catch(o){return console.error("Password update error:",o),{success:!1,message:"পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে"}}}async function te(){try{const{data:{users:r},error:e}=await n.auth.admin.listUsers();return e?(console.error("Error fetching users:",e),[]):r||[]}catch(r){return console.error("Error accessing users:",r),[]}}async function oe(r="all"){try{const{data:e}=await n.auth.admin.listUsers();if(!e)return{totalUsers:0,adminUsers:0,activeUsers:0,newUsers:0};const t=e.length,o=e.filter(i=>{var u;return((u=i.user_metadata)==null?void 0:u.role)==="admin"}).length,s=new Date;s.setDate(s.getDate()-30);const a=e.filter(i=>new Date(i.last_sign_in_at||i.created_at)>s).length,c=new Date;c.setDate(c.getDate()-7);const l=e.filter(i=>new Date(i.created_at)>c).length;return{totalUsers:t,adminUsers:o,activeUsers:a,newUsers:l}}catch(e){return console.error("Error calculating user stats:",e),{totalUsers:0,adminUsers:0,activeUsers:0,newUsers:0}}}async function se(r,e=6){try{const{data:t}=await n.from("user_reading_history").select("article_id").eq("user_id",r).limit(10);let o=[];if(t&&t.length>0){const{data:l}=await n.from("articles").select("category_id").in("id",t.map(i=>i.article_id));l&&(o=[...new Set(l.map(i=>i.category_id))])}let s=n.from("articles").select(`
        *,
        categories(id, name, slug)
      `).order("published_at",{ascending:!1}).limit(e);o.length>0&&(s=s.in("category_id",o));const{data:a,error:c}=await s;return c?(console.error("Error fetching personalized recommendations:",c),g(e)):transformArticleData(a||[])}catch(t){return console.error("Error in getPersonalizedRecommendations:",t),g(e)}}export{$ as addComment,oe as getAdminUserStats,h as getArticleBySlug,V as getArticleComments,D as getArticleTags,y as getArticles,U as getAudioArticles,E as getBreakingNews,_ as getCategories,m as getCategoryBySlug,k as getEPapers,w as getLatestArticles,v as getLatestEPaper,se as getPersonalizedRecommendations,M as getPolls,g as getPopularArticles,Z as getRelatedArticles,S as getSiteSettings,C as getSocialMediaPosts,P as getTrendingTopics,R as getUserBookmarks,G as getUserLikeStatus,N as getUserPreferences,O as getUserReadingHistory,d as getUserSavedArticles,j as getUserSearchHistory,L as getUserStats,te as getUsers,A as getVideoBySlug,q as getVideoContent,p as getWeather,b as getWeatherByCity,x as incrementViewCount,X as recordUserInteraction,H as reportArticle,z as saveArticleForOffline,J as saveUserSearchHistory,F as searchArticles,Y as submitUserFeedback,B as subscribeToNewsletter,I as toggleArticleLike,W as toggleBookmark,K as trackArticleShare,ee as trackReadingHistory,re as updateUserPassword,T as updateUserProfile,Q as voteOnPoll};
