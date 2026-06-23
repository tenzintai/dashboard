import { dendriteAdmin } from "@/lib/dendrite"

export async function GET() {
  try {
    const data = await dendriteAdmin(
      "/_matrix/client/v3/publicRooms"
    )
    
    const rooms = data.chunk.map((room: any, i: number) => ({
      id: i + 1,
      name: room.name ?? room.canonical_alias ?? room.room_id,
      roomId: room.room_id,
      topic: room.topic ?? "",
      members: room.num_joined_members,
      messages: 0, // not available via this endpoint
      visibility: "public" as const,
      federated: true,
      created: "",
    }))

    return Response.json(rooms)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}