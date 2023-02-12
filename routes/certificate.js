const Utils = require("../utils");
const router = require("express").Router();
const prisma = require("../db").getInstance();
const axios = require("axios").default;

// Fetch all certificates
router.get("/all", async (req, res, next) => {
    try {
        const certificates = await prisma.certificate.findMany({
            where: {
                profileId: req.user.id
            },
            select: {
                id: true,
                title: true,
                link: true,
                completedOn: true,
                providedBy: true
            }
        });
        res.status(200).json(certificates);
    } catch (error) {
        next(error);
    }
})

// Add a new certificate
router.post("/", async (req, res, next) => {
    try {
        const { title, link, completed_on, provided_by } = req.body;
        if(title === "" || title === undefined || title === null) res.status(400).json({ message: "Missing title" });
        if(link === "" || link === undefined || link === null) res.status(400).json({ message: "Missing link" });
        if(completed_on === "" || completed_on === undefined || completed_on === null) res.status(400).json({ message: "Missing completed_on" });
        if(provided_by === "" || provided_by === undefined || provided_by === null) res.status(400).json({ message: "Missing provided_by" });

        let completedOn = new Date(completed_on);
        if(completedOn == "Invalid Date") res.status(400).json({ message: "Invalid completed_on" });

        const certificate = await prisma.certificate.create({
            data: {
                title,
                link: Utils.URLCleanup(link),
                completedOn: completedOn,
                providedBy: provided_by,
                profileId: req.user.id
            },
            select: {
                id: true,
                title: true,
                link: true,
                completedOn: true,
                providedBy: true
            }
        });
        res.status(200).json(certificate);
    } catch (error) {
        next(error);
    }
})

// Update a certificate
router.put("/:id", async (req, res, next) => {
    try {
        const { title, link, completed_on, provided_by } = req.body;
        if(title === "" || title === undefined || title === null) res.status(400).json({ message: "Missing title" });
        if(link === "" || link === undefined || link === null) res.status(400).json({ message: "Missing link" });
        if(completed_on === "" || completed_on === undefined || completed_on === null) res.status(400).json({ message: "Missing completed_on" });
        if(provided_by === "" || provided_by === undefined || provided_by === null) res.status(400).json({ message: "Missing provided_by" });

        let completedOn = new Date(completed_on);
        if(completedOn == "Invalid Date") res.status(400).json({ message: "Invalid completed_on" });

        // Verify if the certificate exists and belongs to the user
        await prisma.certificate.findFirstOrThrow({
            where: {
                id: parseInt(req.params.id),
                profileId: req.user.id
            }
        })

        // Update the certificate
        const certificate = await prisma.certificate.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                title,
                link: Utils.URLCleanup(link),
                completedOn: completedOn,
                providedBy: provided_by
            },
            select: {
                id: true,
                title: true,
                link: true,
                completedOn: true,
                providedBy: true
            }
        });
        res.status(200).json(certificate);
    } catch (error) {
        next(error);
    }
})

// Delete a certificate
router.delete("/:id", async (req, res, next) => {
    try {
        // Verify if the certificate exists and belongs to the user
        await prisma.certificate.findFirstOrThrow({
            where: {
                id: parseInt(req.params.id),
                profileId: req.user.id
            }
        })

        // Delete the certificate
        await prisma.certificate.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });
        res.status(200).json({ message: "Certificate deleted" });
    } catch (error) {
        next(error);
    }
})

module.exports = router;