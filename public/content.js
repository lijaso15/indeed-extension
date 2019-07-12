/*global chrome*/

chrome.storage.local.set(
  { selection: "", Position: "", Requirements: "", Company: "" },
  function() {}
);

window.setInterval(function() {
  chrome.storage.local.set(
    { selection: window.getSelection().toString() },
    function() {}
  );
}, 1000);
