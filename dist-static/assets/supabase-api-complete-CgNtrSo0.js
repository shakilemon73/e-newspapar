import{s}from"./main-BUduyGtR.js";async function a(r={}){try{let e=s.from("articles").select(`
        id,
        title,
        slug,
        content,
        excerpt,
        image_url,
        views,
        published_at,
        is_featured,
        categories(id, name, slug)
      `).order("published_at",{ascending:!1});if(r.featured&&(e=e.eq("is_featured",!0)),r.category){const{data:o}=await s.from("categories").select("id").eq("slug",r.category).single();o&&(e=e.eq("category_id",o.id))}r.limit&&(e=e.limit(r.limit)),r.offset&&(e=e.range(r.offset,r.offset+(r.limit||10)-1));const{data:t,error:i}=await e;return i?(console.error("Error fetching articles:",i),[]):(t==null?void 0:t.map(o=>({...o,readTime:5,imageUrl:o.image_url,publishedAt:o.published_at,isFeatured:o.is_featured})))||[]}catch(e){return console.error("Articles API error:",e),[]}}async function n(r=5){try{const{data:e,error:t}=await s.from("articles").select(`
        id,
        title,
        slug,
        excerpt,
        image_url,
        views,
        published_at,
        categories(id, name, slug)
      `).order("views",{ascending:!1}).limit(r);return t?(console.error("Error fetching popular articles:",t),[]):(e==null?void 0:e.map(i=>({...i,readTime:5,imageUrl:i.image_url,publishedAt:i.published_at})))||[]}catch(e){return console.error("Popular articles API error:",e),[]}}async function u(r,e=20,t=0){try{const{data:i,error:o}=await s.from("articles").select(`
        id,
        title,
        slug,
        excerpt,
        image_url,
        views,
        published_at,
        categories(id, name, slug)
      `).or(`title.ilike.%${r}%,content.ilike.%${r}%,excerpt.ilike.%${r}%`).order("published_at",{ascending:!1}).range(t,t+e-1);return o?(console.error("Error searching articles:",o),[]):(i==null?void 0:i.map(l=>({...l,readTime:5,imageUrl:l.image_url,publishedAt:l.published_at})))||[]}catch(i){return console.error("Search articles API error:",i),[]}}async function g(){try{const{data:r,error:e}=await s.from("categories").select("*").order("name");return e?(console.error("Error fetching categories:",e),[]):r||[]}catch(r){return console.error("Categories API error:",r),[]}}async function f(r){try{const{data:e,error:t}=await s.from("categories").select("*").eq("slug",r).single();return t?(console.error("Error fetching category:",t),null):e}catch(e){return console.error("Category by slug API error:",e),null}}export{a as getArticles,g as getCategories,f as getCategoryBySlug,n as getPopularArticles,u as searchArticles};
