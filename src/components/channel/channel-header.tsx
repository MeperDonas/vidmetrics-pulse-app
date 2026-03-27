import Image from "next/image";
import { Users, Video, Eye } from "lucide-react";
import type { ChannelInfo } from "@/types/channel";
import { formatNumber } from "@/lib/utils";

interface ChannelHeaderProps {
  channel: ChannelInfo;
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 rounded-xl border border-border/60 bg-card card-surface">
      {channel.thumbnailUrl && (
        <div className="relative shrink-0">
          <Image
            src={channel.thumbnailUrl}
            alt={channel.title}
            width={56}
            height={56}
            className="rounded-full ring-2 ring-primary/20"
            unoptimized
          />
          {/* Online dot */}
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h2 className="font-extrabold text-base sm:text-lg leading-tight truncate text-foreground">
          {channel.title}
        </h2>
        {channel.customUrl && (
          <p className="text-sm text-muted-foreground mt-0.5">{channel.customUrl}</p>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-5 shrink-0 flex-wrap">
        <Stat
          icon={<Users className="h-3.5 w-3.5 text-blue-500" />}
          label="Subscribers"
          value={formatNumber(channel.subscriberCount)}
        />
        <div className="hidden sm:block h-6 w-px bg-border/60" />
        <Stat
          icon={<Video className="h-3.5 w-3.5 text-violet-500" />}
          label="Videos"
          value={formatNumber(channel.videoCount)}
        />
        <div className="hidden sm:block h-6 w-px bg-border/60" />
        <Stat
          icon={<Eye className="h-3.5 w-3.5 text-emerald-500" />}
          label="Total Views"
          value={formatNumber(channel.viewCount)}
        />
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <div className="flex items-center gap-1.5 text-muted-foreground/80">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className="font-extrabold text-sm text-foreground tabular-nums">{value}</span>
    </div>
  );
}
