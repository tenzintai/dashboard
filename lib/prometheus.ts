const PROMETHEUS_URL = process.env.PROMETHEUS_URL

export async function prometheusQuery(query: string) {
  const res = await fetch(
    `${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(query)}`,
    { cache: "no-store" }
  )
  if (!res.ok) throw new Error(`Prometheus error: ${res.status}`)
  const data = await res.json()
  return data.data.result
}

export async function prometheusRange(query: string, start: number, end: number, step: string) {
  const res = await fetch(
    `${PROMETHEUS_URL}/api/v1/query_range?query=${encodeURIComponent(query)}&start=${start}&end=${end}&step=${step}`,
    { cache: "no-store" }
  )
  if (!res.ok) throw new Error(`Prometheus error: ${res.status}`)
  const data = await res.json()
  return data.data.result
}