import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Image } from '../../shared/components/ui';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { blogPosts as staticPosts, type BlogPost } from '../../data/blogPosts';
import { MessageCircle, Send, Zap, FileText, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useSettingsStore } from '../../store/settingsStore';
import { useAcademyName } from '../../context/AppContext';
import { types, curriculums, gradesMap, subjectsMap, classroomsMap, directTypes } from '../../components/blog/LibraryConfig';
import type { ViewType } from '../../components/blog/LibraryConfig';
import { FoundationCard, RegularCard } from '../../components/blog/BlogCard';
import { BlogBreadcrumb } from '../../components/blog/BlogBreadcrumb';
import { LoadMore } from '../../components/blog/LoadMore';
import { LoadingState, EmptyState } from '../../components/blog/BlogStates';
import { MobileHero, DesktopHero } from '../../components/blog/HeroSelection';
import { DesktopLibraryLanding } from '../../components/blog/DesktopLibraryLanding';
import { SelectionGrid } from '../../components/blog/SelectionGrid';
import { PageLoader } from '../../components/ui/PageLoader';

export const Blog = () => {
  const navigate = useNavigate();
  const adminPhone = useSettingsStore(s => s.adminPhone);
  const libraryWhatsapp = useSettingsStore(s => s.libraryWhatsapp);
  const libraryTelegram = useSettingsStore(s => s.libraryTelegram);
  const academyName = useAcademyName();
  const whatsappNumber = adminPhone.replace(/\D/g, '');
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get('view') as ViewType) || 'types';
  const selectedType = searchParams.get('type') || '';
  const selectedCurriculum = searchParams.get('curriculum') || '';
  const selectedLevel = searchParams.get('level') || '';
  const selectedGrade = searchParams.get('grade') || '';
  const selectedTerm = searchParams.get('term') || '';
  const selectedSubject = searchParams.get('subject') || '';
  const [showSplash, setShowSplash] = useState(true);
  const [foundationBtnState, setFoundationBtnState] = useState<{ type: 'download' | 'watch'; phase: 'counting' | 'ready'; seconds?: number; postId: string } | null>(null);
  const foundationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
  }, []);

  const { data: postsData, isLoading: loading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const res = await api.get<{ posts?: BlogPost[]; data?: BlogPost[]; totalPages?: number } | BlogPost[]>('/blog?page=1&limit=12');
      const posts = res?.posts || res?.data || (Array.isArray(res) ? res : []);
      return { posts, totalPages: res?.totalPages || 1 };
    },
  });

  const basePosts = postsData?.posts?.length > 0 ? postsData.posts : staticPosts;
  const totalPages = postsData?.totalPages || 1;

  const [allPosts, setAllPosts] = useState<typeof staticPosts>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (postsData) setAllPosts(basePosts);
  }, [postsData, basePosts]);

  const posts = allPosts.length > 0 ? allPosts : basePosts;

  const handleFoundationButtonClick = (type: 'download' | 'watch', url: string, postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (foundationBtnState?.postId === postId && foundationBtnState?.type === type && foundationBtnState.phase === 'ready') {
      window.open(url, '_blank', 'noopener,noreferrer');
      setFoundationBtnState(null);
      return;
    }
    if (foundationBtnState) return;
    setFoundationBtnState({ type, phase: 'counting', seconds: 9, postId });
    foundationTimerRef.current = setInterval(() => {
      setFoundationBtnState(prev => {
        if (!prev || prev.seconds! <= 1) {
          if (foundationTimerRef.current) clearInterval(foundationTimerRef.current);
          foundationTimerRef.current = null;
          return { type, phase: 'ready', postId };
        }
        return { ...prev, seconds: prev.seconds! - 1 };
      });
    }, 1000);
  };

  useEffect(() => {
    return () => { if (foundationTimerRef.current) clearInterval(foundationTimerRef.current); };
  }, []);

  const setView = useCallback((v: ViewType) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('view', v);
      if (v === 'types') { ['type','curriculum','level','grade','term','subject'].forEach(k => next.delete(k)); }
      else if (v === 'curriculums') { ['level','grade','term','subject'].forEach(k => next.delete(k)); }
      else if (v === 'grades') { ['grade','term','subject'].forEach(k => next.delete(k)); }
      else if (v === 'classrooms') { ['term','subject'].forEach(k => next.delete(k)); }
      else if (v === 'terms') { next.delete('subject'); }
      return next;
    });
  }, [setSearchParams]);


  const setSelectedGrade = useCallback((id: string) => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('grade', id); n.set('view', 'terms'); n.delete('subject'); return n; }); }, [setSearchParams]);
  const setSelectedTerm = useCallback((id: string) => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('term', id); n.set('view', 'subjects'); return n; }); }, [setSearchParams]);
  const setSelectedSubject = useCallback((id: string) => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('subject', id); n.set('view', 'results'); return n; }); }, [setSearchParams]);

  const currentTypeName = types.find(t => t.id === selectedType)?.name || '';
  const currentCurriculumName = curriculums.find(c => c.id === selectedCurriculum)?.name || '';
  const currentLevelName = gradesMap[selectedCurriculum]?.find(g => g.id === selectedLevel)?.name || '';
  const currentSubjectName = (subjectsMap[selectedLevel] || subjectsMap.middle).find(s => s.id === selectedSubject)?.name || '';
  const currentGrades = gradesMap[selectedCurriculum] || [];
  const currentClassrooms = classroomsMap[selectedCurriculum]?.[selectedLevel] || [];
  const currentSubjects = subjectsMap[selectedLevel] || subjectsMap.middle;
  const termLabel = selectedTerm === '1' ? 'ترم أول' : selectedTerm === '2' ? 'ترم ثاني' : 'الكل';

  const filteredPosts = view === 'results' ? posts.filter(p => {
    if (selectedType && p.contentType && p.contentType !== selectedType) return false;
    if (selectedCurriculum && p.curriculum !== selectedCurriculum) return false;
    if (selectedLevel && p.level !== selectedLevel) return false;
    if (selectedGrade && p.grade !== selectedGrade) return false;
    if (selectedTerm && p.term && p.term !== selectedTerm) return false;
    if (selectedSubject && p.subject !== selectedSubject) return false;
    return true;
  }) : posts;

  const isDirectType = directTypes.includes(selectedType);

  const goBack = () => {
    if (view === 'results') setView(isDirectType ? 'types' : 'subjects');
    else if (view === 'subjects') setView('terms');
    else if (view === 'terms') setView('classrooms');
    else if (view === 'classrooms') setView('grades');
    else if (view === 'grades') setView('curriculums');
    else if (view === 'curriculums') setView('types');
    else navigate('/');
  };

  const isHeroView = view === 'types' || view === 'curriculums' || view === 'grades';
  const gridItems = view === 'types' ? types : view === 'curriculums' ? curriculums : currentGrades;

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.get<{ posts?: BlogPost[]; data?: BlogPost[] } | BlogPost[]>(`/blog?page=${nextPage}&limit=12`);
      const fetchedPosts = res?.posts || res?.data || (Array.isArray(res) ? res : []);
      setAllPosts(prev => [...prev, ...fetchedPosts]);
      setPage(nextPage);
    } catch (e) { console.warn(e); } finally { setLoadingMore(false); }
  };

  const [libraryTheme] = useState(() => {
    try { return localStorage.getItem('library-theme') || 'light'; } catch (e) { console.warn(e); return 'light'; }
  });
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(libraryTheme);
  }, [libraryTheme]);

  const breadcrumbItems = [
    { label: 'الرئيسية', onClick: () => setView('types') },
    ...(currentTypeName ? [{ label: currentTypeName, onClick: () => isDirectType ? () => setView('types') : () => setView('curriculums') }] : []),
    ...(currentCurriculumName ? [{ label: currentCurriculumName, onClick: () => setView('grades') }] : []),
    ...(currentLevelName ? [{ label: currentLevelName, onClick: () => setView('classrooms') }] : []),
    ...(selectedGrade ? [{ label: `الصف ${selectedGrade}`, onClick: () => setView('terms') }] : []),
  ];

  const renderPostCard = (post: typeof staticPosts[0], i: number) => {
    const isFoundationStyle = selectedType === 'foundation' || selectedType === 'notes';
    const isCoursesStyle = selectedType === 'more';
    const cardStyle = selectedType === 'foundation'
        ? { gradient: 'from-warning to-warning', badge: 'مذكرة تأسيسية', icon: Zap, sourceText: 'text-warning hover:text-warning', fileSizeBadge: 'bg-warning-light text-warning border-warning/50' }
        : { gradient: 'from-primary to-primary', badge: 'مذكرة', icon: FileText, sourceText: 'text-primary hover:text-primary', fileSizeBadge: 'bg-primary-soft text-primary border-primary/50' };
    if (isFoundationStyle) return <FoundationCard key={post.id} post={post} cardStyle={cardStyle} foundationBtnState={foundationBtnState} handleButtonClick={handleFoundationButtonClick} i={i} />;
    return <RegularCard key={post.id} post={post} isCoursesStyle={isCoursesStyle} i={i} />;
  };

  return (
    <>
      {showSplash && createPortal(<PageLoader />, document.body)}
      <div className="min-h-screen bg-background font-sans relative flex flex-col">
      <SEO title="المكتبة التعليمية"
        description="مكتبة دارين السابعة التعليمية: نصائح للمذاكرة، شرح المناهج الخليجية، تحضير اختبارات القدرات، وأساليب التعلم عن بعد للطلاب في الكويت والسعودية والخليج."
        keywords="مكتبة دارين, مقالات تعليمية, نصائح المذاكرة, اختبار القدرات, المنهج الكويتي, المنهج السعودي, تعليم عن بعد"
        url="https://dareen.cloud/books" image="/dareen_books_banner.webp"
        breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'المكتبة', item: '/books' }]} />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org', '@type': 'CollectionPage',
          name: 'المكتبة التعليمية - دارين السابعة',
          description: 'مكتبة دارين السابعة التعليمية: كتب، مذكرات، ملخصات، واختبارات للمناهج الخليجية',
          url: 'https://dareen.cloud/books',
          mainEntity: { '@type': 'ItemList', itemListElement: [] },
          publisher: { '@type': 'EducationalOrganization', name: 'دارين السابعة', url: 'https://dareen.cloud' }
        })}
      </script>
      <MobileHeader />

      {/* Mobile */}
      <div className="md:hidden pb-0 px-3 relative bg-surface">
        {isHeroView ? (
          <div className="pb-6">
            {/* Hero Banner — Premium dark gradient */}
            <div className="relative rounded-[1.75rem] overflow-hidden mb-5 bg-gradient-to-bl from-primary-deep via-primary to-primary-deep">
              {/* Background layers */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-50%] start-[-30%] w-[80%] h-[120%] bg-gradient-to-br from-white/[0.04] to-transparent rounded-full blur-[60px]" />
                <div className="absolute bottom-[-30%] end-[-20%] w-[70%] h-[100%] bg-gradient-to-tl from-accent/8 to-transparent rounded-full blur-[50px]" />
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              </div>

              <div className="relative p-5">
                {/* Top row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                    </span>
                    <span className="text-[10px] font-extrabold text-white/90">المكتبة التعليمية</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a href={`https://wa.me/${libraryWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن المكتبة التعليمية')}`}
                      target="_blank" rel="noopener noreferrer"
                       className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95"
                       aria-label="واتساب">
                      <MessageCircle size={13} className="text-white/70" />
                    </a>
                    <a href={libraryTelegram.startsWith('http') ? libraryTelegram : `https://t.me/${libraryTelegram}`}
                      target="_blank" rel="noopener noreferrer"
                       className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95"
                       aria-label="تيليجرام">
                        <Send size={13} className="text-white/70" />
                    </a>
                  </div>
                </div>

                {/* Content + Image */}
                <div className="flex items-end gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-black text-white leading-tight mb-1.5 font-heading">
                      مكتبة <span className="text-accent">{academyName}</span>
                    </h1>
                    <p className="text-[11px] text-white/50 leading-relaxed mb-4 font-medium">
                      أفضل الكتب والمذكرات والملخصات لجميع المراحل
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4">
                      {[
                        { value: `${posts.length}+`, label: 'مادة' },
                        { value: '٤', label: 'منهج' },
                        { value: '٤', label: 'دولة' },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-accent">{s.value}</span>
                          <span className="text-[9px] text-white/40 font-bold">{s.label}</span>
                        </div>
                      ))}
                    </div>

                    <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
                      target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center justify-center gap-2 bg-accent text-primary-deep text-[11px] font-extrabold px-5 py-2.5 rounded-xl hover:bg-accent-hover transition-all active:scale-[0.97] shadow-[0_4px_20px_rgba(212,175,55,0.3)]">
                      طلب حصة مجانية
                    </a>
                  </div>
                  <div className="relative shrink-0 w-20 h-20">
                    <div className="absolute inset-0 bg-white/5 rounded-full blur-xl pointer-events-none" />
                    <Image src="/bbook.webp" alt={`بوابة ${academyName}`} className="relative w-full h-full" imgClassName="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]" />
                  </div>
                </div>

                {/* Floating card */}
                <div className="absolute top-[18%] end-[10%] bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.15)] pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-success/20 flex items-center justify-center">
                      <CheckCircle size={10} className="text-success" />
                    </span>
                    <span className="text-[9px] font-extrabold text-white/80">حلول معتمدة</span>
                  </div>
                </div>
              </div>
            </div>

            <MobileHero view={view} gridItems={gridItems} currentTypeName={currentTypeName} currentCurriculumName={currentCurriculumName} setSearchParams={setSearchParams} />
          </div>
        ) : view === 'results' ? (
          <div className="pb-6">
            <BlogBreadcrumb items={breadcrumbItems} currentName={currentSubjectName} onBack={goBack} onHome={() => setView('types')} showChangeButton={!isDirectType} isMobile />
            {loading ? <LoadingState /> : filteredPosts.length === 0 ? <EmptyState /> : (
              <div className="space-y-3">{filteredPosts.map((post, i) => renderPostCard(post, i))}</div>
            )}
            <LoadMore page={page} totalPages={totalPages} loading={loadingMore} onLoadMore={loadMore} />
          </div>
        ) : (
          <SelectionGrid view={view} currentClassrooms={currentClassrooms} currentSubjects={currentSubjects}
            selectedGrade={selectedGrade} termLabel={termLabel}
            currentCurriculumName={currentCurriculumName} currentLevelName={currentLevelName}
            filteredCount={filteredPosts.length} goBack={goBack}
            onSelectGrade={setSelectedGrade} onSelectTerm={setSelectedTerm} onSelectSubject={setSelectedSubject} isMobile />
        )}
      </div>

      {/* Desktop */}
      <main id="main-content" className="hidden md:block pt-24 md:pt-32 pb-0 relative overflow-hidden bg-surface">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-info/3 to-transparent rounded-full blur-[120px]" />
        </div>
        {view === 'types' ? (
          <DesktopLibraryLanding posts={posts} loading={loading} setSearchParams={setSearchParams} />
        ) : (
          <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
            {isHeroView ? (
              <DesktopHero view={view} gridItems={gridItems} currentTypeName={currentTypeName} currentCurriculumName={currentCurriculumName} setSearchParams={setSearchParams} />
            ) : view === 'results' ? (
              <div className="max-w-6xl mx-auto">
                <BlogBreadcrumb items={breadcrumbItems} currentName={currentSubjectName} onBack={goBack} onHome={() => setView('types')} showChangeButton={!isDirectType} />
                {loading ? <LoadingState /> : filteredPosts.length === 0 ? <EmptyState /> : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredPosts.map((post, i) => renderPostCard(post, i))}
                    </div>
                    <LoadMore page={page} totalPages={totalPages} loading={loadingMore} onLoadMore={loadMore} />
                  </>
                )}
              </div>
            ) : (
              <SelectionGrid view={view} currentClassrooms={currentClassrooms} currentSubjects={currentSubjects}
                selectedGrade={selectedGrade} termLabel={termLabel}
                currentCurriculumName={currentCurriculumName} currentLevelName={currentLevelName}
                filteredCount={filteredPosts.length} goBack={goBack}
                onSelectGrade={setSelectedGrade} onSelectTerm={setSelectedTerm} onSelectSubject={setSelectedSubject} />
            )}
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
    </>
  );
};
