# بناء الواجهة الأمامية (Frontend Build)
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# نسخ ملفات الحزم وتثبيت التبعيات
COPY package*.json ./
RUN npm install --ignore-scripts

# إعداد متغيرات البناء
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# نسخ ملفات المشروع وبناء الواجهة
COPY . .
RUN npm run build

# بناء الخادم (Backend)
FROM node:18-alpine

WORKDIR /app

# تثبيت متطلبات sqlite3 للنسخ Alpine
RUN apk add --no-cache python3 make g++

# نسخ ملفات حزم الخادم وتثبيت التبعيات
COPY server/package*.json ./server/
RUN cd server && npm install --production

# نسخ الملفات المبنية من الواجهة الأمامية
COPY --from=frontend-builder /app/dist ./dist

# نسخ كود الخادم
COPY server/ ./server/

# إعداد المتغيرات البيئية
ENV NODE_ENV=production
ENV PORT=3001

# فتح المنفذ
EXPOSE 3001

# تشغيل التطبيق
CMD ["node", "server/index.js"]
