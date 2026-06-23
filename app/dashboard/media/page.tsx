import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MediaTable } from "@/components/media-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

async function getMedia() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/media`, {
    cache: "no-store",
  })
  if (!res.ok) return []
  return res.json()
}

export default async function MediaPage() {
  const media = await getMedia()

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-xl font-semibold">Media</h1>
                <p className="text-sm text-muted-foreground">
                  Manage uploaded files on your homeserver
                </p>
              </div>
              <MediaTable data={media} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}