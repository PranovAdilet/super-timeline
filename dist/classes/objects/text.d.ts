import { IDisplay } from "@/shared/types";
import { Rect, Control, RectProps } from "fabric";
export interface TextProps extends Pick<RectProps, "width" | "height" | "top" | "left"> {
    id: string;
    text: string;
    tScale: number;
    display: IDisplay;
    backgroundColor: string;
}
export declare class TextObject extends Rect {
    isSelected: boolean;
    text?: string;
    tScale?: number;
    display?: any;
    id: string;
    backgroundColor: string;
    static ownDefaults: {
        rx: number;
        ry: number;
        objectCaching: boolean;
        borderColor: string;
        stroke: string;
        strokeWidth: number;
        fill: string;
        borderOpacityWhenMoving: number;
        hoverCursor: string;
        fontSize: number;
        fontFamily: string;
        fontColor: string;
        textAlign: string;
    };
    static type: string;
    constructor(options: TextProps);
    static createControls(): {
        controls: {
            mr: Control;
            ml: Control;
        };
    };
    static getDefaults(): {
        rx: number;
        ry: number;
        objectCaching: boolean;
        borderColor: string;
        stroke: string;
        strokeWidth: number;
        fill: string;
        borderOpacityWhenMoving: number;
        hoverCursor: string;
        fontSize: number;
        fontFamily: string;
        fontColor: string;
        textAlign: string;
    };
    setSelected(isSelected: boolean): void;
    _render(ctx: CanvasRenderingContext2D): void;
    updateSelected(ctx: CanvasRenderingContext2D): void;
}
export declare function renderControl(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any): void;
export declare function createResizeControls(): {
    mr: Control;
    ml: Control;
};
export declare const handleResize: import("fabric/*").TransformActionHandler<import("fabric/*").Transform>;
export declare const positionOffsets: {
    left: number;
    top: number;
    center: number;
    bottom: number;
    right: number;
};
export declare const getOffset: (position: any) => number;
//# sourceMappingURL=text.d.ts.map