import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stats`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function SectionCards() {
  const stats = await getStats()

  const cards = [
    {
      title: "Active Rooms",
      value: stats?.rooms?.toLocaleString() ?? "—",
      change: "+12.5%",
      trend: "up",
      description: "Trending up this month",
      sub: "Across all room types",
    },
    {
      title: "Registered Users",
      value: stats?.users?.toLocaleString() ?? "—",
      change: "+8%",
      trend: "up",
      description: "Growing steadily",
      sub: "Total accounts on server",
    },
    {
      title: "Total Messages",
      value: stats?.messages?.toLocaleString() ?? "—",
      change: "+12.5%",
      trend: "up",
      description: "Strong engagement",
      sub: "All time message count",
    },
    {
      title: "Federated Servers",
      value: stats?.federatedServers?.toLocaleString() ?? "—",
      change: "+4.5%",
      trend: "up",
      description: "Steady growth",
      sub: "Meets federation targets",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.title} className="@container/card">
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {card.trend === "up" ? <TrendingUpIcon /> : <TrendingDownIcon />}
                {card.change}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.description}
              {card.trend === "up" ? (
                <TrendingUpIcon className="size-4" />
              ) : (
                <TrendingDownIcon className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">{card.sub}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}