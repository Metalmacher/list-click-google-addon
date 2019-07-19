let host = 's.codepen.io';
let mainTabID;
let elementsLength;
let currentIndex;
let closeNewTabs;

/**
 * -----------------------------------
 * MAIN
 * -----------------------------------
 */

async function clickNextButton() {
   if (++currentIndex >= elementsLength) {
      return false;
   }
   
   await clickOnButton(currentIndex);
   console.log("Clicked on button #" + currentIndex+1);
   if(closeNewTabs) {
      chrome.webNavigation.onCompleted.addListener(closeTab);
   } else {
      clickNextButton();
   }
}

function addListenerOnce(scope, addHandler, removeHandler, callback) {
   _callback = callback;
   callback = () => {
      removeHandler.call(scope, callback);
      _callback();
   };
   addHandler.call(scope, callback);
}

function getCurrentTabID() {
   return new Promise((res, rej) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
         res(tabs[0].id);
      });
   })
}

function getTabByID(id) {
   return new Promise((res, rej) => {
      chrome.tabs.get(id, (tab) =>{
         res(tab);
      })
   });
}

async function isTabInHost(id) {
   let tab = await getTabByID(id);
   return tab.url.indexOf(host) !== -1;
}

function getElementsLength() {
   return new Promise(async function (res, rej) {
      chrome.tabs.sendMessage(mainTabID, { command: 'getElementsLength' }, function(length) {
         res(length);
      });
   });
}

function clickOnButton(index) {
   return new Promise(async function (res, rej) {
      chrome.tabs.sendMessage(mainTabID, { command: 'clickElement', index: index }, () => {
         res(true);
      });
   });
}

async function closeTab(details) {
   chrome.webNavigation.onCompleted.removeListener(closeTab);
   chrome.tabs.onActivated.addListener(onTabChanged);
   
   if(await isTabInHost(details.tabId)) {
      var tabId = details.tabId;
      chrome.tabs.remove(tabId);
   }
}

function onTabChanged(details) {
   chrome.tabs.onActivated.removeListener(onTabChanged);
   if(details.tabId === mainTabID) {
      clickNextButton();
   }
}

function reset() {
   return new Promise((res, rej) => {
      chrome.webNavigation.onCompleted.removeListener(closeTab);
      chrome.tabs.onActivated.removeListener(onTabChanged);
   });
}

/**
 * -----------------------------------
 * INIT
 * -----------------------------------
 */

async function initVariables() {
   mainTabID = await getCurrentTabID();
   elementsLength = await getElementsLength();
   currentIndex = -1;
}


function bindInitEvent() {
   chrome.runtime.onMessage.addListener(async function (req, sender, res) {
      switch(req.type) {
         case 'initClickButtons':
            await initVariables();
            clickNextButton();
            break;
         case 'setCloseNewTabs':
            debugger;
            closeNewTabs = req.val;
            break;
      }
   });
}
bindInitEvent();


function placeRulesInHostOnly() {
   chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
      chrome.declarativeContent.onPageChanged.addRules([{
         conditions: [new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: host }
         }),
         ],
         actions: [new chrome.declarativeContent.ShowPageAction()]
      }])
   });
}
placeRulesInHostOnly();
