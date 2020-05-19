let createdTab = null;
let port = null;

const startDoc =
  'let p = document.createElement("p"); p.textContent = "READY"; document.body.insertBefore(p, document.body.firstChild); undefined;';
const testDoc =
  'p = document.createElement("p"); p.textContent = "GO!"; document.body.insertBefore(p, document.body.firstChild); undefined;';
const appenBEG = 'p = document.createElement("p"); p.textContent = "';
const appenEND =
  '"; document.body.insertBefore(p, document.body.firstChild); undefined;';
const cssClear =
  'document.querySelectorAll(\'style, link[rel = "stylesheet"]\').forEach(item => item.remove()); document.body.style.backgroundColor = "#222"; document.body.style.color = "#e6e6e6"; document.body.style.borderColor = "#e6e6e6"; document.body.innerHTML = \'\'; undefined;';

//Start up
browser.browserAction.onClicked.addListener(() => {
  if (createdTab == null) {
    console.log("Opening page");
    openPage();
  } else {
    let executing = browser.tabs.executeScript(createdTab, {
      code: testDoc,
    });
    executing.then(onExecuted, onError);
  }
});

function onCreated(tab) {
  port = browser.runtime.connectNative("cbwatcher");
  port.onMessage.addListener(msgListener);
  console.log(`Created new tab: ${tab.id}`);
  createdTab = tab.id;
  let executing = browser.tabs.executeScript(createdTab, {
    code: cssClear,
  });
  executing.then(onExecuted, onError);

  let executing2 = browser.tabs.executeScript(createdTab, {
    code: startDoc,
  });
  executing2.then(onExecuted, onError);
}

//Tab closed
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (tabId == createdTab) {
    if (port != null) {
      port.onMessage.removeListener();
      port.disconnect();
    }
    createdTab = null;
  }
});

function msgListener(response) {
  console.log("Received: " + response);
  let executing = browser.tabs.executeScript(createdTab, {
    code: appenBEG + response.replace(/(?:\r\n|\r|\n)/g, " ") + appenEND,
  });
  executing.then(onExecuted, onError);
}

//Helpers
function openPage() {
  let curTab = browser.tabs.create({
    url: "https://example.com/",
  });
  curTab.then(onCreated, onError);
}

function onExecuted(result) {}

function onError(error) {
  console.log(`Error: ${error}`);
}
