import { GraduationCap } from 'lucide-react'
import { DashboardGreeting } from '../../shared/components/DashboardGreeting'

export interface GreetingStripProps {
  name: string
  grade: string
}

export const GreetingStrip = ({ name, grade }: GreetingStripProps) => {
  return (
    <DashboardGreeting
      name={name}
      nightMessage="ليلة موفقة"
      hideTimeBadge
      chips={[
        ...(grade
          ? [
              {
                icon: GraduationCap,
                label: grade,
              },
            ]
          : []),
      ]}
    />
  )
}
