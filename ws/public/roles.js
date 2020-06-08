const loadedNames = document.getElementsByName('name');
const loadedRoles = [];
for (i = 0; i < loadedNames.length; i++) {
    loadedRoles.push(loadedNames[i].value);
}
var removedRoles = [];

function addRole() {
    const role = document.createElement('div');
    role.className = "role-items-wrapper";

    const colorDisplayDiv = document.createElement('div');
    colorDisplayDiv.className = "color-display"
    role.appendChild(colorDisplayDiv);

    const buttonDiv = document.createElement('div');
    buttonDiv.className = "role-remove-button";

    const removeButton = document.createElement('button');
    removeButton.className = "fa fa-trash"
    removeButton.onclick = function() {
        removeRole(this);
        return false;
    }

    buttonDiv.appendChild(removeButton);
    role.appendChild(buttonDiv);

    const inputTextDiv = document.createElement('div');
    inputTextDiv.className = "role-text-inputs";

    const nameText = document.createElement('input');
    nameText.type = "text";
    nameText.name = "name";
    nameText.placeholder = "role name";
    inputTextDiv.appendChild(nameText);

    const scoreText = document.createElement('input');
    scoreText.type = "text";
    scoreText.name = "score";
    scoreText.placeholder = "required score";
    inputTextDiv.appendChild(scoreText);

    const colorText = document.createElement('input');
    colorText.type = "text";
    colorText.name = "color";
    colorText.oninput = function() {
        changeColorDisplay(this);
        return false;
    }
    colorText.placeholder = "role color";
    inputTextDiv.appendChild(colorText);

    role.appendChild(inputTextDiv);
    document.getElementById('roles-wrapper').appendChild(role);
}

function removeRole(sender) {
    var roleToRemove = sender.parentNode.parentNode.children[1].children[0].value;
    if (loadedRoles.includes(roleToRemove)) {
        removedRoles.push(roleToRemove);
    }
    var elem = sender.parentNode.parentNode;
    elem.parentNode.removeChild(elem);       
}

function changeColorDisplay(sender) {
    const colorDisplay = sender.parentNode.parentNode.children[0];
    if (sender.value.match(/^\d/)) {
        return colorDisplay.style = `background-color:rgb(${sender.value})`;
    }
    colorDisplay.style = `background-color:${sender.value}`;
}

function updateRoles() {
    var names = document.getElementsByName('name');
    var scores = document.getElementsByName('score');
    var colors = document.getElementsByName('color');

    var rolesArray = [];
    for (i = 0; i < names.length; i++) {
        var color;
        if (colors[i].value.match(/^\d/)) {
            color = colors[i].value.split(', ');
            color[0] = Number(color[0]);
            color[1] = Number(color[1]);
            color[2] = Number(color[2]);
        }
        else color = colors[i].value
        rolesArray.push({
            name: names[i].value,
            score: scores[i].value,
            color: color
        });
    }
    rolesArray.sort((a, b) => {
        return a.score - b.score;
    });
    rolesArray.reverse();

    var roles = {};
    for (const index in rolesArray) {
        roles['Rank' + index] = rolesArray[index];
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", `http://${location.hostname}:${location.port}/updateRoles`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        token: window.localStorage.token,
        guildID: window.localStorage.gid,
        roles: roles,
        removedRoles: removedRoles
    }));
    removedRoles.length = 0;
}