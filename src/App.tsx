import { useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { pageContent } from './config/content';
import { theme } from './config/theme';
import { links } from './config/links';
import { seo } from './config/seo';
import { captureAttributionParams } from './utils/attribution';
import { initializeTracking } from './utils/tracking';
import type { PageContent } from './types';

export default function App() {
  // Capture UTM attribution and initialize tracking pixels
  useEffect(() => {
    captureAttributionParams();
    initializeTracking();
  }, []);

  // Set document title from SEO config
  useEffect(() => {
    document.title = seo.title || 'Matriz Low Ticket Base';
  }, []);

  return (
    <LandingPage
      content={pageContent as unknown as PageContent}
      theme={theme}
      links={links}
    />
  );
}
