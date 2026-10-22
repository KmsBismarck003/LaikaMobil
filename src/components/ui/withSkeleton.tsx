import React from 'react';

export interface SkeletonState {
  loading: boolean;
  hasData: boolean;
}

/**
 * HOC que centraliza el estado de carga estilo skeleton (réplica web).
 * La pantalla envuelta solo declara:
 *  - Componente de contenido
 *  - Componente skeleton
 *  - Hook que expone { loading, hasData, ...datos }
 * Si está cargando y no hay datos (ni caché), pinta el skeleton;
 * en cualquier otro caso pinta el contenido.
 */
export function withSkeleton<P extends object>(
  ContentComponent: React.ComponentType<P>,
  SkeletonComponent: React.ComponentType<P>,
  useSkeletonState: () => SkeletonState & P
): React.FC<P> {
  const Wrapped: React.FC<P> = (ownProps) => {
    const state = useSkeletonState();
    const mergedProps = { ...ownProps, ...state } as P;
    if (state.loading && !state.hasData) {
      return <SkeletonComponent {...mergedProps} />;
    }
    return <ContentComponent {...mergedProps} />;
  };
  return Wrapped;
}
