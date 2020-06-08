function initializeSidebar() {
    initializeGuildSelect();
    initializeUser();
}

function initializeGuildSelect() {
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
            if (guild.owner) {
                var select = document.createElement("option");
                select.innerHTML = guild.name;
                select.value = guild.id;
                document.getElementById("guilds").appendChild(select);
            }
        });
        if (!window.localStorage.gid) {
            window.localStorage.gid = document.getElementById('guilds').options[0].value;  
        }
        document.getElementById('guilds').value = window.localStorage.gid;
    }
    xhr.send();
}

function initializeUser() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://discordapp.com/api/users/@me");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + window.localStorage.token);
    xhr.onload = function() {
        var response = JSON.parse(xhr.response);
        const userDiv = document.getElementById("user");
        if (!response.id) {
            const loginLink = document.createElement("a");
            loginLink.href = "https://discord.com/api/oauth2/authorize?client_id=710067353227886612&redirect_uri=http%3A%2F%2F192.168.43.243%3A8000&response_type=token&scope=identify%20guilds";
            loginLink.innerHTML = "login";
            loginLink.id = "login-link"
            userDiv.appendChild(loginLink);
        }
        else {
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
                window.location.reload();
            }
            logoutButton.innerText = 'logout';
            userTextDiv.appendChild(logoutButton);

            userDiv.appendChild(userTextDiv);
        }
    }
    xhr.send();
}

function guildSelectionChange() {
    //save the selected guild's id in local storage
    //reload page with selected guild's data

    window.localStorage.gid = document.getElementById('guilds').value;
    loadPage(location.pathname);
}

function loadPage(path) {
    if (path == '/home') return window.location.href = path;
    window.location.href = `${path}/${window.localStorage.gid}`;
}