import { ProgressBar } from '../../../shared/components/ui'

interface AttendanceChartProps {
  rate: number
  label?: string
}

/** حلقة نسبة الحضور — بيانات حقيقية فقط (لا أعمدة أسبوعية مُختلقة) */
export const AttendanceChart = ({ rate, label = 'نسبة الحضور' }: AttendanceChartProps) => {
  const size = 120
  const radius = 48
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (rate / 100) * circumference
  const center = size / 2

  const getStrokeColor = (r: number) => {
    if (r >= 80) return 'var(--bg-success)'
    if (r >= 50) return 'var(--bg-info)'
    return 'var(--bg-error)'
  }

  const getStatusText = (r: number) => {
    if (r >= 80) return { label: 'حضور ممتاز', hint: 'أداء متميز، استمر!' }
    if (r >= 50) return { label: 'حضور متوسط', hint: 'يمكن تحسينه بالمتابعة' }
    return { label: 'حضور منخفض', hint: 'يحتاج إلى اهتمام' }
  }

  const status = getStatusText(rate)

  return (
    <div>
      <h3 className="mb-3 text-xs font-bold text-main dark:text-main">{label}</h3>
      <div className="flex flex-col items-center gap-4">
        <div className="relative shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={`${label}: ${rate}%`}
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={getStrokeColor(rate)}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              className="transition-all duration-1000"
            />
            <text
              x={center}
              y={center - 6}
              textAnchor="middle"
              dominantBaseline="central"
              fill={getStrokeColor(rate)}
              className="text-2xl font-bold"
            >
              {rate}%
            </text>
            <text
              x={center}
              y={center + 18}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--text-muted)"
              className="text-micro font-medium"
            >
              حضور
            </text>
          </svg>
        </div>
        <div className="w-full space-y-2 text-center">
          <p className="text-sm font-bold text-main dark:text-main">{status.label}</p>
          <ProgressBar
            value={rate}
            variant={rate >= 80 ? 'success' : rate >= 50 ? 'info' : 'error'}
          />
          <p className="text-micro font-medium text-dim dark:text-dim">{status.hint}</p>
        </div>
      </div>
    </div>
  )
}
