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

  useEffect(() => {
    // Verificar que el ref existe y que no hay scripts ya inyectados
    if (bannerRef.current && !bannerRef.current.firstChild) {
      // Si no hay código configurado, no hacer nada
      if (!adCode || adCode === 'TU_BANNER_KEY_AQUI' || adCode === '') {
        return;
      }

      try {
        // Definir configuración de Adsterra
        const atOptions = {
          key: adCode,
          format: 'iframe',
          height: height,
          width: width,
          params: {},
        };

        // Establecer la variable global atOptions
        (window as any).atOptions = atOptions;

        // Crear script de invoke
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://www.highperformancedformats.com/${atOptions.key}/invoke.js`;
        script.async = true;

        // Manejar errores de carga del script
        script.onerror = () => {
          console.error('❌ Error cargando script de Adsterra');
        };

        script.onload = () => {
          console.log('✅ Adsterra banner cargado:', adCode);
        };

        // Añadir script al contenedor
        bannerRef.current.appendChild(script);

      } catch (error) {
        console.error('❌ Error cargando Adsterra:', error);
      }
    }

    // Cleanup
    return () => {
      if (bannerRef.current) {
        bannerRef.current.innerHTML = '';
      }
      // Limpiar variable global
      if ((window as any).atOptions) {
        delete (window as any).atOptions;
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
    
          atOptions = {
           'key' : 'c9ce55fa7fb1042d512cd43b70a31287',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
             'params' : {}
             };

           <script src="https://www.highrevenueformat.com/c9ce55fa7fb1042d512cd43b70a31287/invoke.js"></script>
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
