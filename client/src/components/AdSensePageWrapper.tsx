import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import AdSenseCompliance from './AdSenseCompliance';
import ContentQualityChecker from './ContentQualityChecker';
import { AdFriendlyContentWrapper } from './AdSenseOptimizedLayout';

interface AdSensePageWrapperProps {
  children: ReactNode;
  showComplianceCheck?: boolean;
  contentType?: 'article' | 'category' | 'homepage' | 'other';
  articleContent?: string;
  articleTitle?: string;
  imageUrl?: string;
}

export default function AdSensePageWrapper({
  children,
  showComplianceCheck = false,
  contentType = 'other',
  articleContent = '',
  articleTitle = '',
  imageUrl = ''
}: AdSensePageWrapperProps) {
  const [location] = useLocation();
  
  // Determine content type based on location if not provided
  const determineContentType = (): 'article' | 'category' | 'homepage' | 'other' => {
    if (location === '/') return 'homepage';
    if (location.startsWith('/article/')) return 'article';
    if (location.startsWith('/category/')) return 'category';
    return contentType;
  };

  const currentContentType = determineContentType();

  return (
    <AdFriendlyContentWrapper contentType={currentContentType}>
      {children}
      
      {/* Admin/Developer tools for compliance checking */}
      {showComplianceCheck && (
        <div className="mt-8 space-y-6">
          <AdSenseCompliance />
          
          {(articleContent || articleTitle) && (
            <ContentQualityChecker
              content={articleContent}
              title={articleTitle}
              imageUrl={imageUrl}
            />
          )}
        </div>
      )}
    </AdFriendlyContentWrapper>
  );
}

// Specific wrappers for different page types
export function ArticlePageWrapper({ 
  children, 
  content = '', 
  title = '', 
  imageUrl = '',
  showComplianceCheck = false 
}: { 
  children: ReactNode;
  content?: string;
  title?: string;
  imageUrl?: string;
  showComplianceCheck?: boolean;
}) {
  return (
    <AdSensePageWrapper
      contentType="article"
      articleContent={content}
      articleTitle={title}
      imageUrl={imageUrl}
      showComplianceCheck={showComplianceCheck}
    >
      {children}
    </AdSensePageWrapper>
  );
}

export function CategoryPageWrapper({ 
  children, 
  showComplianceCheck = false 
}: { 
  children: ReactNode;
  showComplianceCheck?: boolean;
}) {
  return (
    <AdSensePageWrapper
      contentType="category"
      showComplianceCheck={showComplianceCheck}
    >
      {children}
    </AdSensePageWrapper>
  );
}

export function HomepageWrapper({ 
  children, 
  showComplianceCheck = false 
}: { 
  children: ReactNode;
  showComplianceCheck?: boolean;
}) {
  return (
    <AdSensePageWrapper
      contentType="homepage"
      showComplianceCheck={showComplianceCheck}
    >
      {children}
    </AdSensePageWrapper>
  );
}