import { entityHubRoute } from '@/components/site/EntityPages'
export const dynamic = 'force-dynamic'
const route = entityHubRoute('case-studies', 'ro')
export const generateMetadata = route.generateMetadata
export default route.Page
