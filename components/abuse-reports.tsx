import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Clock } from "lucide-react"

const reports = [
  {
    id: 1,
    room: "#general:matrix.org",
    reporter: "@alice:matrix.org",
    reason: "Spam messages",
    severity: "low",
    age: "2m ago",
  },
  {
    id: 2,
    room: "#random:matrix.org",
    reporter: "@bob:matrix.org",
    reason: "Harassment",
    severity: "high",
    age: "14m ago",
  },
  {
    id: 3,
    room: "#support:matrix.org",
    reporter: "@carol:matrix.org",
    reason: "Inappropriate content",
    severity: "medium",
    age: "1h ago",
  },
  {
    id: 4,
    room: "#dev-team:matrix.org",
    reporter: "@dave:matrix.org",
    reason: "Doxxing attempt",
    severity: "high",
    age: "2h ago",
  },
]

const severityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  high: "destructive",
  medium: "outline",
  low: "secondary",
}

export function AbuseReports() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Abuse Reports
          </CardTitle>
          <CardDescription>Unreviewed reports needing attention</CardDescription>
        </div>
        <Badge variant="destructive" className="text-xs">
          {reports.length} open
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {reports.map((report) => (
          <div key={report.id} className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant={severityVariant[report.severity]} className="text-xs capitalize">
                  {report.severity}
                </Badge>
                <span className="text-xs text-muted-foreground truncate">{report.room}</span>
              </div>
              <span className="text-sm font-medium">{report.reason}</span>
              <span className="text-xs text-muted-foreground">by {report.reporter}</span>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {report.age}
              </span>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Review
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}