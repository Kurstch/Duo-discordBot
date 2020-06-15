## Duo Discord bot

[Dashboard](https://duo-discordbot.herokuapp.com/)

[Invite link](https://discord.com/oauth2/authorize?client_id=710067353227886612&permissions=2081160439&scope=bot)

 Function:

    1. implements upvote, downvote function (using reactions),
    2. keeps track of user data (score, upvotes, downvotes (seperate server wide and for each channel)),
    3. can provide user data (for individual users or leaderboard (server or channel)),
    4. automaticly assigns user role when user reaches a certain score

Prefix: `_`

Commands: `score, Leaderboard, help`

Accepted reactions: `👍 👎`

DataBase: `mongoDB`

Host: `Heroku`
