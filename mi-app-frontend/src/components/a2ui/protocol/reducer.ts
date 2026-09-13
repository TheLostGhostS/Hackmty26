import type { A2UIComponent, A2UIServerMessage, A2UIState } from "../types";
import { setAtPointer } from "./jsonPointer";

export const initialA2UIState: A2UIState = {
  surfaces: {},
  order: [],
};

export type A2UIReducerAction =
  | { type: "server"; message: A2UIServerMessage }
  | { type: "localData"; surfaceId: string; path: string; value: unknown }
  | { type: "reset" };

function componentMap(components: A2UIComponent[]) {
  return Object.fromEntries(components.map((component) => [component.id, component]));
}

export function applyA2UIMessage(
  state: A2UIState,
  message: A2UIServerMessage,
): A2UIState {
  if ("createSurface" in message) {
    const surface = message.createSurface;
    if (state.surfaces[surface.surfaceId]) return state;

    return {
      surfaces: {
        ...state.surfaces,
        [surface.surfaceId]: {
          surfaceId: surface.surfaceId,
          catalogId: surface.catalogId,
          theme: surface.theme,
          sendDataModel: surface.sendDataModel ?? false,
          components: {},
          dataModel: {},
        },
      },
      order: [...state.order, surface.surfaceId],
    };
  }

  if ("updateComponents" in message) {
    const { surfaceId, components } = message.updateComponents;
    const current = state.surfaces[surfaceId];
    if (!current) return state;

    return {
      ...state,
      surfaces: {
        ...state.surfaces,
        [surfaceId]: {
          ...current,
          components: {
            ...current.components,
            ...componentMap(components),
          },
        },
      },
    };
  }

  if ("updateDataModel" in message) {
    const update = message.updateDataModel;
    const current = state.surfaces[update.surfaceId];
    if (!current) return state;

    const hasValue = Object.prototype.hasOwnProperty.call(update, "value");
    const nextDataModel = setAtPointer(
      current.dataModel,
      update.path ?? "/",
      update.value,
      !hasValue,
    );

    return {
      ...state,
      surfaces: {
        ...state.surfaces,
        [update.surfaceId]: {
          ...current,
          dataModel: nextDataModel,
        },
      },
    };
  }

  const { surfaceId } = message.deleteSurface;
  if (!state.surfaces[surfaceId]) return state;

  const nextSurfaces = { ...state.surfaces };
  delete nextSurfaces[surfaceId];

  return {
    surfaces: nextSurfaces,
    order: state.order.filter((id) => id !== surfaceId),
  };
}

export function a2uiReducer(state: A2UIState, action: A2UIReducerAction): A2UIState {
  if (action.type === "reset") return initialA2UIState;
  if (action.type === "server") return applyA2UIMessage(state, action.message);

  const surface = state.surfaces[action.surfaceId];
  if (!surface) return state;

  return {
    ...state,
    surfaces: {
      ...state.surfaces,
      [action.surfaceId]: {
        ...surface,
        dataModel: setAtPointer(surface.dataModel, action.path, action.value),
      },
    },
  };
}
