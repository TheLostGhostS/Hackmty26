import { useState, type CSSProperties, type ReactNode } from "react";
import type {
  A2UIActionDefinition,
  A2UIComponent,
  A2UISurfaceState,
  ChildList,
  DataBinding,
} from "../types";
import { checkErrors, executeFunction, resolveDeep, resolveDynamic } from "../protocol/functions";
import {
  appendPointer,
  getAtPointer,
  isDataBinding,
  resolveBindingPath,
} from "../protocol/jsonPointer";

export type CatalogRenderContext = {
  surface: A2UISurfaceState;
  disabled?: boolean;
  renderComponent: (id: string, scopePath?: string, keySuffix?: string) => ReactNode;
  updateData: (path: string, value: unknown) => void;
  invokeAction: (
    sourceComponentId: string,
    action: A2UIActionDefinition,
    scopePath?: string,
  ) => void;
};

export type CatalogRendererProps = {
  component: A2UIComponent;
  scopePath?: string;
  ctx: CatalogRenderContext;
};

export type CatalogRenderer = (props: CatalogRendererProps) => ReactNode;
export type A2UICatalog = Record<string, CatalogRenderer>;

type GenericRecord = Record<string, unknown>;

function prop<T = unknown>(component: A2UIComponent, name: string): T | undefined {
  return component[name] as T | undefined;
}

function dynamic(component: A2UIComponent, name: string, scopePath: string | undefined, ctx: CatalogRenderContext) {
  return resolveDynamic(prop(component, name), {
    dataModel: ctx.surface.dataModel,
    scopePath,
  });
}

function stringValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function numberValue(value: unknown, fallback = 0): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

function bindingFor(component: A2UIComponent, ...names: string[]): DataBinding | undefined {
  for (const name of names) {
    const value = prop(component, name);
    if (isDataBinding(value)) return value;
  }
  return undefined;
}

function boundPath(binding: DataBinding | undefined, scopePath?: string) {
  return binding ? resolveBindingPath(binding.path, scopePath ?? "") : undefined;
}

function renderChildren(children: ChildList | undefined, scopePath: string | undefined, ctx: CatalogRenderContext) {
  if (!children) return null;

  if (Array.isArray(children)) {
    return children.map((id) => ctx.renderComponent(id, scopePath));
  }

  const listPath = resolveBindingPath(children.path, scopePath ?? "");
  const data = getAtPointer(ctx.surface.dataModel, listPath);
  if (!Array.isArray(data)) return null;

  return data.map((_item, index) =>
    ctx.renderComponent(
      children.componentId,
      appendPointer(listPath, index),
      `${children.componentId}:${index}`,
    ),
  );
}

const justifyClass: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  spaceBetween: "justify-between",
  spaceAround: "justify-around",
  spaceEvenly: "justify-evenly",
};

const alignClass: Record<string, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const textClass: Record<string, string> = {
  h1: "font-display text-4xl font-semibold tracking-tight text-ink",
  h2: "font-display text-3xl font-semibold tracking-tight text-ink",
  h3: "font-display text-2xl font-semibold text-ink",
  h4: "font-display text-xl font-semibold text-ink",
  h5: "font-display text-lg font-semibold text-ink",
  body: "text-base text-ink/80",
  caption: "text-sm text-ink/55",
};

function flexStyle(component: A2UIComponent): CSSProperties | undefined {
  return typeof component.weight === "number" ? { flexGrow: component.weight } : undefined;
}

function ariaLabel(component: A2UIComponent, scopePath: string | undefined, ctx: CatalogRenderContext) {
  return component.accessibility?.label
    ? stringValue(
        resolveDynamic(component.accessibility.label, {
          dataModel: ctx.surface.dataModel,
          scopePath,
        }),
      )
    : undefined;
}

function componentCheckErrors(component: A2UIComponent, scopePath: string | undefined, ctx: CatalogRenderContext) {
  return checkErrors(component.checks, {
    dataModel: ctx.surface.dataModel,
    scopePath,
  });
}

function Text({ component, scopePath, ctx }: CatalogRendererProps) {
  const text = stringValue(dynamic(component, "text", scopePath, ctx));
  const variant = String(prop(component, "variant") ?? "body");
  const Tag = variant === "h1" ? "h1" : variant === "h2" ? "h2" : variant === "h3" ? "h3" : "p";

  return (
    <Tag
      className={`${textClass[variant] ?? textClass.body} whitespace-pre-wrap`}
      style={flexStyle(component)}
      aria-label={ariaLabel(component, scopePath, ctx)}
    >
      {text}
    </Tag>
  );
}

