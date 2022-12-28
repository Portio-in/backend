const router = require("express").Router();
const prisma = require("../db").getInstance();

// Fetch user profile
router.get("/", async (req, res) => {
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
            description: true
        }
    })
    res.send(profile);
})

// Update user profile
router.put("/", async (req, res) => {
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
            description: true
        }
    })
    res.send(profile);
})

module.exports = router;