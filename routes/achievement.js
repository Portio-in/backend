const Utils = require("../utils");
const router = require("express").Router();
const prisma = require("../db").getInstance();
const axios = require("axios").default;

// Fetch all records
router.get("/all", async (req, res, next) => {
    try {
        const achievements = await prisma.achievement.findMany({
            where: {
                profileId: req.user.id
            },
            select: {
                id: true,
                title: true,
                description: true,
                date: true,
                referenceLink: true
            }
        });
        res.status(200).json(achievements);
    } catch (err) {
        next(err);
    }
})

// Add a new record
router.post("/", async (req, res, next) => {
    try {
        const { title, description, date, reference_link } = req.body;
        if(title === "" || title === undefined || title ===null) return res.status(400).json({ error: "Missing title" });
        if(description === "" || description === undefined || description ===null) return res.status(400).json({ error: "Missing description" });
        if(date === "" || date === undefined || date ===null) return res.status(400).json({ error: "Missing date" });

        const date_formatted = new Date(date);
        if(date_formatted.toString() === "Invalid Date") return res.status(400).json({ error: "Invalid date" });

        const referenceLink = (reference_link === "" || reference_link === undefined || reference_link === null)? "" : reference_link;

        const achievement = await prisma.achievement.create({
            data: {
                title,
                description,
                date: date_formatted,
                referenceLink: Utils.URLCleanup(referenceLink),
                profile: {
                    connect: {
                        id: req.user.id
                    }
                }
            },
            select: {
                id: true,
                title: true,
                description: true,
                referenceLink: true,
                date: true
            }
        })
        await req.triggerRebuildPortfolio();
        res.status(200).json(achievement);
    } catch (err) {
        next(err);
    }
})

// Fetch a record
router.get("/:id", async (req, res, next) => {
    try {
        const achievement = await prisma.achievement.findFirst({
            where: {
                id: parseInt(req.params.id),
                profileId: req.user.id
            },
            select: {
                id: true,
                title: true,
                description: true,
                referenceLink: true,
                date: true
            }
        })
        if(achievement === null) return res.status(404).json({ error: "Not Found" });
        res.status(200).json(achievement);
    } catch (err) {
        next(err);
    }
})

// Update a record
router.put("/:id", async (req, res, next) => {
    try {
        const { title, description, date, reference_link } = req.body;
        if(title === "" || title === undefined || title ===null) return res.status(400).json({ error: "Missing title" });
        if(description === "" || description === undefined || description ===null) return res.status(400).json({ error: "Missing description" });
        if(date === "" || date === undefined || date ===null) return res.status(400).json({ error: "Missing date" });

        const date_formatted = new Date(date);
        if(date_formatted.toString() === "Invalid Date") return res.status(400).json({ error: "Invalid date" });
        const referenceLink = (reference_link === "" || reference_link === undefined || reference_link === null)? "" : reference_link;

        // Verify if the record exists and belongs to the user
        await prisma.achievement.findFirstOrThrow({
            where: {
                id: parseInt(req.params.id),
                profileId: req.user.id
            }
        })

        // Update the record
        const achievement = await prisma.achievement.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                title,
                description,
                referenceLink: Utils.URLCleanup(referenceLink),
                date: date_formatted
            },
            select: {
                id: true,
                title: true,
                description: true,
                referenceLink: true,
                date: true
            }
        })
        await req.triggerRebuildPortfolio();
        res.status(200).json(achievement);
    } catch (err) {
        next(err);
    }
})

// Delete a record
router.delete("/:id", async (req, res, next) => {
    try {
        // Verify if the record exists and belongs to the user
        await prisma.achievement.findFirstOrThrow({
            where: {
                id: parseInt(req.params.id),
                profileId: req.user.id
            }
        })
        // Delete the record
        await prisma.achievement.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        await req.triggerRebuildPortfolio();
        res.status(200).json({ message: "Achievement deleted" });
    } catch (err) {
        next(err);
    }
})

module.exports = router;