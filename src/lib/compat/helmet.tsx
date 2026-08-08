/**
 * Minimal react-helmet-async compatible shim (aliased in vite.config.ts) so the
 * copied SEO component works on this stack, where head tags are applied to the
 * live document instead of through a Helmet provider.
 */
import { useEffect, type ReactElement, type ReactNode } from "react";

type AnyElement = ReactElement<Record<string, unknown>> & { type: string };

function flatten(children: ReactNode): AnyElement[] {
  const out: AnyElement[] = [];
  const walk = (node: ReactNode) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === "object" && "type" in node) {
      out.push(node as AnyElement);
    }
  };
  walk(children);
  return out;
}

export function Helmet({ children }: { children?: ReactNode }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const created: Element[] = [];

    for (const el of flatten(children)) {
      if (typeof el.type !== "string") continue;
      const props = el.props as Record<string, unknown>;

      if (el.type === "title") {
        const text = Array.isArray(props["children"])
          ? props["children"].join("")
          : String(props["children"] ?? "");
        document.title = text;
        continue;
      }

      const selectorAttr = props["name"] ? "name" : props["property"] ? "property" : "rel";
      const selectorValue = props[selectorAttr];
      if (selectorValue) {
        document
          .querySelectorAll(`head ${el.type}[${selectorAttr}="${String(selectorValue)}"]`)
          .forEach((node) => node.remove());
      }

      const node = document.createElement(el.type);
      for (const [key, value] of Object.entries(props)) {
        if (key === "children" || value == null) continue;
        node.setAttribute(key, String(value));
      }
      document.head.appendChild(node);
      created.push(node);
    }

    return () => created.forEach((node) => node.remove());
  }, [children]);

  return null;
}

export function HelmetProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export default Helmet;
