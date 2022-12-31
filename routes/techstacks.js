const router = require("express").Router();
const prisma = require("../db").getInstance();
const axios = require("axios").default;

// Get all techstacks
router.get("/", async (req, res) => {
    const profile_techstacks = await prisma.profile.findFirstOrThrow({
        where: {
            id: req.user.id
        },
        select: {
            techStacks: {
                select: {
                    id: true,
                    name: true,
                    icon: true
                }
            }
        }
    });
    res.json(profile_techstacks.techStacks || []);
})

// Update techstacks
router.put("/", async (req, res) => {
    const { tech_stacks_id } = req.body;
    if(tech_stacks_id === null || tech_stacks_id === undefined) tech_stacks_id = [];
    const profile_techstacks = await prisma.profile.update({
        where: {
            id: req.user.id
        },
        data: {
            techStacks: {
                connect: tech_stacks_id.map(id => ({ id: id }))
            }
        },
        select: {
            techStacks: {
                select: {
                    id: true,
                    name: true,
                    icon: true
                }
            }
        }
    })

    res.json(profile_techstacks.techStacks || []);
});

module.exports = router;