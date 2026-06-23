import { dendriteAdmin } from "@/lib/dendrite"

export async function GET() {
  try {
    const data = await dendriteAdmin("/_matrix/client/v3/account/whoami")
    return Response.json(data)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}