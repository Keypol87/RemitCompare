import { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  adCode: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Componente de anuncios Adsterra
 * Implementación correcta basada en: https://stackoverflow.com/a/75569861
 * 
 * Uso:
 * <AdsterraAd adCode="TU_KEY_AQUI" width={728} height={90} />
 */
export default function AdsterraAd({ adCode, width = 728, height = 90, className = '' }: AdsterraAdProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  const atOptions = {
    key: adCode,
    format: 'iframe',
    height: height,
    width: width,
    params: {},
  };

  useEffect(() => {
    // Verificar que el ref existe y que no hay scripts ya inyectados
    if (bannerRef.current && !bannerRef.current.firstChild) {
      // Si no hay código configurado, no hacer nada
      if (!adCode || adCode === 'TU_BANNER_KEY_AQUI' || adCode === '') {
        return;
      }

      try {
        // Crear script de configuración
        const conf = document.createElement('script');
        conf.type = 'text/javascript';
        conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`;

        // Crear script de invoke
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `//www.highperformancedformats.com/${atOptions.key}/invoke.js`;

        // Añadir ambos scripts al contenedor
        bannerRef.current.append(conf);
        bannerRef.current.append(script);

        console.log('✅ Adsterra banner cargado:', adCode);
      } catch (error) {
        console.error('❌ Error cargando Adsterra:', error);
      }
    }

    // Cleanup
    return () => {
      if (bannerRef.current) {
        bannerRef.current.innerHTML = '';
      }
    };
  }, [adCode, width, height]);

  // Si no hay código configurado, mostrar placeholder
  if (!adCode || adCode === 'TU_BANNER_KEY_AQUI' || adCode === '') {
    return (
      <div 
        className={`min-h-[${height}px] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center ${className}`}
        style={{ minHeight: `${height}px` }}
      >
        <div className="text-center p-4">
          <div className="text-3xl mb-2">📢</div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            Espacio publicitario {width}x{height}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Configura tu código de Adsterra en App.tsx
          </p>
          <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-700 dark:text-amber-400">
            <strong>Instrucciones:</strong><br />
            1. Ve a src/App.tsx<br />
            2. Busca: ADSTERRA_BANNER_KEY<br />
            3. Reemplaza con tu key real
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={bannerRef}
        className="flex items-center justify-center overflow-hidden"
        style={{ minHeight: `${height}px` }}
      />
    </div>
  );
}
