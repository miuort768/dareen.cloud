# بناء الواجهة الأمامية (Frontend Build)
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# نسخ ملفات الحزم وتثبيت التبعيات
COPY package*.json ./
RUN npm install --ignore-scripts

# إعداد متغيرات البناء
ARG VITE_API_URL
ARG VITE_LIVEKIT_URL
ARG VITE_ATTENDANCE_SECRET
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_LIVEKIT_URL=$VITE_LIVEKIT_URL
ENV VITE_ATTENDANCE_SECRET=$VITE_ATTENDANCE_SECRET

# نسخ ملفات المشروع وبناء الواجهة
COPY . .
RUN npm run build

# بناء الخادم (Backend)
FROM node:22-alpine

WORKDIR /app

# تثبيت أدوات البناء لـ sqlite3 (python3, make, g++)
RUN apk add --no-cache python3 make g++

# نسخ ملفات الحزم وتثبيت التبعيات
COPY server/package*.json ./server/
RUN cd server && npm install

# نسخ بقية كود الخادم (بما في ذلك السكيما)
COPY --chown=node:node server/ ./server/

# توليد Prisma Client من schema.prisma الموحّد ثم إزالة devDeps
ENV DATABASE_URL=postgresql://placeholder:placeholder@postgres:5432/placeholder
RUN cd server && npx prisma generate && npm prune --production

# نسخ الملفات المبنية من الواجهة الأمامية
COPY --from=frontend-builder /app/dist ./dist

# إعداد المتغيرات البيئية
ENV NODE_ENV=production
ENV PORT=3001

# إنشاء دليل السجلات بصلاحيات المستخدم غير الجذر
RUN mkdir -p /app/logs && chown -R node:node /app/logs

# تشغيل التطبيق كمستخدم غير جذر
USER node

# فتح المنفذ
EXPOSE 3001

# تشغيل التطبيق
CMD ["node", "server/index.js"]
