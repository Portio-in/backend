const router = require("express").Router();
const prisma = require("../db").getInstance();
const axios = require("axios").default;

// Fetch all available tech stacks
router.get("/techstack", async (req, res) => {
    const techstacks = await prisma.techStackType.findMany({
        select: {
            id: true,
            name: true,
            icon: true
        }
    });
    res.json(techstacks);
})

// Fetch all available social link types
router.get("/sociallink", async (req, res) => {
    const sociallinks = await prisma.socialType.findMany({
        select: {
            id: true,
            type: true,
            icon: true
        }
    });
    res.json(sociallinks);
})

module.exports = router;