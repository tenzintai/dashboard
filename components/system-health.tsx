import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ServerIcon,
  UsersIcon,
  ActivityIcon,
  GlobeIcon,
  ImageIcon,
  DatabaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  ClockIcon,
} from "lucide-react"

async function getHealth() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/health`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}

function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
  status,
}: {
  title: string
  value: string | number
  sub: string
  icon: any
  status?: "up" | "down" | "warning" | "neutral"
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          {status === "up" && <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
          {status === "down" && <XCircleIcon className="h-5 w-5 text-destructive" />}
          {status === "warning" && <ClockIcon className="h-5 w-5 text-yellow-500" />}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

export async function SystemHealth() {
  const data = await getHealth()

  if (!data || data.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Could not connect to Prometheus</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { server, sync, federation, media, roomserver, cache } = data

  return (
    <div className="flex flex-col gap-8">

      {/* Server */}
      <div>
        <SectionHeader title="Server" description="Core homeserver status" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Dendrite Status"
            value={server.up ? "Online" : "Offline"}
            sub={server.up ? "Homeserver is running" : "Homeserver is down"}
            icon={ServerIcon}
            status={server.up ? "up" : "down"}
          />
          <MetricCard
            title="Registered Users"
            value={Number(server.registeredUsers ?? 0).toLocaleString()}
            sub="Total accounts on homeserver"
            icon={UsersIcon}
            status="neutral"
          />
          <MetricCard
            title="Cache Hit Ratio"
            value={cache.ratio ? `${(Number(cache.ratio) * 100).toFixed(1)}%` : "N/A"}
            sub="Ristretto cache efficiency"
            icon={DatabaseIcon}
            status="neutral"
          />
          <MetricCard
            title="Room Backpressure"
            value={Number(roomserver.backpressure ?? 0).toLocaleString()}
            sub="Events queued in roomserver"
            icon={ActivityIcon}
            status={Number(roomserver.backpressure) > 100 ? "warning" : "up"}
          />
        </div>
      </div>

      {/* Sync */}
      <div>
        <SectionHeader title="Sync API" description="Client sync connections" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Active Sync Requests"
            value={Number(sync.activeRequests ?? 0).toLocaleString()}
            sub="Currently syncing clients"
            icon={RefreshCwIcon}
            status="neutral"
          />
          <MetricCard
            title="Waiting Sync Requests"
            value={Number(sync.waitingRequests ?? 0).toLocaleString()}
            sub="Clients waiting for events"
            icon={ClockIcon}
            status={Number(sync.waitingRequests) > 50 ? "warning" : "neutral"}
          />
        </div>
      </div>

      {/* Federation */}
      <div>
        <SectionHeader title="Federation" description="Server-to-server communication" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Queues"
            value={Number(federation.totalQueues ?? 0).toLocaleString()}
            sub="Federation destination queues"
            icon={GlobeIcon}
            status="neutral"
          />
          <MetricCard
            title="Running Queues"
            value={Number(federation.runningQueues ?? 0).toLocaleString()}
            sub="Active federation queues"
            icon={ActivityIcon}
            status="neutral"
          />
          <MetricCard
            title="Backing Off"
            value={Number(federation.backingOff ?? 0).toLocaleString()}
            sub="Servers in backoff state"
            icon={ClockIcon}
            status={Number(federation.backingOff) > 0 ? "warning" : "up"}
          />
        </div>
      </div>

      {/* Media */}
      <div>
        <SectionHeader title="Media" description="File upload and download activity" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Media Downloads"
            value={Number(media.downloads ?? 0).toLocaleString()}
            sub="Total files downloaded"
            icon={ImageIcon}
            status="neutral"
          />
          <MetricCard
            title="Thumbnails Generated"
            value={Number(media.thumbnails ?? 0).toLocaleString()}
            sub="Total thumbnails created"
            icon={ImageIcon}
            status="neutral"
          />
        </div>
      </div>

    </div>
  )
}