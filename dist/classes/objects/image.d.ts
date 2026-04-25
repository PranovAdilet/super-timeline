import { Rect, RectProps } from "fabric";
import { IDisplay } from "@/shared/types";
export interface ImageProps extends Pick<RectProps, "width" | "height" | "left" | "top"> {
    id: string;
    src: string;
    tScale: number;
    display: IDisplay;
}
declare class ImageClass extends Rect {
    isSelected: boolean;
    tScale?: number;
    display?: any;
    id: string;
    src: string;
    itemType: string;
    static ownDefaults: {
        rx: number;
        ry: number;
        objectCaching: boolean;
        borderColor: string;
        stroke: string;
        strokeWidth: number;
        borderOpacityWhenMoving: number;
        hoverCursor: string;
        fill: string;
    };
    static type: string;
    constructor(config: ImageProps);
    static createControls(): {
        controls: {
            mr: import("fabric/*").Control;
            ml: import("fabric/*").Control;
        };
    };
    static getDefaults(): {
        rx: number;
        ry: number;
        objectCaching: boolean;
        borderColor: string;
        stroke: string;
        strokeWidth: number;
        borderOpacityWhenMoving: number;
        hoverCursor: string;
        fill: string;
    };
    _render(context: CanvasRenderingContext2D): void;
    setSelected(isSelected: boolean): void;
    updateSelected(context: CanvasRenderingContext2D): void;
}
export declare const ImageObject: typeof ImageClass;
export {};
//# sourceMappingURL=image.d.ts.map