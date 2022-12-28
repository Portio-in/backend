/*
  Warnings:

  - You are about to drop the `APIToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "APIToken" DROP CONSTRAINT "APIToken_profileId_fkey";

-- DropTable
DROP TABLE "APIToken";

-- CreateTable
CREATE TABLE "apiToken" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "type" "OauthType" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "apiToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apiToken_key_key" ON "apiToken"("key");

-- AddForeignKey
ALTER TABLE "apiToken" ADD CONSTRAINT "apiToken_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
