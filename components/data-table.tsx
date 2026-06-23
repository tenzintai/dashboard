"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GripVerticalIcon,
  EllipsisVerticalIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  ShieldCheckIcon,
  CircleUserIcon,
  Hash,
  MonitorSmartphoneIcon,
  ShieldAlertIcon,
  SearchIcon,
} from "lucide-react"

// ─── Schema ───────────────────────────────────────────────────────────────────

export const schema = z.object({
  id: z.number(),
  displayName: z.string(),
  matrixId: z.string(),
  status: z.enum(["active", "deactivated", "suspended"]),
  isAdmin: z.boolean(),
  rooms: z.number(),
  lastSeen: z.string(),
  registered: z.string(),
})

type User = z.infer<typeof schema>

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const mockUsers: User[] = [
  { id: 1, displayName: "Alice Chen", matrixId: "@alice:matrix.org", status: "active", isAdmin: true, rooms: 12, lastSeen: "Just now", registered: "2023-01-15" },
  { id: 2, displayName: "Bob Martinez", matrixId: "@bob:matrix.org", status: "active", isAdmin: false, rooms: 7, lastSeen: "5m ago", registered: "2023-03-22" },
  { id: 3, displayName: "Carol White", matrixId: "@carol:matrix.org", status: "suspended", isAdmin: false, rooms: 3, lastSeen: "2h ago", registered: "2023-05-10" },
  { id: 4, displayName: "Dave Kim", matrixId: "@dave:matrix.org", status: "active", isAdmin: false, rooms: 21, lastSeen: "1h ago", registered: "2022-11-08" },
  { id: 5, displayName: "Eve Johnson", matrixId: "@eve:matrix.org", status: "deactivated", isAdmin: false, rooms: 0, lastSeen: "30d ago", registered: "2022-08-19" },
  { id: 6, displayName: "Frank Lee", matrixId: "@frank:matrix.org", status: "active", isAdmin: false, rooms: 5, lastSeen: "20m ago", registered: "2023-07-01" },
  { id: 7, displayName: "Grace Patel", matrixId: "@grace:matrix.org", status: "active", isAdmin: true, rooms: 18, lastSeen: "3m ago", registered: "2022-06-14" },
  { id: 8, displayName: "Hiro Tanaka", matrixId: "@hiro:matrix.org", status: "active", isAdmin: false, rooms: 9, lastSeen: "45m ago", registered: "2023-09-30" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: User["status"] }) {
  const map = {
    active: "default",
    deactivated: "secondary",
    suspended: "destructive",
  } as const
  return (
    <Badge variant={map[status]} className="capitalize text-xs">
      {status}
    </Badge>
  )
}

