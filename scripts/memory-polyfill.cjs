// Some restricted build sandboxes do not mount /proc, which makes libuv's RSS lookup throw.
// Keep this preload harmless on normal hosts and provide Next.js with a conservative fallback.
try {
  process.memoryUsage()
} catch {
  const rss = () => Math.max(process.resourceUsage().maxRSS * 1024, 1)
  const fallback = () => ({ rss: rss(), heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 })
  fallback.rss = rss
  process.memoryUsage = fallback
}

