import{s as a}from"./main-BUduyGtR.js";async function n(r=10){const{data:e,error:t}=await a.from("articles").select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      view_count,
      published_at,
      is_featured,
      categories(id, name, slug)
    `).order("published_at",{ascending:!1}).limit(r);return t?(console.error("Error fetching latest articles:",t),[]):e||[]}async function o(r=5){const{data:e,error:t}=await a.from("articles").select(`
      id,
      title,
      slug,
      excerpt,
      image_url,
      view_count,
      published_at,
      categories(id, name, slug)
    `).not("view_count","is",null).gte("view_count",1).order("view_count",{ascending:!1}).limit(r);return t?(console.error("Error fetching popular articles:",t),[]):e||[]}async function s(){const{data:r,error:e}=await a.from("breaking_news").select("*").eq("is_active",!0).order("created_at",{ascending:!1}).limit(5);return e?(console.error("Error fetching breaking news:",e),[]):r||[]}async function c(){const{data:r,error:e}=await a.from("epapers").select("*").order("publish_date",{ascending:!1});return e?(console.error("Error fetching e-papers:",e),[]):r||[]}async function l(){const{data:r,error:e}=await a.from("epapers").select("*").eq("is_latest",!0).single();return e?(console.error("Error fetching latest e-paper:",e),null):r}async function u(r=10){const{data:e,error:t}=await a.from("video_content").select("*").order("created_at",{ascending:!1}).limit(r);return t?(console.error("Error fetching videos:",t),[]):e||[]}async function d(r=10){const{data:e,error:t}=await a.from("audio_articles").select("*").order("created_at",{ascending:!1}).limit(r);return t?(console.error("Error fetching audio articles:",t),[]):e||[]}export{d as getAudioArticles,s as getBreakingNews,c as getEPapers,n as getLatestArticles,l as getLatestEPaper,o as getPopularArticles,u as getVideos};
