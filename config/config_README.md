Create a JSON file named config in this directory

Template:
```json
{
    "prefix": "", // your prefferred prefig
    "token": "", // bot token
    "upvoteEmoji": [""], // a list of emoji used for upvoting
    "downvoteEmoji": [""], // a list of emoji used for downvoting
    "defaultRoles": {
        // objects containing data about the roles
        // default roles will be used as long as guild admin hasn't set custom roles
        // to work properly Rank0 must have the highest score, Rank1: 2nd highest score etc.
        "Rank0": {
            "name": "", // roleName (eg. Rank1)
            "score": "", // required score to get role (can be negative)
            "color": "", // role color
        },
        "Rank1": {
            //...
        }
        //...
    },
    "mongodburl": "", //MongoDB connection string
}
```