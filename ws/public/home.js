const panelSelectButtons = document.querySelectorAll('.panel-select button');

panelSelectButtons.forEach(button => {
    button.addEventListener('click', () => {
        const openPanels = document.getElementsByClassName('open');
        openPanels[0].classList.remove('open');
        const panel = document.getElementById(button.innerHTML);
        panel.classList.add('open');
    });
});
