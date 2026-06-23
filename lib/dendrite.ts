const BASE_URL = process.env.DENDRITE_BASE_URL ?? "https://im.tibcert.org"
const TOKEN = process.env.DENDRITE_ADMIN_TOKEN

export async function dendriteAdmin(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Dendrite API error ${res.status}: ${error}`)
  }

  return res.json()
}