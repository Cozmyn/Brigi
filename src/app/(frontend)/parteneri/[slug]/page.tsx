import { entityDetailRoute } from '@/components/site/EntityPages'
export const dynamic = 'force-dynamic'
const route = entityDetailRoute('partners', 'ro')
export const generateMetadata = route.generateMetadata
export default route.Page
