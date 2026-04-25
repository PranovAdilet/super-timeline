import { Timeline } from "@/classes/timeline/timeline";
import { ITrackItem } from "@/shared/types/timeline";
export declare class TrackItemsMixin {
    addTrackItem(this: Timeline, object: any): void;
    alignItemsToTrack(this: Timeline): void;
    updateTrackItemsPosition(this: Timeline): void;
    restoreTrackItemPositions(): void;
    updateTrackItemsState(this: Timeline): void;
    deleteActiveTrackItem(this: Timeline): false | undefined;
    updateTrackItemsToHistory(this: Timeline): void;
    cloneActiveTrackItem(this: Timeline, options?: {
        trackItemId?: string;
    }): false | undefined;
    splitActiveTrackItem(this: Timeline, options: {
        trackItemId?: string;
        time: number;
    }): false | undefined;
    updateTrackItemCoords(this: Timeline, id: string): void;
    updateTrackItemDetails(this: Timeline, payload: Partial<ITrackItem>, options?: {
        trackItemId?: string;
    }): false | undefined;
    updateTrackItem(this: Timeline, payload: ITrackItem, options: {
        trackItemId: string;
    }): false | undefined;
    updateTrackItemsDetails(this: Timeline, payload: Partial<ITrackItem>[], options?: {
        trackItemIds?: string[];
    }): void;
    getTrackItems(this: Timeline): import("fabric/*").FabricObject<Partial<import("fabric/*").FabricObjectProps>, import("fabric/*").SerializedObjectProps, import("fabric/*").ObjectEvents>[];
    setActiveTrackItemCoords(this: Timeline): void;
    deleteTrackItemById(this: Timeline, itemIds: any[]): void;
    selectTrackItemByIds(this: Timeline, itemIds: any[]): void;
}
//# sourceMappingURL=track-item-mixin.d.ts.map