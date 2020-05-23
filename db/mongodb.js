exports.update = async function(client, guildID, collection, filter, update) {
    const db = client.db(guildID);

    const data = await db.collection(collection).findOneAndUpdate(
        filter,
        update,
        {returnOriginal: false},
        {upsert: true}
    );

    return data;
};

exports.read = async function(client, guildID, collection, filter) {
    const db = client.db(guildID);

    const data = await db.collection(collection).find(
        filter
    ).toArray();

    return data;
};