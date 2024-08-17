let stg = storages.create("xdfsdfsd");
function boot() {
  toastLog("启动");
  if (stg.get("boot", false)) {
    toastLog("已经启动");
    return;
  }
  stg.put("boot", true);
  log("开始启动");

  threads.start(function () {
    // 启动线程，进行答题。
    work();
  });
}

function clearboot() {
  toastLog("关闭");

  stg.put("boot", false);
  threads.shutDownAll();
  sleep(3 * 1000);
}

events.setKeyInterceptionEnabled("volume_up", true);
events.observeKey();
events.onKeyUp("volume_up", () => {
  log("音量上键按下又弹起来");
  boot();
});
events.onKeyUp("volume_down", () => {
  log("音量下键按下又弹起来");
  clearboot();
});
