export const A2UI_VERSION = "v0.9.1" as const;
export const BASIC_CATALOG_ID =
  "https://a2ui.org/specification/v0_9_1/catalogs/basic/catalog.json";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type DataBinding = { path: string };
export type FunctionCall = {
  call: string;
  args?: Record<string, unknown>;
  returnType?: string;
};

export type DynamicValue<T = unknown> = T | DataBinding | FunctionCall;
export type ChildList = string[] | { componentId: string; path: string };

export type A2UITheme = {
  primaryColor?: string;
  iconUrl?: string;
  agentDisplayName?: string;
  [key: string]: unknown;
};

export type A2UIAccessibility = {
  label?: DynamicValue<string>;
  role?: string;
  [key: string]: unknown;
};

export type A2UIEventDefinition = {
  name: string;
  context?: Record<string, unknown>;
};

export type A2UIActionDefinition = {
  event?: A2UIEventDefinition;
  functionCall?: FunctionCall;
};

export type A2UICheck = {
  call?: string;
  args?: Record<string, unknown>;
  condition?: FunctionCall;
  message: string;
};

/**
 * A2UI components are catalog-driven. We keep the wire type open so this
 * renderer can safely receive unknown/custom catalog components and show a
 * fallback instead of crashing.
 */
export type A2UIComponent = {
  id: string;
  component: string;
  accessibility?: A2UIAccessibility;
  weight?: number;
  checks?: A2UICheck[];
  [key: string]: unknown;
};

export type CreateSurfaceMessage = {
  version: typeof A2UI_VERSION;
  createSurface: {
    surfaceId: string;
    catalogId: string;
    theme?: A2UITheme;
    sendDataModel?: boolean;
  };
};

export type UpdateComponentsMessage = {
  version: typeof A2UI_VERSION;
  updateComponents: {
    surfaceId: string;
    components: A2UIComponent[];
  };
};

export type UpdateDataModelMessage = {
  version: typeof A2UI_VERSION;
  updateDataModel: {
    surfaceId: string;
    path?: string;
    value?: unknown;
  };
};

export type DeleteSurfaceMessage = {
  version: typeof A2UI_VERSION;
  deleteSurface: {
    surfaceId: string;
  };
};

export type A2UIServerMessage =
  | CreateSurfaceMessage
  | UpdateComponentsMessage
  | UpdateDataModelMessage
  | DeleteSurfaceMessage;

export type A2UIClientActionMessage = {
  version: typeof A2UI_VERSION;
  action: {
    name: string;
    surfaceId: string;
    sourceComponentId: string;
    timestamp: string;
    context: Record<string, unknown>;
  };
};

export type A2UIClientCapabilities = {
  "v0.9": {
    supportedCatalogIds: string[];
  };
};

export type A2UIClientDataModel = {
  surfaces: Record<string, unknown>;
};

export type A2UITransportMetadata = {
  a2uiClientCapabilities: A2UIClientCapabilities;
  a2uiClientDataModel?: A2UIClientDataModel;
};

export type A2UISurfaceState = {
  surfaceId: string;
  catalogId: string;
  theme?: A2UITheme;
  sendDataModel: boolean;
  components: Record<string, A2UIComponent>;
  dataModel: unknown;
};

export type A2UIState = {
  surfaces: Record<string, A2UISurfaceState>;
  order: string[];
};

export type A2UIActionInvocation = {
  surfaceId: string;
  sourceComponentId: string;
  action: A2UIActionDefinition;
  scopePath?: string;
};

export type A2UIValidationError = {
  code: "VALIDATION_FAILED";
  surfaceId: string;
  path: string;
  message: string;
};