function ImageComponent({ component, scopePath, ctx }: CatalogRendererProps) {
  const url = stringValue(dynamic(component, "url", scopePath, ctx));
  if (!url) return null;
  const fit = String(prop(component, "fit") ?? "cover");

  return (
    <img
      src={url}
      alt={ariaLabel(component, scopePath, ctx) ?? ""}
      className={`w-full rounded-2xl ${fit === "contain" ? "object-contain" : "object-cover"}`}
      style={flexStyle(component)}
    />
  );
}

const iconGlyphs: Record<string, string> = {
  check: "✓",
  close: "×",
  mail: "✉",
  warning: "⚠",
  info: "ⓘ",
  search: "⌕",
  add: "+",
  remove: "−",
};

function Icon({ component, scopePath, ctx }: CatalogRendererProps) {
  const name = stringValue(dynamic(component, "name", scopePath, ctx));
  return (
    <span
      role="img"
      aria-label={ariaLabel(component, scopePath, ctx) ?? name}
      className="inline-flex min-h-5 min-w-5 items-center justify-center"
      style={flexStyle(component)}
    >
      {iconGlyphs[name] ?? name}
    </span>
  );
}

function Video({ component, scopePath, ctx }: CatalogRendererProps) {
  const url = stringValue(dynamic(component, "url", scopePath, ctx));
  if (!url) return null;
  return <video src={url} controls className="w-full rounded-2xl" style={flexStyle(component)} />;
}

function AudioPlayer({ component, scopePath, ctx }: CatalogRendererProps) {
  const url = stringValue(dynamic(component, "url", scopePath, ctx));
  if (!url) return null;
  return <audio src={url} controls className="w-full" style={flexStyle(component)} />;
}

function Row({ component, scopePath, ctx }: CatalogRendererProps) {
  const children = prop<ChildList>(component, "children");
  const justify = String(prop(component, "justify") ?? "start");
  const align = String(prop(component, "align") ?? "center");

  return (
    <div
      className={`flex flex-row flex-wrap gap-3 ${justifyClass[justify] ?? "justify-start"} ${alignClass[align] ?? "items-center"}`}
      style={flexStyle(component)}
    >
      {renderChildren(children, scopePath, ctx)}
    </div>
  );
}

function Column({ component, scopePath, ctx }: CatalogRendererProps) {
  const children = prop<ChildList>(component, "children");
  const justify = String(prop(component, "justify") ?? "start");
  const align = String(prop(component, "align") ?? "stretch");

  return (
    <div
      className={`flex flex-col gap-4 ${justifyClass[justify] ?? "justify-start"} ${alignClass[align] ?? "items-stretch"}`}
      style={flexStyle(component)}
    >
      {renderChildren(children, scopePath, ctx)}
    </div>
  );
}

function List({ component, scopePath, ctx }: CatalogRendererProps) {
  const children = prop<ChildList>(component, "children");
  const direction = String(prop(component, "direction") ?? "vertical");
  const align = String(prop(component, "align") ?? "stretch");

  return (
    <div
      className={`flex max-h-[60vh] gap-3 overflow-auto ${
        direction === "horizontal" ? "flex-row" : "flex-col"
      } ${alignClass[align] ?? "items-stretch"}`}
      style={flexStyle(component)}
    >
      {renderChildren(children, scopePath, ctx)}
    </div>
  );
}

function Card({ component, scopePath, ctx }: CatalogRendererProps) {
  const child = prop<string>(component, "child");
  return (
    <section
      className="rounded-3xl border border-ink/10 bg-white/70 p-5 shadow-sm backdrop-blur"
      style={flexStyle(component)}
    >
      {child ? ctx.renderComponent(child, scopePath) : null}
    </section>
  );
}

function Divider({ component }: CatalogRendererProps) {
  const axis = String(prop(component, "axis") ?? "horizontal");
  return axis === "vertical" ? (
    <div className="mx-2 self-stretch border-l border-ink/10" />
  ) : (
    <hr className="my-1 border-0 border-t border-ink/10" />
  );
}

function Button({ component, scopePath, ctx }: CatalogRendererProps) {
  const child = prop<string>(component, "child");
  const action = prop<A2UIActionDefinition>(component, "action");
  const variant = String(prop(component, "variant") ?? "primary");
  const errors = componentCheckErrors(component, scopePath, ctx);
  const disabled = ctx.disabled || errors.length > 0;
  const primaryColor =
    typeof ctx.surface.theme?.primaryColor === "string" ? ctx.surface.theme.primaryColor : undefined;

  const handleClick = () => {
    if (!action || disabled) return;

    if (action.functionCall) {
      executeFunction(action.functionCall, {
        dataModel: ctx.surface.dataModel,
        scopePath,
        allowEffects: true,
      });
    }

    if (action.event) ctx.invokeAction(component.id, action, scopePath);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      aria-label={ariaLabel(component, scopePath, ctx)}
      title={errors[0]}
      className={`rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        variant === "borderless"
          ? "bg-transparent text-ink hover:bg-ink/5"
          : primaryColor
            ? "text-white hover:opacity-90"
            : "bg-ink text-paper hover:opacity-90"
      }`}
      style={{ ...(flexStyle(component) ?? {}), ...(variant !== "borderless" && primaryColor ? { backgroundColor: primaryColor } : {}) }}
    >
      {child ? ctx.renderComponent(child, scopePath) : stringValue(prop(component, "text") ?? "Continuar")}
    </button>
  );
}

