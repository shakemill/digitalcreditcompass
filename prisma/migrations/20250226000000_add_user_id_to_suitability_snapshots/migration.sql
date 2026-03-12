-- AlterTable
ALTER TABLE "SuitabilitySnapshot" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "SuitabilitySnapshot_userId_idx" ON "SuitabilitySnapshot"("userId");

-- AddForeignKey
ALTER TABLE "SuitabilitySnapshot" ADD CONSTRAINT "SuitabilitySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
