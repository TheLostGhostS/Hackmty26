import type { DataBinding } from "../types";

const decodeSegment = (segment: string) =>
  segment.replace(/~1/g, "/").replace(/~0/g, "~");

const encodeSegment = (segment: string) =>
  segment.replace(/~/g, "~0").replace(/\//g, "~1");

export function isDataBinding(value: unknown): value is DataBinding {
  return (
    typeof value === "object" &&
    value !== null &&
    "path" in value &&
    typeof (value as { path?: unknown }).path === "string"
  );
}

export function resolveBindingPath(path: string, scopePath = ""): string {
  if (path === "" || path === "/") return "/";
  if (path.startsWith("/")) return path;

  const scope = scopePath && scopePath !== "/" ? scopePath.replace(/\/$/, "") : "";
  return `${scope}/${path}`.replace(/\/+/g, "/");
}

export function appendPointer(base: string, segment: string | number): string {
  const normalizedBase = !base || base === "/" ? "" : base.replace(/\/$/, "");
  return `${normalizedBase}/${encodeSegment(String(segment))}` || "/";
}

export function getAtPointer(root: unknown, pointer: string): unknown {
  if (!pointer || pointer === "/") return root;

  const parts = pointer
    .replace(/^\//, "")
    .split("/")
    .map(decodeSegment);

  let current: unknown = root;
  for (const part of parts) {
    if (Array.isArray(current)) {
      const index = Number(part);
      if (!Number.isInteger(index)) return undefined;
      current = current[index];
      continue;
    }

    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function cloneJsonish<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value ?? {})) as T;
}

export function setAtPointer(
  root: unknown,
  pointer: string,
  value: unknown,
  remove = false,
): unknown {
  if (!pointer || pointer === "/") return remove ? {} : value;

  const nextRoot = cloneJsonish(root ?? {});
  const parts = pointer
    .replace(/^\//, "")
    .split("/")
    .map(decodeSegment);

  let current: unknown = nextRoot;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    const nextShouldBeArray = /^\d+$/.test(nextPart);

    if (Array.isArray(current)) {
      const index = Number(part);
      if (current[index] == null || typeof current[index] !== "object") {
        current[index] = nextShouldBeArray ? [] : {};
      }
      current = current[index];
      continue;
    }

    if (typeof current !== "object" || current === null) return nextRoot;
    const record = current as Record<string, unknown>;
    if (record[part] == null || typeof record[part] !== "object") {
      record[part] = nextShouldBeArray ? [] : {};
    }
    current = record[part];
  }

  const last = parts[parts.length - 1];

  if (Array.isArray(current)) {
    const index = Number(last);
    if (!Number.isInteger(index)) return nextRoot;
    current[index] = remove ? undefined : value;
  } else if (typeof current === "object" && current !== null) {
    const record = current as Record<string, unknown>;
    if (remove) delete record[last];
    else record[last] = value;
  }

  return nextRoot;
}
