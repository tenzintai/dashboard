import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hash } from "lucide-react"

const rooms = [
  { name: "general", id: "!abc123:matrix.org", members: 342, messages: 8432, type: "public" },
  { name: "support", id: "!def456:matrix.org", members: 218, messages: 5210, type: "public" },
  { name: "announcements", id: "!ghi789:matrix.org", members: 891, messages: 1023, type: "public" },
  { name: "dev-team", id: "!jkl012:matrix.org", members: 34, messages: 3847, type: "private" },
  { name: "random", id: "!mno345:matrix.org", members: 156, messages: 2991, type: "public" },
]

export function TopRooms() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Active Rooms</CardTitle>
        <CardDescription>Most messages in the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{room.name}</span>
                <span className="text-xs text-muted-foreground truncate">{room.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-muted-foreground">{room.members} members</span>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {room.messages.toLocaleString()} msg
              </Badge>
              <Badge variant={room.type === "public" ? "outline" : "secondary"} className="text-xs">
                {room.type}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}