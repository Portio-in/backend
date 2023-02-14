const router = require("express").Router();
const prisma = require("../db").getInstance();
const config = require("../config");
const axios = require("axios").default;
const {google} = require('googleapis');
const { generateApiKey } = require('generate-api-key');
const {GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_REDIRECT_URI, GOOGLE_OAUTH_CLIENT_SECRET} = require("../config");
const Utils = require("../utils");
const nodemailer = require("nodemailer");


// Auth redirection link
router.get("/google", (req, res)=>{
    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_OAUTH_CLIENT_ID,
        GOOGLE_OAUTH_CLIENT_SECRET,
        GOOGLE_OAUTH_REDIRECT_URI
    );
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];
    const authorizationUrl = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'online',
        /** Pass in the scopes array defined above.
          * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true
    });
    res.redirect(authorizationUrl)
})

router.get("/github", (req, res) => {
    res.redirect("https://github.com/login/oauth/authorize?client_id=" + config.GITHUB_OAUTH_CLIENT_ID+"&scope=user");
})

// Auth callback
router.get("/callback/github", async (req, res, next) => {
    try {
        const code = req.query.code;
        const response = await axios.post("https://github.com/login/oauth/access_token?client_id=" + config.GITHUB_OAUTH_CLIENT_ID + "&client_secret=" + config.GITHUB_OAUTH_CLIENT_SECRET + "&code=" + code);
        const access_token = response.data.split("&")[0].split("=")[1];
        // Fetch user profile
        const user = await axios.get("https://api.github.com/user", {
            headers: {
                "Authorization": "Bearer " + access_token
            }
        });
        const user_received_data = user.data;
        // Fetch user emails
        const emails = await axios.get("https://api.github.com/user/emails", {
            headers: {
                "Authorization": "Bearer " + access_token
            }
        });
        const emails_received_data = emails.data;
        let confimed_email_record = emails_received_data.find(email => email.primary && email.verified && email.email.indexOf("noreply.github.com") !== -1);
        if (confimed_email_record === undefined) {
            confimed_email_record = emails_received_data[0];
        }
        const email = confimed_email_record.email;
        const name = user_received_data.name || user_received_data.login;
        const picture = user_received_data.avatar_url;
        const api_token = await loginAndGenerateAPIToken(name, email, picture, access_token, "github");
        res.redirect(process.env.AUTH_REDIRECT_URL + "?token=" + api_token);
    } catch (error) {
        next(error);
    }
})


router.get("/callback/google", async (req, res, next) => {
    try {
        const credential = req.query["code"];
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_OAUTH_CLIENT_ID,
            GOOGLE_OAUTH_CLIENT_SECRET,
            GOOGLE_OAUTH_REDIRECT_URI
        );
        let { tokens } = await oauth2Client.getToken(credential);
        oauth2Client.setCredentials(tokens);
        google.oauth2("v2").userinfo.get({
            auth: oauth2Client
        }, async(err, data) => {
            if(err) next("Failed to authenticate")
            let payload = data.data;
            const email = payload.email;
            const name = payload.name;
            const picture = payload.picture;
            // Login and generate api token
            const api_token = await loginAndGenerateAPIToken(name, email, picture, credential, "google");
            // Send api token
            res.redirect(process.env.AUTH_REDIRECT_URL + "?token=" + api_token);
        })        
    } catch (error) {
        next(error);
    }
})


// Helper function -> return api key
async function loginAndGenerateAPIToken(name, email, picture, access_token, provider_type) {
    let user; // User object 
    // Check if user exists
    const existing_user = await prisma.profile.findFirst({
        where: {
            email: email
        },
        select: {
            id: true,
            domain: true
        }
    })
    if (existing_user !== null) {
        // if user exists, set user
        user = existing_user;
    } else {
        // TODO check first if username is available
        let random_username = name.replace(".", "").split(" ")[0].toString().toLowerCase();
        if(random_username.length < 3) {
            random_username = random_username + generateApiKey({method: 'bytes', min: 6, max: 8});
        }
        while(true){
            const found_any_user = await prisma.profile.findFirst({
                where: {
                    domain: random_username+"."+config.PORTFOLIO_BASE_DOMAIN
                }
            })
            if(found_any_user === null) {
                break;
            }
            random_username = random_username + generateApiKey({method: 'bytes', min: 6, max: 8});
        }
        
        
        // Create new user
        const new_user = await prisma.profile.create({
            data: {
                name: name,
                avatar: picture,
                email: email,
                domain: random_username+"."+config.PORTFOLIO_BASE_DOMAIN
            },
            select: {
                id: true,
                domain: true
            }
        })
        // Set user
        user = new_user;

        // Attach high rated portfolio
        const portfolio = await prisma.portfolioTemplate.findFirst({
            orderBy: {
                totalInstalls: "desc"
            },
            select: {
                id: true,
                code: true
            }
        })
        await prisma.profile.update({
            where: {
                id: user.id
            },
            data: {
                activeTemplate: {
                    connect: {
                        id: portfolio.id
                    }
                }
            }
        })
        // Build portfolio
        await Utils.triggerTemplateRebuild(user.domain, portfolio.code);
    }
    // Create Auth Token Record
    const api_token = await prisma.apiToken.create({
        data: {
            profileId: user.id,
            accessToken: access_token,
            type: provider_type,
            key: generateApiKey({method: 'bytes', min: 35, max: 60})
        },
        select: {
            key: true
        }
    })

    return api_token.key;
}

// Email registration route
router.post("/email/init", async (req, res, next) => {
    try{
        const { email , name } = req.body;
        if(email === undefined || email === null || email === "" || name === undefined || name === null || name === "") res.status(200).json({
            "success": false,
            "message": "Provide all the details correctly"
        })
        // Check if email is already registered
        const existing_user = await prisma.profile.findFirst({
            where: {
                email: email
            },
            select: {
                id: true
            }
        })
        if (existing_user !== null) {
            res.status(200).json({
                "success": false,
                "message": "Email already registered"
            })
            return;
        }
        const tempRecord = await prisma.mailAccountRegistration.create({
            data: {
                email: email,
                name: name,
                token: generateApiKey({method: 'bytes', min: 35, max: 60})
            },
            select: {
                id: true,
                token: true
            }
        })
        // Send email
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_SERVER,
            port: parseInt(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD
            },
        });

        await transporter.sendMail({
            from: `"Portio 👻" <${process.env.SMTP_EMAIL}>`, 
            to: email, 
            subject: "Portio Account Registration",
            html: `Hi ! Tap this link to verify and confirm your registration to portio <br/> <a href="${process.env.API_BASE_URL}/auth/email/confirm/${tempRecord.id}?token=${tempRecord.token}">${process.env.API_BASE_URL}/auth/email/confirm/${tempRecord.id}?token=${tempRecord.token}</a>`
        });

        res.status(200).json({
            "success": true,
            "message": "Check your inbox for the verification email"
        })    
    } catch (error) {
        next(error);
    }
})

router.get("/email/confirm/:id", async (req, res, next) => {
    try {
        const token = req.query["token"];
        const id = parseInt(req.params["id"]);

        const record = await prisma.mailAccountRegistration.findFirst({
            where: {
                id: id,
                token: token
            },
            select: {
                email: true,
                name: true
            }
        })
        if(record === null){
            res.status(200).json({
                "success": false,
                "message": "Invalid link"
            })
            return;
        }
        await prisma.mailAccountRegistration.deleteMany({
            where: {
                id: id
            }
        })
        // Login and generate api token
        const api_token = await loginAndGenerateAPIToken(record.name, record.email, "https://portio-content.s3.ap-south-1.amazonaws.com/167631382200540418cd29fad71aa0a11ddfdcb192c4f.png", "", "email");
        res.redirect(process.env.AUTH_REDIRECT_URL + "?token=" + api_token);
    } catch (error) {
        next(error);
    }
})

// Email login route
router.post("/email/login", async (req, res, next) => {
    try {
        const {email} = req.body;
        if(email === undefined || email === null || email === "") res.status(200).json({
            "success": false,
            "message": "Please provide email"
        })
        const existing_user = await prisma.profile.findFirst({
            where: {
                email: email
            },
            select: {
                name: true,
                email: true
            }
        })
        if(existing_user === null) {
            res.status(200).json({
                "success": false,
                "message": "Email not registered"
            })
            return;
        }
        const tempRecord = await prisma.mailVerification.create({
            data: {
                email: email,
                token: generateApiKey({method: 'bytes', min: 35, max: 60})
            },
            select: {
                id: true,
                token: true
            }
        })
        // Send email
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_SERVER,
            port: parseInt(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD
            }
        })
        await transporter.sendMail({
            from: `"Portio 👻" <${process.env.SMTP_EMAIL}>`, 
            to: `"${existing_user.name}" <${existing_user.email}>`, 
            subject: "Portio Login | Magic Link",
            html: `Hi ${existing_user.name} ! Tap this link to login to portio <br/> <a href="${process.env.API_BASE_URL}/auth/email/login/${tempRecord.id}?token=${tempRecord.token}">${process.env.API_BASE_URL}/auth/email/login/${tempRecord.id}?token=${tempRecord.token}</a>`
        });
        res.status(200).json({
            "success": true,
            "message": "Check your inbox for the magic link to login"
        })

    } catch (error) {
        next(error);
    }
})

router.get("/email/login/:id", async (req, res, next) => {
    try {
        const token = req.query["token"];
        const id = parseInt(req.params["id"]);

        const record = await prisma.mailVerification.findFirst({
            where: {
                id: id,
                token: token
            },
            select: {
                email: true
            }
        })
        if(record === null){
            res.status(200).json({
                "success": false,
                "message": "Invalid link"
            })
            return;
        }
        await prisma.mailVerification.deleteMany({
            where: {
                id: id
            }
        })
        // Login and generate api token
        const api_token = await loginAndGenerateAPIToken("", record.email, "", "", "email");
        res.redirect(process.env.AUTH_REDIRECT_URL + "?token=" + api_token);
    } catch (error) {
        next(error);
    }
})

module.exports = router;