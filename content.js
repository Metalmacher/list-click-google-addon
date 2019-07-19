const ELEMENTS_SEL = '#app > ul > li > a';

function getElements() {
    return document.querySelectorAll(ELEMENTS_SEL);
}

function clickElement(index) {
    let elements = getElements();
    elements[index].click();
}

function getElementsLength() {
    return getElements().length;
}


function addInitListener() {
    chrome.runtime.onMessage.addListener(function(req, sender, sendRes) {
        switch(req.command) {
            case "getElementsLength": 
                sendRes(getElementsLength());
                break;
            case "clickElement": 
                clickElement(req.index);
                sendRes(true);
                break;
        }
    });
}
addInitListener();

