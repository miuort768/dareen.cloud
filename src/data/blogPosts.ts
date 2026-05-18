export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // Markdown or HTML
    coverImage: string;
    date: string;
    author: string;
    category: string;
    keywords: string;
    contentType?: string;
    curriculum?: string;
    level?: string;
    grade?: string;
    term?: string;
    subject?: string;
}

export const blogPosts: BlogPost[] = [];
