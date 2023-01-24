const { route } = require("./auth");

const router = require("express").Router();
const prisma = require("../db").getInstance();

// Fetch user profile
router.get("/", async (req, res, next) => {
    try {
        const user = req.user;
        const profile = await prisma.profile.findFirstOrThrow({
            where: {
                id: user.id
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                phone: true,
                description: true,
                tagline: true,
                domain: true,
                techStacks: {
                    select: {
                        id: true,
                        name: true,
                        icon: true
                    }
                },
                activeTemplate: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        author: true,
                        githubLink: true,
                        previewimg: true,
                        totalInstalls: true
                    }
                }
            }
        })
        res.send(profile);
    } catch (error) {
        next(error);
    }
})

// Update user profile
router.put("/", async (req, res, next) => {
    try {
        const user = req.user;
        const { name, avatar, phone, description, tagline } = req.body;
        const profile = await prisma.profile.update({
            where: {
                id: user.id
            },
            data: {
                name: name,
                avatar: avatar,
                phone: phone,
                description: description,
                tagline: tagline
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                phone: true,
                description: true,
                tagline: true,
                domain: true,
                techStacks: {
                    select: {
                        id: true,
                        name: true,
                        icon: true
                    }
                },
                activeTemplate: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        author: true,
                        githubLink: true,
                        previewimg: true,
                        totalInstalls: true
                    }
                }
            }
        })
        res.send(profile);
    } catch (error) {
        next(error);
    }
})

// Update the domain
router.patch("/domain", async (req, res, next) => {
    try {
        const user = req.user;
        const { domain } = req.body;
        // TODO Some checks
        const profile = await prisma.profile.update({
            where: {
                id: user.id
            },
            data: {
                domain: domain
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                phone: true,
                description: true,
                domain: true,
                techStacks: {
                    select: {
                        id: true,
                        name: true,
                        icon: true
                    }
                },
                activeTemplate: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        author: true,
                        githubLink: true,
                        previewimg: true,
                        totalInstalls: true
                    }
                }
            }
        })
        res.send(profile);
    } catch (error) {
        next(error);
    }
})

// API to update template
router.patch("/template", async (req, res, next) => {
    try {
        const user = req.user;
        const { template_id } = req.body;
        const profile = await prisma.profile.update({
            where: {
                id: user.id
            },
            data: {
                activeTemplateId: template_id
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                phone: true,
                description: true,
                domain: true,
                techStacks: {
                    select: {
                        id: true,
                        name: true,
                        icon: true
                    }
                },
                activeTemplate: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        author: true,
                        githubLink: true,
                        previewimg: true,
                        totalInstalls: true
                    }
                }
            }
        });

        await prisma.portfolioTemplate.update({
            where: {
                id: template_id
            },
            data: {
                totalInstalls: {
                    increment: 1
                }
            }
        })

        res.send(profile);
    } catch (error) {
        next(error);
    }

})

module.exports = router;