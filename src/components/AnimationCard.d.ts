import { type ReactNode } from "react";
import { type AnimationDemo } from "../data/animations";
type CopyResult = "success" | "error";
interface AnimationCardProps {
    /** Demo id; metadata (title, description, code, etc.) is read from animationDemoMetaById */
    id: string;
    /** The live preview (JSX) for the animation demo */
    children: ReactNode;
    /** Optional metadata override for external demo datasets (for example CSS demos). */
    metadataOverride?: Pick<AnimationDemo, "title" | "description" | "code">;
    accent?: string;
    onCopyResult?: (result: CopyResult, demoId: string) => void;
}
export declare function AnimationCard({ id, children, metadataOverride, accent, onCopyResult, }: AnimationCardProps): import("react/jsx-runtime").JSX.Element;
export {};
