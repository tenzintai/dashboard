import { query } from "@/lib/db"

export async function GET() {
  try {
    const media = await query(`
      SELECT
        media_id,
        media_origin,
        content_type,
        file_size_bytes,
        creation_ts,
        upload_name,
        user_id
      FROM mediaapi_media_repository
      ORDER BY creation_ts DESC
      LIMIT 100
    `)

    const mapped = media.map((m: any, i: number) => ({
      id: i + 1,
      mediaId: m.media_id,
      origin: m.media_origin,
      contentType: m.content_type,
      fileSizeBytes: Number(m.file_size_bytes),
      uploadName: m.upload_name ?? "Unnamed",
      userId: m.user_id,
      created: m.creation_ts
        ? new Date(Number(m.creation_ts)).toLocaleDateString()
        : "Unknown",
      mxcUrl: `mxc://${m.media_origin}/${m.media_id}`,
    }))

    return Response.json(mapped)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}