import {
  HISTORY_REDO,
  HISTORY_UNDO,
  SCENE_RESIZE,
} from "@/classes/timeline/events/constants-events";
import eventBus from "@/classes/timeline/events/event-bus";
import { Button, Popover } from "@/shared/ui";
import { Icons } from "../menu-list/icons";
import { useEffect, useState } from "react";
import { useStore } from "@/shared";
import { v4 as uuid } from "uuid";
import { ChevronDown, Download } from "lucide-react";
import { Label } from "@radix-ui/themes/dist/cjs/components/context-menu";
import { Progress, Spinner } from "@radix-ui/themes";

export default function Navbar() {
  const handleUndo = () => {
    eventBus.dispatch(HISTORY_UNDO);
  };

  const handleRedo = () => {
    eventBus.dispatch(HISTORY_REDO);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 320px",
      }}
      className="pointer-events-none absolute left-0 right-0 top-0 z-[205] flex h-[72px] items-center px-2"
    >
      <div className="pointer-events-auto flex h-14 items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-background">
          {/* <img
            src={logo.src}
            alt="logo"
            className="p-1"
          /> */}
        </div>
        <HistoryButtons />
      </div>
      <div className="pointer-events-auto flex h-14 items-center justify-center gap-2">
        <div className="flex h-12 items-center gap-4 rounded-md bg-background px-2.5">
          <div className="px-1 text-sm font-medium">Untitled video</div>
          <ResizeVideo />
        </div>
      </div>
      <div className="pointer-events-auto flex h-14 items-center justify-end gap-2">
        <div className="flex h-12 items-center gap-2 rounded-md bg-background px-2.5">
          <DownloadPopover />
        </div>
      </div>
    </div>
  );
}

interface ResizeOptionProps {
  label: string;
  icon: string;
  value: ResizeValue;
  description: string;
}

interface ResizeValue {
  width: number;
  height: number;
  name: string;
}

const RESIZE_OPTIONS: ResizeOptionProps[] = [
  {
    label: "16:9",
    icon: "landscape",
    description: "YouTube ads",
    value: {
      width: 1920,
      height: 1080,
      name: "16:9",
    },
  },
  {
    label: "9:16",
    icon: "portrait",
    description: "TikTok, YouTube Shorts",
    value: {
      width: 1080,
      height: 1920,
      name: "9:16",
    },
  },
  {
    label: "1:1",
    icon: "square",
    description: "Instagram, Facebook posts",
    value: {
      width: 1080,
      height: 1080,
      name: "1:1",
    },
  },
];

export const ResizeVideo = () => {
  const handleResize = (options: ResizeValue) => {
    eventBus.dispatch(SCENE_RESIZE, {
      payload: {
        ...options,
      },
    });
  };
  return (
    <div className="text-sm">
      <Popover
        trigger={
          <Button className="border border-border" variant="secondary">
            Resize
          </Button>
        }
      >
        {RESIZE_OPTIONS.map((option, index) => (
          <ResizeOption
            key={index}
            label={option.label}
            icon={option.icon}
            value={option.value}
            handleResize={handleResize}
            description={option.description}
          />
        ))}
      </Popover>
    </div>
  );
};

export const HistoryButtons = () => {
  const handleUndo = () => {
    eventBus.dispatch(HISTORY_UNDO);
  };

  const handleRedo = () => {
    eventBus.dispatch(HISTORY_REDO);
  };

  return (
    <div className="flex h-12 items-center bg-background px-1.5">
      <Button
        onClick={handleUndo}
        className="text-muted-foreground"
        variant="ghost"
        size="icon"
      >
        <Icons.undo width={20} />
      </Button>
      <Button
        onClick={handleRedo}
        className="text-muted-foreground"
        variant="ghost"
        size="icon"
      >
        <Icons.redo width={20} />
      </Button>
    </div>
  );
};

const ResizeOption = ({
  label,
  icon,
  value,
  description,
  handleResize,
}: ResizeOptionProps & { handleResize: (payload: ResizeValue) => void }) => {
  const Icon = Icons[icon as "text"];
  return (
    <div
      onClick={() => handleResize(value)}
      className="flex cursor-pointer items-center rounded-md p-2 hover:bg-zinc-50/10"
    >
      <div className="w-8 text-muted-foreground">
        <Icon size={20} />
      </div>
      <div>
        <div>{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
};

const baseUrl = "http://localhost:8000";
const size = {
  width: 1080,
  height: 1920,
};

interface IDownloadState {
  renderId: string;
  progress: number;
  isDownloading: boolean;
}
export const DownloadPopover = ({
  onExport,
  isPending,
}: {
  onExport?: (data: any) => void;
  isPending?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [downloadState, setDownloadState] = useState<IDownloadState>({
    progress: 0,
    isDownloading: false,
    renderId: "",
  });
  const {
    tracks,
    trackItemIds,
    trackItemsMap,
    trackItemDetailsMap,
    transitionsMap,
    transitionIds,
    tracksSettings,
    fps,
  } = useStore();

  const handleExport = () => {
    const data: any = {
      id: uuid(),
      fps,
      size,
      tracks,
      trackItemDetailsMap,
      trackItemIds,
      transitionsMap,
      trackItemsMap,
      transitionIds,
      tracksSettings,
    };
    onExport?.(data);
    console.log(JSON.stringify(data));
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (downloadState.renderId) {
      interval = setInterval(() => {
        fetch(`${baseUrl}/status/${downloadState.renderId}`)
          .then((res) => res.json())
          .then(({ render: { progress, output } }) => {
            if (progress === 100) {
              clearInterval(interval);
              setDownloadState({
                ...downloadState,
                renderId: "",
                progress: 0,
                isDownloading: false,
              });
              download(output, `${downloadState.renderId}`);
              setOpen(false);
            } else {
              setDownloadState({
                ...downloadState,
                progress,
                isDownloading: true,
              });
            }
          });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [downloadState.renderId]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          className="flex h-9 w-9 gap-1 border border-border"
          size="icon"
          variant="secondary"
        >
          <Download width={18} />
        </Button>
      }
    >
      {downloadState.isDownloading ? (
        <>
          <Label>Downloading</Label>
          <div className="flex items-center gap-2">
            <Progress
              className="h-2 rounded-sm"
              value={downloadState.progress}
            />
            <div className="rounded-sm border border-border p-1 text-sm text-zinc-400">
              {parseInt(downloadState.progress.toString())}%
            </div>
          </div>
          <div>
            <Button className="w-full">Copy link</Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <Label>Export settings</Label>
          <Button className="w-full justify-between" variant="outline">
            <div>MP4</div>
            <ChevronDown width={16} />
          </Button>
          <div>
            <Button onClick={handleExport} className="w-full">
              {isPending ? <Spinner /> : "Export"}
            </Button>
          </div>
        </div>
      )}
    </Popover>
  );
};

export const download = (url: string, filename: string) => {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => console.error("Download error:", error));
};
