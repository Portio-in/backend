const router = require("express").Router();
const prisma = require("../db").getInstance();
const axios = require("axios").default;

// Fetch all records
router.get("/all", async (req, res) => {
    const result = await prisma.workingExperience.findMany({
        where: {
            profileId: req.user.id
        },
        select:{
            id: true,
            role: true,
            organization: true,
            accomplishments: true,
            startingDate: true,
            endingDate: true,
        }
    });
    res.json(result);
})

// Add a record
router.post("/", async (req, res) => {
    const { role, organization, accomplishments, starting_date, ending_date } = req.body;
    if(role === undefined || role == null) return res.status(400).json({ error: "Missing role" });
    if(organization === undefined || organization == null) return res.status(400).json({ error: "Missing organization" });
    if(accomplishments === undefined || accomplishments == null) return res.status(400).json({ error: "Missing accomplishments" });
    if(starting_date === undefined || starting_date == null) return res.status(400).json({ error: "Missing starting_date" });

    let starting_date_formatted = new Date(starting_date);
    if(starting_date_formatted == "Invalid Date") return res.status(400).json({ error: "Invalid starting_date" });

    let ending_date_formatted = null;
    if(ending_date !== undefined && ending_date != null) {
        ending_date_formatted = new Date(ending_date);
        if(ending_date_formatted == "Invalid Date") return res.status(400).json({ error: "Invalid ending_date" });
    }

    const result = await prisma.workingExperience.create({
        data: {
            role: role,
            organization: organization,
            accomplishments: accomplishments,
            startingDate: starting_date_formatted,
            endingDate: ending_date_formatted,
            profile: {
                connect: {
                    id: req.user.id
                }
            }
        },
        select: {
            id: true,
            role: true,
            organization: true,
            accomplishments: true,
            startingDate: true,
            endingDate: true,
        }
    });
    res.json(result);
})

// Update a record
router.put("/:id", async (req, res) => {
    const { role, organization, accomplishments, starting_date, ending_date } = req.body;
    if(role === undefined || role == null) return res.status(400).json({ error: "Missing role" });
    if(organization === undefined || organization == null) return res.status(400).json({ error: "Missing organization" });
    if(accomplishments === undefined || accomplishments == null) return res.status(400).json({ error: "Missing accomplishments" });
    if(starting_date === undefined || starting_date == null) return res.status(400).json({ error: "Missing starting_date" });

    let starting_date_formatted = new Date(starting_date);
    if(starting_date_formatted == "Invalid Date") return res.status(400).json({ error: "Invalid starting_date" });

    let ending_date_formatted = null;
    if(ending_date !== undefined && ending_date != null) {
        ending_date_formatted = new Date(ending_date);
        if(ending_date_formatted == "Invalid Date") return res.status(400).json({ error: "Invalid ending_date" });
    }

    // Check if the record exists and belongs to the user
    await prisma.workingExperience.findFirstOrThrow({
        where: {
            id: parseInt(req.params.id),
            profileId: req.user.id
        }
    })

    // Update the record
    const result = await prisma.workingExperience.update({
        where: {
            id: parseInt(req.params.id)
        },
        data: {
            role: role,
            organization: organization,
            accomplishments: accomplishments,
            startingDate: starting_date_formatted,
            endingDate: ending_date_formatted,
        },
        select: {
            id: true,
            role: true,
            organization: true,
            accomplishments: true,
            startingDate: true,
            endingDate: true,
        }
    });
    res.json(result);
})

// Delete record
router.delete("/:id", async (req, res) => {
    // Check if the record exists and belongs to the user
    await prisma.workingExperience.findFirstOrThrow({
        where: {
            id: parseInt(req.params.id),
            profileId: req.user.id
        }
    })

    // Delete the record
    await prisma.workingExperience.delete({
        where: {
            id: parseInt(req.params.id)
        }
    });
    res.json({ message: "Experience record deleted" });
})

module.exports = router;