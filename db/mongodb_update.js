exports.update = async function(client, guildID, channelID, userID, scoreChange, upvotesChange, downvotesChange) {
    const db = client.db(guildID);
    
    await db.collection('Users').findOneAndUpdate(
        {_id: userID},
        {$inc: {score: scoreChange, upvotes: upvotesChange, downvotes: downvotesChange}},
        {upsert: true}
    );

    await db.collection(channelID).findOneAndUpdate(
        {_id: userID},
        {$inc: {score: scoreChange, upvotes: upvotesChange, downvotes: downvotesChange}},
        {upsert: true}
    );
};