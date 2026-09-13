import type { ReactNode } from "react";
import { basicCatalog, type A2UICatalog, type CatalogRenderContext } from "../catalog/basicCatalog";
import type {
  A2UIActionDefinition,
  A2UIActionInvocation,
  A2UIState,
  A2UISurfaceState,
} from "../types";

export type A2UIRendererProps = {
  surface: A2UISurfaceState;
  catalog?: A2UICatalog;
  disabled?: boolean;
  onDataChange: (surfaceId: string, path: string, value: unknown) => void;
  onAction: (invocation: A2UIActionInvocation) => void;
};

export function A2UIRenderer({
  surface,
  catalog = basicCatalog,
  disabled,
  onDataChange,
  onAction,
}: A2UIRendererProps) {
  const renderComponent = (
    id: string,
    scopePath = "",
    keySuffix = id,
  ): ReactNode => {
    const component = surface.components[id];
    if (!component) {
      return (
        <div key={`missing:${keySuffix}`} className="rounded-xl border border-dashed border-ink/15 p-3 text-xs text-ink/40">
          Esperando componente: {id}
        </div>
      );
    }

    const Renderer = catalog[component.component];
    if (!Renderer) {
      return (
        <div key={`unknown:${keySuffix}`} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Componente A2UI no soportado: {component.component}
        </div>
      );
    }

    const ctx: CatalogRenderContext = {
      surface,
      disabled,
      renderComponent,
      updateData: (path, value) => onDataChange(surface.surfaceId, path, value),
      invokeAction: (
        sourceComponentId: string,
        action: A2UIActionDefinition,
        actionScopePath?: string,
      ) =>
        onAction({
          surfaceId: surface.surfaceId,
          sourceComponentId,
          action,
          scopePath: actionScopePath,
        }),
    };

    return (
      <div key={`${keySuffix}:${scopePath}`} data-a2ui-component-id={component.id} className="contents">
        <Renderer component={component} scopePath={scopePath} ctx={ctx} />
      </div>
    );
  };

  return (
    <section
      data-a2ui-surface-id={surface.surfaceId}
      data-a2ui-catalog-id={surface.catalogId}
      className="w-full"
    >
      {surface.theme?.agentDisplayName && (
        <div className="mb-3 flex items-center gap-2 text-xs text-ink/45">
          {surface.theme.iconUrl && (
            <img src={surface.theme.iconUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
          )}
          <span>{surface.theme.agentDisplayName}</span>
        </div>
      )}

      {surface.components.root ? (
        renderComponent("root")
      ) : (
        <div className="animate-pulse rounded-3xl border border-ink/10 bg-white/40 p-6 text-sm text-ink/45">
          Preparando interfaz…
        </div>
      )}
    </section>
  );
}

export function A2UISurfaceList({
  state,
  disabled,
  onDataChange,
  onAction,
}: {
  state: A2UIState;
  disabled?: boolean;
  onDataChange: (surfaceId: string, path: string, value: unknown) => void;
  onAction: (invocation: A2UIActionInvocation) => void;
}) {
  return (
    <div className="space-y-5">
      {state.order.map((surfaceId) => {
        const surface = state.surfaces[surfaceId];
        if (!surface) return null;
        return (
          <A2UIRenderer
            key={surfaceId}
            surface={surface}
            disabled={disabled}
            onDataChange={onDataChange}
            onAction={onAction}
          />
        );
      })}
    </div>
  );
}

export default A2UIRenderer;
