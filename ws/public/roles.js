const loadedNames = document.getElementsByName('name');
const loadedRoles = [];
for (i = 0; i < loadedNames.length; i++) {
    loadedRoles.push(loadedNames[i].value);
}
var removedRoles = [];

function addRole() {
    const role = document.createElement('div');
    role.className = "role-items-wrapper";

    const buttonDiv = document.createElement('div');
    buttonDiv.className = "role-remove-button";

    const removeButton = document.createElement('button');
    removeButton.innerHTML = "-";
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

function updateRoles() {
    var names = document.getElementsByName('name');
    var scores = document.getElementsByName('score');
    var colors = document.getElementsByName('color');
    var reasons = document.getElementsByName('reason');

    var rolesArray = [];
    for (i = 0; i < names.length; i++) {
        rolesArray.push({
            name: names[i].value,
            score: scores[i].value,
            color: colors[i].value,
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
    xhr.open("POST", "http://192.168.43.243:41206/updateRoles");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        token: window.localStorage.token,
        guildID: window.localStorage.gid,
        roles: roles,
        removedRoles: removedRoles
    }));
    removedRoles.length = 0;
}