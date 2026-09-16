export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4';

export interface MediaItem {
  src: string;
  alt: string;
  label: string;
  ratio: AspectRatio;
}

export interface ProductItem extends MediaItem {
  eyebrow: string;
  title: string;
  description: string;
}

export interface BonusItem extends ProductItem {
  value: string;
}

export interface FeatureItemObject {
  label: string;
  value?: string;
}

export type FeatureItem = string | FeatureItemObject;

export interface PricingData {
  previousPrice?: string;
  previousPriceLabel?: string;
  installmentCount?: number;
  installmentValue?: string;
  cashValue: string;
  paymentType?: string;
}

export interface SimpleOffer extends PricingData {
  title: string;
  items: string[];
  ctaLabel: string;
}

export interface CompleteOffer extends PricingData {
  badge: string;
  title: string;
  items: FeatureItem[];
  ctaLabel: string;
}

export interface PopupOffer extends PricingData {
  eyebrow: string;
  message: string;
  title: string;
  ctaLabel: string;
  secondaryLabel: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PageContent {
  urgencyBar: {
    enabled: boolean;
    text: string;
  };
  hero: {
    image: string;
    imageAlt: string;
    headline: string;
    body: string;
    ctaLabel: string;
    securityImage: string;
    securityImageAlt: string;
  };
  results: {
    title: string;
    items: MediaItem[];
  };
  modulesSection: {
    title: string;
    subtitle?: string;
  };
  modulesCarousel?: MediaItem[];
  modules: ProductItem[];
  bonusesSection: {
    title: string;
    subtitle?: string;
  };
  bonuses: BonusItem[];
  offersSection: {
    title: string;
    paymentSecurityImage: string;
    paymentSecurityAlt: string;
  };
  offers: {
    simple: SimpleOffer;
    complete: CompleteOffer;
    popup: PopupOffer;
  };
  guarantee: {
    image: string;
    imageAlt: string;
    days: number;
    title: string;
    body: string;
  };
  faqSection: {
    title: string;
  };
  faq: FaqItem[];
  footer: {
    brand: string;
    copyright: string;
  };
}

export interface ThemeConfig {
  brand: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
  };
  cta: {
    color: string;
    dark: string;
    light: string;
  };
}

export interface LinksConfig {
  checkoutSimple: string;
  checkoutComplete: string;
  checkoutUpgrade: string;
  privacy: string;
  terms: string;
  support: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robots: string;
}

export interface TrackingConfig {
  metaPixelId: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  tiktokPixelId: string;
}
