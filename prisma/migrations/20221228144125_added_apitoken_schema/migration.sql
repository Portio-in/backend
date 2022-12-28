-- CreateEnum
CREATE TYPE "OauthType" AS ENUM ('github', 'google');

-- CreateTable
CREATE TABLE "APIToken" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "type" "OauthType" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "APIToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "APIToken_key_key" ON "APIToken"("key");

-- AddForeignKey
ALTER TABLE "APIToken" ADD CONSTRAINT "APIToken_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
