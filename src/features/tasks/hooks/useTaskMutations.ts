import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { Task, TaskStatus } from '../types'

/**
 * عمليات المهام المشتركة بين سطح المكتب والهاتف — كلها عبر REST (/tasks)
 * مع تحديث متفائل للكاش وإبطاله بعد النجاح لضمان التزامن بين الأجهزة.
 */
export const useTaskMutations = () => {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] })

  const createTask = useMutation({
    mutationFn: (data: Pick<Task, 'title' | 'description' | 'priority' | 'dueDate'>) =>
      api.post<Task>('/tasks', { ...data, status: 'pending' }),
    onSuccess: invalidate,
  })

  const updateTaskStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.patch(`/tasks/${id}`, { status }),
    // تحديث متفائل فوري
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<Task[]>(['tasks'])
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        (old || []).map((t) => (t.id === id ? { ...t, status } : t)),
      )
      return { previous }
    },
    // فشل → استرجاع + إبطال
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks'], context.previous)
      invalidate()
    },
    // نجاح → إبطال لضمان التزامن مع الأجهزة الأخرى
    onSuccess: invalidate,
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: invalidate,
  })

  /** حذف عدة مهام بتسلسل واحد ثم إبطال واحد بدل N إبطالات */
  const deleteManyTasks = async (ids: string[]) => {
    for (const id of ids) {
      try {
        await api.delete(`/tasks/${id}`)
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
    invalidate()
  }

  return { createTask, updateTaskStatus, deleteTask, deleteManyTasks }
}
