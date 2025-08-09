import { useEffect } from 'react';

export default function AdSenseScriptLoader() {
  useEffect(() => {
    // Check if AdSense script is already loaded
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      return;
    }

    // Create and load AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3287015775404935';
    script.crossOrigin = 'anonymous';
    
    // Add script to head
    document.head.appendChild(script);

    // Initialize adsbygoogle array if it doesn't exist
    if (typeof window !== 'undefined') {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
    }

    return () => {
      // Cleanup if component unmounts
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
}