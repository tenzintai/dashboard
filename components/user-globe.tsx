"use client"

import { useEffect, useRef } from "react"
import createGlobe from "cobe"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const USER_LOCATIONS: [number, number][] = [
  [51.5, -0.12],
  [48.85, 2.35],
  [52.52, 13.4],
  [40.71, -74.0],
  [37.77, -122.4],
  [35.68, 139.69],
  [1.35, 103.82],
  [28.61, 77.2],
  [-33.87, 151.2],
  [55.75, 37.62],
]

export function UserGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null)
  const phiRef = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!canvasRef.current) return

    globeRef.current = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600,
      height: 600,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.15],
      markerColor: [0.4, 0.6, 1.0],
      glowColor: [0.15, 0.15, 0.25],
      markers: USER_LOCATIONS.map(([lat, lng]) => ({
        location: [lat, lng],
        size: 0.05,
      })),
    })

    function animate() {
      phiRef.current += 0.003
      globeRef.current?.update({ phi: phiRef.current })
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      globeRef.current?.destroy()
    }
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>User Locations</CardTitle>
        <CardDescription>Where your users are connecting from</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center overflow-hidden px-2 pb-4">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", maxWidth: 300, aspectRatio: "1" }}
        />
      </CardContent>
    </Card>
  )
}