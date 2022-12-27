const router = require("express").Router();
const prisma = require("../db").getInstance();
const config = require("../config");
const axios = require("axios").default;

// Auth redirection link
router.get("/github", (req, res) => {
    res.redirect("https://github.com/login/oauth/authorize?client_id=" + config.GITHUB_OAUTH_CLIENT_ID);
})

// Auth callback
router.get("/callback/github", async (req, res) => {
    const code = req.query.code;
    const response = await axios.post("https://github.com/login/oauth/access_token?client_id=" + config.GITHUB_OAUTH_CLIENT_ID + "&client_secret=" + config.GITHUB_OAUTH_CLIENT_SECRET + "&code=" + code);
    const access_token = response.data.split("&")[0].split("=")[1];
    // Fetch user profile
    const user = await axios.get("https://api.github.com/user", {
        headers:{
            "Authorization": "Bearer " + access_token
        }
    });
    const user_received_data = user.data;
    // Fetch user emails
    const emails = await axios.get("https://api.github.com/user/emails", {
        headers:{
            "Authorization": "Bearer " + access_token
        }
    });
    const emails_received_data = emails.data;
    let confimed_email_record = emails_received_data.find(email => email.primary && email.verified && email.email.indexOf("noreply.github.com")!==-1);
    if(confimed_email_record === undefined){
        confimed_email_record = emails_received_data[0];
    }
    const email = confimed_email_record.email;
    const name = user_received_data.name;
    const picture = user_received_data.avatar_url;

    console.log(email, name, picture);


    res.send("Hello World!");
})

module.exports = router;