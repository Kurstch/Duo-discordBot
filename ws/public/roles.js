// Save all loaded roles into an array
// Only these roles will the bot be allowed to delete

const loadedNames = document.getElementsByName('name');
const loadedRoles = [];
for (i = 0; i < loadedNames.length; i++) {
    loadedRoles.push(loadedNames[i].value);
}


function addRole() {
    // main role div
    const role = document.createElement('div');
    role.className = "role-items-wrapper";

    // color display
    const colorDisplayDiv = document.createElement('div');
    colorDisplayDiv.className = "color-display"
    role.appendChild(colorDisplayDiv);

    // role remove button container
    const buttonDiv = document.createElement('div');
    buttonDiv.className = "role-remove-button";

    // role remove button
    const removeButton = document.createElement('button');
    removeButton.className = "fa fa-trash"
    removeButton.onclick = function() {
        removeRole(this);
        return false;
    }

    buttonDiv.appendChild(removeButton);
    role.appendChild(buttonDiv);

    // input wrapper
    const inputTextDiv = document.createElement('div');
    inputTextDiv.className = "role-text-inputs";

    createInput('Name', "role name");
    createInput('Score', "required score");
    createInput('Color', "role color");

    function createInput(inputName, placeholder) {
        const inputField = document.createElement('div');
        inputField.className = 'input-field';
        inputField.innerHTML = `${inputName}:`

        const input = document.createElement('input');
        input.type = 'text';
        input.name = inputName.toLowerCase();
        input.placeholder = placeholder;
        if (inputName == 'Color') {
            input.oninput = function() {
                changeColorDisplay(this);
                return false;
            }
        }

        inputField.appendChild(input);
        inputTextDiv.appendChild(inputField);
    }

    role.appendChild(inputTextDiv);
    document.getElementById('roles-wrapper').appendChild(role);
}


function removeRole(sender) {
    var elem = sender.parentNode.parentNode;
    elem.parentNode.removeChild(elem);       
}


function changeColorDisplay(sender) {
    // Dynamicly change div color as user types in the color text input
    const colorDisplay = sender.parentNode.parentNode.parentNode.children[0];
    if (sender.value.match(/^\d/)) {
        return colorDisplay.style = `background-color:rgb(${sender.value})`;
    }
    colorDisplay.style = `background-color:${sender.value}`;
}


function updateRoles() {
    var names = document.getElementsByName('name');
    var scores = document.getElementsByName('score');
    var colors = document.getElementsByName('color');


    // Since role values are given in seperate arrays, i.e. names, scores, colors, we have to combine values into objects
    // Roles have to be sorted by score so that updateUserRoles works properly
    var rolesArray = [];
    for (i = 0; i < names.length; i++) {
        // Check if color is an rgb value
        var color;
        if (colors[i].value.match(/^\d/)) {
            color = colors[i].value.split(', ');
            color[0] = Number(color[0]);
            color[1] = Number(color[1]);
            color[2] = Number(color[2]);
        }
        else color = colors[i].value;
        
        rolesArray.push({
            name: names[i].value,
            score: Number(scores[i].value),
            color: color
        });
    }
    rolesArray.sort((a, b) => {
        return a.score - b.score;
    });
    rolesArray.reverse();

    // Remove all saved roles from loadedRoles array
    // Any roles left in loadedRoles array will be deleted from the guild
    for (role of rolesArray) {
        if (loadedRoles.includes(role.name)) {
            const index = loadedRoles.indexOf(role.name);
            if (index > -1) {
                loadedRoles.splice(index, 1);
            }
        }
    }


    // Because of how mongoDB stores data, it's best to make an object (roles) that contains role objects
    var roles = {};
    for (const index in rolesArray) {
        roles['Rank' + index] = rolesArray[index];
    }


    var xhr = new XMLHttpRequest();
    xhr.open("POST", `https://${location.hostname}:${location.port}/updateRoles`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        token: window.localStorage.token,
        guildID: window.localStorage.gid,
        roles: roles,
        removedRoles: loadedRoles
    }));


    // Reset loadedRoles array with the new roles
    loadedRoles.length = 0;
    for (i = 0; i < names.length; i++) {
        loadedRoles.push(names[i].value);
    }
}
