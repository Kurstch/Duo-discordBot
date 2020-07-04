function initializeSidebar() {
    initializeGuildSelect();
    initializeUser();
}

function initializeGuildSelect() {
    // If user hasn't logged in return

    if (window.localStorage.token === undefined || window.localStorage.token == 'null') return;

    // Get all guilds the user is a member in
    // If user is the guild's owner, add the guild to navigation bar guilds selector
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://discordapp.com/api/users/@me/guilds");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + window.localStorage.token);
    xhr.onload = function() {
        var response = JSON.parse(xhr.response);
        if(!response[0]) return;
        response.forEach(guild=>{
            if (guild.owner) {
                var select = document.createElement("option");
                select.innerHTML = guild.name;
                select.value = guild.id;
                document.getElementById("guilds").appendChild(select);
            }
        });

        // Save currently selected guild's id to local storage

        if (!window.localStorage.gid) {
            window.localStorage.gid = document.getElementById('guilds').options[0].value;  
        }
        document.getElementById('guilds').value = window.localStorage.gid;
    }
    xhr.send();
}

function initializeUser() {
    // If user hasn't logged in, create a login link and return

    if (window.localStorage.token === undefined || window.localStorage.token == 'null') {
        const userDiv = document.getElementById("user");
        const loginLink = document.createElement("a");
        loginLink.href = "https://discord.com/api/oauth2/authorize?client_id=710067353227886612&redirect_uri=https%3A%2F%2Fduo-discordbot.herokuapp.com%2Findex&response_type=token&scope=identify%20guilds";
        loginLink.innerHTML = "login";
        loginLink.id = "login-link"
        userDiv.appendChild(loginLink);
        return;
    }

    // Get user data to display in the nav bar

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://discordapp.com/api/users/@me");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + window.localStorage.token);
    xhr.onload = function() {
        var response = JSON.parse(xhr.response);
        const userDiv = document.getElementById("user");

        // If user doesn't have an avatar, use default discord avatar

        const userAvatar = document.createElement("img");
        if (response.avatar != null) {
            userAvatar.src = `https://cdn.discordapp.com/avatars/${response.id}/${response.avatar}.png`;
        }
        else {
            userAvatar.src = "/images/discordDefaultAvatar.png"
        }
        userDiv.appendChild(userAvatar);

        const userTextDiv = document.createElement('div');
        userTextDiv.className = 'user-text';

        const username = document.createElement("small");
        username.innerHTML = response.username;
        userTextDiv.appendChild(username);

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
    if (path == '/home') return window.location.href = path;
    if (window.localStorage.token === undefined || window.localStorage.token === 'null') return location.href = '/unauth';
    if (window.localStorage.gid === undefined) return location.href = '/noGuilds';
    window.location.href = `${path}/${window.localStorage.gid}`;
}