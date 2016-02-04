function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {

    var tab = tabs[0];
    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url, tab.id);
  });
}

function messageToTab(tabId, cmd, cb) {
  chrome.tabs.sendMessage(
    tabId, cmd,
    function(data) {
      if (cb) cb(data);
    }
  );
}


function forTabsWithUrl(url, success, fail, skip) {
  chrome.tabs.query({windowType:'normal', status:'complete', }, function(tabs) {
    var successed = false;
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].url.match(url)) {
        if (success) success(tabs[i]);
        seccessed = true;
        if (skip) return;
      }
    }
    if (!successed && fail) fail();
  });
}