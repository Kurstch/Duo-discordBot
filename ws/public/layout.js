function loadGuildSelector() {
    //get all guilds the user is a member in
    //if user is the guilds owner - add the guild to navigation bar guilds selector 

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://discordapp.com/api/users/@me/guilds");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + window.localStorage.token);
    xhr.onload = function() {
        var response = JSON.parse(xhr.response);
        if(!response[0]) return;
        response.forEach(guild=>{
            if(guild.owner) {
                var selecter = document.createElement("option");
                selecter.innerHTML = guild.name;
                selecter.value = guild.id;
                document.getElementById("guilds").appendChild(selecter);
            }
        });
        if (!window.localStorage.gid) {
            window.localStorage.gid = document.getElementById('guilds').options[0].value;  
        }
        document.getElementById('guilds').value = window.localStorage.gid;          
    }
    xhr.send();
}

function guildSelectionChange() {
    //save the selected guild's id in local storage
    //reload page with selected guild's data

    window.localStorage.gid = document.getElementById('guilds').value;
    loadPage('roles');
}

function loadPage(id) {
    window.location.href = `/nav?id=${id}&gid=${window.localStorage.gid}`;
}