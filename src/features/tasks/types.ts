/** أنواع وإعدادات موحدة لميزة المهام — المصدر الوحيد المستخدم في سطح المكتب والهاتف */

export type TaskStatus = 'pending' | 'in-progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  category?: string
}

import type { LucideIcon } from 'lucide-react'
import { Clock, CircleDashed, CheckCircle2, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react'

interface StatusMeta {
  label: string
  icon: LucideIcon
  color: string
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, StatusMeta> = {
  pending: { label: 'قيد الانتظار', icon: Clock, color: 'text-warning dark:text-primary' },
  'in-progress': { label: 'قيد التنفيذ', icon: CircleDashed, color: 'text-primary' },
  completed: { label: 'مكتملة', icon: CheckCircle2, color: 'text-success' },
}

interface PriorityMeta {
  label: string
  badge: string
  dot: string
  bar: string
  /** زر الأولوية غير المحدد — تدرّج خفيف مميّز بلون الأولوية */
  soft: string
  /** زر الأولوية المحدد — تعبئة مشبعة بلون الأولوية */
  solid: string
  icon: LucideIcon
}

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, PriorityMeta> = {
  high: {
    label: 'عالية',
    badge: 'bg-error-soft text-error',
    dot: 'bg-error',
    bar: 'border-s-error border-e-error',
    soft: 'border-error bg-error-soft text-error',
    solid: 'border-error bg-error text-on-error',
    icon: ArrowUp,
  },
  medium: {
    label: 'متوسطة',
    badge: 'bg-warning-soft text-warning dark:bg-primary-soft dark:text-primary',
    dot: 'bg-warning dark:bg-primary',
    bar: 'border-s-warning border-e-warning dark:border-s-primary dark:border-e-primary',
    soft: 'border-warning bg-warning-soft text-warning dark:border-primary dark:bg-primary-soft dark:text-primary',
    solid:
      'border-warning bg-warning text-on-warning dark:border-primary dark:bg-primary dark:text-on-primary',
    icon: ArrowRight,
  },
  low: {
    label: 'منخفضة',
    badge: 'bg-success-soft text-success',
    dot: 'bg-success',
    bar: 'border-s-success border-e-success',
    soft: 'border-success bg-success-soft text-success',
    solid: 'border-success bg-success text-on-success',
    icon: ArrowDown,
  },
}

/** ترتيب دورة الحالة عند النقر المتتالي */
export const nextTaskStatus = (status: TaskStatus): TaskStatus =>
  status === 'pending' ? 'in-progress' : status === 'in-progress' ? 'completed' : 'pending'
