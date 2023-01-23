const router = require("express").Router();
const prisma = require("../db").getInstance();
const axios = require("axios").default;

// Fetch all records
router.get("/all", async (req, res, next) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                profileId: req.user.id
            },
            select: {
                id: true,
                title: true,
                description: true,
                coverImage: true,
                images: true,
                techStacks: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    }
                },
                liveLink: true,
                codeLink: true,
                readMoreLink: true,
                startingDate: true,
                endingDate: true,
            }
        });
        res.status(200).json(projects);
    } catch (err) {
        next(err);
    }
})

// Add a new record
router.post("/", async (req, res, next) => {
    try {
        let { title, description, cover_image, images, tech_stacks_id, live_link, code_link, read_more_link, starting_date, ending_date } = req.body;
        if(title === "" || title === undefined || title === null) return res.status(400).json({ error: "Missing title" });
        if(description === "" || description === undefined || description === null) return res.status(400).json({ error: "Missing description" });
        if(images === "" || images === undefined || images === null) return res.status(400).json({ error: "Missing images" });
        if(tech_stacks_id === "" || tech_stacks_id === undefined || tech_stacks_id === null) return res.status(400).json({ error: "Missing tech_stacks_id" });
        if(live_link === "" || live_link === undefined || live_link === null) live_link = null;
        if(code_link === "" || code_link === undefined || code_link === null) code_link = null;
        if(read_more_link === "" || read_more_link === undefined || read_more_link === null) read_more_link = null;
        if(starting_date === "" || starting_date === undefined || starting_date === null) return res.status(400).json({ error: "Missing starting_date" });
        if(ending_date === "" || ending_date === undefined || ending_date === null) ending_date = "";

        const starting_date_formatted = new Date(starting_date);
        if(starting_date_formatted.toString() === "Invalid Date") return res.status(400).json({ error: "Invalid starting_date" });

        let ending_date_formatted = new Date(ending_date);
        if(ending_date_formatted.toString() === "Invalid Date") ending_date_formatted = null;

        let cover_image_formatted = (cover_image === "" || cover_image === undefined || cover_image === null) ?  "http://www.tgsin.in/images/joomlart/demo/default.jpg" : cover_image;

        const project = await prisma.project.create({
            data: {
                title,
                description,
                coverImage: cover_image_formatted,
                images,
                techStacks: {
                    connect: tech_stacks_id.map(id => ({ id: id }))
                },
                liveLink: live_link,
                codeLink: code_link,
                readMoreLink: read_more_link,
                startingDate: starting_date_formatted,
                endingDate: ending_date_formatted,
                profile: {
                    connect: {
                        id: req.user.id
                    }
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                coverImage: true,
                images: true,
                techStacks: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    }
                },
                liveLink: true,
                codeLink: true,
                readMoreLink: true,
                startingDate: true,
                endingDate: true,
            }
        });
        res.status(200).json(project);
    } catch (err) {
        next(err);
    }
})

// Get a record by id
router.get("/:id", async (req, res, next) => {
    try {
        const project = await prisma.project.findUnique({
            where: {
                id: parseInt(req.params.id)
            },
            select: {
                id: true,
                title: true,
                description: true,
                coverImage: true,
                images: true,
                techStacks: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    }
                },
                liveLink: true,
                codeLink: true,
                readMoreLink: true,
                startingDate: true,
                endingDate: true,
            }
        });
        if(project === null) return res.status(404).json({ error: "Project not found" });
        res.status(200).json(project);
    } catch (err) {
        next(err);
    }
})

// Update a record by id
router.put("/:id", async (req, res, next) => {
    try {
        let { title, description, cover_image, images, tech_stacks_id, live_link, code_link, read_more_link, starting_date, ending_date } = req.body;
        if(title === "" || title === undefined || title === null) return res.status(400).json({ error: "Missing title" });
        if(description === "" || description === undefined || description === null) return res.status(400).json({ error: "Missing description" });
        if(cover_image === "" || cover_image === undefined || cover_image === null) return res.status(400).json({ error: "Missing cover_image" });
        if(images === "" || images === undefined || images === null) return res.status(400).json({ error: "Missing images" });
        if(tech_stacks_id === "" || tech_stacks_id === undefined || tech_stacks_id === null) return res.status(400).json({ error: "Missing tech_stacks_id" });
        if(live_link === "" || live_link === undefined || live_link === null) live_link = null;
        if(code_link === "" || code_link === undefined || code_link === null) code_link = null;
        if(read_more_link === "" || read_more_link === undefined || read_more_link === null) read_more_link = null;
        if(starting_date === "" || starting_date === undefined || starting_date === null) return res.status(400).json({ error: "Missing starting_date" });
        if(ending_date === "" || ending_date === undefined || ending_date === null) ending_date = "";

        const starting_date_formatted = new Date(starting_date);
        if(starting_date_formatted.toString() === "Invalid Date") return res.status(400).json({ error: "Invalid starting_date" });

        let ending_date_formatted = new Date(ending_date);
        if(ending_date_formatted.toString() === "Invalid Date") ending_date_formatted = null;

        // Check if the project exists and belongs to the user
        await prisma.project.findFirstOrThrow({
            where: {
                id: parseInt(req.params.id),
                profileId: req.user.id
            }
        });

        // Update the project
        const project = await prisma.project.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                title,
                description,
                coverImage: cover_image,
                images,
                techStacks: {
                    connect: tech_stacks_id.map(id => ({ id: id }))
                },
                liveLink: live_link,
                codeLink: code_link,
                readMoreLink: read_more_link,
                startingDate: starting_date_formatted,
                endingDate: ending_date_formatted,
            },
            select: {
                id: true,
                title: true,
                description: true,
                coverImage: true,
                images: true,
                techStacks: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    }
                },
                liveLink: true,
                codeLink: true,
                readMoreLink: true,
                startingDate: true,
                endingDate: true,
            }
        });
        res.status(200).json(project);
    } catch (err) {
        next(err);
    }
})

//  Delete the record by id
router.delete("/:id", async (req, res, next) => {
    try {
        // Check if the project exists and belongs to the user
        await prisma.project.findFirstOrThrow({
            where: {
                id: parseInt(req.params.id),
                profileId: req.user.id
            }
        });

        // Delete the project
        await prisma.project.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });
        res.status(200).json({ message: "Project deleted" });
    } catch (err) {
        next(err);
    }
})

module.exports = router;