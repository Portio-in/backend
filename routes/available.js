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

// Fetch all portfolio templates
router.get("/template", async (req, res) => {
    const templates = await prisma.portfolioTemplate.findMany({
        select: {
            id: true,
            code: true,
            name: true,
            previewimg: true,
            author: true,
            githubLink: true,
            totalInstalls: true
        },
        orderBy: {
            totalInstalls: "desc"
        }
    });
    res.json(templates);
})

module.exports = router;