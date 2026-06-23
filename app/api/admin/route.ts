import { dendriteAdmin } from "@/lib/dendrite"
import { NextRequest } from "next/server"

// Evacuate user from all rooms
export async function DELETE(req: NextRequest) {
  const { action, userId, roomId, password } = await req.json()

  try {
    switch (action) {
      case "evacuateUser":
        const userData = await dendriteAdmin(
          `/_dendrite/admin/evacuateUser/${userId}`,
          { method: "POST" }
        )
        return Response.json(userData)

      case "evacuateRoom":
        const roomData = await dendriteAdmin(
          `/_dendrite/admin/evacuateRoom/${roomId}`,
          { method: "POST" }
        )
        return Response.json(roomData)

      case "purgeRoom":
        const purgeData = await dendriteAdmin(
          `/_dendrite/admin/purgeRoom/${roomId}`,
          { method: "POST" }
        )
        return Response.json(purgeData)

      case "resetPassword":
        const resetData = await dendriteAdmin(
          `/_dendrite/admin/resetPassword/${userId}`,
          {
            method: "POST",
            body: JSON.stringify({ password, logout_devices: true }),
          }
        )
        return Response.json(resetData)

      case "whois":
        const whoisData = await dendriteAdmin(
          `/_matrix/client/v3/admin/whois/${userId}`
        )
        return Response.json(whoisData)

      case "serverNotice":
        const { message, userId: targetId } = await req.json()
        const noticeData = await dendriteAdmin(
          "/_synapse/admin/v1/send_server_notice",
          {
            method: "POST",
            body: JSON.stringify({
              user_id: targetId,
              content: {
                msgtype: "m.text",
                body: message,
              },
            }),
          }
        )
        return Response.json(noticeData)

      default:
        return Response.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}