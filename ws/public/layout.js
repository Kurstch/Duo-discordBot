function initializeSidebar() {
    initializeGuildSelect();
    initializeUser();
}

function initializeGuildSelect() {
    /*
        Check if user has logged in
        Add all guilds the user owns to the guilds select
        Asign guilds select value
    */

   const guildSelect = document.getElementById('guilds');

    // If user hasn't logged in, hide guild select
    if (window.localStorage.token === undefined || window.localStorage.token == 'null') {
        return guildSelect.style = "opacity:0;pointer-events:none;";
    }


    // Get all guilds the user is a member in
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://discordapp.com/api/users/@me/guilds");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + window.localStorage.token);
    xhr.onload = function() {
        var response = JSON.parse(xhr.response);
        if(!response[0]) return;


        // If user owns the guild, add it to the selection
        response.forEach(guild=>{
            if (guild.owner) {
                var option = document.createElement("option");
                option.innerHTML = guild.name;
                option.value = guild.id;
                guildSelect.appendChild(option);
            }
        });


        // If localStorage does not have gid, set it as the select's first option
        // Set the guild select value to localStorage.gid
        if (!window.localStorage.gid) {
            window.localStorage.gid = document.getElementById('guilds').options[0].value;  
        }
        guildSelect.value = window.localStorage.gid;
    }
    xhr.send();
}

function initializeUser() {
    /*
        Check if user has logged in
        if not: create a login button
        else: display user data in aside user div
    */

    const userDiv = document.getElementById("user");

    // If user hasn't logged in, create a login link and return
    if (window.localStorage.token === undefined || window.localStorage.token == 'null') {
        const loginLink = document.createElement("a");
        loginLink.href = "https://discord.com/api/oauth2/authorize?client_id=710067353227886612&redirect_uri=https%3A%2F%2Fduo-discordbot.herokuapp.com%2Findex&response_type=token&scope=identify%20guilds";
        loginLink.innerHTML = "login";
        return userDiv.appendChild(loginLink);
    }


    // Get user data to display in the nav bar
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://discordapp.com/api/users/@me");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + window.localStorage.token);
    xhr.onload = function() {
        var response = JSON.parse(xhr.response);


        // If user has an avatar get it from cdn.discordapp.com/avatars
        // Else use default discord avatar from public/images directory
        const userAvatarElem = document.createElement("img");
        if (response.avatar != null) {
            userAvatarElem.src = `https://cdn.discordapp.com/avatars/${response.id}/${response.avatar}.png`;
        }
        else {
            userAvatarElem.src = "/images/discordDefaultAvatar.png"
        }
        userAvatarElem.alt = "user avatar";
        userDiv.appendChild(userAvatarElem);


        // container for username and logout button
        const userTextDiv = document.createElement('div');
        userTextDiv.className = 'user-text';

        // username
        const usernameElem = document.createElement("small");
        usernameElem.innerHTML = response.username;
        userTextDiv.appendChild(usernameElem);

        // logout button
        const logoutButton = document.createElement('button');
        logoutButton.className = 'logout-button';
        logoutButton.onclick = function() {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('gid');
            window.location.href = '/home'
        }
        logoutButton.innerText = 'logout';
        userTextDiv.appendChild(logoutButton);

        userDiv.appendChild(userTextDiv);
    }
    xhr.send();
}

function guildSelectionChange() {
    //save the selected guild's id in local storage
    //reload page with selected guild's data

    window.localStorage.gid = document.getElementById('guilds').value;
    loadPage('/' + location.pathname.split('/')[1]);
}

function loadPage(path) {
    // Check if user has logged in
    if (window.localStorage.token === undefined || window.localStorage.token === 'null') {
        return location.href = '/unauth';
    }
    // Check if user owns any guilds
    if (window.localStorage.gid === undefined) {
        return location.href = '/noGuilds';
    }
    // Render view with GuildID as route
    window.location.href = `${path}/${window.localStorage.gid}`;
}