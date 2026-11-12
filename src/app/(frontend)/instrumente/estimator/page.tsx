import { PlanningToolPage, planningMetadata } from '@/components/site/PlanningToolPages'
export const dynamic = 'force-dynamic'
export const generateMetadata = () => planningMetadata('ro', 'estimator')
export default function Page() {
  return <PlanningToolPage locale="ro" kind="estimator"/>
}
