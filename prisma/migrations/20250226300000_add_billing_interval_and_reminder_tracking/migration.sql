-- AlterTable
ALTER TABLE "User" ADD COLUMN "billingInterval" TEXT,
ADD COLUMN "subscriptionReminder7dForEnd" TIMESTAMP(3),
ADD COLUMN "subscriptionReminder1dForEnd" TIMESTAMP(3),
ADD COLUMN "subscriptionReminder30dForEnd" TIMESTAMP(3);
