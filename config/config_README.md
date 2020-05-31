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
            "reason": "role reason"
        },
        "Rank1": {
            //...
        }
        //...
    },
    "mongodburl": "MongoDB connection string",
    "ws": {
        "port": "port number"
    }
}
```