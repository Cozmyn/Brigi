import { GuideHubPage, guideHubMetadata } from '@/components/site/GuidePages'
export const dynamic = 'force-dynamic'
export async function generateMetadata() { return guideHubMetadata('ro') }
export default function Page() { return <GuideHubPage locale="ro" /> }
