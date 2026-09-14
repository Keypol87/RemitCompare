import { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  adCode: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function AdsterraAd({ adCode, width = 728, height = 90, className = '' }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !adCode || adCode === 'TU_BANNER_KEY_AQUI') return;

    // Limpiar contenido anterior
    containerRef.current.innerHTML = '';

    // Crear variable global atOptions
    (window as any).atOptions = {
      'key': adCode,
      'format': 'iframe',
      'height': height,
      'width': width,
      'params': {}
    };

    // Crear script
    const script = document.createElement('script');
    script.src = `https://www.highperformancedformats.com/${adCode}/invoke.js`;
    script.async = true;
    script.type = 'text/javascript';
    script.charset = 'utf-8';

    // Añadir script al contenedor
    containerRef.current.appendChild(script);

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [adCode, width, height]);

  // Si no hay código configurado, mostrar placeholder
  if (!adCode || adCode === 'TU_BANNER_KEY_AQUI') {
    return (
      <div className={`min-h-[${height}px] bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            📢 Espacio publicitario {width}x{height}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Configura tu código de Adsterra en App.tsx
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div 
        ref={containerRef}
        className="flex items-center justify-center overflow-hidden"
        style={{ minHeight: `${height}px` }}
      />
    </div>
  );
}
