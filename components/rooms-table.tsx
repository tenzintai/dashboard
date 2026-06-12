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
  Hash,
  SearchIcon,
  UsersIcon,
  GlobeIcon,
  LockIcon,
  MessageSquareIcon,
  ShieldAlertIcon,
  SettingsIcon,
  Trash2Icon,
  UserPlusIcon,
} from "lucide-react"

// ─── Schema ───────────────────────────────────────────────────────────────────

export const roomSchema = z.object({
  id: z.number(),
  name: z.string(),
  roomId: z.string(),
  topic: z.string(),
  members: z.number(),
  messages: z.number(),
  visibility: z.enum(["public", "private"]),
  federated: z.boolean(),
  created: z.string(),
})

type Room = z.infer<typeof roomSchema>

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const mockRooms: Room[] = [
  { id: 1, name: "general", roomId: "!abc123:matrix.org", topic: "General discussion for everyone", members: 342, messages: 8432, visibility: "public", federated: true, created: "2022-01-10" },
  { id: 2, name: "support", roomId: "!def456:matrix.org", topic: "Get help from the community", members: 218, messages: 5210, visibility: "public", federated: true, created: "2022-02-14" },
  { id: 3, name: "announcements", roomId: "!ghi789:matrix.org", topic: "Official announcements only", members: 891, messages: 1023, visibility: "public", federated: false, created: "2022-01-10" },
  { id: 4, name: "dev-team", roomId: "!jkl012:matrix.org", topic: "Internal dev discussions", members: 34, messages: 3847, visibility: "private", federated: false, created: "2022-03-05" },
  { id: 5, name: "random", roomId: "!mno345:matrix.org", topic: "Off-topic chatter", members: 156, messages: 2991, visibility: "public", federated: true, created: "2022-04-20" },
  { id: 6, name: "security", roomId: "!pqr678:matrix.org", topic: "Security discussions", members: 28, messages: 1456, visibility: "private", federated: false, created: "2022-05-15" },
  { id: 7, name: "matrix-help", roomId: "!stu901:matrix.org", topic: "Matrix protocol questions", members: 504, messages: 12034, visibility: "public", federated: true, created: "2022-01-12" },
  { id: 8, name: "ops-team", roomId: "!vwx234:matrix.org", topic: "Operations and infra", members: 12, messages: 987, visibility: "private", federated: false, created: "2022-06-01" },
]

// ─── Mock room members ────────────────────────────────────────────────────────

