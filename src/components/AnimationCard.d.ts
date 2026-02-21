import { type ReactNode } from "react";
type CopyResult = "success" | "error";
export interface DemoMetadata {
    title: string;
    description: string;
    code: string;
}
interface AnimationCardProps {
    id: string;
    metadata: DemoMetadata;
    children: ReactNode;
    accent?: string;
    onCopyResult?: (result: CopyResult, demoId: string) => void;
}
export declare function AnimationCard({ id, metadata, children, accent, onCopyResult, }: AnimationCardProps): import("react/jsx-runtime").JSX.Element;
export {};
