/**
 * Script global para forzar que todos los enlaces de anuncios
 * se abran en nueva pestaña y no interrumpan la navegación
 */

export function initAdLinksHandler() {
  // Función para forzar target="_blank" en enlaces de anuncios
  const forceAdLinksNewTab = () => {
    // Selectores comunes de anuncios
    const adSelectors = [
      'a[href*="highperformancedformats.com"]',
      'a[href*="adsterra"]',
      'a[href*="profitablecreativeformat"]',
      'a[href*="effectivecreativeformat"]',
      'iframe[src*="highperformancedformats.com"]',
      'iframe[src*="adsterra"]',
    ];

    adSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.tagName === 'A') {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
      });
    });
  };

  // Ejecutar inmediatamente
  forceAdLinksNewTab();

  // Ejecutar periódicamente para capturar enlaces dinámicos
  setInterval(forceAdLinksNewTab, 2000);

  // También usar MutationObserver para detectar cambios en el DOM
  const observer = new MutationObserver(() => {
    forceAdLinksNewTab();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Interceptar clicks en enlaces de anuncios
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link) {
      const href = link.getAttribute('href') || '';
      
      // Si es un enlace de anuncio, forzar nueva pestaña
      if (
        href.includes('highperformancedformats.com') ||
        href.includes('adsterra') ||
        href.includes('profitablecreativeformat') ||
        href.includes('effectivecreativeformat')
      ) {
        e.preventDefault();
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    }
  }, true);

  console.log('✅ Ad links handler initialized');
}

// Auto-inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdLinksHandler);
  } else {
    initAdLinksHandler();
  }
}
