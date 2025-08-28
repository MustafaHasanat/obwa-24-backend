-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "failedVerifyAttempts" INTEGER DEFAULT 0;
