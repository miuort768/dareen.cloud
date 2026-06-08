import { Link } from 'react-router-dom';
import { Zap, FileText, ExternalLink, Download, Eye, ArrowLeft, Calendar, Flame, GraduationCap } from 'lucide-react';
import { subjectNameMap } from './LibraryConfig';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    coverImage?: string;
    downloadLink?: string;
    watchLink?: string;
    fileSize?: string;
    file_size?: string;
    downloadButtonText?: string;
    download_button_text?: string;
    watchButtonText?: string;
    watch_button_text?: string;
    source?: string;
    date?: string;
    views?: number;
    subject?: string;
    category?: string;
    [key: string]: unknown;
}

interface FoundationBtnState {
    type: 'download' | 'watch';
    phase: 'counting' | 'ready';
    seconds?: number;
    postId: string;
}

interface FoundationCardProps {
    post: BlogPost;
    cardStyle: {
        gradient: string;
        badge: string;
        icon: React.ElementType;
        sourceText: string;
        fileSizeBadge: string;
    };
    foundationBtnState: FoundationBtnState | null;
    handleButtonClick: (type: 'download' | 'watch', url: string, postId: string, e: React.MouseEvent) => void;
    i: number;
}

export const FoundationCard = ({ post, cardStyle, foundationBtnState, handleButtonClick, i }: FoundationCardProps) => {
    return (
        <div className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="group bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 shadow-sm transition-all duration-500 h-full flex flex-col relative">
                <div className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${cardStyle.gradient}`} />
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black text-white bg-gradient-to-r ${cardStyle.gradient} shadow-sm`}>
                            <cardStyle.icon size={10} />
                            {cardStyle.badge}
                        </span>
                        {(post.fileSize || post.file_size) && (
                            <span className={`shrink-0 inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full ${cardStyle.fileSizeBadge} text-[9px] sm:text-[10px] font-bold border`}>
                                <FileText size={10} />
                                {post.fileSize || post.file_size}
                            </span>
                        )}
                    </div>
                    <h3 className="text-sm sm:text-base sm:lg font-heading font-black text-slate-900 dark:text-slate-50 leading-snug mb-2">{post.title}</h3>
                    {post.source && (
                        <a href={post.source} target="_blank" rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold ${cardStyle.sourceText} transition-colors w-fit mb-2.5 sm:mb-3`}
                            onClick={(e) => e.stopPropagation()}>
                            <ExternalLink size={11} />
                            <span className="truncate max-w-[180px] sm:max-w-[200px]" dir="ltr">{post.source}</span>
                        </a>
                    )}
                    <p className="text-xs sm:text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3 sm:mb-4 flex-1">{post.excerpt}</p>
                    <div className="border-t border-slate-100 dark:border-slate-800/50 pt-3" />
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            {post.downloadLink && (
                                <button onClick={(e) => handleButtonClick('download', post.downloadLink, post.id, e)}
                                    disabled={foundationBtnState !== null && (foundationBtnState.postId !== post.id || foundationBtnState.type !== 'download')}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-[12px] font-black py-3 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98]">
                                    <Download size={14} />
                                    <span>{foundationBtnState?.type === 'download' && foundationBtnState.phase === 'counting' && foundationBtnState.postId === post.id ? `${post.downloadButtonText || post.download_button_text || 'تحميل'} (${foundationBtnState.seconds})` : foundationBtnState?.type === 'download' && foundationBtnState.phase === 'ready' && foundationBtnState.postId === post.id ? 'جاهز ✓' : post.downloadButtonText || post.download_button_text || 'تحميل'}</span>
                                </button>
                            )}
                            {post.watchLink && (
                                <button onClick={(e) => handleButtonClick('watch', post.watchLink, post.id, e)}
                                    disabled={foundationBtnState !== null && (foundationBtnState.postId !== post.id || foundationBtnState.type !== 'watch')}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white text-[12px] font-black py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98]">
                                    <Eye size={14} />
                                    <span>{foundationBtnState?.type === 'watch' && foundationBtnState.phase === 'counting' && foundationBtnState.postId === post.id ? `${post.watchButtonText || post.watch_button_text || 'مشاهدة'} (${foundationBtnState.seconds})` : foundationBtnState?.type === 'watch' && foundationBtnState.phase === 'ready' && foundationBtnState.postId === post.id ? 'جاهز ✓' : post.watchButtonText || post.watch_button_text || 'مشاهدة'}</span>
                                </button>
                            )}
                        </div>
                        <Link to={`/books/${post.slug}`} onClick={() => window.scrollTo(0, 0)}
                            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-[12px] font-black py-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]">
                            <span>اقرأ المقال</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface RegularCardProps {
    post: BlogPost;
    isCoursesStyle: boolean;
    i: number;
}

export const RegularCard = ({ post, isCoursesStyle, i }: RegularCardProps) => {
    const badgeGradient = 'from-rose-500 to-pink-600';

    return (
        <div className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
            <Link to={`/books/${post.slug}`} onClick={() => window.scrollTo(0, 0)}
                className="group block bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/5 transition-all duration-500 h-full flex flex-col">
                <div className={`relative ${isCoursesStyle ? 'h-44' : 'aspect-video'} overflow-hidden bg-slate-50 dark:bg-slate-800/30`}>
                    <img src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} width="400" height="225" loading="lazy" decoding="async" className={`w-full h-full transition-transform duration-700 ease-out ${isCoursesStyle ? 'object-contain scale-[1.15]' : 'object-cover group-hover:scale-105'}`} />
                    <div className={`absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${isCoursesStyle ? 'from-white dark:from-slate-900' : 'from-black/40'} to-transparent`} />
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black text-white shadow-lg ${isCoursesStyle ? `bg-gradient-to-br ${badgeGradient}` : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400'}`}>{subjectNameMap[post.subject] || post.category}</span>
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 mb-2">
                        <span className="flex items-center gap-1"><Calendar size={12} /><span>{post.date?.split('T')[0]}</span></span>
                        {isCoursesStyle && (
                            <span className="flex items-center gap-0.5"><Flame size={12} className="text-orange-500" /><span>{post.views ?? 0}</span></span>
                        )}
                    </div>
                    <h2 className="text-sm sm:text-base font-heading font-black leading-snug mb-2 text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{post.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
                    {isCoursesStyle ? (
                        <div className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-[12px] font-black py-3 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 active:scale-[0.98]">
                            <ArrowLeft size={14} />
                            <span>اقرأ المقال</span>
                        </div>
                    ) : (
                        <div className="mt-4 inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-[11px] group/link">
                            <span>اقرأ المقال</span>
                            <ArrowLeft size={14} className="group-hover/link:-translate-x-1 transition-transform" />
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
};
