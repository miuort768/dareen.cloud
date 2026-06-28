# بناء الواجهة الأمامية (Frontend Build)
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# نسخ ملفات الحزم وتثبيت التبعيات
COPY package*.json ./
RUN npm install --ignore-scripts

# إعداد متغيرات البناء
ARG VITE_API_URL
ARG VITE_LIVEKIT_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_LIVEKIT_URL=$VITE_LIVEKIT_URL

# نسخ ملفات المشروع وبناء الواجهة
COPY . .
RUN npm run build

# بناء الخادم (Backend)
FROM node:22-alpine

WORKDIR /app

# نسخ ملفات الحزم وتثبيت التبعيات
COPY server/package*.json ./server/
RUN cd server && npm install

# نسخ بقية كود الخادم (بما في ذلك السكيما)
COPY server/ ./server/

# تبديل سكيما Prisma إلى PostgreSQL وتوليد العميل ثم إزالة devDeps
RUN cp ./server/prisma/schema.pg.prisma ./server/prisma/schema.prisma
ENV DATABASE_URL=postgresql://placeholder:placeholder@postgres:5432/placeholder
RUN cd server && npx prisma generate && npm prune --production

# نسخ الملفات المبنية من الواجهة الأمامية
COPY --from=frontend-builder /app/dist ./dist

# إعداد المتغيرات البيئية
ENV NODE_ENV=production
ENV PORT=3001

# فتح المنفذ
EXPOSE 3001

# تشغيل التطبيق
CMD ["node", "server/index.js"]
