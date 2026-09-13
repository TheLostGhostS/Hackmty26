import {
  A2UI_VERSION,
  BASIC_CATALOG_ID,
  type A2UIServerMessage,
  type A2UIState,
  type A2UIValidationError,
} from "../types";

export function validateServerMessage(
  input: unknown,
  state: A2UIState,
  supportedCatalogIds = [BASIC_CATALOG_ID],
): { ok: true; message: A2UIServerMessage } | { ok: false; error: A2UIValidationError } {
  const fail = (surfaceId: string, path: string, message: string) => ({
    ok: false as const,
    error: {
      code: "VALIDATION_FAILED" as const,
      surfaceId,
      path,
      message,
    },
  });

  if (typeof input !== "object" || input === null) {
    return fail("unknown", "/", "A2UI message must be a JSON object.");
  }

  const value = input as Record<string, unknown>;
  if (value.version !== A2UI_VERSION) {
    return fail(
      "unknown",
      "/version",
      `Expected ${A2UI_VERSION}, received ${String(value.version)}.`,
    );
  }

  const envelopeKeys = [
    "createSurface",
    "updateComponents",
    "updateDataModel",
    "deleteSurface",
  ].filter((key) => key in value);

  if (envelopeKeys.length !== 1) {
    return fail("unknown", "/", "A2UI envelope must contain exactly one message type.");
  }

  if ("createSurface" in value) {
    const create = value.createSurface as Record<string, unknown>;
    const surfaceId = String(create?.surfaceId ?? "unknown");
    if (!create || typeof create.surfaceId !== "string" || typeof create.catalogId !== "string") {
      return fail(surfaceId, "/createSurface", "createSurface requires surfaceId and catalogId.");
    }
    if (state.surfaces[create.surfaceId]) {
      return fail(surfaceId, "/createSurface/surfaceId", "Surface already exists.");
    }
    if (!supportedCatalogIds.includes(create.catalogId)) {
      return fail(surfaceId, "/createSurface/catalogId", `Unsupported catalog: ${create.catalogId}`);
    }
    return { ok: true, message: input as A2UIServerMessage };
  }

  const payload = value[envelopeKeys[0]] as Record<string, unknown>;
  const surfaceId = String(payload?.surfaceId ?? "unknown");
  if (!payload || typeof payload.surfaceId !== "string") {
    return fail(surfaceId, `/${envelopeKeys[0]}/surfaceId`, "surfaceId is required.");
  }
  if (!state.surfaces[payload.surfaceId]) {
    return fail(surfaceId, `/${envelopeKeys[0]}/surfaceId`, "Surface must be created before it can be updated.");
  }

  if ("updateComponents" in value) {
    if (!Array.isArray(payload.components) || payload.components.length === 0) {
      return fail(surfaceId, "/updateComponents/components", "components must be a non-empty array.");
    }

    const ids = new Set<string>();
    for (let i = 0; i < payload.components.length; i += 1) {
      const component = payload.components[i] as Record<string, unknown>;
      if (!component || typeof component.id !== "string" || typeof component.component !== "string") {
        return fail(surfaceId, `/updateComponents/components/${i}`, "Each component requires id and component.");
      }
      if (ids.has(component.id)) {
        return fail(surfaceId, `/updateComponents/components/${i}/id`, "Duplicate component id in update.");
      }
      ids.add(component.id);
    }
  }

  return { ok: true, message: input as A2UIServerMessage };
}
