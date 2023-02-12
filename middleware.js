const Utils = require("./utils");

const prisma = require("./db").getInstance();

class Middleware {
    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     * @param {NextFunction} next 
     */
    static async auth(req, res, next) {
        try {
            const token = req.headers.authorization;
            if(token === null || token === undefined) throw new Error("Unauthorized");
            const user = await prisma.apiToken.findFirstOrThrow({
                where: {
                    key: token
                },
                select: {
                    profille: {
                        select: {
                            id: true,
                            email: true,
                            domain: true,
                            activeTemplate: {
                                select: {
                                    code: true
                                }
                            }
                        }
                    }
                }
            })
            req.user = user.profille;
            req.triggerRebuildPortfolio = async()=>await Utils.triggerTemplateRebuild(user.profille.domain, user.profille.activeTemplate.code);
            next();
        } catch (err) {
            res.status(401).json({
                message: "Unauthorized"
            });
        }
    }
}

module.exports = Middleware;