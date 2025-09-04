"use client";

import type { UIEvent } from "react";
import React, { useEffect, useRef, useState } from "react";

import { useCurrentPlayerFrame } from "@/shared/hooks";
import useStore from "@/shared/store/store";
import * as ScrollArea from "@radix-ui/react-scroll-area";

import Ruler from "../ruler";
import Header from "../header";
import Playhead from "../playhead";
import { Timeline as CanvasTimeline } from "@/classes/timeline/timeline";
import { Helper, Image, Text, Track, Video, Audio } from "@/classes/items";
import eventBus from "@/classes/timeline/events/event-bus";
import { filter } from "rxjs";
import {
  TIMELINE_BOUNDING_CHANGED,
  TIMELINE_PREFIX,
} from "@/classes/timeline/events/constants-events";
import { timeMsToUnits, unitsToTimeMs } from "@/shared/utils";
import {
  TIMELINE_OFFSET_CANVAS_LEFT,
  TIMELINE_OFFSET_CANVAS_RIGHT,
} from "@/shared/constants";
import { handleEvents } from "@/classes/timeline/events/handle-events";
import { StateManager } from "@/classes/state";
import "./styles.css";

CanvasTimeline.registerItems({
  Text,
  Image,
  Video,
  Audio,

  Track,
  Helper,
});

