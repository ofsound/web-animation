import type { GalleryRegistry, GalleryMode } from "../data/demoRegistry";

export type { GalleryMode, GalleryRegistry };
export const DEFAULT_MODE: GalleryMode = "tailwind";

export type ParsedRoute =
  | { kind: "mode"; mode: GalleryMode }
  | {
      kind: "demo";
      mode: GalleryMode;
      demoId: string;
      canonicalPath: string;
      isCanonical: boolean;
    }
  | { kind: "invalid"; redirectPath: string };

export function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tagName = target.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }

  return target.closest('[contenteditable="true"], [role="textbox"]') !== null;
}

export function parseRoute(
  pathname: string,
  galleryRegistry: GalleryRegistry,
): ParsedRoute {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { kind: "invalid", redirectPath: `/${DEFAULT_MODE}` };
  }

  const [modeSegment, slugSegment, ...rest] = segments;
  if (modeSegment !== "tailwind" && modeSegment !== "css") {
    return { kind: "invalid", redirectPath: `/${DEFAULT_MODE}` };
  }
  const mode: GalleryMode = modeSegment;

  if (segments.length === 1) {
    return { kind: "mode", mode };
  }

  if (!slugSegment || rest.length > 0) {
    return { kind: "invalid", redirectPath: `/${mode}` };
  }

  let decodedSlug = slugSegment;
  try {
    decodedSlug = decodeURIComponent(slugSegment);
  } catch {
    return { kind: "invalid", redirectPath: `/${mode}` };
  }

  const resolved = galleryRegistry.resolveDemoFromRoute(mode, decodedSlug);
  if (!resolved) {
    return { kind: "invalid", redirectPath: `/${mode}` };
  }

  const canonicalPath = galleryRegistry.getDemoRoutePath(mode, resolved.demoId);
  return {
    kind: "demo",
    mode,
    demoId: resolved.demoId,
    canonicalPath,
    isCanonical: decodedSlug === resolved.canonicalSlug,
  };
}
