import { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  adCode: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Componente de anuncios Adsterra - Versión Simplificada
 * Usa el código HTML directo sin inyección dinámica
 */
export default function AdsterraAd({ adCode, width = 728, height = 90, className = '' }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Forzar que todos los enlaces se abran en nueva pestaña
    const forceNewTab = () => {
      if (!containerRef.current) return;
      
      const links = containerRef.current.querySelectorAll('a');
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    };

    // Ejecutar inmediatamente y también después de un delay
    forceNewTab();
    const interval = setInterval(forceNewTab, 1000);

    return () => clearInterval(interval);
  }, [adCode]);

  // Si no hay código configurado, mostrar placeholder
  if (!adCode || adCode === ADSTERRA_BANNER_KEY || adCode === '') {
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

  // Código HTML directo de Adsterra
  const adHtml = `
    <script type="text/javascript">
      atOptions = {
        'key' : '${adCode}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://www.highperformancedformats.com/${adCode}/invoke.js"></script>
  `;

  return (
    <div className={className} style={{ width: '100%', maxWidth: `${width}px`, margin: '0 auto' }}>
      <div 
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: adHtml }}
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
