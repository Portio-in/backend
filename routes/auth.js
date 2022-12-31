const router = require("express").Router();
const prisma = require("../db").getInstance();
const config = require("../config");
const axios = require("axios").default;
const { OAuth2Client } = require('google-auth-library');
const { generateApiKey } = require('generate-api-key');


// Auth redirection link
router.get("/github", (req, res) => {
    res.redirect("https://github.com/login/oauth/authorize?client_id=" + config.GITHUB_OAUTH_CLIENT_ID);
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
        const name = user_received_data.name;
        const picture = user_received_data.avatar_url;
        const api_token = await loginAndGenerateAPIToken(name, email, picture, access_token, "github");
        res.send(api_token);
    } catch (error) {
        next(error);
    }
})


router.post("/callback/google", async (req, res, next) => {
    try {
        const credential = req.body["credential"];
        const client = new OAuth2Client(config.GOOGLE_OAUTH_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: config.GOOGLE_OAUTH_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;
        // Login and generate api token
        const api_token = await loginAndGenerateAPIToken(name, email, picture, credential, "google");
        // Send api token
        res.send(api_token);
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
            id: true
        }
    })
    if (existing_user !== null) {
        // if user exists, set user
        user = existing_user;
    } else {
        
        const random_username = name.split(" ")[0].toString().toLowerCase() + generateApiKey({method: 'bytes', min: 6, max: 8});
        // Create new user
        const new_user = await prisma.profile.create({
            data: {
                name: name,
                avatar: picture,
                email: email,
                domain: random_username+"."+config.PORTFOLIO_BASE_DOMAIN
            },
            select: {
                id: true
            }
        })
        // Set user
        user = new_user;
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
    return api_token;
}

module.exports = router;