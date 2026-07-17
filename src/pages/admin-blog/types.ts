export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: string;
    keywords: string;
    author: string;
    date: string;
    contentType: string;
    curriculum: string;
    level: string;
    grade: string;
    term: string;
    subject: string;
    downloadLink: string;
    watchLink: string;
    showButtons: boolean;
    downloadButtonText: string;
    watchButtonText: string;
    isNew: boolean;
    views: number;
    seoTitle: string;
    seoDescription: string;
    ogImage: string;
    focusKeyword: string;
    readingTime: number;
    canonicalUrl: string;
    robotsIndex: boolean;
    isFeatured: boolean;
    tags: string;
    fileSize?: string;
    source?: string;
}

export interface BlogPostRaw {
    file_size?: string;
    show_buttons?: boolean | number;
    download_button_text?: string;
    watch_button_text?: string;
    [key: string]: unknown;
}
