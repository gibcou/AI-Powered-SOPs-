-- AlterTable
ALTER TABLE "Sop" ADD COLUMN     "lastReviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Acknowledgment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sopId" TEXT NOT NULL,

    CONSTRAINT "Acknowledgment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Acknowledgment" ADD CONSTRAINT "Acknowledgment_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "Sop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
