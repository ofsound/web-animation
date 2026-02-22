import type { ComponentType } from "react";

export type CategoryIconName =
  | "pointer"
  | "spark"
  | "loader"
  | "type"
  | "layers";

export interface Category<TId extends string = string> {
  id: TId;
  label: string;
  icon: CategoryIconName;
  description: string;
}

export type DemoSource = "tailwind" | "css" | "database";
export type DemoDifficulty = "Basic" | "Intermediate" | "Advanced";

export type SupportLevel =
  | "widely-available"
  | "baseline-2024"
  | "new-2025"
  | "experimental";

export interface Demo<
  TCategoryId extends string = string,
  TSource extends DemoSource = DemoSource,
> {
  id: string;
  categoryId: TCategoryId;
  title: string;
  description: string;
  code: string;
  Component: ComponentType;
  source: TSource;
  difficulty?: DemoDifficulty;
  support?: SupportLevel;
}
