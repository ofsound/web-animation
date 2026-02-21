import type { ComponentType } from "react";
import type { SupportLevel } from "../components/SupportBadge";
export interface DemoDefinition {
    id: string;
    title: string;
    description: string;
    support: SupportLevel;
    code: string;
    Component: ComponentType;
}
export interface DemoCategory {
    id: string;
    title: string;
    demos: DemoDefinition[];
}
export declare const demoCategories: DemoCategory[];
