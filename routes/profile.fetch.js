const router = require("express").Router();
const prisma = require("../db").getInstance();


router.get("/", async (req, res, next) => {
    try {
        const { domain } = req.query;
        if (!domain) res.status(400).send({"message": "Bad Request"});
        const profile = await prisma.profile.findFirst({
            where: {
                domain: domain
            },
            select: {
                name: true,
                email: true,
                domain: true,
                phone: true,
                avatar: true,
                description: true,
                tagline: true,
                resumeLink: true,
                techStacks: {
                    select: {
                        name: true,
                        icon: true
                    }
                },
                socialLinks: {
                    select: {
                        link: true,
                        type: {
                            select: {
                                icon: true,
                                type: true
                            }
                        }
                    }
                },
                projects: {
                    select: {
                        title: true,
                        coverImage: true,
                        images: true,
                        description: true,
                        techStacks: {
                            select: {
                                name: true,
                                icon: true
                            }
                        },
                        liveLink: true,
                        readMoreLink: true,
                        codeLink: true,
                        startingDate: true,
                        endingDate: true,
                    }
                },
                educations: {
                    select: {
                        courseName: true,
                        institutionName: true,
                        score: true,
                        subjects: true,
                        startingDate: true,
                        endingDate: true,
                    }
                },
                experiences: {
                    select: {
                        role: true,
                        organization: true,
                        accomplishments: true,
                        startingDate: true,
                        endingDate: true
                    }
                },
                certificates: {
                    select: {
                        title: true,
                        link: true,
                        providedBy: true,
                        completedOn: true,
                    }
                },
                achievements: {
                    select: {
                        title: true,
                        description: true,
                        referenceLink: true,
                        date: true,
                    }
                }
            }
        })
        res.send(profile);
    } catch (error) {
        res.status(500).send({"message": "Internal Server Error"});
    }
})


module.exports = router;