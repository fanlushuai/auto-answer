let e;

events.setKeyInterceptionEnabled("volume_up", true);
events.observeKey();
events.onKeyUp("volume_up", () => {
  log("音量上键按下又弹起来");

  if (e == null || e.getEngine().isDestroyed()) {
    log("启动脚本引擎");
    engines.execScriptFile("./work.js");
  }
});
events.onKeyUp("volume_down", () => {
  log("音量下键按下又弹起来");
  if (e) {
    log("关闭脚本引擎");
    e.getEngine().forceStop();
  }
});
