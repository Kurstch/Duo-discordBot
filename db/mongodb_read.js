exports.read = async function(client, guildID, collection, filter) {
    const db = client.db(guildID);

    var data = {};

    var cursor = db.collection(collection).find(
        filter
    );

    function iterateFunc(doc) {
        data[doc._id] = {
            score: doc.score,
            upvotes: doc.upvotes,
            downvotes: doc.downvotes
        };
    };

    await cursor.forEach(iterateFunc);
    return data;
};