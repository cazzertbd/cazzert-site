-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OTP_email_idx" ON "OTP"("email");

-- CreateIndex
CREATE INDEX "OTP_otp_idx" ON "OTP"("otp");

-- CreateIndex
CREATE INDEX "OTP_createdAt_idx" ON "OTP"("createdAt");
