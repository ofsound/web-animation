export type DemoSource = "css" | "tailwind";
export type DemoFileKind = "html" | "css" | "js";
export type PersistedDemoFileKind = DemoFileKind | "tailwind_css";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface DemoCategory {
  id: string;
  type: DemoSource;
  slug: string;
  label: string;
  icon: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DemoFileRecord {
  id: string;
  demoId: string;
  fileKind: PersistedDemoFileKind;
  content: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DemoRecord {
  id: string;
  source: DemoSource;
  categoryId: string;
  slug: string;
  title: string;
  description: string;
  status: "published";
  difficulty: string | null;
  support: string | null;
  sortOrder: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  files: DemoFileRecord[];
}

export interface DemoDraft {
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  support: string;
  files: Record<DemoFileKind, string>;
}

export const FILE_KIND_ORDER: DemoFileKind[] = [
  "html",
  "css",
  "js",
];

export const FILE_KIND_LABEL: Record<DemoFileKind, string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
};
