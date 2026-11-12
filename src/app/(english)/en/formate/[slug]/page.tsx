import { entityDetailRoute } from '@/components/site/EntityPages'
export const dynamic = 'force-dynamic'
const route = entityDetailRoute('musical-formats', 'en')
export const generateMetadata = route.generateMetadata
export default route.Page
