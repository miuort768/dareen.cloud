-- CreateTable
CREATE TABLE "teacher_payment_settings" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "wallet_provider" TEXT,
    "wallet_phone" TEXT,
    "instapay_id" TEXT,
    "account_holder" TEXT,
    "instapay_phone" TEXT,
    "iban" TEXT,
    "bank_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_payment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_payment_settings_teacher_id_key" ON "teacher_payment_settings"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_payment_settings_teacher_id_idx" ON "teacher_payment_settings"("teacher_id");

-- AddForeignKey
ALTER TABLE "teacher_payment_settings" ADD CONSTRAINT "teacher_payment_settings_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
