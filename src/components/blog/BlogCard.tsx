import { Link } from 'react-router-dom';
import { Image } from '../../shared/components/ui';
import { FileText, ExternalLink, Download, Eye, ArrowLeft, Calendar, Flame } from 'lucide-react';
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
    const borderAccent = cardStyle.gradient.includes('warning') ? 'border-s-warning'
        : cardStyle.gradient.includes('primary') ? 'border-s-primary'
        : 'border-s-primary';

    return (
        <div className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`group bg-card border border-border rounded-2xl transition-all duration-200 h-full flex flex-col relative overflow-hidden hover:shadow-sm hover:-translate-y-0.5 ${borderAccent}`}>
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-on-primary bg-gradient-to-r ${cardStyle.gradient}`}>
                            <cardStyle.icon size={10} />
                            {cardStyle.badge}
                        </span>
                        {(post.fileSize || post.file_size) && (
                            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg ${cardStyle.fileSizeBadge} text-[10px] font-bold border`}>
                                <FileText size={10} />
                                {post.fileSize || post.file_size}
                            </span>
                        )}
                    </div>

                    <h3 className="text-sm sm:text-base font-heading font-black text-main leading-snug mb-2">{post.title}</h3>

                    {post.source && (
                        <a href={post.source} target="_blank" rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${cardStyle.sourceText} transition-colors w-fit mb-3`}
                            onClick={(e) => e.stopPropagation()}>
                            <ExternalLink size={10} />
                            <span className="truncate max-w-[200px]" dir="ltr">{post.source}</span>
                        </a>
                    )}

                    <p className="text-[11px] sm:text-xs text-muted leading-relaxed line-clamp-2 mb-4 flex-1">{post.excerpt}</p>

                    <div className="border-t border-border pt-3" />

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            {post.downloadLink && (
                                <button type="button" onClick={(e) => handleButtonClick('download', post.downloadLink, post.id, e)}
                                    disabled={foundationBtnState !== null && (foundationBtnState.postId !== post.id || foundationBtnState.type !== 'download')}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-warning text-on-warning hover:bg-warning-hover text-[11px] font-extrabold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98]">
                                    <Download size={13} />
                                    <span>{foundationBtnState?.type === 'download' && foundationBtnState.phase === 'counting' && foundationBtnState.postId === post.id ? `${post.downloadButtonText || post.download_button_text || 'تحميل'} (${foundationBtnState.seconds})` : foundationBtnState?.type === 'download' && foundationBtnState.phase === 'ready' && foundationBtnState.postId === post.id ? 'جاهز' : post.downloadButtonText || post.download_button_text || 'تحميل'}</span>
                                </button>
                            )}
                            {post.watchLink && (
                                <button type="button" onClick={(e) => handleButtonClick('watch', post.watchLink, post.id, e)}
                                    disabled={foundationBtnState !== null && (foundationBtnState.postId !== post.id || foundationBtnState.type !== 'watch')}
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary-hover text-[11px] font-extrabold py-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98]">
                                    <Eye size={13} />
                                    <span>{foundationBtnState?.type === 'watch' && foundationBtnState.phase === 'counting' && foundationBtnState.postId === post.id ? `${post.watchButtonText || post.watch_button_text || 'مشاهدة'} (${foundationBtnState.seconds})` : foundationBtnState?.type === 'watch' && foundationBtnState.phase === 'ready' && foundationBtnState.postId === post.id ? 'جاهز' : post.watchButtonText || post.watch_button_text || 'مشاهدة'}</span>
                                </button>
                            )}
                        </div>
                        <Link to={`/books/${post.slug}`} onClick={() => window.scrollTo(0, 0)}
                            className="w-full inline-flex items-center justify-center gap-2 bg-success text-on-success hover:bg-success-hover text-[11px] font-extrabold py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98]">
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
    return (
        <div className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
            <Link to={`/books/${post.slug}`} onClick={() => window.scrollTo(0, 0)}
                className="group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                <div className={`relative ${isCoursesStyle ? 'h-44' : 'aspect-video'} overflow-hidden bg-surface`}>
                    <Image src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} className="w-full h-full" imgClassName={`transition-transform duration-500 ${isCoursesStyle ? 'object-contain scale-[1.15]' : 'group-hover:scale-105'}`} />
                    <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${isCoursesStyle ? 'from-card' : 'from-black/30'} to-transparent`} />
                    <div className="absolute top-3 start-3 z-10">
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${isCoursesStyle ? 'bg-gradient-to-br from-error to-primary text-on-primary' : 'bg-card/90 backdrop-blur-sm text-primary border border-border'}`}>
                            {subjectNameMap[post.subject] || post.category}
                        </span>
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-muted mb-2">
                        <span className="flex items-center gap-1"><Calendar size={11} /><span>{post.date?.split('T')[0]}</span></span>
                        {isCoursesStyle && (
                            <span className="flex items-center gap-0.5"><Flame size={11} className="text-warning" /><span>{post.views ?? 0}</span></span>
                        )}
                    </div>
                    <h2 className="text-sm sm:text-base font-heading font-black leading-snug mb-2 text-main group-hover:text-primary transition-colors">{post.title}</h2>
                    <p className="text-[11px] sm:text-xs text-muted leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>

                    {isCoursesStyle ? (
                        <div className="mt-4 inline-flex items-center justify-center gap-2 bg-success text-on-success hover:bg-success-hover text-[11px] font-extrabold py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98]">
                            <ArrowLeft size={13} />
                            <span>اقرأ المقال</span>
                        </div>
                    ) : (
                        <div className="mt-4 inline-flex items-center gap-1.5 text-primary font-extrabold text-[11px] group/link">
                            <span>اقرأ المقال</span>
                            <ArrowLeft size={13} className="group-hover/link:-translate-x-1 transition-transform" />
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
};
