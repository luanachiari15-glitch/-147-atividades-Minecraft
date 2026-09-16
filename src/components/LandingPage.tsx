import { useEffect, useRef, useState } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import type { FeatureItem, MediaItem, PageContent, ThemeConfig, LinksConfig } from '../types';
import { withAttributionParams } from '../utils/attribution';

interface LandingPageProps {
  content: PageContent;
  theme: ThemeConfig;
  links: LinksConfig;
}

const placeholder = (
  item: MediaItem,
  priority = false,
  fit: 'cover' | 'contain' = 'cover',
) =>
  item.src ? (
    <img
      src={item.src}
      alt={item.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={`w-full h-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
    />
  ) : (
    <div className="placeholder" role="img" aria-label={item.alt}>
      <span className="font-bold">{item.label}</span>
      <small className="opacity-75">
        {item.ratio === '3:2'
          ? '1200 × 800'
          : item.ratio === '3:4'
          ? '1200 × 1600'
          : item.ratio === '2:3'
          ? '1200 × 1800'
          : '1200 × 1200'}{' '}
        • {item.ratio}
      </small>
    </div>
  );

function Button({
  children,
  onClick,
  href,
  kind = 'primary',
  id,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  kind?: 'primary' | 'secondary';
  id?: string;
}) {
  const className = `button button-${kind}`;
  return href ? (
    <a id={id} className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <button id={id} className={className} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function UrgencyBar({ content }: { content: PageContent['urgencyBar'] }) {
  const formatDate = () =>
    new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

  const [localDate, setLocalDate] = useState(formatDate);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNextDay = () => {
      const now = new Date();
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(() => {
        setLocalDate(formatDate());
        scheduleNextDay();
      }, nextDay.getTime() - now.getTime() + 100);
    };
    scheduleNextDay();
    return () => clearTimeout(timer);
  }, []);

  if (!content.enabled) return null;

  const barText = content.text.includes('{data}')
    ? content.text.replace('{data}', localDate)
    : `Válido só hoje dia ${localDate}`;

  return (
    <div className="urgency" id="urgency-bar">
      {barText}
    </div>
  );
}

function Price({
  data,
}: {
  data: {
    previousPrice?: string;
    previousPriceLabel?: string;
    installmentCount?: number;
    installmentValue?: string;
    cashValue: string;
    paymentType?: string;
  };
}) {
  const hasPrevious = Boolean(data.previousPrice);
  return (
    <div className="price" aria-label="Preço da oferta">
      {hasPrevious && (
        <span className="price-before">
          {data.previousPriceLabel ? `${data.previousPriceLabel} ` : 'De '}
          <s>{data.previousPrice}</s>
        </span>
      )}
      <strong>
        {hasPrevious ? `HOJE, TUDO POR ${data.cashValue}` : data.cashValue}
      </strong>
      <span>
        {data.paymentType ||
          (data.installmentCount && data.installmentCount > 1 && data.installmentValue
            ? `ou ${data.installmentCount}x de ${data.installmentValue}`
            : 'Pagamento único')}
      </span>
    </div>
  );
}

function Carousel({
  items: originalItems,
  ariaLabel = 'Galeria de resultados',
  cardClass = 'result-card',
}: {
  items: MediaItem[];
  ariaLabel?: string;
  cardClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const items = [...originalItems, ...originalItems, ...originalItems];
  const segmentWidth = () => (ref.current?.scrollWidth ?? 0) / 3;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const initialize = () => element.scrollTo({ left: segmentWidth() });
    initialize();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let previousTime = performance.now();
    let isPaused = false;

    const onPause = () => {
      isPaused = true;
    };
    const onResume = () => {
      isPaused = false;
      previousTime = performance.now();
    };

    const animate = (time: number) => {
      const segment = segmentWidth();
      if (segment && !isPaused) {
        element.scrollLeft += ((time - previousTime) / 1000) * 75;
        if (element.scrollLeft >= segment * 2) element.scrollLeft -= segment;
        if (element.scrollLeft <= 0) element.scrollLeft += segment;
      }
      previousTime = time;
      frame = window.requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(initialize);
    observer.observe(element);
    if (!reduceMotion) frame = window.requestAnimationFrame(animate);
    window.addEventListener('resize', initialize);
    element.addEventListener('mouseenter', onPause);
    element.addEventListener('mouseleave', onResume);
    element.addEventListener('touchstart', onPause, { passive: true });
    element.addEventListener('touchend', onResume, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', initialize);
      element.removeEventListener('mouseenter', onPause);
      element.removeEventListener('mouseleave', onResume);
      element.removeEventListener('touchstart', onPause);
      element.removeEventListener('touchend', onResume);
    };
  }, [originalItems]);

  return (
    <div className="carousel-wrap">
      <div className="carousel" ref={ref} aria-label={ariaLabel}>
        {items.map((item, index) => (
          <article
            className={cardClass}
            aria-hidden={index < originalItems.length || index >= originalItems.length * 2}
            key={`${item.alt}-${index}`}
          >
            {placeholder(item)}
          </article>
        ))}
      </div>
    </div>
  );
}

function Modules({ modules }: { modules: PageContent['modules'] }) {
  const [open, setOpen] = useState<number[]>([]);
  const toggle = (index: number) =>
    setOpen((old) =>
      old.includes(index) ? old.filter((item) => item !== index) : [...old, index],
    );

  return (
    <div className="card-grid">
      {modules.map((item, index) => {
        const expanded = open.includes(index);
        return (
          <article className="content-card" key={`${item.eyebrow}-${index}`} id={`module-card-${index}`}>
            <div className="square-media">{placeholder(item)}</div>
            <span className="eyebrow">{item.eyebrow}</span>
            <h3>{item.title}</h3>
            <button
              className="accordion-trigger"
              onClick={() => toggle(index)}
              aria-expanded={expanded}
              aria-controls={`module-${index}`}
            >
              <span>{expanded ? 'Ocultar o que tem dentro' : '[CLIQUE PARA VER O QUE TEM DENTRO +]'}</span>
              {expanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
            <div className="accordion-panel" id={`module-${index}`} hidden={!expanded}>
              <p className="whitespace-pre-line">{item.description}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

const FeatureList = ({ items }: { items: readonly FeatureItem[] }) => (
  <ul className="feature-list">
    {items.map((item, idx) => {
      const label = typeof item === 'string' ? item : item.label;
      const value = typeof item === 'string' ? '' : item.value;
      return (
        <li key={`${label}-${idx}`}>
          <Check aria-hidden="true" className="w-5 h-5 text-current flex-shrink-0" />
          <span>
            {label}
            {value && (
              <>
                {': '}
                <span className={value.includes('GRÁTIS') ? 'font-bold text-[var(--green-mc)]' : 'bonus-value'}>{value}</span>
              </>
            )}
          </span>
        </li>
      );
    })}
  </ul>
);

function UpgradeModal({
  open,
  onClose,
  offers,
  links,
}: {
  open: boolean;
  onClose: () => void;
  offers: PageContent['offers'];
  links: LinksConfig;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();

    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialog.current) {
        const focusable = [...dialog.current.querySelectorAll<HTMLElement>('button,a[href]')];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', keydown);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="modal"
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        id="upgrade-modal-dialog"
      >
        <button
          ref={closeButton}
          className="close"
          onClick={onClose}
          aria-label="Fechar modal"
          id="close-upgrade-modal"
        >
          <X className="w-5 h-5" />
        </button>
        {offers.popup.eyebrow ? <span className="eyebrow">{offers.popup.eyebrow}</span> : null}
        {offers.popup.message ? <p className="mt-2 text-[var(--text-muted)]">{offers.popup.message}</p> : null}
        <h2 id="modal-title" className="modal-title">
          {offers.popup.title}
        </h2>
        <FeatureList items={offers.complete.items} />
        <Price data={offers.popup} />
        <div className="modal-actions">
          <Button
            id="btn-upgrade-modal-cta"
            href={links.checkoutUpgrade ? withAttributionParams(links.checkoutUpgrade) : undefined}
            onClick={() => {
              if (!links.checkoutUpgrade) {
                alert('Link de checkout de upgrade configurado via links.checkoutUpgrade.');
              }
            }}
          >
            {offers.popup.ctaLabel}
          </Button>
          <Button
            id="btn-upgrade-modal-secondary"
            kind="secondary"
            onClick={() => {
              onClose();
              if (links.checkoutSimple) {
                window.open(withAttributionParams(links.checkoutSimple), '_blank');
              }
            }}
          >
            {offers.popup.secondaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function renderHeroHeadline(headline: string) {
  const target = '+147 ATIVIDADES ESCOLARES COM MINECRAFT';
  if (headline.includes(target)) {
    const parts = headline.split(target);
    return (
      <>
        {parts[0]}
        <span className="hero-highlight">{target}</span>
        {parts.slice(1).join(target)}
      </>
    );
  }
  return headline;
}

export function LandingPage({ content, theme, links }: LandingPageProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  useEffect(() => {
    // Apply CSS variables
    const vars: Record<string, string> = {
      '--brand-primary': theme.brand.primary,
      '--brand-primary-dark': theme.brand.primaryDark,
      '--brand-primary-light': theme.brand.primaryLight,
      '--cta-color': theme.cta.color,
      '--cta-dark': theme.cta.dark,
      '--cta-light': theme.cta.light,
    };
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--background-page)] text-[var(--text-body)] selection:bg-[#2389C4] selection:text-white">
      <UrgencyBar content={content.urgencyBar} />

      <main>
        {/* HERO SECTION */}
        <section className="hero" id="hero-section">
          <div className="container hero-inner">
            <div className="hero-media">
              {placeholder(
                {
                  src: content.hero.image,
                  alt: content.hero.imageAlt,
                  label: content.hero.imageAlt || 'Imagem de Destaque da Oferta',
                  ratio: '3:2',
                },
                true,
                'contain',
              )}
            </div>
            <h1 id="hero-headline">{renderHeroHeadline(content.hero.headline)}</h1>
            <p className="lead" id="hero-subheadline">
              {content.hero.body}
            </p>
            <div className="hero-action">
              <Button
                id="hero-cta-btn"
                onClick={() =>
                  document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                {content.hero.ctaLabel}
              </Button>
              {content.hero.securityImage && (
                <img
                  src={content.hero.securityImage}
                  alt={content.hero.securityImageAlt}
                  className="w-full h-auto mt-3"
                  loading="eager"
                />
              )}
            </div>
          </div>
        </section>

        {/* RESULTS / CAROUSEL SECTION */}
        <section className="section section-muted" id="results-section">
          <div className="container">
            <h2>{content.results.title}</h2>
            <Carousel items={content.results.items} />
          </div>
        </section>

        {/* MODULES SECTION */}
        <section className="section" id="modules-section">
          <div className="container">
            <h2>{content.modulesSection.title}</h2>
            {content.modulesSection.subtitle && (
              <p className="lead max-w-3xl mx-auto -mt-6 mb-12 text-center">
                {content.modulesSection.subtitle}
              </p>
            )}
            <Carousel
              items={content.modulesCarousel ?? content.modules}
              ariaLabel="Amostra de atividades do caderno"
              cardClass="activity-card"
            />
          </div>
        </section>

        {/* BONUSES SECTION */}
        <section className="section section-muted" id="bonuses-section">
          <div className="container">
            <h2>{content.bonusesSection.title}</h2>
            {content.bonusesSection.subtitle && (
              <p className="lead max-w-3xl mx-auto -mt-6 mb-12 text-center">
                {content.bonusesSection.subtitle}
              </p>
            )}
            <div className="card-grid">
              {content.bonuses.map((item, index) => (
                <article className="content-card bonus" key={`${item.eyebrow}-${index}`} id={`bonus-card-${index}`}>
                  <div className="square-media">{placeholder(item)}</div>
                  <span className="eyebrow">{item.eyebrow}</span>
                  <h3>{item.title}</h3>
                  <p className="whitespace-pre-line">{item.description}</p>
                  {item.value && (
                    <span
                      className={`block mt-3 font-bold ${
                        item.value.includes('GRÁTIS') ? 'text-[var(--green-mc)]' : 'text-[var(--text-title)]'
                      }`}
                    >
                      {item.value.startsWith('R$') ? `Valor individual: ${item.value}` : item.value}
                    </span>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* OFFERS SECTION */}
        <section className="section" id="ofertas">
          <div className="container">
            <h2>{content.offersSection.title}</h2>
            <div className="offers">
              {/* OFERTA SIMPLES */}
              <article className="offer-card" id="offer-card-simple">
                <h3>{content.offers.simple.title}</h3>
                <FeatureList items={content.offers.simple.items} />
                <Price data={content.offers.simple} />
                <div className="offer-action">
                  <Button
                    id="btn-simple-offer"
                    kind="secondary"
                    onClick={() => setModalOpen(true)}
                  >
                    {content.offers.simple.ctaLabel}
                  </Button>
                  {content.offersSection.paymentSecurityImage && (
                    <img
                      src={content.offersSection.paymentSecurityImage}
                      alt={content.offersSection.paymentSecurityAlt}
                      loading="lazy"
                    />
                  )}
                </div>
              </article>

              {/* OFERTA COMPLETA */}
              <article className="offer-card featured" id="offer-card-complete">
                {content.offers.complete.badge && (
                  <span className="offer-badge">{content.offers.complete.badge}</span>
                )}
                <h3>{content.offers.complete.title}</h3>
                <FeatureList items={content.offers.complete.items} />
                <Price data={content.offers.complete} />
                <div className="offer-action">
                  <Button
                    id="btn-complete-offer"
                    href={
                      links.checkoutComplete
                        ? withAttributionParams(links.checkoutComplete)
                        : undefined
                    }
                    onClick={() => {
                      if (!links.checkoutComplete) {
                        alert('Link do checkout configurado no menu Editar > Links.');
                      }
                    }}
                  >
                    {content.offers.complete.ctaLabel}
                  </Button>
                  {content.offersSection.paymentSecurityImage && (
                    <img
                      src={content.offersSection.paymentSecurityImage}
                      alt={content.offersSection.paymentSecurityAlt}
                      loading="lazy"
                    />
                  )}
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* GUARANTEE SECTION */}
        <section className="section section-muted" id="guarantee-section">
          <div className="container guarantee">
            {content.guarantee.image && (
              <img
                className="guarantee-seal"
                src={content.guarantee.image}
                alt={content.guarantee.imageAlt}
                loading="lazy"
              />
            )}
            <div className="mt-8">
              <h2>{content.guarantee.title}</h2>
              <p>{content.guarantee.body}</p>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="section" id="faq-section">
          <div className="container narrow">
            <h2>{content.faqSection.title}</h2>
            <div className="faq">
              {content.faq.map((item, index) => {
                const expanded = faqOpen === index;
                return (
                  <div className="faq-item" key={`${item.question}-${index}`}>
                    <button
                      id={`faq-toggle-${index}`}
                      onClick={() => setFaqOpen(expanded ? null : index)}
                      aria-expanded={expanded}
                      aria-controls={`faq-${index}`}
                    >
                      <span>{item.question}</span>
                      {expanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                    <div id={`faq-${index}`} hidden={!expanded}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="page-footer">
        <div className="container">
          <strong>{content.footer.brand}</strong>
          <p>{content.footer.copyright}</p>
          <nav aria-label="Links legais">
            {links.privacy ? (
              <a href={links.privacy} target="_blank" rel="noopener noreferrer">
                Privacidade
              </a>
            ) : (
              <span className="text-[#8BB0C4] text-sm">Política de Privacidade</span>
            )}
            {links.terms ? (
              <a href={links.terms} target="_blank" rel="noopener noreferrer">
                Termos de Uso
              </a>
            ) : (
              <span className="text-[#8BB0C4] text-sm">Termos</span>
            )}
            {links.support ? (
              <a href={links.support} target="_blank" rel="noopener noreferrer">
                Suporte
              </a>
            ) : (
              <span className="text-[#8BB0C4] text-sm">Suporte</span>
            )}
          </nav>
        </div>
      </footer>

      {/* UPGRADE MODAL */}
      <UpgradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        offers={content.offers}
        links={links}
      />
    </div>
  );
}
