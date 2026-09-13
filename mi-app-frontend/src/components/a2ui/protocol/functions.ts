import type { A2UICheck, FunctionCall } from "../types";
import { getAtPointer, isDataBinding, resolveBindingPath } from "./jsonPointer";

export type EvaluationContext = {
  dataModel: unknown;
  scopePath?: string;
  allowEffects?: boolean;
};

export function isFunctionCall(value: unknown): value is FunctionCall {
  return (
    typeof value === "object" &&
    value !== null &&
    "call" in value &&
    typeof (value as { call?: unknown }).call === "string"
  );
}

export function resolveDynamic(value: unknown, ctx: EvaluationContext): unknown {
  if (isDataBinding(value)) {
    return getAtPointer(
      ctx.dataModel,
      resolveBindingPath(value.path, ctx.scopePath ?? ""),
    );
  }

  if (isFunctionCall(value)) return executeFunction(value, ctx);
  return value;
}

export function resolveDeep(value: unknown, ctx: EvaluationContext): unknown {
  const dynamic = resolveDynamic(value, ctx);
  if (dynamic !== value) return resolveDeep(dynamic, ctx);

  if (Array.isArray(value)) return value.map((item) => resolveDeep(item, ctx));

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveDeep(item, ctx)]),
    );
  }

  return value;
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function valuePresent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function executeFunction(call: FunctionCall, ctx: EvaluationContext): unknown {
  const args = resolveDeep(call.args ?? {}, ctx) as Record<string, unknown>;

  switch (call.call) {
    case "required":
      return valuePresent(args.value);

    case "regex": {
      try {
        return new RegExp(String(args.pattern ?? "")).test(String(args.value ?? ""));
      } catch {
        return false;
      }
    }

    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(args.value ?? ""));

    case "length": {
      const length = String(args.value ?? "").length;
      if (args.min != null && length < asNumber(args.min)) return false;
      if (args.max != null && length > asNumber(args.max)) return false;
      if (args.equals != null && length !== asNumber(args.equals)) return false;
      return true;
    }

    case "numeric": {
      const value = Number(args.value);
      if (!Number.isFinite(value)) return false;
      if (args.min != null && value < asNumber(args.min)) return false;
      if (args.max != null && value > asNumber(args.max)) return false;
      return true;
    }

    case "and": {
      const values = Array.isArray(args.values) ? args.values : [];
      return values.every(Boolean);
    }

    case "or": {
      const values = Array.isArray(args.values) ? args.values : [];
      return values.some(Boolean);
    }

    case "not":
      return !Boolean(args.value);

    case "formatNumber":
      return new Intl.NumberFormat(undefined, {
        maximumFractionDigits:
          args.maximumFractionDigits == null
            ? undefined
            : asNumber(args.maximumFractionDigits),
      }).format(asNumber(args.value));

    case "formatCurrency":
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: String(args.currency ?? "USD"),
      }).format(asNumber(args.value));

    case "formatDate": {
      const date = new Date(String(args.value ?? ""));
      return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
    }

    case "pluralize": {
      const count = asNumber(args.count ?? args.value);
      return count === 1
        ? String(args.singular ?? "")
        : String(args.plural ?? `${String(args.singular ?? "")}s`);
    }

    case "formatString": {
      const template = String(args.template ?? args.format ?? args.value ?? "");
      return template.replace(/\$\{([^}]+)\}/g, (_match, path: string) => {
        const resolved = getAtPointer(
          ctx.dataModel,
          resolveBindingPath(path, ctx.scopePath ?? ""),
        );
        if (resolved == null) return "";
        return typeof resolved === "object" ? JSON.stringify(resolved) : String(resolved);
      });
    }

    case "openUrl": {
      const url = String(args.url ?? "");
      if (!ctx.allowEffects) return url;
      if (!/^https?:\/\//i.test(url)) return false;
      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    }

    default:
      return undefined;
  }
}

export function checkErrors(
  checks: A2UICheck[] | undefined,
  ctx: EvaluationContext,
): string[] {
  if (!checks?.length) return [];

  return checks.flatMap((check) => {
    const functionCall = check.condition ??
      (check.call ? { call: check.call, args: check.args } : undefined);
    if (!functionCall) return [];
    return Boolean(executeFunction(functionCall, ctx)) ? [] : [check.message];
  });
}
