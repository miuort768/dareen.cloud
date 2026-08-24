import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { parentsService } from '../services/parentsService'
import type { Parent, Enrollment, Student } from '../../../types'
import type { FamilyScheduleItem } from '../types'
import { useShowNotification } from '../../../context/AppContext'
import { canonicalPhone } from '../../../lib/phone'

export const useParents = () => {
  const queryClient = useQueryClient()
  const showNotification = useShowNotification()

  // UI Local State
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [newParent, setNewParent] = useState<{
    name: string
    phone: string
    phone2?: string
    username?: string
    password?: string
  }>({
    name: '',
    phone: '',
    phone2: '',
    username: '',
    password: '',
  })

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    title?: string
    message: string
    confirmText?: string
    variant?: 'danger' | 'primary'
    action: ((password?: string) => void) | null
  }>({ show: false, message: '', action: null })

  // React Query
  const { data: parents = [], isLoading: isLoadingParents } = useQuery({
    queryKey: ['parents'],
    queryFn: parentsService.getParents,
  })

  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: parentsService.getStudents,
  })

  const addMutation = useMutation({
    mutationFn: parentsService.addParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] })
      showNotification('طھظ…طھ ط§ظ„ط¹ظ…ظ„ظٹط© ط¨ظ†ط¬ط§ط­', 'success')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Parent> }) =>
      parentsService.updateParent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] })
      showNotification('طھظ… ط§ظ„طھط­ط¯ظٹط« ط¨ظ†ط¬ط§ط­', 'success')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password?: string }) =>
      parentsService.deleteParent(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] })
      showNotification('طھظ… ط§ظ„ط­ط°ظپ ط¨ظ†ط¬ط§ط­', 'success')
    },
  })

  // Handlers
  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: newParent })
        setEditId(null)
      } else {
        await addMutation.mutateAsync(newParent)
      }
      setShowAddForm(false)
      setNewParent({ name: '', phone: '', phone2: '', username: '', password: '' })
    } catch (error) {
      console.error('Error saving parent', error)
      const err = error as { response?: { data?: { details?: string } }; message?: string }
      showNotification(
        err.response?.data?.details || err.message || 'ظپط´ظ„ ظپظٹ ط­ظپط¸ ط§ظ„ط¨ظٹط§ظ†ط§طھ',
        'error',
      )
    }
  }

  const handleEditParent = (parent: Parent) => {
    setNewParent({
      name: parent.name,
      phone: parent.phone,
      phone2: parent.phone2 || '',
      username: parent.username || '',
      password: '',
    })
    setEditId(parent.id)
    setShowAddForm(true)
  }

  const handleDeleteParent = (id: string) => {
    setConfirmModal({
      show: true,
      title: 'طھط£ظƒظٹط¯ ط¹ظ…ظ„ظٹط© ط§ظ„ط­ط°ظپ',
      message:
        'ظ‡ط°ط§ ط§ظ„ط¥ط¬ط±ط§ط، ط³ظٹط­ط°ظپ ظˆظ„ظٹ ط§ظ„ط£ظ…ط± ظ†ظ‡ط§ط¦ظٹط§ظ‹. ط£ط¯ط®ظ„ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„طھط­ط°ظٹط±ظٹط© ظ„ظ„ظ…طھط§ط¨ط¹ط©.',
      confirmText: 'ظ†ط¹ظ…طŒ ط­ط°ظپ',
      variant: 'danger',
      action: async (password) => {
        await deleteMutation.mutateAsync({ id, password })
        if (selectedParent?.id === id) setShowDetails(false)
      },
    })
  }

  const samePhone = (a?: string | null, b?: string | null) => {
    const ca = canonicalPhone(a)
    const cb = canonicalPhone(b)
    return ca.length > 0 && ca === cb
  }

  const handleImportParents = async () => {
    const existingPhones = new Set(parents.map((p) => canonicalPhone(p.phone)).filter(Boolean))
    const newParentsList: Omit<Parent, 'id'>[] = []
    const seenPhones = new Set()

    // Group students by normalized parent phone
    const studentsByPhone: Record<string, typeof students> = {}
    for (const s of students) {
      const canonical = canonicalPhone(s.parentPhone || '')
      if (canonical && !existingPhones.has(canonical)) {
        const group = studentsByPhone[canonical]
        if (group) {
          group.push(s)
        } else {
          studentsByPhone[canonical] = [s]
        }
      }
    }

    // Create parents from groups
    for (const [phone, familyStudents] of Object.entries(studentsByPhone)) {
      if (!seenPhones.has(phone)) {
        seenPhones.add(phone)
        // Grade ranking map
        const gradeRank: Record<string, number> = {
          تمهيدي: 0,
          روضة: 0,
          kg1: 0,
          kg2: 0,
          الأول: 1,
          'الصف الأول': 1,
          '1': 1,
          الثاني: 2,
          'الصف الثاني': 2,
          '2': 2,
          الثالث: 3,
          'الصف الثالث': 3,
          '3': 3,
          الرابع: 4,
          'الصف الرابع': 4,
          '4': 4,
          الخامس: 5,
          'الصف الخامس': 5,
          '5': 5,
          السادس: 6,
          'الصف السادس': 6,
          '6': 6,
          السابع: 7,
          'الصف السابع': 7,
          '7': 7,
          الثامن: 8,
          'الصف الثامن': 8,
          '8': 8,
          التاسع: 9,
          'الصف التاسع': 9,
          '9': 9,
          العاشر: 10,
          'الصف العاشر': 10,
          '10': 10,
          'الحادي عشر': 11,
          'الصف الحادي عشر': 11,
          '11': 11,
          'الثاني عشر': 12,
          'الصف الثاني عشر': 12,
          '12': 12,
          توجيهي: 12,
        }
        // Find oldest student
        const gradeRankOf = (st: { grade?: string } | undefined): number => {
          const normalized = (st?.grade ?? '').trim()
          const direct = gradeRank[normalized]
          if (direct !== undefined) return direct
          const match = normalized.match(/\d+/)
          return match ? parseInt(match[0], 10) : -1
        }
        let oldestStudent = familyStudents.length > 0 ? familyStudents[0] : undefined
        for (const s of familyStudents as Student[]) {
          if (!oldestStudent || !s) continue
          if (gradeRankOf(s) > gradeRankOf(oldestStudent)) {
            oldestStudent = s
          }
        }
        if (!oldestStudent) continue

        newParentsList.push({
          name: `ظˆظ„ظٹ ط£ظ…ط± ${oldestStudent.name}`,
          phone: phone,
          phone2: '',
        })
      }
    }

    if (newParentsList.length === 0) {
      setConfirmModal({
        show: true,
        title: 'ط§ظ„ط§ط³طھظٹط±ط§ط¯ ظ…ظ† ط§ظ„ط·ظ„ط§ط¨',
        message:
          'ظ„ط§ ظٹظˆط¬ط¯ ط£ظˆظ„ظٹط§ط، ط£ظ…ظˆط± ط¬ط¯ط¯ ظ„ظ„ط§ط³طھظٹط±ط§ط¯ ظ…ظ† ظ‚ط§ط¦ظ…ط© ط§ظ„ط·ظ„ط§ط¨ ط­ط§ظ„ظٹط§ظ‹.',
        confirmText: 'ط­ط³ظ†ط§ظ‹',
        variant: 'primary',
        action: null,
      })
      return
    }

    setConfirmModal({
      show: true,
      title: 'طھط£ظƒظٹط¯ ط§ظ„ط§ط³طھظٹط±ط§ط¯',
      message: `طھظ… ط§ظ„ط¹ط«ظˆط± ط¹ظ„ظ‰ ${newParentsList.length} ظˆظ„ظٹ ط£ظ…ط± ط¬ط¯ظٹط¯ ظپظٹ ظ‚ط§ط¦ظ…ط© ط§ظ„ط·ظ„ط§ط¨. ظ‡ظ„ طھط±ظٹط¯ ط§ط³طھظٹط±ط§ط¯ظ‡ظ… طھظ„ظ‚ط§ط¦ظٹط§ظ‹طں`,
      confirmText: 'ط¨ط¯ط، ط§ظ„ط§ط³طھظٹط±ط§ط¯',
      variant: 'primary',
      action: async () => {
        const { successCount, failCount, errors } =
          await parentsService.importParents(newParentsList)
        queryClient.invalidateQueries({ queryKey: ['parents'] })
        queryClient.invalidateQueries({ queryKey: ['students'] })

        setTimeout(() => {
          let message =
            failCount === 0
              ? `طھظ… ط§ط³طھظٹط±ط§ط¯ ${successCount} ظˆظ„ظٹ ط£ظ…ط± ط¨ظ†ط¬ط§ط­.`
              : `طھظ… ط§ط³طھظٹط±ط§ط¯ ${successCount} ظˆظ„ظٹ ط£ظ…ط±طŒ ظˆظپط´ظ„ ط§ط³طھظٹط±ط§ط¯ ${failCount}.`
          if (failCount > 0 && errors.length > 0) {
            const firstErrors = Array.from(new Set(errors)).slice(0, 3)
            message += `\nط§ظ„ط£ط³ط¨ط§ط¨: ${firstErrors.join(' | ')}`
          }
          setConfirmModal({
            show: true,
            title: 'ظ†طھظٹط¬ط© ط§ظ„ط§ط³طھظٹط±ط§ط¯',
            message,
            confirmText: 'ط¥ط؛ظ„ط§ظ‚',
            variant: 'primary',
            action: null,
          })
        }, 300)
      },
    })
  }

  const handleExportParents = () => {
    try {
      const dataStr = JSON.stringify(parents, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `parents_export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showNotification(
        'طھظ… طھطµط¯ظٹط± ط¨ظٹط§ظ†ط§طھ ط£ظˆظ„ظٹط§ط، ط§ظ„ط£ظ…ظˆط± ط¨ظ†ط¬ط§ط­',
        'success',
      )
    } catch (e) {
      console.error(e)
      showNotification('ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، طھطµط¯ظٹط± ط§ظ„ط¨ظٹط§ظ†ط§طھ', 'error')
    }
  }

  // Derived Data
  const filteredParents = useMemo(() => {
    return parents.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.phone || '').includes(searchTerm) ||
        (p.phone2 && p.phone2.includes(searchTerm)),
    )
  }, [parents, searchTerm])

  const stats = useMemo(() => {
    const linkedStudents = students.filter((s) =>
      parents.some((p) => samePhone(p.phone, s.parentPhone) || (p.id && s.parent?.id === p.id)),
    )
    return {
      totalParents: parents.length,
      totalLinkedStudents: linkedStudents.length,
    }
  }, [parents, students])

  const selectedParentData = useMemo(() => {
    if (!selectedParent) return null

    const children = students.filter(
      (s) => samePhone(selectedParent.phone, s.parentPhone) || s.parent?.id === selectedParent.id,
    )

    const DAY_ORDER = [
      'ط§ظ„ط³ط¨طھ',
      'ط§ظ„ط£ط­ط¯',
      'ط§ظ„ط§ط«ظ†ظٹظ†',
      'ط§ظ„ط«ظ„ط§ط«ط§ط،',
      'ط§ظ„ط£ط±ط¨ط¹ط§ط،',
      'ط§ظ„ط®ظ…ظٹط³',
      'ط§ظ„ط¬ظ…ط¹ط©',
    ]
    const toMinutes = (h: string) => {
      const [hh = '', mm = '0'] = String(h || '').split(':')
      const mins = parseInt(hh, 10) * 60 + parseInt(mm, 10)
      return Number.isNaN(mins) ? 0 : mins
    }
    const teacherNameOf = (en: Enrollment) => {
      const t = en.teacher
      if (typeof t === 'string') return t
      if (t && typeof t === 'object' && t.name) return t.name
      return en.teacherFallback || ''
    }

    const familySchedule: FamilyScheduleItem[] = children
      .flatMap((child) =>
        (child.enrollments || []).flatMap((en) =>
          (en.schedule || []).map((sch) => ({
            ...sch,
            studentName: child.name,
            subject: en.subject || 'ط¨ط¯ظˆظ† ط¹ظ†ظˆط§ظ†',
            teacherName: teacherNameOf(en),
          })),
        ),
      )
      .sort((a, b) => {
        const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
        if (dayDiff !== 0) return dayDiff
        return toMinutes(a.hour) - toMinutes(b.hour)
      })

    const totalEnrollments = children.reduce(
      (sum, child) => sum + (child.enrollments?.length || 0),
      0,
    )
    const totalSessions = children.reduce(
      (sum, child) => sum + (child.enrollments || []).reduce((s, en) => s + en.sessionsTotal, 0),
      0,
    )
    const completedSessions = children.reduce(
      (sum, child) => sum + (child.enrollments || []).reduce((s, en) => s + en.sessionsUsed, 0),
      0,
    )
    const completionRate =
      totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

    return {
      children,
      familySchedule,
      totalEnrollments,
      totalSessions,
      completedSessions,
      completionRate,
    }
  }, [selectedParent, students])

  return {
    state: {
      parents,
      students,
      searchTerm,
      loading: isLoadingParents || isLoadingStudents,
      showAddForm,
      selectedParent,
      showDetails,
      editId,
      confirmModal,
      newParent,
      filteredParents,
      ...stats,
      selectedParentData,
    },
    actions: {
      setSearchTerm,
      setShowAddForm,
      setSelectedParent,
      setShowDetails,
      setEditId,
      setConfirmModal,
      setNewParent,
      handleAddParent,
      handleEditParent,
      handleDeleteParent,
      handleImportParents,
      handleExportParents,
      refresh: () => {
        queryClient.invalidateQueries({ queryKey: ['parents'] })
        queryClient.invalidateQueries({ queryKey: ['students'] })
      },
    },
  }
}
