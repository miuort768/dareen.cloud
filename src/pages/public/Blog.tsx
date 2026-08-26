import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MobileHeader } from '../../components/public/MobileHeader'
import { PublicFooter } from '../../components/public/PublicFooter'
import { SEO } from '../../components/SEO'
import { blogPosts as staticPosts, type BlogPost } from '../../data/blogPosts'
import { Zap, FileText } from 'lucide-react'
import { api } from '../../lib/api'
import {
  types,
  curriculums,
  gradesMap,
  subjectsMap,
  classroomsMap,
  directTypes,
  languages,
} from '../../components/blog/LibraryConfig'
import type { ViewType } from '../../components/blog/LibraryConfig'
import { FoundationCard, RegularCard } from '../../components/blog/BlogCard'
import { BlogBreadcrumb } from '../../components/blog/BlogBreadcrumb'
import { LoadMore } from '../../components/blog/LoadMore'
import { LoadingState, EmptyState } from '../../components/blog/BlogStates'
import { MobileHero, DesktopHero } from '../../components/blog/HeroSelection'
import { DesktopLibraryLanding } from '../../components/blog/DesktopLibraryLanding'
import { SelectionGrid } from '../../components/blog/SelectionGrid'
import { PageLoader } from '../../components/ui/PageLoader'