// ─── Drag Handle ──────────────────────────────────────────────────────────────

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<User>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "displayName",
    header: "User",
    cell: ({ row }) => <UserCellViewer user={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "isAdmin",
    header: "Role",
    cell: ({ row }) =>
      row.original.isAdmin ? (
        <Badge variant="outline" className="gap-1 text-xs">
          <ShieldCheckIcon className="size-3 text-primary" /> Admin
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">User</span>
      ),
  },
  {
    accessorKey: "rooms",
    header: "Rooms",
    cell: ({ row }) => (
      <span className="flex items-center gap-1 text-sm tabular-nums">
        <Hash className="size-3 text-muted-foreground" />
        {row.original.rooms}
      </span>
    ),
  },
  {
    accessorKey: "lastSeen",
    header: "Last Seen",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.lastSeen}</span>
    ),
  },
  {
    accessorKey: "registered",
    header: "Registered",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.registered}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
              <EllipsisVerticalIcon className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(user.matrixId)
                toast.success("Matrix ID copied")
              }}
            >
              Copy Matrix ID
            </DropdownMenuItem>
            <DropdownMenuItem>
              {user.isAdmin ? "Demote to user" : "Promote to admin"}
            </DropdownMenuItem>
            <DropdownMenuItem>Reset password</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Redact all messages</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              {user.status === "deactivated" ? "Reactivate" : "Deactivate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// ─── Draggable Row ────────────────────────────────────────────────────────────

function DraggableRow({ row }: { row: Row<User> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export function DataTable({ data: initialData }: { data: User[] }) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const sortableId = React.useId()

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination, globalFilter },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs defaultValue="all" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between gap-4 px-4 lg:px-6">
        {/* Filter tabs */}
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="admins">
            Admins <Badge variant="secondary">{data.filter(u => u.isAdmin).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspended <Badge variant="secondary">{data.filter(u => u.status === "suspended").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="deactivated">Deactivated</TabsTrigger>
        </TabsList>

        {/* Mobile select */}
        <Select defaultValue="all">
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm">
            <SelectValue placeholder="Filter users" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admins">Admins</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="deactivated">Deactivated</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative ml-auto w-52">
          <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <TabsContent value="all" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} user(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 50].map((s) => (
                      <SelectItem key={s} value={`${s}`}>{s}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                <ChevronsLeftIcon />
              </Button>
              <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronLeftIcon />
              </Button>
              <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRightIcon />
              </Button>
              <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Other tab content */}
      {["admins", "suspended", "deactivated"].map((tab) => (
        <TabsContent key={tab} value={tab} className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground text-sm">
            {tab.charAt(0).toUpperCase() + tab.slice(1)} users view coming soon
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

// ─── User Detail Drawer ───────────────────────────────────────────────────────

const userRooms = [
  { name: "general", id: "!abc:matrix.org", joined: "2023-02-01" },
  { name: "support", id: "!def:matrix.org", joined: "2023-04-12" },
  { name: "dev-team", id: "!ghi:matrix.org", joined: "2023-06-20" },
]

const userSessions = [
  { device: "Element Web — Chrome/Linux", sessionId: "sess_abc123", lastActive: "Just now" },
  { device: "Element Android", sessionId: "sess_def456", lastActive: "2h ago" },
]

const userReports = [
  { reason: "Spam", room: "#general:matrix.org", filed: "2024-01-10" },
]

function UserCellViewer({ user }: { user: User }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {user.displayName[0]}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium leading-tight">{user.displayName}</span>
            <span className="text-xs text-muted-foreground">{user.matrixId}</span>
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {user.displayName[0]}
            </div>
            <div>
              <DrawerTitle className="flex items-center gap-2">
                {user.displayName}
                {user.isAdmin && <ShieldCheckIcon className="size-4 text-primary" />}
              </DrawerTitle>
              <DrawerDescription>{user.matrixId}</DrawerDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={user.status} />
            <span className="text-xs text-muted-foreground">Registered {user.registered}</span>
            <span className="text-xs text-muted-foreground">· Last seen {user.lastSeen}</span>
          </div>
        </DrawerHeader>

        {/* Quick actions */}
        <div className="flex gap-2 px-4 pb-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={async () => {
              try {
                await fetch("/api/admin", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "resetPassword",
                    userId: user.matrixId,
                    password: Math.random().toString(36).slice(-10), // temp password
                  }),
                })
                toast.success("Password reset successfully")
              } catch (e) {
                toast.error("Failed to reset password")
              }
            }}
          >
            <ShieldCheckIcon className="size-3" />
            Reset Password
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={async () => {
              try {
                const res = await fetch("/api/admin", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "whois",
                    userId: user.matrixId,
                  }),
                })
                const data = await res.json()
                toast.success(`${Object.keys(data.devices || {}).length} active session(s)`)
              } catch (e) {
                toast.error("Failed to fetch user info")
              }
            }}
          >
            Whois
          </Button>

          <Button
            size="sm"
            variant="destructive"
            className="ml-auto text-xs"
            onClick={async () => {
              try {
                const res = await fetch("/api/admin", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "evacuateUser",
                    userId: user.matrixId,
                  }),
                })
                const data = await res.json()
                toast.success(`Removed from ${data.affected?.length ?? 0} room(s)`)
              } catch (e) {
                toast.error("Failed to evacuate user")
              }
            }}
          >
            Evacuate
          </Button>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="rooms" className="flex-1 overflow-hidden">
          <TabsList className="mx-4 mt-3">
            <TabsTrigger value="rooms" className="gap-1.5">
              <Hash className="size-3" /> Rooms ({user.rooms})
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-1.5">
              <MonitorSmartphoneIcon className="size-3" /> Sessions
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <ShieldAlertIcon className="size-3" /> Reports
            </TabsTrigger>
          </TabsList>

          {/* Rooms tab */}
          <TabsContent value="rooms" className="overflow-y-auto px-4 mt-3">
            <div className="flex flex-col gap-2">
              {userRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Hash className="size-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{room.name}</p>
                      <p className="text-xs text-muted-foreground">{room.id}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={async () => {
                      try {
                        await fetch("/api/admin", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "evacuateUser",
                            userId: user.matrixId,
                          }),
                        })
                        toast.success(`Evacuated from all rooms`)
                      } catch (e) {
                        toast.error("Failed to kick user")
                      }
                    }}
                  >
                    Kick
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Sessions tab */}
          <TabsContent value="sessions" className="overflow-y-auto px-4 mt-3">
            <div className="flex flex-col gap-2">
              {userSessions.map((session) => (
                <div key={session.sessionId} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CircleUserIcon className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{session.device}</p>
                      <p className="text-xs text-muted-foreground">Last active: {session.lastActive}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => toast.error("Session logged out")}
                  >
                    Log out
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Reports tab */}
          <TabsContent value="reports" className="overflow-y-auto px-4 mt-3">
            <div className="flex flex-col gap-2">
              {userReports.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No reports filed</p>
              ) : userReports.map((report, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{report.reason}</p>
                    <p className="text-xs text-muted-foreground">{report.room} · {report.filed}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">Open</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}