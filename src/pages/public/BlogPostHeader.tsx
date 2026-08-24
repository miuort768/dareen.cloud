import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  GraduationCap,
  School,
  Tag,
} from 'lucide-react'

const curriculumNames: Record<string, string> = {
  kuwait: 'منهج كويتي',
  qatar: 'منهج قطري',
  uae: 'منهج إماراتي',
  saudi: 'منهج سعودي',
}
const levelNames: Record<string, string> = {
  primary: 'ابتدائي',
  middle: 'متوسط',
  secondary: 'ثانوي',
  basic: 'أساسي',
  preparatory: 'إعدادي',
}
const subjectNames: Record<string, string> = {
  arabic: 'عربي',
  math: 'رياضيات',
  islamic: 'إسلامية',
  english: 'إنجليزي',
  science: 'علوم',
  physics: 'فيزياء',
  chemistry: 'كيمياء',
  biology: 'أحياء',
  history: 'تاريخ',
  geography: 'جغرافيا',
  social: 'اجتماعيات',
  computer: 'حاسب آلي',
  stats: 'إحصاء',
}
const termNames: Record<string, string> = { '1': 'الفصل الأول', '2': 'الفصل الثاني' }
const gradeNames: Record<string, string> = {
  '1': 'الأول',
  '2': 'الثاني',
  '3': 'الثالث',
  '4': 'الرابع',
  '5': 'الخامس',
  '6': 'السادس',
  '7': 'السابع',
  '8': 'الثامن',
  '9': 'التاسع',
  '10': 'العاشر',
  '11': 'الحادي عشر',
  '12': 'الثاني عشر',
}

interface BlogPostHeaderProps {
  post: {
    title: string
    category: string
    date: string
    readingTime?: string | number
    author: string
    contentType?: string
    curriculum?: string
    level?: string
    grade?: string
    term?: string
    subject?: string
    tags?: string
    coverImage?: string
    excerpt?: string
  }
  slug?: string
}

export const BlogPostHeader = ({ post }: BlogPostHeaderProps) => (
  <header className="container mx-auto mb-6 max-w-4xl px-4 md:mb-12">
    <div className="mb-3 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between md:gap-0">
      <div className="order-2 flex flex-wrap items-center gap-4 md:order-1">
        <span className="bg-error-light px-3 py-1.5 text-xs font-black uppercase tracking-widest text-error">
          {post.category}
        </span>
        <div className="flex items-center gap-4 text-xs font-medium text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} /> <span>{post.date}</span>
          </div>
          {post.readingTime ? (
            <div className="flex items-center gap-1.5">
              <Clock size={14} /> <span>{post.readingTime} دقيقة قراءة</span>
            </div>
          ) : null}
          <div className="rounded-lg bg-error-light px-2.5 py-1 text-xs font-black text-error sm:px-3 sm:py-1.5 sm:text-xs">
            <User size={12} className="inline" /> {post.author}
          </div>
          <div className="mt-2 flex items-center gap-2 md:hidden">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-on-success transition-all hover:opacity-80"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.5 6.5a8.5 8.5 0 0 1-3.5 16.2" />
                <path d="M3 21l1.7-5.9a8.5 8.5 0 1 1 5.8 5.8L3 21z" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="12" y1="8" x2="12" y2="16" />
              </svg>
              <span>واتساب</span>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-info px-3 py-1.5 text-xs font-bold text-on-info transition-all hover:opacity-80"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21.2 4.2L2.8 12.9c-.8.3-.7 1.5.1 1.7l5.1 1.4 2 6.3c.3.9 1.4.9 1.7 0L21.2 4.2z" />
                <path d="M11.9 15.7l6.5-6.5" />
                <path d="M9 21l3.4-5.8" />
              </svg>
              <span>تيليجرام</span>
            </a>
          </div>
        </div>
      </div>
      <Link
        to="/books"
        className="order-1 inline-flex w-full items-center justify-center gap-2 rounded-card bg-hover px-4 py-3 text-sm font-bold text-main transition-all hover:bg-primary hover:text-on-primary md:order-2 md:w-auto md:justify-start"
      >
        <ArrowRight size={16} />
        <span>العودة لجميع المقالات</span>
      </Link>
    </div>
    <h1 className="mb-2 font-heading text-2xl font-black leading-tight text-main sm:text-3xl md:mb-4 md:text-4xl lg:text-5xl">
      {post.title}
    </h1>
    {post.contentType !== 'more' &&
      post.contentType !== 'foundation' &&
      (post.curriculum || post.level || post.grade || post.term || post.subject) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {post.curriculum && (
            <span className="border-info/50 inline-flex items-center gap-1 rounded-lg border bg-info-light px-3 py-1.5 text-xs font-bold text-info">
              <BookOpen size={12} />
              {curriculumNames[post.curriculum] || post.curriculum}
            </span>
          )}
          {post.level && (
            <span className="border-success/50 inline-flex items-center gap-1 rounded-lg border bg-success-light px-3 py-1.5 text-xs font-bold text-success">
              <GraduationCap size={12} />
              {levelNames[post.level] || post.level}
            </span>
          )}
          {post.grade && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-primary/50 bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
              <School size={12} />
              الصف {gradeNames[post.grade] || post.grade}
            </span>
          )}
          {post.term && (
            <span className="border-warning/50 inline-flex items-center gap-1 rounded-lg border bg-warning-light px-3 py-1.5 text-xs font-bold text-warning">
              <Tag size={12} />
              {termNames[post.term] || post.term}
            </span>
          )}
          {post.subject && (
            <span className="border-error/50 inline-flex items-center gap-1 rounded-lg border bg-error-light px-3 py-1.5 text-xs font-bold text-error">
              <BookOpen size={12} />
              {subjectNames[post.subject] || post.subject}
            </span>
          )}
        </div>
      )}
    {post.tags &&
      (() => {
        const tags = Array.isArray(post.tags)
          ? post.tags
          : typeof post.tags === 'string'
            ? post.tags.split(',').map((t) => t.trim())
            : []
        if (tags.length === 0) return null
        return (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag: string, i: number) => (
              <span
                key={`tag-${i}`}
                className="rounded-lg bg-surface px-2 py-1 text-micro font-bold text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )
      })()}
  </header>
)
