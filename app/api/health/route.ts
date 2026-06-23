import { prometheusQuery } from "@/lib/prometheus"

export async function GET() {
  try {
    const [
      dendrite,
      registeredUsers,
      activeSyncRequests,
      waitingSyncRequests,
      federationQueuesTotal,
      federationQueuesRunning,
      federationQueuesBacking,
      mediaDownloads,
      mediaThumbnails,
      roomserverBackpressure,
      sendEventDuration,
      cacheRatio,
    ] = await Promise.allSettled([
      prometheusQuery('dendrite_up'),
      prometheusQuery('dendrite_clientapi_reg_users_total'),
      prometheusQuery('dendrite_syncapi_active_sync_requests'),
      prometheusQuery('dendrite_syncapi_waiting_sync_requests'),
      prometheusQuery('dendrite_federationapi_destination_queues_total'),
      prometheusQuery('dendrite_federationapi_destination_queues_running'),
      prometheusQuery('dendrite_federationapi_destination_queues_backing_off'),
      prometheusQuery('dendrite_mediaapi_download'),
      prometheusQuery('dendrite_mediaapi_thumbnail'),
      prometheusQuery('dendrite_roomserver_input_backpressure'),
      prometheusQuery('dendrite_clientapi_sendevent_duration_millis_sum'),
      prometheusQuery('dendrite_caching_ristretto_ratio'),
    ])

    function val(result: PromiseSettledResult<any>) {
      if (result.status === "fulfilled" && result.value?.[0]) {
        return result.value[0].value[1]
      }
      return null
    }

    return Response.json({
      server: {
        up: val(dendrite) === "1",
        registeredUsers: val(registeredUsers),
      },
      sync: {
        activeRequests: val(activeSyncRequests),
        waitingRequests: val(waitingSyncRequests),
      },
      federation: {
        totalQueues: val(federationQueuesTotal),
        runningQueues: val(federationQueuesRunning),
        backingOff: val(federationQueuesBacking),
      },
      media: {
        downloads: val(mediaDownloads),
        thumbnails: val(mediaThumbnails),
      },
      roomserver: {
        backpressure: val(roomserverBackpressure),
      },
      cache: {
        ratio: val(cacheRatio),
      },
    })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}