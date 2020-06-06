Create a JSON file named config in this directory

Template:
```json
{
    "prefix": "your preffered prefix",
    "token": "bot token",
    "upvoteEmoji": ["a list of emoji used for upvoting"],
    "downvoteEmoji": ["a list of emoji used for downvoting"],
    "defaultRoles": {
        //objects containing data about the roles
        "Rank0": {
            "name": "roleName (eg. Rank1)",
            "score": "required score to get role (can be negative)",
            "color": "role color",
        },
        "Rank1": {
            //...
        }
        //...
    },
    "mongodburl": "MongoDB connection string",
    "ws": {
        "oauth2Redirect": "discord redicect url",
        "port": "port number"
    }
}
```