const roomMembers = [
  { name: "Alice Chen", matrixId: "@alice:matrix.org", powerLevel: "Admin" },
  { name: "Bob Martinez", matrixId: "@bob:matrix.org", powerLevel: "Moderator" },
  { name: "Carol White", matrixId: "@carol:matrix.org", powerLevel: "User" },
  { name: "Dave Kim", matrixId: "@dave:matrix.org", powerLevel: "User" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function VisibilityBadge({ visibility }: { visibility: Room["visibility"] }) {
  return visibility === "public" ? (
    <Badge variant="outline" className="gap-1 text-xs">
      <GlobeIcon className="size-3" /> Public
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1 text-xs">
      <LockIcon className="size-3" /> Private
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

const columns: ColumnDef<Room>[] = [
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
    accessorKey: "name",
    header: "Room",
    cell: ({ row }) => <RoomCellViewer room={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "members",
    header: "Members",
    cell: ({ row }) => (
      <span className="flex items-center gap-1 text-sm tabular-nums">
        <UsersIcon className="size-3 text-muted-foreground" />
        {row.original.members.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "messages",
    header: "Messages (24h)",
    cell: ({ row }) => (
      <span className="flex items-center gap-1 text-sm tabular-nums">
        <MessageSquareIcon className="size-3 text-muted-foreground" />
        {row.original.messages.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
    cell: ({ row }) => <VisibilityBadge visibility={row.original.visibility} />,
  },
  {
    accessorKey: "federated",
    header: "Federated",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.federated ? (
          <span className="text-emerald-500">✓ Yes</span>
        ) : (
          <span className="text-muted-foreground">— No</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.created}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const room = row.original
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
                navigator.clipboard.writeText(room.roomId)
                toast.success("Room ID copied")
              }}
            >
              Copy Room ID
            </DropdownMenuItem>
            <DropdownMenuItem>
              {room.visibility === "public" ? "Make private" : "Make public"}
            </DropdownMenuItem>
            <DropdownMenuItem>Invite user</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Purge messages</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              Delete room
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// ─── Draggable Row ────────────────────────────────────────────────────────────

function DraggableRow({ row }: { row: Row<Room> }) {
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

export function RoomsTable({ data: initialData }: { data: Room[] }) {
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
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="all">All Rooms</TabsTrigger>
          <TabsTrigger value="public">
            Public <Badge variant="secondary">{data.filter(r => r.visibility === "public").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="private">
            Private <Badge variant="secondary">{data.filter(r => r.visibility === "private").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="federated">
            Federated <Badge variant="secondary">{data.filter(r => r.federated).length}</Badge>
          </TabsTrigger>
        </TabsList>

        <Select defaultValue="all">
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm">
            <SelectValue placeholder="Filter rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Rooms</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="federated">Federated</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

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
                      No rooms found.
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
            {table.getFilteredRowModel().rows.length} room(s) selected.
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

      {["public", "private", "federated"].map((tab) => (
        <TabsContent key={tab} value={tab} className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground text-sm">
            {tab.charAt(0).toUpperCase() + tab.slice(1)} rooms view coming soon
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

// ─── Room Detail Drawer ───────────────────────────────────────────────────────

function RoomCellViewer({ room }: { room: Room }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
            <Hash className="size-3.5" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium leading-tight">#{room.name}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">{room.roomId}</span>
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Hash className="size-5" />
            </div>
            <div>
              <DrawerTitle>#{room.name}</DrawerTitle>
              <DrawerDescription>{room.roomId}</DrawerDescription>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{room.topic}</p>
          <div className="flex items-center gap-2 mt-1">
            <VisibilityBadge visibility={room.visibility} />
            {room.federated && (
              <Badge variant="outline" className="gap-1 text-xs">
                <GlobeIcon className="size-3" /> Federated
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">Created {room.created}</span>
          </div>
        </DrawerHeader>

        {/* Quick actions */}
        <div className="flex gap-2 px-4 pb-2 flex-wrap">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <UserPlusIcon className="size-3" /> Invite User
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            {room.visibility === "public" ? (
              <><LockIcon className="size-3" /> Make Private</>
            ) : (
              <><GlobeIcon className="size-3" /> Make Public</>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="ml-auto gap-1.5 text-xs"
            onClick={() => toast.error(`Room #${room.name} deleted`)}
          >
            <Trash2Icon className="size-3" /> Delete Room
          </Button>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="members" className="flex-1 overflow-hidden">
          <TabsList className="mx-4 mt-3">
            <TabsTrigger value="members" className="gap-1.5">
              <UsersIcon className="size-3" /> Members ({room.members})
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <SettingsIcon className="size-3" /> Settings
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-1.5 text-destructive">
              <ShieldAlertIcon className="size-3" /> Danger
            </TabsTrigger>
          </TabsList>

          {/* Members tab */}
          <TabsContent value="members" className="overflow-y-auto px-4 mt-3">
            <div className="flex flex-col gap-2">
              {roomMembers.map((member) => (
                <div key={member.matrixId} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.matrixId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{member.powerLevel}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => toast.error(`${member.name} kicked from #${room.name}`)}
                    >
                      Kick
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings" className="overflow-y-auto px-4 mt-3">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-md border px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Visibility</p>
                  <p className="text-xs text-muted-foreground">Who can find and join this room</p>
                </div>
                <Select defaultValue={room.visibility}>
                  <SelectTrigger size="sm" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Federation</p>
                  <p className="text-xs text-muted-foreground">Allow users from other servers</p>
                </div>
                <Select defaultValue={room.federated ? "yes" : "no"}>
                  <SelectTrigger size="sm" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Enabled</SelectItem>
                    <SelectItem value="no">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Guest Access</p>
                  <p className="text-xs text-muted-foreground">Allow unauthenticated users</p>
                </div>
                <Select defaultValue="forbidden">
                  <SelectTrigger size="sm" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allowed">Allowed</SelectItem>
                    <SelectItem value="forbidden">Forbidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Danger tab */}
          <TabsContent value="danger" className="overflow-y-auto px-4 mt-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Purge All Messages</p>
                  <p className="text-xs text-muted-foreground">Permanently delete all messages in this room</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs"
                  onClick={() => toast.error("All messages purged")}
                >
                  Purge
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Redact All Media</p>
                  <p className="text-xs text-muted-foreground">Remove all uploaded files and images</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs"
                  onClick={() => toast.error("All media redacted")}
                >
                  Redact
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Shutdown Room</p>
                  <p className="text-xs text-muted-foreground">Kick all members and close the room</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs"
                  onClick={() => toast.error(`Room #${room.name} shut down`)}
                >
                  Shutdown
                </Button>
              </div>
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