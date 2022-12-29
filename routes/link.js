const router = require("express").Router();
const prisma = require("../db").getInstance();
const axios = require("axios").default;

// Get all links
router.get("/all", async (req, res) => {
    const social_links = await prisma.socialLink.findMany({
        where: {
            profileId: req.user.id
        },
        select: {
            id: true,
            link: true,
            type: {
                select: {
                    id: true,
                    icon: true,
                    type: true
                }
            }
        }
    });
    res.json(social_links);
})

// Add a link
router.post("/", async (req, res) => {
    const { link, type_id } = req.body;
    if(link === undefined || link == null) return res.status(400).json({ error: "Missing link" });
    if(type_id === undefined || type_id == null) return res.status(400).json({ error: "Missing link type_id" });

    const social_link = await prisma.socialLink.create({
        data: {
            link,
            type: {
                connect: {
                    id: type_id
                }
            },
            profile: {
                connect: {
                    id: req.user.id
                }
            }
        },
        select: {
            id: true,
            link: true,
            type: {
                select: {
                    id: true,
                    icon: true,
                    type: true
                }
            }
        }
    });
    res.json(social_link);
})

// Send single link details
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const social_link = await prisma.socialLink.findFirst({
        where: {
            id: parseInt(id),
            profile: {
                id: req.user.id
            }
        },
        select: {
            id: true,
            link: true,
            type: {
                select: {
                    id: true,
                    icon: true,
                    type: true
                }
            }
        }
    });
    if(social_link === null) return res.status(404).json({ message: "Link not found" });
    res.json(social_link);
})

// Update link
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { link } = req.body;
    if(link === undefined || link == null) return res.status(400).json({ error: "Missing link" });

    // Verify user access to record -- if not found, will throw error
    await prisma.socialLink.findFirstOrThrow({
        where: {
            id: parseInt(id),
            profile: {
                id: req.user.id
            }
        }
    })

    // Update
    const social_link = await prisma.socialLink.update({
        where: {
            id: parseInt(id)
        },
        data: {
            link
        },
        select: {
            id: true,
            link: true,
            type: {
                select: {
                    id: true,
                    icon: true,
                    type: true
                }
            }
        }
    });
    res.json(social_link);
})

// Delete
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    // Verify user access to record -- if not found, will throw error
    await prisma.socialLink.findFirstOrThrow({
        where: {
            id: parseInt(id),
            profile: {
                id: req.user.id
            }
        }
    })

    // Delete
    await prisma.socialLink.delete({
        where: {
            id: parseInt(id)
        }
    });
    res.json({ message: "Link deleted" });
})

module.exports = router;