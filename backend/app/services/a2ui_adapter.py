from __future__ import annotations

from html import escape
from math import cos, pi, sin
from urllib.parse import quote

from app.models.ui import (
    ButtonComponent,
    ChartComponent,
    CheckboxComponent,
    DropdownComponent,
    MultiSelectComponent,
    SliderComponent,
    TextComponent,
    UIResponse,
)


A2UI_VERSION = "v0.9.1"
BASIC_CATALOG_ID = "https://a2ui.org/specification/v0_9_1/catalogs/basic/catalog.json"
DEFAULT_SURFACE_ID = "main"


def _safe_id(raw: str, fallback: str) -> str:
    value = "".join(ch if (ch.isalnum() or ch in "_-.") else "_" for ch in (raw or fallback))
    return value or fallback


def _unique_id(raw: str, fallback: str, used: set[str]) -> str:
    base = _safe_id(raw, fallback)
    candidate = base
    index = 2
    while candidate in used:
        candidate = f"{base}_{index}"
        index += 1
    used.add(candidate)
    return candidate


def _svg_data_uri(svg: str) -> str:
    return "data:image/svg+xml;charset=UTF-8," + quote(svg, safe="")


def _chart_svg(chart: ChartComponent) -> str:
    """Convierte ChartComponent a un SVG para mantener compatibilidad con el Basic Catalog (Image)."""
    width, height = 760, 360
    left, right, top, bottom = 70, 30, 40, 70
    plot_w = width - left - right
    plot_h = height - top - bottom
    palette = ["#C8102E", "#6B7280", "#111827", "#E11D48", "#9CA3AF"]

    labels = [str(x) for x in chart.labels]
    datasets = chart.datasets
    all_values = [float(v) for ds in datasets for v in ds.values] or [0.0]
    maximum = max(max(all_values), 1.0)

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        '<rect width="100%" height="100%" rx="24" fill="#ffffff"/>',
        f'<text x="{left}" y="28" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#111827">{escape(chart.title)}</text>',
    ]

    if chart.chart_type == "pie":
        values = [max(float(v), 0.0) for v in (datasets[0].values if datasets else [])]
        total = sum(values) or 1.0
        cx, cy, radius = 235, 190, 110
        angle = -pi / 2
        for i, value in enumerate(values):
            sweep = (value / total) * 2 * pi
            next_angle = angle + sweep
            x1, y1 = cx + radius * cos(angle), cy + radius * sin(angle)
            x2, y2 = cx + radius * cos(next_angle), cy + radius * sin(next_angle)
            large = 1 if sweep > pi else 0
            color = palette[i % len(palette)]
            if value > 0:
                parts.append(
                    f'<path d="M {cx} {cy} L {x1:.2f} {y1:.2f} A {radius} {radius} 0 {large} 1 {x2:.2f} {y2:.2f} Z" fill="{color}"/>'
                )
            angle = next_angle

        for i, label in enumerate(labels[: len(values)]):
            y = 90 + i * 34
            color = palette[i % len(palette)]
            value = values[i] if i < len(values) else 0
            pct = (value / total) * 100
            parts.extend([
                f'<rect x="430" y="{y - 13}" width="16" height="16" rx="4" fill="{color}"/>',
                f'<text x="456" y="{y}" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#374151">{escape(label)}: {value:g} ({pct:.1f}%)</text>',
            ])

    elif chart.chart_type == "line":
        parts.extend([
            f'<line x1="{left}" y1="{top + plot_h}" x2="{left + plot_w}" y2="{top + plot_h}" stroke="#D1D5DB"/>',
            f'<line x1="{left}" y1="{top}" x2="{left}" y2="{top + plot_h}" stroke="#D1D5DB"/>',
        ])
        count = max(len(labels), max((len(ds.values) for ds in datasets), default=1))
        for dsi, ds in enumerate(datasets):
            color = palette[dsi % len(palette)]
            points = []
            for i, value in enumerate(ds.values):
                x = left + (plot_w * i / max(count - 1, 1))
                y = top + plot_h - (float(value) / maximum) * plot_h
                points.append(f"{x:.1f},{y:.1f}")
            if points:
                parts.append(f'<polyline points="{" ".join(points)}" fill="none" stroke="{color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>')
                for point in points:
                    x, y = point.split(",")
                    parts.append(f'<circle cx="{x}" cy="{y}" r="4" fill="{color}"/>')
        for i, label in enumerate(labels):
            x = left + (plot_w * i / max(len(labels) - 1, 1))
            parts.append(f'<text x="{x:.1f}" y="{height - 35}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6B7280">{escape(label[:18])}</text>')

    else:  # bar
        parts.extend([
            f'<line x1="{left}" y1="{top + plot_h}" x2="{left + plot_w}" y2="{top + plot_h}" stroke="#D1D5DB"/>',
            f'<line x1="{left}" y1="{top}" x2="{left}" y2="{top + plot_h}" stroke="#D1D5DB"/>',
        ])
        groups = max(len(labels), 1)
        ds_count = max(len(datasets), 1)
        group_w = plot_w / groups
        bar_w = max(8, group_w * 0.72 / ds_count)
        for li, label in enumerate(labels):
            group_x = left + li * group_w
            for dsi, ds in enumerate(datasets):
                value = float(ds.values[li]) if li < len(ds.values) else 0.0
                bar_h = max(0.0, value / maximum) * plot_h
                x = group_x + group_w * 0.14 + dsi * bar_w
                y = top + plot_h - bar_h
                color = palette[dsi % len(palette)]
                parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bar_w * 0.88:.1f}" height="{bar_h:.1f}" rx="5" fill="{color}"/>')
            parts.append(f'<text x="{group_x + group_w / 2:.1f}" y="{height - 35}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" fill="#6B7280">{escape(label[:18])}</text>')

    # Leyenda para bar/line cuando hay varios datasets.
    if chart.chart_type != "pie" and datasets:
        legend_x = left
        for dsi, ds in enumerate(datasets):
            color = palette[dsi % len(palette)]
            parts.append(f'<rect x="{legend_x}" y="{height - 18}" width="10" height="10" rx="2" fill="{color}"/>')
            parts.append(f'<text x="{legend_x + 15}" y="{height - 9}" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#6B7280">{escape(ds.label[:22])}</text>')
            legend_x += 150

    parts.append("</svg>")
    return _svg_data_uri("".join(parts))


