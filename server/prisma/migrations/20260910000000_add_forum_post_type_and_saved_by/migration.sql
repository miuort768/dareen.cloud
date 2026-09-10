-- إضافة نوع المنشور وقائمة الحفظ للمنتدى (تغيير إضافي آمن — لا يكسر البيانات)
-- type: سؤال question / مناقشة discussion / نصيحة tip / إعلان announcement
-- savedBy: JSON array من معرفات المستخدمين الذين حفظوا المنشور (نفس نمط upvotes — بدون @map)

ALTER TABLE "forum_posts" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'discussion';
ALTER TABLE "forum_posts" ADD COLUMN "savedBy" TEXT DEFAULT '[]';

CREATE INDEX "forum_posts_type_idx" ON "forum_posts"("type");
