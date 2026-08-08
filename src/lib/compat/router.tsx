/**
 * Compatibility layer that maps the react-router-dom API surface used by the
 * cloned app onto TanStack Router (the router used by this stack).
 * Aliased to "react-router-dom" in vite.config.ts so the copied source files
 * stay untouched.
 */
import {
  Link as TSLink,
  useRouter,
  useLocation as useTSLocation,
  useParams as useTSParams,
  Outlet,
} from "@tanstack/react-router";
import { forwardRef, useEffect, useMemo, type AnchorHTMLAttributes, type ReactNode } from "react";

type To = string;

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: To;
  replace?: boolean;
  state?: unknown;
  end?: boolean;
  children?: ReactNode;
}

export interface NavLinkProps extends Omit<LinkProps, "className" | "children"> {
  className?: string | ((props: { isActive: boolean; isPending: boolean }) => string);
  children?: ReactNode | ((props: { isActive: boolean; isPending: boolean }) => ReactNode);
  end?: boolean;
}

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function useNavigate() {
  const router = useRouter();
  return useMemo(
    () =>
      ((to: To | number, options?: NavigateOptions) => {
        if (typeof to === "number") {
          if (to < 0) router.history.back();
          else if (to > 0) router.history.forward();
          return;
        }
        const [pathname, hashPart] = to.split("#");
        const [pathOnly, searchPart] = (pathname ?? "/").split("?");
        void router.navigate({
          href:
            (pathOnly || "/") + (searchPart ? `?${searchPart}` : "") + (hashPart ? `#${hashPart}` : ""),
          replace: options?.replace,
          state: (options?.state ?? undefined) as never,
        });
      }) as {
        (to: To, options?: NavigateOptions): void;
        (delta: number): void;
      },
    [router],
  );
}

export function useLocation() {
  const location = useTSLocation();
  return {
    pathname: location.pathname,
    search: location.searchStr ?? "",
    hash: location.hash ? `#${location.hash}` : "",
    state: (location.state ?? {}) as Record<string, unknown>,
    key: (location as unknown as { key?: string }).key ?? "default",
  };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  return useTSParams({ strict: false } as never) as T;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams) => void] {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const setParams = (next: URLSearchParams) => {
    const qs = next.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: true });
  };
  return [params, setParams];
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace, state, end: _end, children, ...rest }, ref) => (
    <TSLink
      ref={ref}
      to={to as never}
      replace={replace}
      state={(state ?? undefined) as never}
      {...rest}
    >
      {children}
    </TSLink>
  ),
);
Link.displayName = "Link";

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, className, children, end, replace, state, ...rest }, ref) => {
    const location = useLocation();
    const target = normalize(to.split("?")[0]?.split("#")[0] ?? "/");
    const current = normalize(location.pathname);
    const isActive = end === false ? current.startsWith(target) : current === target;
    const args = { isActive, isPending: false };
    return (
      <TSLink
        ref={ref}
        to={to as never}
        replace={replace}
        state={(state ?? undefined) as never}
        className={typeof className === "function" ? className(args) : className}
        {...rest}
      >
        {typeof children === "function" ? children(args) : children}
      </TSLink>
    );
  },
);
NavLink.displayName = "NavLink";

export function Navigate({ to, replace, state }: { to: To; replace?: boolean; state?: unknown }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace: replace ?? true, state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);
  return null;
}

export { Outlet };
