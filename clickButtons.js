function onClearClick() {
    chrome.runtime.sendMessage({type: "initClickButtons"}, function() {});
}

function onCheckboxUpdate() {
    let checkbox = document.getElementById('closeNewTabs');
    chrome.runtime.sendMessage({type: "setCloseNewTabs", val: checkbox.checked}, function() {});
}

function init() {
    let clearButton = document.getElementById('clearBtn');
    clearButton.addEventListener("click", onClearClick);

    let checkbox = document.getElementById('closeNewTabs');
    checkbox.addEventListener("change", onCheckboxUpdate);
}

init();



