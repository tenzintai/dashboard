import { query } from "@/lib/db"

export async function GET() {
  try {
    const users = await query(`
      SELECT 
        a.localpart,
        a.server_name,
        a.account_type,
        a.created_ts
      FROM userapi_accounts a
      ORDER BY a.created_ts DESC
      LIMIT 100
    `)

    const mapped = users.map((u: any, i: number) => ({
      id: i + 1,
      displayName: u.localpart,
      matrixId: `@${u.localpart}:${u.server_name}`,
      status: "active" as const,
      isAdmin: u.account_type === 3,
      rooms: 0,
      lastSeen: "N/A",
      registered: u.created_ts 
        ? new Date(Number(u.created_ts)).toLocaleDateString() 
        : "Unknown",
    }))

    return Response.json(mapped)
  } catch (error: any) {
    console.error("DB ERROR:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}