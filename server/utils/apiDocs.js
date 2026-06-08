const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'دارين السابعة API',
        description: 'الوثيقة الرسمية لواجهة برمجة تطبيقات منصة دارين السابعة للتعليم والتدريب',
        version: '1.0.0',
        contact: { url: 'https://dareen.cloud' }
    },
    servers: [
        { url: 'https://dareen.cloud/api', description: 'الإنتاج' },
        { url: 'http://localhost:3001/api', description: 'تطوير' }
    ],
    paths: {
        '/blog': {
            get: {
                summary: 'قائمة المقالات',
                description: 'يعرض المقالات مع pagination أو جميع المقالات إذا أرسلت ?all=true',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 12, maximum: 100 } },
                    { name: 'all', in: 'query', schema: { type: 'string', enum: ['true'] } }
                ],
                responses: {
                    '200': { description: 'قائمة المقالات' }
                }
            },
            post: {
                summary: 'إضافة مقال جديد',
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogPost' } } } },
                responses: { '201': { description: 'تم الإنشاء' }, '400': { description: 'خطأ في التحقق' } }
            }
        },
        '/blog/{slug}': {
            get: {
                summary: 'مقال واحد',
                parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'تفاصيل المقال' }, '404': { description: 'غير موجود' } }
            }
        },
        '/blog/{id}': {
            put: { summary: 'تحديث مقال', security: [{ bearerAuth: [] }], responses: { '200': { description: 'تم التحديث' } } },
            delete: { summary: 'حذف مقال', security: [{ bearerAuth: [] }], responses: { '200': { description: 'تم الحذف' } } }
        },
        '/upload/blog-image': {
            post: {
                summary: 'رفع صورة للمقالات',
                security: [{ bearerAuth: [] }],
                requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } } } },
                responses: { '200': { description: 'رابط الصورة' } }
            }
        },
        '/health': {
            get: { summary: 'فحص الصحة', responses: { '200': { description: 'الحالة' } } }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        },
        schemas: {
            BlogPost: {
                type: 'object',
                required: ['title', 'slug'],
                properties: {
                    title: { type: 'string', description: 'عنوان المقال' },
                    slug: { type: 'string', description: 'الرابط المختصر (أحرف إنجليزية وأرقام وشرطات)' },
                    excerpt: { type: 'string' },
                    content: { type: 'string' },
                    coverImage: { type: 'string', format: 'uri' },
                    category: { type: 'string' },
                    keywords: { type: 'string' },
                    author: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    contentType: { type: 'string', enum: ['foundation', 'solutions', 'notes', 'more'] },
                    curriculum: { type: 'string', enum: ['kuwait', 'qatar', 'uae', 'saudi'] },
                    level: { type: 'string' },
                    grade: { type: 'string' },
                    term: { type: 'string' },
                    subject: { type: 'string' },
                    downloadLink: { type: 'string', format: 'uri' },
                    watchLink: { type: 'string', format: 'uri' },
                    showButtons: { type: 'boolean', default: true },
                    source: { type: 'string', format: 'uri' },
                    fileSize: { type: 'string' }
                }
            }
        }
    }
};

module.exports = openApiSpec;
