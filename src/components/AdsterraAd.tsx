import { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  adCode: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Componente de anuncios Adsterra - Versión Corregida
 *
 * ERROR CORREGIDO: antes el código de Adsterra se inyectaba con
 * dangerouslySetInnerHTML (innerHTML). Los navegadores NO ejecutan
 * las etiquetas <script> insertadas vía innerHTML, por lo que el
 * script invoke.js de Adsterra nunca se cargaba y el anuncio no aparecía.
 *
 * SOLUCIÓN: crear el <script> con document.createElement dentro de
 * useEffect, asignando window.atOptions ANTES de cargar invoke.js.
 */
export default function AdsterraAd({ adCode, width = 728, height = 90, className = '' }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isKeyConfigured = Boolean(adCode) && adCode !== 'TU_BANNER_KEY_AQUI' && adCode.trim() !== '';

  useEffect(() => {
    if (!isKeyConfigured || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    // 1. window.atOptions DEBE existir antes de que invoke.js se ejecute
    (window as any).atOptions = {
      'key': adCode,
      'format': 'iframe',
      'height': height,
      'width': width,
      'params': {},
    };

    // 2. Inyectar el script vía DOM (así SÍ se ejecuta)
    const script = document.createElement('script');
    script.src = `https://www.highperformancedformats.com/${adCode}/invoke.js`;
    script.async = true;
    container.appendChild(script);

    // 3. Forzar que los enlaces se abran en nueva pestaña
    //    (solo aplica a enlaces directos; los del iframe de Adsterra son cross-origin)
    const forceNewTab = () => {
      const links = container.querySelectorAll('a');
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    };
    forceNewTab();
    const interval = setInterval(forceNewTab, 1000);

    return () => {
      clearInterval(interval);
      container.innerHTML = '';
      delete (window as any).atOptions;
    };
  }, [isKeyConfigured, adCode, width, height]);

  // Si no hay código configurado, mostrar placeholder
  if (!isKeyConfigured) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center ${className}`}
        style={{ minHeight: `${height}px`, width: '100%', maxWidth: `${width}px`, margin: '0 auto' }}
      >
        <div className="text-center p-4">
          <div className="text-3xl mb-2">📢</div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            Espacio publicitario {width}x{height}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Configura tu código de Adsterra en App.tsx
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', maxWidth: `${width}px`, margin: '0 auto' }}>
      {/* El contenedor debe existir en el DOM ANTES de inyectar el script */}
      <div
        ref={containerRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          margin: '0 auto',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}
