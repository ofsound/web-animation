import { type ReactNode } from "react";
type CopyResult = "success" | "error";
interface AnimationCardProps {
    /** Demo id; metadata (title, description, code, etc.) is read from animationDemoMetaById */
    id: string;
    /** The live preview (JSX) for the animation demo */
    children: ReactNode;
    accent?: string;
    onCopyResult?: (result: CopyResult, demoId: string) => void;
}
export declare function AnimationCard({ id, children, accent, onCopyResult, }: AnimationCardProps): import("react/jsx-runtime").JSX.Element;
export {};
