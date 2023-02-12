const router = require("express").Router();
const prisma = require("../db").getInstance();
const axios = require("axios").default;

// Get all educations 
router.get("/all", async (req, res, next) => {
    try {
        const educations = await prisma.education.findMany({
            where: {
                profileId: req.user.id
            },
            select: {
                id: true,
                courseName: true,
                institutionName: true,
                subjects: true,
                score: true,
                startingDate: true,
                endingDate: true,
            }
        });
        res.json(educations);
    } catch (error) {
        next(error);
    }
})

// Add an education
router.post("/", async (req, res, next) => {
    try {
        const { course_name, institution_name, subjects, score, starting_date, ending_date } = req.body;
        if(course_name === undefined || course_name == null) return res.status(400).json({ error: "Missing course_name" });
        if(institution_name === undefined || institution_name == null) return res.status(400).json({ error: "Missing institutionName" });
        if(subjects === undefined || subjects == null) return res.status(400).json({ error: "Missing subjects" });
        if(score === undefined || score == null) return res.status(400).json({ error: "Missing score" });
        if(starting_date === undefined || starting_date == null) return res.status(400).json({ error: "Missing starting_date" });

        let starting_date_formatted = new Date(starting_date);
        if(starting_date_formatted == "Invalid Date") return res.status(400).json({ error: "Invalid starting_date" });

        let ending_date_formatted = null;
        if(ending_date !== undefined && ending_date != null) {
            ending_date_formatted = new Date(ending_date);
            if(ending_date_formatted == "Invalid Date") return res.status(400).json({ error: "Invalid ending_date" });
        }

        const education = await prisma.education.create({
            data: {
                courseName: course_name,
                institutionName: institution_name,
                subjects: subjects,
                score: score,
                startingDate: starting_date_formatted,
                endingDate: ending_date_formatted,
                profie: {
                    connect: {
                        id: req.user.id
                    }
                }
            },
            select: {
                id: true,
                courseName: true,
                institutionName: true,
                subjects: true,
                score: true,
                startingDate: true,
                endingDate: true,
            }
        });
        await req.triggerRebuildPortfolio();
        res.json(education);
    } catch (error) {
        next(error);
    }
})

// Fetch single record
router.get("/:id", async (req, res, next) => {
    try {
        const education = await prisma.education.findFirst({
            where: {
                id: parseInt(req.params.id),
                profileId: req.user.id
            },
            select: {
                id: true,
                courseName: true,
                institutionName: true,
                subjects: true,
                score: true,
                startingDate: true,
                endingDate: true,
            }
        });
        res.json(education);
    } catch (error) {
        next(error);
    }
})

// Update single record
router.put("/:id", async (req, res, next) => {
    try {
        const { course_name, institution_name, subjects, score, starting_date, ending_date } = req.body;
        if(course_name === undefined || course_name == null) return res.status(400).json({ error: "Missing course_name" });
        if(institution_name === undefined || institution_name == null) return res.status(400).json({ error: "Missing institutionName" });
        if(subjects === undefined || subjects == null) return res.status(400).json({ error: "Missing subjects" });
        if(score === undefined || score == null) return res.status(400).json({ error: "Missing score" });
        if(starting_date === undefined || starting_date == null) return res.status(400).json({ error: "Missing starting_date" });
    
        let starting_date_formatted = new Date(starting_date);
        if(starting_date_formatted == "Invalid Date") return res.status(400).json({ error: "Invalid starting_date" });
    
        let ending_date_formatted = null;
        if(ending_date !== undefined && ending_date != null) {
            ending_date_formatted = new Date(ending_date);
            if(ending_date_formatted == "Invalid Date") return res.status(400).json({ error: "Invalid ending_date" });
        }
    
        // Verify if the education exists -- whether it belongs to the user
        await prisma.education.findFirstOrThrow({
            where: {
                id: parseInt(req.params.id),
                profileId: req.user.id
            }
        })
    
        // update
        const education = await prisma.education.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                courseName: course_name,
                institutionName: institution_name,
                subjects: subjects,
                score: score,
                startingDate: starting_date_formatted,
                endingDate: ending_date_formatted,
            },
            select: {
                id: true,
                courseName: true,
                institutionName: true,
                subjects: true,
                score: true,
                startingDate: true,
                endingDate: true,
            }
        });
        await req.triggerRebuildPortfolio();
        res.json(education);
    } catch (error) {
        next(error);
    }
})

// Delete single record
router.delete("/:id", async (req, res, next) => {
    try {
         // Verify if the education exists -- whether it belongs to the user
        await prisma.education.findFirstOrThrow({
            where: {
                id: parseInt(req.params.id),
                profileId: req.user.id
            }
        })

        // delete
        await prisma.education.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });
        await req.triggerRebuildPortfolio();
        res.json({ message: "Education record deleted" });
    } catch (error) {
        next(error);
    }
})

module.exports = router;
