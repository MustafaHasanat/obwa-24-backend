-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_bookletId_fkey";

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "bookletId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_bookletId_fkey" FOREIGN KEY ("bookletId") REFERENCES "public"."Booklet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