export const Blog = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const view = (searchParams.get('view') as ViewType) || 'types'
  const selectedType = searchParams.get('type') || ''
  const selectedCurriculum = searchParams.get('curriculum') || ''
  const selectedLevel = searchParams.get('level') || ''
  const selectedGrade = searchParams.get('grade') || ''
  const selectedTerm = searchParams.get('term') || ''
  const selectedSubject = searchParams.get('subject') || ''
  const selectedLanguage = searchParams.get('language') || ''
  const [showSplash, setShowSplash] = useState(true)
  const [foundationBtnState, setFoundationBtnState] = useState<{
    type: 'download' | 'watch'
    phase: 'counting' | 'ready'
    seconds?: number
    postId: string
  } | null>(null)
  const foundationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const { data: postsData, isLoading: loading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const res = await api.get<
        { posts?: BlogPost[]; data?: BlogPost[]; totalPages?: number } | BlogPost[]
      >('/blog?page=1&limit=12')
      const meta = Array.isArray(res) ? null : res
      const posts = meta?.posts || meta?.data || []
      return { posts, totalPages: meta?.totalPages || 1 }
    },
  })

  const basePosts =
    postsData && postsData.posts && postsData.posts.length > 0 ? postsData.posts : staticPosts
  const totalPages = postsData?.totalPages || 1

  const [allPosts, setAllPosts] = useState<typeof staticPosts>([])
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (postsData) setAllPosts(basePosts)
  }, [postsData, basePosts])

  const posts = allPosts.length > 0 ? allPosts : basePosts

  const handleFoundationButtonClick = (
    type: 'download' | 'watch',
    url: string,
    postId: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (
      foundationBtnState?.postId === postId &&
      foundationBtnState?.type === type &&
      foundationBtnState.phase === 'ready'
    ) {
      window.open(url, '_blank', 'noopener,noreferrer')
      setFoundationBtnState(null)
      return
    }
    if (foundationBtnState) return
    setFoundationBtnState({ type, phase: 'counting', seconds: 9, postId })
    foundationTimerRef.current = setInterval(() => {
      setFoundationBtnState((prev) => {
        if (!prev || prev.seconds! <= 1) {
          if (foundationTimerRef.current) clearInterval(foundationTimerRef.current)
          foundationTimerRef.current = null
          return { type, phase: 'ready', postId }
        }
        return { ...prev, seconds: prev.seconds! - 1 }
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (foundationTimerRef.current) clearInterval(foundationTimerRef.current)
    }
  }, [])

  const setView = useCallback(
    (v: ViewType) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('view', v)
        if (v === 'types') {
          ;['type', 'curriculum', 'level', 'grade', 'term', 'subject', 'language'].forEach((k) =>
            next.delete(k),
          )
        } else if (v === 'curriculums') {
          ;['level', 'grade', 'term', 'subject'].forEach((k) => next.delete(k))
        } else if (v === 'grades') {
          ;['grade', 'term', 'subject'].forEach((k) => next.delete(k))
        } else if (v === 'classrooms') {
          ;['term', 'subject'].forEach((k) => next.delete(k))
        } else if (v === 'terms') {
          next.delete('subject')
        } else if (v === 'languages') {
          ;['curriculum', 'level', 'grade', 'term', 'subject', 'language'].forEach((k) =>
            next.delete(k),
          )
        } else if (v === 'language-sections') {
          ;['curriculum', 'level', 'grade', 'term', 'subject'].forEach((k) => next.delete(k))
        }
        return next
      })
    },
    [setSearchParams],
  )

  const setSelectedGrade = useCallback(
    (id: string) => {
      setSearchParams((prev) => {
        const n = new URLSearchParams(prev)
        n.set('grade', id)
        n.set('view', 'terms')
        n.delete('subject')
        return n
      })
    },
    [setSearchParams],
  )
  const setSelectedTerm = useCallback(
    (id: string) => {
      setSearchParams((prev) => {
        const n = new URLSearchParams(prev)
        n.set('term', id)
        n.set('view', 'subjects')
        return n
      })
    },
    [setSearchParams],
  )
  const setSelectedSubject = useCallback(
    (id: string) => {
      setSearchParams((prev) => {
        const n = new URLSearchParams(prev)
        n.set('subject', id)
        n.set('view', 'results')
        return n
      })
    },
    [setSearchParams],
  )

  const currentTypeName = types.find((t) => t.id === selectedType)?.name || ''
  const currentCurriculumName = curriculums.find((c) => c.id === selectedCurriculum)?.name || ''
  const currentLevelName =
    gradesMap[selectedCurriculum]?.find((g) => g.id === selectedLevel)?.name || ''
  const currentSubjectName =
    (subjectsMap[selectedLevel] || subjectsMap.middle || []).find((s) => s.id === selectedSubject)
      ?.name || ''
  const currentGrades = gradesMap[selectedCurriculum] || []
  const currentClassrooms = classroomsMap[selectedCurriculum]?.[selectedLevel] || []
  const currentSubjects = subjectsMap[selectedLevel] || subjectsMap.middle || []
  const termLabel = selectedTerm === '1' ? 'ترم أول' : selectedTerm === '2' ? 'ترم ثاني' : 'الكل'

  const filteredPosts =
    view === 'results' || view === 'language-sections'
      ? posts.filter((p) => {
          if (selectedType && p.contentType && p.contentType !== selectedType) return false
          if (selectedCurriculum && p.curriculum !== selectedCurriculum) return false
          if (selectedLevel && p.level !== selectedLevel) return false
          if (selectedGrade && p.grade !== selectedGrade) return false
          if (selectedTerm && p.term && p.term !== selectedTerm) return false
          if (selectedSubject && p.subject !== selectedSubject) return false
          if (
            selectedLanguage &&
            p.category &&
            !p.category.toLowerCase().includes(selectedLanguage)
          )
            return false
          return true
        })
      : posts

  const isDirectType = directTypes.includes(selectedType)

  const goBack = () => {
    if (view === 'results') setView(isDirectType ? 'types' : 'subjects')
    else if (view === 'subjects') setView('terms')
    else if (view === 'terms') setView('classrooms')
    else if (view === 'classrooms') setView('grades')
    else if (view === 'grades') setView('curriculums')
    else if (view === 'curriculums') setView('types')
    else if (view === 'languages') setView('types')
    else if (view === 'language-sections') setView('types')
    else navigate('/')
  }

  const isHeroView =
    view === 'types' || view === 'curriculums' || view === 'grades' || view === 'languages'
  const gridItems =
    view === 'types'
      ? types
      : view === 'curriculums'
        ? curriculums
        : view === 'languages'
          ? languages.map((l) => ({ ...l, icon: l.icon }))
          : currentGrades

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await api.get<{ posts?: BlogPost[]; data?: BlogPost[] } | BlogPost[]>(
        `/blog?page=${nextPage}&limit=12`,
      )
      const meta = Array.isArray(res) ? null : res
      const fetchedPosts = meta?.posts || meta?.data || []
      setAllPosts((prev) => [...prev, ...fetchedPosts])
      setPage(nextPage)
    } catch (e) {
      console.warn(e)
    } finally {
      setLoadingMore(false)
    }
  }

  const [libraryTheme] = useState(() => {
    try {
      return localStorage.getItem('library-theme') || 'light'
    } catch (e) {
      console.warn(e)
      return 'light'
    }
  })
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(libraryTheme)
  }, [libraryTheme])

  const currentLanguageName = languages.find((l) => l.id === selectedLanguage)?.name || ''

  const breadcrumbItems = [
    { label: 'الرئيسية', onClick: () => setView('types') },
    ...(currentTypeName
      ? [
          {
            label: currentTypeName,
            onClick: () => (isDirectType ? () => setView('types') : () => setView('curriculums')),
          },
        ]
      : []),
    ...(currentCurriculumName
      ? [{ label: currentCurriculumName, onClick: () => setView('grades') }]
      : []),
    ...(currentLevelName
      ? [{ label: currentLevelName, onClick: () => setView('classrooms') }]
      : []),
    ...(selectedGrade ? [{ label: `الصف ${selectedGrade}`, onClick: () => setView('terms') }] : []),
    ...(currentLanguageName
      ? [{ label: currentLanguageName, onClick: () => setView('types') }]
      : []),
  ]

  const renderPostCard = (post: (typeof staticPosts)[0], i: number) => {
    const isFoundationStyle = selectedType === 'foundation' || selectedType === 'notes'
    const isCoursesStyle = selectedType === 'more'
    const cardStyle =
      selectedType === 'foundation'
        ? {
            gradient: 'from-warning to-warning',
            badge: 'مذكرة تأسيسية',
            icon: Zap,
            sourceText: 'text-warning hover:text-warning',
            fileSizeBadge: 'bg-warning-light text-warning border-warning',
          }
        : {
            gradient: 'from-primary to-primary',
            badge: 'مذكرة',
            icon: FileText,
            sourceText: 'text-primary hover:text-primary',
            fileSizeBadge: 'bg-primary-soft text-primary border-primary/50',
          }
    if (isFoundationStyle)
      return (
        <FoundationCard
          key={post.id}
          post={post}
          cardStyle={cardStyle}
          foundationBtnState={foundationBtnState}
          handleButtonClick={handleFoundationButtonClick}
          i={i}
        />
      )
    return <RegularCard key={post.id} post={post} isCoursesStyle={isCoursesStyle} i={i} />
  }

  return (
    <>
      {showSplash && createPortal(<PageLoader />, document.body)}
      <div className="relative flex min-h-screen flex-col bg-background font-sans">
        <SEO
          title="المكتبة التعليمية"
          description="مكتبة دارين السابعة التعليمية: نصائح للمذاكرة، شرح المناهج الخليجية، تحضير اختبارات القدرات، وأساليب التعلم عن بعد للطلاب في الكويت والسعودية والخليج."
          keywords="مكتبة دارين السابعة, مقالات تعليمية, نصائح المذاكرة, اختبار القدرات, المنهج الكويتي, المنهج السعودي, تعليم عن بعد"
          url="https://dareen.cloud/books"
          image="/dareen_books_banner.webp"
          breadcrumbs={[
            { name: 'الرئيسية', item: '/' },
            { name: 'المكتبة', item: '/books' },
          ]}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'المكتبة التعليمية - دارين السابعة',
            description:
              'مكتبة دارين السابعة التعليمية: كتب، مذكرات، ملخصات، واختبارات للمناهج الخليجية',
            url: 'https://dareen.cloud/books',
            mainEntity: { '@type': 'ItemList', itemListElement: [] },
            publisher: {
              '@type': 'EducationalOrganization',
              name: 'دارين السابعة',
              url: 'https://dareen.cloud',
            },
          })}
        </script>
        <MobileHeader />

        {/* Mobile */}
        <div className="relative bg-surface px-3 pb-0 md:hidden">
          {isHeroView ? (
            <div className="pb-6">
              <MobileHero
                view={view}
                gridItems={gridItems}
                currentTypeName={currentTypeName}
                currentCurriculumName={currentCurriculumName}
                setSearchParams={setSearchParams}
              />
            </div>
          ) : view === 'results' || view === 'language-sections' ? (
            <div className="pb-6">
              <BlogBreadcrumb
                items={breadcrumbItems}
                currentName={currentSubjectName}
                onBack={goBack}
                onHome={() => setView('types')}
                showChangeButton={!isDirectType}
                isMobile
              />
              {loading ? (
                <LoadingState />
              ) : filteredPosts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-3">
                  {filteredPosts.map((post, i) => renderPostCard(post, i))}
                </div>
              )}
              <LoadMore
                page={page}
                totalPages={totalPages}
                loading={loadingMore}
                onLoadMore={loadMore}
              />
            </div>
          ) : (
            <SelectionGrid
              view={view}
              currentClassrooms={currentClassrooms}
              currentSubjects={currentSubjects}
              selectedGrade={selectedGrade}
              termLabel={termLabel}
              currentCurriculumName={currentCurriculumName}
              currentLevelName={currentLevelName}
              filteredCount={filteredPosts.length}
              goBack={goBack}
              onSelectGrade={setSelectedGrade}
              onSelectTerm={setSelectedTerm}
              onSelectSubject={setSelectedSubject}
              isMobile
            />
          )}
        </div>

        {/* Desktop */}
        <main
          id="main-content"
          className="relative hidden overflow-hidden bg-surface pb-0 pt-24 md:block md:pt-32"
        >
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute right-[-10%] top-[-15%] h-[60%] w-[60%] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-[140px]" />
            <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-gradient-to-tr from-info-soft to-transparent blur-[120px]" />
          </div>
          {view === 'types' ? (
            <DesktopLibraryLanding
              posts={posts}
              loading={loading}
              setSearchParams={setSearchParams}
            />
          ) : isHeroView ? (
            <div className="container relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10">
              <DesktopHero
                view={view}
                gridItems={gridItems}
                currentTypeName={currentTypeName}
                currentCurriculumName={currentCurriculumName}
                setSearchParams={setSearchParams}
              />
            </div>
          ) : view === 'results' || view === 'language-sections' ? (
            <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
              <BlogBreadcrumb
                items={breadcrumbItems}
                currentName={currentSubjectName}
                onBack={goBack}
                onHome={() => setView('types')}
                showChangeButton={!isDirectType}
              />
              {loading ? (
                <LoadingState />
              ) : filteredPosts.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post, i) => renderPostCard(post, i))}
                  </div>
                  <LoadMore
                    page={page}
                    totalPages={totalPages}
                    loading={loadingMore}
                    onLoadMore={loadMore}
                  />
                </>
              )}
            </div>
          ) : (
            <SelectionGrid
              view={view}
              currentClassrooms={currentClassrooms}
              currentSubjects={currentSubjects}
              selectedGrade={selectedGrade}
              termLabel={termLabel}
              currentCurriculumName={currentCurriculumName}
              currentLevelName={currentLevelName}
              filteredCount={filteredPosts.length}
              goBack={goBack}
              onSelectGrade={setSelectedGrade}
              onSelectTerm={setSelectedTerm}
              onSelectSubject={setSelectedSubject}
            />
          )}
        </main>
        <PublicFooter />
      </div>
    </>
  )
}
