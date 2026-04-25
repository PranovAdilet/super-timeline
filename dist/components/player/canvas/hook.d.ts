import type { Canvas, FabricObject } from "fabric";
type Props = {
    onChange?: (object: FabricObject) => void;
};
export declare const useFabricEditor: ({ onChange }: Props) => {
    selectedObjects: FabricObject<Partial<import("fabric/*").FabricObjectProps>, import("fabric/*").SerializedObjectProps, import("fabric/*").ObjectEvents>[];
    handleReady: (canvas: Canvas) => void;
    editor: {
        canvas: Canvas;
        updateText(object: import("fabric/*").Textbox, options?: Partial<import("fabric/*").TextboxProps & {
            text: string;
        }>): void;
        getActiveText(): import("fabric/*").Textbox<any, any, any> | undefined;
        exportObjects(): any;
    } | undefined;
};
export {};
//# sourceMappingURL=hook.d.ts.map