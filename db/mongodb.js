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

exports.read = async function(client, guildID, collection, filter) {
    const db = client.db(guildID);

    var data = await db.collection(collection).find(
        filter
    ).toArray();

    return data;
};