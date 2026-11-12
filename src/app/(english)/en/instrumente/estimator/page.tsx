import { PlanningToolPage, planningMetadata } from '@/components/site/PlanningToolPages'
export const dynamic = 'force-dynamic'
export const generateMetadata = () => planningMetadata('en', 'estimator')
export default function Page() {
  return <PlanningToolPage locale="en" kind="estimator"/>
}
