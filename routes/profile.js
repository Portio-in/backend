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
        const { name, avatar, phone, description, tagline, tech_stacks_id } = req.body;
        if(tech_stacks_id === null || tech_stacks_id === undefined) tech_stacks_id = [];

        // fetch all techstacks id previous
        const prev_tech_stacks = await prisma.profile.findFirst({
            where: {
                id: user.id
            },
            select: {
                techStacks: {
                    select: {
                        id: true
                    }
                }
            }
        })
        const prev_tech_stacks_id = prev_tech_stacks.techStacks.map(tech_stack => tech_stack.id);
        const delete_tech_stacks_id = prev_tech_stacks_id.filter(id => !tech_stacks_id.includes(id));
        const add_tech_stacks_id = tech_stacks_id.filter(id => !prev_tech_stacks_id.includes(id));

        const profile = await prisma.profile.update({
            where: {
                id: user.id
            },
            data: {
                name: name,
                avatar: avatar,
                phone: phone,
                description: description,
                tagline: tagline,
                techStacks: {
                    disconnect: delete_tech_stacks_id.map(id => ({ id: id })),
                    connect: add_tech_stacks_id.map(id => ({ id: id }))
                }
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