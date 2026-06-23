"use client"

import * as React from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  PaletteIcon,
  UsersIcon,
  GlobeIcon,
  BellIcon,
  ImageIcon,
  SaveIcon,
  UploadIcon,
} from "lucide-react"

export function InstanceSettings() {
  // ─── Branding state ───────────────────────────────────────────
  const [appName, setAppName] = React.useState("Matrix Chat")
  const [serverName, setServerName] = React.useState("im.t.org")
  const [primaryColor, setPrimaryColor] = React.useState("#7c3aed")
  const [logoUrl, setLogoUrl] = React.useState("")
  const [faviconUrl, setFaviconUrl] = React.useState("")

  // ─── Registration state ───────────────────────────────────────
  const [registrationMode, setRegistrationMode] = React.useState("closed")
  const [inviteOnly, setInviteOnly] = React.useState(false)
  const [guestAccess, setGuestAccess] = React.useState(false)
  const [rateLimitEnabled, setRateLimitEnabled] = React.useState(true)
  const [maxUsersPerRoom, setMaxUsersPerRoom] = React.useState("1000")

  // ─── Federation state ─────────────────────────────────────────
  const [federationEnabled, setFederationEnabled] = React.useState(true)
  const [allowedServers, setAllowedServers] = React.useState("")
  const [blockedServers, setBlockedServers] = React.useState("")

  // ─── Server notices state ─────────────────────────────────────
  const [noticeEnabled, setNoticeEnabled] = React.useState(false)
  const [noticeUserId, setNoticeUserId] = React.useState("@notices:im.t.org")
  const [noticeRoomName, setNoticeRoomName] = React.useState("Server Notices")
  const [broadcastMessage, setBroadcastMessage] = React.useState("")

  // ─── Media state ──────────────────────────────────────────────
  const [maxUploadSize, setMaxUploadSize] = React.useState("10")
  const [thumbnailsEnabled, setThumbnailsEnabled] = React.useState(true)
  const [dynamicThumbnails, setDynamicThumbnails] = React.useState(false)
  const [maxThumbnailWidth, setMaxThumbnailWidth] = React.useState("800")
  const [maxThumbnailHeight, setMaxThumbnailHeight] = React.useState("600")

  async function sendServerNotice() {
    if (!broadcastMessage.trim()) {
      toast.error("Message cannot be empty")
      return
    }
    try {
      const res = await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "serverNotice",
          message: broadcastMessage,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Server notice sent")
      setBroadcastMessage("")
    } catch {
      toast.error("Failed to send server notice")
    }
  }

  function handleSave(section: string) {
    toast.success(`${section} settings saved`)
  }

  return (
    <div className="px-4 lg:px-6">
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="branding" className="gap-1.5">
            <PaletteIcon className="size-3.5" /> Branding
          </TabsTrigger>
          <TabsTrigger value="registration" className="gap-1.5">
            <UsersIcon className="size-3.5" /> Registration
          </TabsTrigger>
          <TabsTrigger value="federation" className="gap-1.5">
            <GlobeIcon className="size-3.5" /> Federation
          </TabsTrigger>
          <TabsTrigger value="notices" className="gap-1.5">
            <BellIcon className="size-3.5" /> Server Notices
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-1.5">
            <ImageIcon className="size-3.5" /> Media & Files
          </TabsTrigger>
        </TabsList>

        {/* ─── Branding ─────────────────────────────────────────── */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize the appearance of your Matrix instance
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="app-name">App Name</Label>
                  <Input
                    id="app-name"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="Matrix Chat"
                  />
                  <p className="text-xs text-muted-foreground">Shown in browser tab and header</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="server-name">Server Name</Label>
                  <Input
                    id="server-name"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="im.t.org"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Cannot be changed after setup</p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primary-color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded-md border border-input bg-transparent"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-32 font-mono text-sm"
                    placeholder="#7c3aed"
                  />
                  <div
                    className="h-10 w-10 rounded-md border"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Used for buttons, accents, and highlights</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo-url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                    <Button variant="outline" size="icon">
                      <UploadIcon className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Recommended: 200x200px PNG</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="favicon-url">Favicon URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="favicon-url"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="https://example.com/favicon.ico"
                    />
                    <Button variant="outline" size="icon">
                      <UploadIcon className="size-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Recommended: 32x32px ICO or PNG</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Branding")} className="gap-2">
                  <SaveIcon className="size-4" /> Save Branding
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Registration ──────────────────────────────────────── */}
        <TabsContent value="registration">
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
              <CardDescription>
                Control how users can create accounts on your server
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="registration-mode">Registration Mode</Label>
                <Select value={registrationMode} onValueChange={setRegistrationMode}>
                  <SelectTrigger id="registration-mode" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open — Anyone can register</SelectItem>
                    <SelectItem value="closed">Closed — No new registrations</SelectItem>
                    <SelectItem value="invite">Invite Only</SelectItem>
                    <SelectItem value="token">Token Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Guest Access</p>
                    <p className="text-xs text-muted-foreground">Allow unauthenticated users to browse public rooms</p>
                  </div>
                  <Switch checked={guestAccess} onCheckedChange={setGuestAccess} />
                </div>
                <div className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Rate Limiting</p>
                    <p className="text-xs text-muted-foreground">Limit registration attempts to prevent abuse</p>
                  </div>
                  <Switch checked={rateLimitEnabled} onCheckedChange={setRateLimitEnabled} />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label htmlFor="max-users">Max Users Per Room</Label>
                <Input
                  id="max-users"
                  type="number"
                  value={maxUsersPerRoom}
                  onChange={(e) => setMaxUsersPerRoom(e.target.value)}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">Set to 0 for unlimited</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Registration")} className="gap-2">
                  <SaveIcon className="size-4" /> Save Registration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Federation ───────────────────────────────────────── */}
        <TabsContent value="federation">
          <Card>
            <CardHeader>
              <CardTitle>Federation</CardTitle>
              <CardDescription>
                Control which servers can communicate with yours
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Enable Federation</p>
                  <p className="text-xs text-muted-foreground">Allow your server to communicate with other Matrix servers</p>
                </div>
                <Switch checked={federationEnabled} onCheckedChange={setFederationEnabled} />
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label htmlFor="allowed-servers">Allowed Servers</Label>
                <Textarea
                  id="allowed-servers"
                  value={allowedServers}
                  onChange={(e) => setAllowedServers(e.target.value)}
                  placeholder="matrix.org&#10;mozilla.org&#10;one per line — leave empty to allow all"
                  className="font-mono text-sm h-28 resize-none"
                />
                <p className="text-xs text-muted-foreground">Leave empty to allow all servers. One server per line.</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="blocked-servers">Blocked Servers</Label>
                <Textarea
                  id="blocked-servers"
                  value={blockedServers}
                  onChange={(e) => setBlockedServers(e.target.value)}
                  placeholder="spam.example.com&#10;bad-actor.org&#10;one per line"
                  className="font-mono text-sm h-28 resize-none"
                />
                <p className="text-xs text-muted-foreground">These servers will be blocked from federating with yours.</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Federation")} className="gap-2">
                  <SaveIcon className="size-4" /> Save Federation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Server Notices ───────────────────────────────────── */}
        <TabsContent value="notices">
          <Card>
            <CardHeader>
              <CardTitle>Server Notices</CardTitle>
              <CardDescription>
                Send messages to all users on your homeserver
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Enable Server Notices</p>
                  <p className="text-xs text-muted-foreground">Allow admins to send notices to all users</p>
                </div>
                <Switch checked={noticeEnabled} onCheckedChange={setNoticeEnabled} />
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notice-user">Notice Bot User ID</Label>
                  <Input
                    id="notice-user"
                    value={noticeUserId}
                    onChange={(e) => setNoticeUserId(e.target.value)}
                    placeholder="@notices:im.t.org"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notice-room">Notice Room Name</Label>
                  <Input
                    id="notice-room"
                    value={noticeRoomName}
                    onChange={(e) => setNoticeRoomName(e.target.value)}
                    placeholder="Server Notices"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label htmlFor="broadcast">Broadcast Message</Label>
                <Textarea
                  id="broadcast"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type a message to send to all users..."
                  className="h-28 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setBroadcastMessage("")}
                >
                  Clear
                </Button>
                <Button
                  onClick={sendServerNotice}
                  disabled={!broadcastMessage.trim()}
                  className="gap-2"
                >
                  <BellIcon className="size-4" /> Send Notice
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Media & Files ────────────────────────────────────── */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media & Files</CardTitle>
              <CardDescription>
                Configure file upload limits and thumbnail generation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="max-upload">Max Upload Size (MB)</Label>
                <Input
                  id="max-upload"
                  type="number"
                  value={maxUploadSize}
                  onChange={(e) => setMaxUploadSize(e.target.value)}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">Maximum file size users can upload</p>
              </div>

              <Separator />

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Generate Thumbnails</p>
                    <p className="text-xs text-muted-foreground">Automatically create thumbnails for uploaded images</p>
                  </div>
                  <Switch checked={thumbnailsEnabled} onCheckedChange={setThumbnailsEnabled} />
                </div>
                <div className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Dynamic Thumbnails</p>
                    <p className="text-xs text-muted-foreground">Generate thumbnails on-demand instead of at upload time</p>
                  </div>
                  <Switch checked={dynamicThumbnails} onCheckedChange={setDynamicThumbnails} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="thumb-width">Max Thumbnail Width (px)</Label>
                  <Input
                    id="thumb-width"
                    type="number"
                    value={maxThumbnailWidth}
                    onChange={(e) => setMaxThumbnailWidth(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="thumb-height">Max Thumbnail Height (px)</Label>
                  <Input
                    id="thumb-height"
                    type="number"
                    value={maxThumbnailHeight}
                    onChange={(e) => setMaxThumbnailHeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Media")} className="gap-2">
                  <SaveIcon className="size-4" /> Save Media Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}