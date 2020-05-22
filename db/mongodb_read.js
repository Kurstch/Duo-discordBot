exports.read = async function(client, guildID, collection, filter) {
    const db = client.db(guildID);

    var data = await db.collection(collection).find(
        filter
    ).toArray();

    return data;
};