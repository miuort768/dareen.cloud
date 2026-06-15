# Fix BlogPost Crash - خطة علاج

## المشكلة
عند النقر على أي مقال في /books/:slug تظهر شاشة ErrorBoundary "عذراً، حدث خطأ غير متوقع"
بدلاً من عرض المقال.

## التشخيص
الخلل في `src/pages/public/BlogPost.tsx`:
- السطر 101: `/<[a-z][\s\S]*>/i.test(post.content)` — `test()` لا يرمي خطأ مع `null`/`undefined`
- السطر 110: `post.content.split(/\n\n/)` — `split()` يرمي TypeError إذا `post.content` كان `null/undefined`
- السطر 114-128: `processContent` يستخدم `post.content` من closure بدل `text` parameter

## التعديلات

### 1. التعديل الأول — تعريف `content` آمن قبل `contentParts`
**الموقع:** `src/pages/public/BlogPost.tsx` سطر ~100

**قبل:**
```typescript
const contentParts = (() => {
    const hasHtml = /<[a-z][\s\S]*>/i.test(post.content);
    if (hasHtml) {
        const match = post.content.match(/<\/p>/i);
        if (match) {
            const idx = match.index! + match[0].length;
            return { first: post.content.slice(0, idx), rest: post.content.slice(idx) };
        }
        return { first: post.content, rest: '' };
    }
    const parts = post.content.split(/\n\n/);
    return { first: parts[0], rest: parts.slice(1).join('\n\n') };
})();
```

**بعد:**
```typescript
const content = post.content || '';
const contentParts = (() => {
    if (!content) return { first: '', rest: '' };
    const hasHtml = /<[a-z][\s\S]*>/i.test(content);
    if (hasHtml) {
        const match = content.match(/<\/p>/i);
        if (match) {
            const idx = match.index! + match[0].length;
            return { first: content.slice(0, idx), rest: content.slice(idx) };
        }
        return { first: content, rest: '' };
    }
    const parts = content.split(/\n\n/);
    return { first: parts[0], rest: parts.slice(1).join('\n\n') };
})();
```

### 2. التعديل الثاني — Fix `processContent` useMemo + guard
**الموقع:** `src/pages/public/BlogPost.tsx` سطر ~114

**قبل:**
```typescript
const processContent = useMemo(() => {
    return (text: string) => {
        const lines = text.split('\n');
        const hasHtml = /<[a-z][\s\S]*>/i.test(post.content);
        const processed = lines.map((line: string) => {
            ...
        });
        return hasHtml ? processed.join('\n') : processed.join('<br/>');
    };
}, [post.content]);
```

**بعد:**
```typescript
const processContent = useMemo(() => {
    return (text: string) => {
        if (!text) return '';
        const lines = text.split('\n');
        const hasHtml = /<[a-z][\s\S]*>/i.test(text);
        const processed = lines.map((line: string) => {
            const trimmed = line.trim();
            const imgRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i;
            if (imgRegex.test(trimmed)) {
                return `<img src="${trimmed}" alt="" loading="lazy" class="w-full h-auto my-8" onerror="this.style.display='none'" />`;
            }
            return line;
        });
        return hasHtml ? processed.join('\n') : processed.join('<br/>');
    };
}, [post.content]);
```

### 3. Optional Chaining لـ coverImage
**الموقع:** سطر 199

**قبل:**
```jsx
<img src={post.coverImage} alt={post.title} loading="lazy" decoding="async" className="w-full h-auto" />
```

**بعد:**
```jsx
<img src={post.coverImage || ''} alt={post.title || ''} loading="lazy" decoding="async" className="w-full h-auto" />
```

## الاختبار
بعد التطبيق، اختبر النقر على كل مقال من صفحة /books والتأكد من:
1. المقال يفتح بدون ErrorBoundary
2. المحتوى يظهر بشكل صحيح
3. الصور تظهر
4. أزرار التحميل/المشاهدة تعمل
5. وضع عدم الاتصال (API fail) يشتغل بالبيانات الثابتة
