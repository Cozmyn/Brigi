import { VideoHubPage, videoHubMetadata } from '@/components/site/VideoPages'
export const dynamic = 'force-dynamic'
export async function generateMetadata() { return videoHubMetadata('en') }
export default function Page() { return <VideoHubPage locale="en" /> }