const Timeline = ({ stateManager }: { stateManager: StateManager }) => {
  // const canScrollRef = useRef(false);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<CanvasTimeline | null>(null);
  const verticalScrollbarVpRef = useRef<HTMLDivElement>(null);
  const horizontalScrollbarVpRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const {
    scale,
    playerRef,
    fps,

    setState,
    timeline,
  } = useStore();
  const { setTimeline } = useStore();
  const store = useStore((state) => state);
  const currentFrame = useCurrentPlayerFrame(playerRef ?? undefined);

  const onScroll = (v: { scrollTop: number; scrollLeft: number }) => {
    if (horizontalScrollbarVpRef.current && verticalScrollbarVpRef.current) {
      verticalScrollbarVpRef.current.scrollTop = -v.scrollTop;
      horizontalScrollbarVpRef.current.scrollLeft = -v.scrollLeft;
      setScrollLeft(-v.scrollLeft);
    }
  };

  useEffect(() => {
    const position = timeMsToUnits((currentFrame / fps) * 1000, scale.zoom);
    const canvasBoudingX =
      canvasElRef.current?.getBoundingClientRect().x! +
      canvasElRef.current?.clientWidth!;
    const playHeadPos = position - scrollLeft + 40;
    if (playHeadPos >= canvasBoudingX) {
      const scrollDivWidth = horizontalScrollbarVpRef.current?.clientWidth!;
      const totalScrollWidth = horizontalScrollbarVpRef.current?.scrollWidth!;
      const currentPosScroll = horizontalScrollbarVpRef.current?.scrollLeft!;
      const availableScroll =
        totalScrollWidth - (scrollDivWidth + currentPosScroll);
      const scaleScroll = availableScroll / scrollDivWidth;
      if (scaleScroll >= 0) {
        if (scaleScroll > 1)
          horizontalScrollbarVpRef.current?.scrollTo({
            left: currentPosScroll + scrollDivWidth,
          });
        else
          horizontalScrollbarVpRef.current?.scrollTo({
            left: totalScrollWidth - scrollDivWidth,
          });
      }
    }
  }, [currentFrame]);

  useEffect(() => {
    const canvasEl = canvasElRef.current;
    const containerEl = containerRef.current;
    if (!canvasEl || !containerEl) return;

    const containerWidth = containerEl.clientWidth;
    const containerHeight = containerEl.clientHeight;

    const canvas = new CanvasTimeline(canvasEl, {
      width: containerWidth,
      height: containerHeight,
      bounding: {
        width: containerWidth,
        height: 0,
      },
      selectionColor: "rgba(0, 216, 214,0.1)",
      selectionBorderColor: "rgba(0, 216, 214,1.0)",
      onScroll,
      // tScale: scale.zoom,
      store,
      state: stateManager,
      scale,
      spacing: {
        left: TIMELINE_OFFSET_CANVAS_LEFT,
        right: TIMELINE_OFFSET_CANVAS_RIGHT,
      },
    });

    const eventsHandler = handleEvents(canvas);

    canvasRef.current = canvas;

    setCanvasSize({
      width: containerWidth,
      height: containerHeight,
    });
    setSize({
      width: containerWidth,
      height: 0,
    });
    setTimeline(canvas);

    const resizeDesignSubscription = stateManager.subscribeToSize(
      (newState: any) => {
        setState(newState);
      }
    );
    const scaleSubscription = stateManager.subscribeToScale((newState: any) => {
      setState(newState);
    });

    const tracksSubscription = stateManager.subscribeToTracks(
      (newState: any) => {
        setState(newState);
      }
    );
    const durationSubscription = stateManager.subscribeToDuration(
      (newState: any) => {
        setState(newState);
      }
    );

    const updateTrackItemsMap = stateManager.subscribeToUpdateTrackItem(() => {
      const currentState = stateManager.getState();

      setState({
        duration: currentState.duration,
        trackItemsMap: currentState.trackItemsMap,
      });
    });

    const updateTracksSettings = stateManager.subscribeToUpdateTracksSettings(
      () => {
        const currentState = stateManager.getState();

        setState({
          tracksSettings: currentState.tracksSettings,
        });
      }
    );

    const itemsDetailsSubscription = stateManager.subscribeToAddOrRemoveItems(
      () => {
        const currentState = stateManager.getState();

        setState({
          trackItemDetailsMap: currentState.trackItemDetailsMap,
          trackItemsMap: currentState.trackItemsMap,
          trackItemIds: currentState.trackItemIds,
          tracks: currentState.tracks,
          tracksSettings: currentState.tracksSettings,
        });
      }
    );

    const updateItemDetailsSubscription =
      stateManager.subscribeToUpdateItemDetails(() => {
        const currentState = stateManager.getState();
        setState({
          trackItemDetailsMap: currentState.trackItemDetailsMap,
        });
      });

    return () => {
      eventsHandler.unsubscribe();
      canvas.purge();

      scaleSubscription.unsubscribe();
      tracksSubscription.unsubscribe();
      durationSubscription.unsubscribe();
      itemsDetailsSubscription.unsubscribe();
      updateTrackItemsMap.unsubscribe();
      updateItemDetailsSubscription.unsubscribe();
      resizeDesignSubscription.unsubscribe();
      updateTracksSettings.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const addEvents = eventBus.subject.pipe(
      filter(({ key }) => key.startsWith(TIMELINE_PREFIX))
    );

    const subscription = addEvents.subscribe((obj) => {
      if (obj.key === TIMELINE_BOUNDING_CHANGED) {
        const bounding = obj.value?.payload?.bounding;
        if (bounding) {
          setSize({
            width: bounding.width,
            height: bounding.height,
          });
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleOnScrollH = (e: any) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const canvas: any = canvasRef.current!;
    canvas.scrollTo({ scrollLeft });
    setScrollLeft(scrollLeft);
  };

  const handleOnScrollV = (e: any) => {
    const scrollTop = e.currentTarget.scrollTop;
    const canvas: any = canvasRef.current!;
    canvas.scrollTo({ scrollTop });
  };

  useEffect(() => {
    const availableScroll = horizontalScrollbarVpRef.current?.scrollWidth;
    if (!availableScroll || !timeline) return;
    const canvasWidth = timeline.width;
    if (availableScroll < canvasWidth + scrollLeft) {
      timeline.scrollTo({ scrollLeft: availableScroll - canvasWidth } as any);
    }
  }, [scale]);

  const onClickRuler = (units: number) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const time = unitsToTimeMs(units, scale.zoom);
    playerRef?.current?.seekTo((time * fps) / 1000);
  };

  return (
    <div className="relative overflow-hidden h-80 w-full">
      <Header />
      <Ruler
        onClick={onClickRuler}
        scrollLeft={scrollLeft}
      />
      <Playhead scrollLeft={scrollLeft} />
      <div className="flex size-full">
        <div className="relative w-10 flex-none"></div>
        <div className="relative h-[230px] flex-1">
          <div
            ref={containerRef}
            className="absolute top-0 h-[230px] w-full text-sm text-white "
          >
            <canvas
              ref={canvasElRef}
              id="designcombo-timeline-canvas"
            />
          </div>
          <ScrollArea.Root
            type="always"
            style={{
              position: "absolute",
              width: "calc(100vw - 40px)",
              height: "10px",
            }}
            className="ScrollAreaRootH"
          >
            <ScrollArea.Viewport
              onScroll={handleOnScrollH}
              className="ScrollAreaViewport"
              id="viewportH"
              ref={horizontalScrollbarVpRef}
            >
              <div
                style={{
                  width:
                    size.width > canvasSize.width
                      ? size.width + TIMELINE_OFFSET_CANVAS_RIGHT
                      : size.width,
                }}
                className="pointer-events-none h-[10px]"
              ></div>
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar
              className="ScrollAreaScrollbar"
              orientation="horizontal"
            >
              <ScrollArea.Thumb className="ScrollAreaThumb" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          <ScrollArea.Root
            type="always"
            style={{
              position: "absolute",
              height: "230px",
              width: "10px",
            }}
            className="ScrollAreaRootV"
          >
            <ScrollArea.Viewport
              onScroll={handleOnScrollV}
              className="ScrollAreaViewport"
              ref={verticalScrollbarVpRef}
            >
              <div
                style={{
                  height:
                    size.height > canvasSize.height
                      ? size.height + 40
                      : canvasSize.height,
                }}
                className="pointer-events-none w-[10px]"
              ></div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="ScrollAreaScrollbar"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="ScrollAreaThumb" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
