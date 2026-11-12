import { PlanningToolPage, planningMetadata } from '@/components/site/PlanningToolPages'
export const dynamic = 'force-dynamic'
export const generateMetadata = () => planningMetadata('en', 'hub')
export default function Page() {
  return <PlanningToolPage locale="en" kind="hub"/>
}
