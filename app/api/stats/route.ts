import { query } from "@/lib/db"

export async function GET() {
  try {
    const [users, rooms, messages, fedServers] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM userapi_accounts WHERE account_type != 4`),
      query(`SELECT COUNT(*) as count FROM roomserver_rooms`),
      query(`SELECT COUNT(*) as count FROM roomserver_events`),
      query(`SELECT COUNT(DISTINCT server_name) as count FROM federationsender_joined_hosts`),
    ])

    return Response.json({
      users: Number(users[0].count),
      rooms: Number(rooms[0].count),
      messages: Number(messages[0].count),
      federatedServers: Number(fedServers[0].count),
    })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}