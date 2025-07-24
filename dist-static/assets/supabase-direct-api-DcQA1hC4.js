import{s,o as u,a as o,n as i,b as g}from"./main-Dp9VOJ-r.js";u({id:i(),title:o(),slug:o(),content:o(),excerpt:o().nullable(),image_url:o().nullable(),category_id:i(),author:o(),read_time:i(),is_featured:g(),view_count:i(),published_at:o(),created_at:o(),updated_at:o()});u({id:i(),name:o(),slug:o(),created_at:o(),updated_at:o()});const d={async getAll(e=10,r=0,t,c){try{let a=s.from("articles").select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `).order("published_at",{ascending:!1});c&&(a=a.eq("is_featured",!0)),t&&(a=a.eq("categories.slug",t));const{data:n,error:l}=await a.range(r,r+e-1);if(l)throw l;return n||[]}catch(a){throw console.error("Error fetching articles:",a),a}},async getBySlug(e){try{const{data:r,error:t}=await s.from("articles").select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `).eq("slug",e).single();if(t)throw t;return r}catch(r){throw console.error("Error fetching article by slug:",r),r}},async getPopular(e=5){try{const{data:r,error:t}=await s.from("articles").select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `).order("view_count",{ascending:!1}).limit(e);if(t)throw t;return r||[]}catch(r){throw console.error("Error fetching popular articles:",r),r}},async getLatest(e=10){try{const{data:r,error:t}=await s.from("articles").select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `).order("published_at",{ascending:!1}).limit(e);if(t)throw t;return r||[]}catch(r){throw console.error("Error fetching latest articles:",r),r}},async search(e,r=10,t=0){try{const{data:c,error:a}=await s.from("articles").select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `).or(`title.ilike.%${e}%,content.ilike.%${e}%,excerpt.ilike.%${e}%`).order("published_at",{ascending:!1}).range(t,t+r-1);if(a)throw a;return c||[]}catch(c){throw console.error("Error searching articles:",c),c}},async trackView(e){try{const{data:r,error:t}=await s.rpc("increment_view_count",{article_id:e});if(t){console.error("Error incrementing view count:",t);const{data:c,error:a}=await s.from("articles").select("view_count").eq("id",e).single();if(!a&&c){const{error:n}=await s.from("articles").update({view_count:(c.view_count||0)+1}).eq("id",e);if(!n)return{success:!0,viewCount:(c.view_count||0)+1}}}return{success:!0,viewCount:r||0}}catch(r){return console.error("Error tracking article view:",r),{success:!1,viewCount:0}}}},w={async getAll(){try{const{data:e,error:r}=await s.from("categories").select("*").order("name");if(r)throw r;return e||[]}catch(e){throw console.error("Error fetching categories:",e),e}},async getBySlug(e){try{const{data:r,error:t}=await s.from("categories").select("*").eq("slug",e).single();if(t)throw t;return r}catch(r){throw console.error("Error fetching category by slug:",r),r}}},f={articles:d,categories:w};export{d as articlesAPI,w as categoriesAPI,f as default,f as supabaseDirectAPI};