def ui_response_to_a2ui(
    ui: UIResponse,
    *,
    surface_id: str = DEFAULT_SURFACE_ID,
    surface_exists: bool = False,
) -> list[dict]:
    """
    Traduce el esquema GenUI existente a mensajes A2UI v0.9.1 sin pedirle
    a Gemini que cambie de formato.
    """
    used: set[str] = {"root"}
    root_children: list[str] = []
    components: list[dict] = []
    controls: dict[str, object] = {}

    for index, item in enumerate(ui.components):
        original_id = getattr(item, "id", f"component_{index}")
        cid = _unique_id(original_id, f"component_{index}", used)

        if isinstance(item, TextComponent):
            variant_map = {
                "title": "h1",
                "subtitle": "h2",
                "body": "body",
                "caption": "caption",
            }
            components.append({
                "id": cid,
                "component": "Text",
                "text": item.text,
                "variant": variant_map.get(item.variant, "body"),
            })
            root_children.append(cid)

        elif isinstance(item, ButtonComponent):
            label_id = _unique_id(f"{cid}__label", f"button_label_{index}", used)
            components.append({
                "id": label_id,
                "component": "Text",
                "text": item.label,
            })
            components.append({
                "id": cid,
                "component": "Button",
                "child": label_id,
                "variant": "primary",
                "action": {
                    "event": {
                        "name": item.action,
                        "context": {
                            "controls": {"path": "/controls"},
                        },
                    }
                },
            })
            root_children.append(cid)

        elif isinstance(item, SliderComponent):
            path = f"/controls/{cid}"
            controls[cid] = item.default_value if item.default_value is not None else item.min
            components.append({
                "id": cid,
                "component": "Slider",
                "label": item.label,
                "minValue": item.min,
                "maxValue": item.max,
                "step": item.step,
                "value": {"path": path},
            })
            root_children.append(cid)

        elif isinstance(item, DropdownComponent):
            path = f"/controls/{cid}"
            controls[cid] = [item.default_value] if item.default_value is not None else []
            components.append({
                "id": cid,
                "component": "ChoicePicker",
                "label": item.label,
                "variant": "mutuallyExclusive",
                "maxAllowedSelections": 1,
                "options": [option.model_dump() for option in item.options],
                "value": {"path": path},
            })
            root_children.append(cid)

        elif isinstance(item, MultiSelectComponent):
            path = f"/controls/{cid}"
            controls[cid] = list(item.default_values or [])
            components.append({
                "id": cid,
                "component": "ChoicePicker",
                "label": item.label,
                "variant": "multiple",
                "maxAllowedSelections": max(len(item.options), 1),
                "options": [option.model_dump() for option in item.options],
                "value": {"path": path},
            })
            root_children.append(cid)

        elif isinstance(item, CheckboxComponent):
            path = f"/controls/{cid}"
            controls[cid] = bool(item.default_checked)
            components.append({
                "id": cid,
                "component": "CheckBox",
                "label": item.label,
                "value": {"path": path},
            })
            root_children.append(cid)

        elif isinstance(item, ChartComponent):
            # Chart no forma parte del Basic Catalog. Se encapsula como Card + Image SVG.
            title_id = _unique_id(f"{cid}__title", f"chart_title_{index}", used)
            image_id = _unique_id(f"{cid}__image", f"chart_image_{index}", used)
            content_id = _unique_id(f"{cid}__content", f"chart_content_{index}", used)
            card_id = cid
            components.extend([
                {
                    "id": title_id,
                    "component": "Text",
                    "text": item.title,
                    "variant": "h3",
                },
                {
                    "id": image_id,
                    "component": "Image",
                    "url": _chart_svg(item),
                    "fit": "contain",
                    "accessibility": {"label": item.title},
                },
                {
                    "id": content_id,
                    "component": "Column",
                    "children": [title_id, image_id],
                    "align": "stretch",
                },
                {
                    "id": card_id,
                    "component": "Card",
                    "child": content_id,
                },
            ])
            root_children.append(card_id)

    components.insert(0, {
        "id": "root",
        "component": "Column",
        "children": root_children,
        "justify": "start",
        "align": "stretch",
    })

    messages: list[dict] = []
    if not surface_exists:
        messages.append({
            "version": A2UI_VERSION,
            "createSurface": {
                "surfaceId": surface_id,
                "catalogId": BASIC_CATALOG_ID,
                "theme": {
                    "primaryColor": "#C8102E",
                    "agentDisplayName": "Rubí",
                },
                "sendDataModel": True,
            },
        })

    messages.append({
        "version": A2UI_VERSION,
        "updateComponents": {
            "surfaceId": surface_id,
            "components": components,
        },
    })

    # Siempre reemplazamos el modelo para que controles viejos no sobrevivan a una pantalla nueva.
    messages.append({
        "version": A2UI_VERSION,
        "updateDataModel": {
            "surfaceId": surface_id,
            "path": "/",
            "value": {"controls": controls},
        },
    })

    return messages
