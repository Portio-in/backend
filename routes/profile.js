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
                name: true,
                email: true,
                avatar: true,
                phone: true,
                description: true,
                domain: true
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
        const { name, avatar, phone, description } = req.body;
        const profile = await prisma.profile.update({
            where: {
                id: user.id
            },
            data: {
                name: name,
                avatar: avatar,
                phone: phone,
                description: description
            },
            select: {
                name: true,
                email: true,
                avatar: true,
                phone: true,
                description: true,
                domain: true
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
                name: true,
                email: true,
                avatar: true,
                phone: true,
                description: true,
                domain: true
            }
        })
        res.send(profile);
    } catch (error) {
        next(error);
    }
})

module.exports = router;