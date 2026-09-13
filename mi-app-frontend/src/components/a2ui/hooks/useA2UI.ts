import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  A2UI_VERSION,
  BASIC_CATALOG_ID,
  type A2UIActionInvocation,
  type A2UIClientActionMessage,
  type A2UIState,
  type A2UITransportMetadata,
} from "../types";
import { resolveDeep } from "../protocol/functions";
import { a2uiReducer, applyA2UIMessage, initialA2UIState } from "../protocol/reducer";
import { consumeA2UIResponse } from "../protocol/transport";
import { validateServerMessage } from "../protocol/validation";

export type UseA2UIOptions = {
  endpoint?: string;
  supportedCatalogIds?: string[];
};

function dataModelMetadata(state: A2UIState, originSurfaceId?: string) {
  const surfaces: Record<string, unknown> = {};

  const candidates = originSurfaceId
    ? [originSurfaceId]
    : state.order;

  for (const surfaceId of candidates) {
    const surface = state.surfaces[surfaceId];
    if (surface?.sendDataModel) surfaces[surfaceId] = surface.dataModel;
  }

  return Object.keys(surfaces).length ? { surfaces } : undefined;
}

export function useA2UI({
  endpoint = "/api/chat",
  supportedCatalogIds = [BASIC_CATALOG_ID],
}: UseA2UIOptions = {}) {
  const [state, dispatch] = useReducer(a2uiReducer, initialA2UIState);
  const stateRef = useRef(state);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const buildMetadata = useCallback(
    (originSurfaceId?: string): A2UITransportMetadata => {
      const metadata: A2UITransportMetadata = {
        a2uiClientCapabilities: {
          "v0.9": {
            supportedCatalogIds,
          },
        },
      };

      const dataModel = dataModelMetadata(stateRef.current, originSurfaceId);
      if (dataModel) metadata.a2uiClientDataModel = dataModel;
      return metadata;
    },
    [supportedCatalogIds],
  );

  const ingest = useCallback(
    (rawMessage: unknown) => {
      const checked = validateServerMessage(
        rawMessage,
        stateRef.current,
        supportedCatalogIds,
      );

      if (checked.ok === false) {
        setError(checked.error.message);
        console.warn("A2UI validation error", checked.error);
        return;
      }

      stateRef.current = applyA2UIMessage(stateRef.current, checked.message);
      dispatch({ type: "server", message: checked.message });
    },
    [supportedCatalogIds],
  );

  const post = useCallback(
    async (body: unknown) => {
      setPendingRequests((count) => count + 1);
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/a2ui+json, application/x-ndjson, application/json, text/event-stream",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Backend respondió ${response.status}`);
        }

        await consumeA2UIResponse(response, ingest);
      } catch (reason) {
        const message = reason instanceof Error ? reason.message : "No se pudo conectar con el backend";
        setError(message);
        throw reason;
      } finally {
        setPendingRequests((count) => Math.max(0, count - 1));
      }
    },
    [endpoint, ingest],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message) return;

      // `message` is transport/application data. A2UI itself intentionally
      // does not prescribe how a normal user prompt is transported.
      await post({
        message,
        metadata: buildMetadata(),
      });
    },
    [buildMetadata, post],
  );

  const invokeAction = useCallback(
    async (invocation: A2UIActionInvocation) => {
      const event = invocation.action.event;
      if (!event) return;

      const surface = stateRef.current.surfaces[invocation.surfaceId];
      if (!surface) return;

      const context = resolveDeep(event.context ?? {}, {
        dataModel: surface.dataModel,
        scopePath: invocation.scopePath,
      }) as Record<string, unknown>;

      const actionMessage: A2UIClientActionMessage = {
        version: A2UI_VERSION,
        action: {
          name: event.name,
          surfaceId: invocation.surfaceId,
          sourceComponentId: invocation.sourceComponentId,
          timestamp: new Date().toISOString(),
          context,
        },
      };

      // REST wrapper: the A2UI action remains untouched under `a2ui`, while
      // capabilities/data-model synchronization travel as transport metadata.
      await post({
        a2ui: actionMessage,
        metadata: buildMetadata(invocation.surfaceId),
      });
    },
    [buildMetadata, post],
  );

  const updateDataModel = useCallback((surfaceId: string, path: string, value: unknown) => {
    const action = { type: "localData" as const, surfaceId, path, value };
    stateRef.current = a2uiReducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const reset = useCallback(() => {
    stateRef.current = initialA2UIState;
    dispatch({ type: "reset" });
    setError(null);
  }, []);

  return {
    state,
    loading: pendingRequests > 0,
    error,
    sendMessage,
    invokeAction,
    updateDataModel,
    reset,
  };
}