function FieldErrors({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return <p className="text-xs text-red-600">{errors[0]}</p>;
}

function TextField({ component, scopePath, ctx }: CatalogRendererProps) {
  const binding = bindingFor(component, "value");
  const path = boundPath(binding, scopePath);
  const value = path ? getAtPointer(ctx.surface.dataModel, path) : dynamic(component, "value", scopePath, ctx);
  const label = stringValue(dynamic(component, "label", scopePath, ctx));
  const kind = String(prop(component, "textFieldType") ?? prop(component, "variant") ?? "shortText");
  const errors = componentCheckErrors(component, scopePath, ctx);

  const setValue = (next: string) => {
    if (!path) return;
    ctx.updateData(path, kind === "number" ? Number(next) : next);
  };

  if (kind === "longText") {
    return (
      <label className="block space-y-2" style={flexStyle(component)}>
        <span className="text-sm font-medium text-ink/70">{label}</span>
        <textarea
          value={stringValue(value)}
          disabled={ctx.disabled}
          onChange={(event) => setValue(event.currentTarget.value)}
          className="min-h-28 w-full rounded-2xl border border-ink/15 bg-white/80 px-3 py-3 text-ink outline-none transition focus:border-ink/35"
        />
        <FieldErrors errors={errors} />
      </label>
    );
  }

  const inputType = kind === "obscured" ? "password" : kind === "number" ? "number" : kind === "date" ? "date" : "text";

  return (
    <label className="block space-y-2" style={flexStyle(component)}>
      <span className="text-sm font-medium text-ink/70">{label}</span>
      <input
        type={inputType}
        value={stringValue(value)}
        disabled={ctx.disabled}
        onChange={(event) => setValue(event.currentTarget.value)}
        className="w-full rounded-2xl border border-ink/15 bg-white/80 px-3 py-3 text-ink outline-none transition focus:border-ink/35"
      />
      <FieldErrors errors={errors} />
    </label>
  );
}

function CheckBox({ component, scopePath, ctx }: CatalogRendererProps) {
  const binding = bindingFor(component, "value");
  const path = boundPath(binding, scopePath);
  const checked = Boolean(path ? getAtPointer(ctx.surface.dataModel, path) : false);
  const label = stringValue(dynamic(component, "label", scopePath, ctx));
  const errors = componentCheckErrors(component, scopePath, ctx);

  return (
    <div className="space-y-1" style={flexStyle(component)}>
      <label className="flex items-center gap-3 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={checked}
          disabled={ctx.disabled}
          onChange={(event) => path && ctx.updateData(path, event.currentTarget.checked)}
          className="h-4 w-4"
        />
        <span>{label}</span>
      </label>
      <FieldErrors errors={errors} />
    </div>
  );
}

function Slider({ component, scopePath, ctx }: CatalogRendererProps) {
  const binding = bindingFor(component, "value");
  const path = boundPath(binding, scopePath);
  const min = numberValue(dynamic(component, "minValue", scopePath, ctx), 0);
  const max = numberValue(dynamic(component, "maxValue", scopePath, ctx), 100);
  const value = numberValue(path ? getAtPointer(ctx.surface.dataModel, path) : min, min);
  const step = numberValue(prop(component, "step"), 1);

  return (
    <label className="block space-y-2" style={flexStyle(component)}>
      <div className="flex justify-between text-sm text-ink/60">
        <span>{stringValue(dynamic(component, "label", scopePath, ctx))}</span>
        <output>{value}</output>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={ctx.disabled}
        onChange={(event) => path && ctx.updateData(path, Number(event.currentTarget.value))}
        className="w-full accent-current"
      />
    </label>
  );
}

function DateTimeInput({ component, scopePath, ctx }: CatalogRendererProps) {
  const binding = bindingFor(component, "value");
  const path = boundPath(binding, scopePath);
  const value = stringValue(path ? getAtPointer(ctx.surface.dataModel, path) : "");
  const enableDate = prop<boolean>(component, "enableDate") ?? true;
  const enableTime = prop<boolean>(component, "enableTime") ?? false;
  const type = enableDate && enableTime ? "datetime-local" : enableTime ? "time" : "date";

  return (
    <label className="block space-y-2" style={flexStyle(component)}>
      <span className="text-sm font-medium text-ink/70">
        {stringValue(dynamic(component, "label", scopePath, ctx))}
      </span>
      <input
        type={type}
        value={value}
        disabled={ctx.disabled}
        onChange={(event) => path && ctx.updateData(path, event.currentTarget.value)}
        className="w-full rounded-2xl border border-ink/15 bg-white/80 px-3 py-3 text-ink outline-none"
      />
    </label>
  );
}

function ChoicePicker({ component, scopePath, ctx }: CatalogRendererProps) {
  const binding = bindingFor(component, "value", "selections");
  const path = boundPath(binding, scopePath);
  const rawValue = path ? getAtPointer(ctx.surface.dataModel, path) : [];
  const selected = Array.isArray(rawValue) ? rawValue.map(String) : rawValue == null ? [] : [String(rawValue)];
  const options = (prop<unknown[]>(component, "options") ?? []) as GenericRecord[];
  const maxAllowed = numberValue(prop(component, "maxAllowedSelections"), 1);
  const mutuallyExclusive = String(prop(component, "variant") ?? "") === "mutuallyExclusive" || maxAllowed === 1;

  if (mutuallyExclusive) {
    return (
      <label className="block space-y-2" style={flexStyle(component)}>
        <span className="text-sm font-medium text-ink/70">
          {stringValue(dynamic(component, "label", scopePath, ctx))}
        </span>
        <select
          value={selected[0] ?? ""}
          disabled={ctx.disabled}
          onChange={(event) => path && ctx.updateData(path, [event.currentTarget.value])}
          className="w-full rounded-2xl border border-ink/15 bg-white/80 px-3 py-3 text-ink outline-none"
        >
          <option value="">Selecciona una opción</option>
          {options.map((option) => {
            const value = stringValue(resolveDeep(option.value, { dataModel: ctx.surface.dataModel, scopePath }));
            const label = stringValue(resolveDeep(option.label, { dataModel: ctx.surface.dataModel, scopePath }));
            return <option key={value} value={value}>{label}</option>;
          })}
        </select>
      </label>
    );
  }

  const toggle = (value: string) => {
    if (!path) return;
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : selected.length >= maxAllowed
        ? selected
        : [...selected, value];
    ctx.updateData(path, next);
  };

  return (
    <fieldset className="space-y-2" style={flexStyle(component)} disabled={ctx.disabled}>
      <legend className="text-sm font-medium text-ink/70">
        {stringValue(dynamic(component, "label", scopePath, ctx))}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const value = stringValue(resolveDeep(option.value, { dataModel: ctx.surface.dataModel, scopePath }));
          const label = stringValue(resolveDeep(option.label, { dataModel: ctx.surface.dataModel, scopePath }));
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={`rounded-full border px-3 py-2 text-sm transition ${
                active ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white/70 text-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Tabs({ component, scopePath, ctx }: CatalogRendererProps) {
  const items = (prop<unknown[]>(component, "tabItems") ?? []) as GenericRecord[];
  const [active, setActive] = useState(0);
  if (!items.length) return null;

  const current = items[Math.min(active, items.length - 1)];
  return (
    <div className="space-y-4" style={flexStyle(component)}>
      <div className="flex gap-2 overflow-x-auto border-b border-ink/10">
        {items.map((item, index) => (
          <button
            key={`${component.id}:tab:${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`whitespace-nowrap px-3 py-2 text-sm ${active === index ? "border-b-2 border-ink font-medium text-ink" : "text-ink/50"}`}
          >
            {stringValue(resolveDynamic(item.title, { dataModel: ctx.surface.dataModel, scopePath }))}
          </button>
        ))}
      </div>
      {typeof current.child === "string" ? ctx.renderComponent(current.child, scopePath) : null}
    </div>
  );
}

function Modal({ component, scopePath, ctx }: CatalogRendererProps) {
  const [open, setOpen] = useState(false);
  const entryPointChild = prop<string>(component, "entryPointChild");
  const contentChild = prop<string>(component, "contentChild");

  return (
    <>
      <div onClickCapture={() => setOpen(true)}>{entryPointChild ? ctx.renderComponent(entryPointChild, scopePath) : null}</div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" role="dialog" aria-modal="true">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-auto rounded-3xl bg-paper p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full px-3 py-2 text-ink/60 hover:bg-ink/5"
              aria-label="Cerrar"
            >
              ×
            </button>
            {contentChild ? ctx.renderComponent(contentChild, scopePath) : null}
          </div>
        </div>
      )}
    </>
  );
}

export const basicCatalog: A2UICatalog = {
  Text,
  Image: ImageComponent,
  Icon,
  Video,
  AudioPlayer,
  Row,
  Column,
  List,
  Card,
  Tabs,
  Divider,
  Modal,
  Button,
  CheckBox,
  TextField,
  DateTimeInput,
  ChoicePicker,
  Slider,
};
