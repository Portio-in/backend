/*
  Warnings:

  - You are about to drop the `test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "test";

-- CreateTable
CREATE TABLE "TechStackType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "TechStackType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "SocialType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" SERIAL NOT NULL,
    "link" TEXT NOT NULL,
    "socialTypeId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "images" TEXT[],
    "description" TEXT DEFAULT '',
    "liveLink" TEXT DEFAULT '#',
    "codeLink" TEXT DEFAULT '#',
    "readmoreLink" TEXT DEFAULT '#',
    "startingDate" TIMESTAMP(3),
    "endingDate" TIMESTAMP(3),
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" SERIAL NOT NULL,
    "courseName" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "score" TEXT DEFAULT '',
    "subjects" TEXT[],
    "startingDate" TIMESTAMP(3),
    "endingDate" TIMESTAMP(3),
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingExperience" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "startingDate" TIMESTAMP(3),
    "endingDate" TIMESTAMP(3),
    "accomplishments" TEXT[],
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "WorkingExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "completedOn" TIMESTAMP(3),
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfileToTechStackType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectToTechStackType" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TechStackType_name_key" ON "TechStackType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SocialType_type_key" ON "SocialType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "_ProfileToTechStackType_AB_unique" ON "_ProfileToTechStackType"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfileToTechStackType_B_index" ON "_ProfileToTechStackType"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToTechStackType_AB_unique" ON "_ProjectToTechStackType"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToTechStackType_B_index" ON "_ProjectToTechStackType"("B");

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_socialTypeId_fkey" FOREIGN KEY ("socialTypeId") REFERENCES "SocialType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingExperience" ADD CONSTRAINT "WorkingExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileToTechStackType" ADD CONSTRAINT "_ProfileToTechStackType_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileToTechStackType" ADD CONSTRAINT "_ProfileToTechStackType_B_fkey" FOREIGN KEY ("B") REFERENCES "TechStackType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToTechStackType" ADD CONSTRAINT "_ProjectToTechStackType_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToTechStackType" ADD CONSTRAINT "_ProjectToTechStackType_B_fkey" FOREIGN KEY ("B") REFERENCES "TechStackType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
