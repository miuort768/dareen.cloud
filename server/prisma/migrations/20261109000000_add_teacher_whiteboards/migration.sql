-- Add Teacher Whiteboard Table
CREATE TABLE "teacher_whiteboards" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'سبورة جديدة',
    "pages_data" TEXT NOT NULL DEFAULT '[]',
    "thumbnail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_whiteboards_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "teacher_whiteboards_teacher_id_idx" ON "teacher_whiteboards"("teacher_id");
CREATE INDEX "teacher_whiteboards_updated_at_idx" ON "teacher_whiteboards"("updated_at");

ALTER TABLE "teacher_whiteboards" ADD CONSTRAINT "teacher_whiteboards_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
