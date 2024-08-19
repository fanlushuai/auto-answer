const { ThreadFix } = require("./threadFix");
const { work } = require("./work");

ThreadFix.job = work;
events.setKeyInterceptionEnabled("volume_up", true);
events.setKeyInterceptionEnabled("volume_down", true);
events.observeKey();
events.onKeyUp("volume_up", () => {
  log("音量上键");
  ThreadFix.start();
});
events.onKeyUp("volume_down", () => {
  log("音量下键");
  ThreadFix.stop();
});
