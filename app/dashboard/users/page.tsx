// app/dashboard/users/page.tsx
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { DataTable, mockUsers } from "@/components/data-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function UsersPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-xl font-semibold">Users</h1>
                <p className="text-sm text-muted-foreground">
                  Manage registered users on your homeserver
                </p>
              </div>
              <DataTable data={mockUsers} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}