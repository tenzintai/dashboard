"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Hash, GlobeIcon, LayoutDashboardIcon, ImageIcon, ShieldAlertIcon, ServerIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon } from "lucide-react"

const data = {
  user: {
    name: "admin",
    email: "m@example.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon/>
      ),
    },
    {
      title: "Rooms",
      url: "/dashboard/rooms",
      icon: <Hash />,
      items: [
        { title: "All Rooms", url: "/dashboard/rooms" },
        { title: "Public Rooms", url: "/dashboard/rooms/public" },
        { title: "Create Room", url: "/dashboard/rooms/create" },
      ],
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: <UsersIcon />,
      items: [
        { title: "All Users", url: "/dashboard/users" },
        { title: "Deactivated", url: "/dashboard/users/deactivated" },
        { title: "Admins", url: "/dashboard/users/admins" },
      ],
    },
    {
      title: "Federation",
      url: "/dashboard/federation",
      icon: <GlobeIcon />,
      items: [
        { title: "Connected Servers", url: "/dashboard/federation" },
        { title: "Block / Allow List", url: "/dashboard/federation/acl" },
      ],
    },
    {
      title: "Media",
      url: "/dashboard/media",
      icon: <ImageIcon />,
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: <ShieldAlertIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings2Icon />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Search",
      url: "#",
      icon: <SearchIcon />,
    },
  ],
  documents: [
    {
      name: "Server Info",
      url: "/dashboard/server",
      icon: <ServerIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="dashboard">
                <ServerIcon className="size-5!" />
                <span className="text-base font-semibold">Admin Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
