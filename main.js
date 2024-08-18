const { autojsUtil } = require("./autojsUtil");
const { work } = require("./work");

let ss = storages.create("2343233");
ss.put("start", false); //初始化为false。重新启动，这个应该为停止的
ss.put("threadsStart", false); //初始化为false。重新启动，这个应该为停止的

events.setKeyInterceptionEnabled("volume_up", true);
events.setKeyInterceptionEnabled("volume_down", true);
events.observeKey();
events.onKeyUp("volume_up", () => {
  log("音量上键");

  ss.put("start", true);
});
events.onKeyUp("volume_down", () => {
  log("音量下键");
  // ss.put("start", false);
  autojsUtil.stop();
});

setInterval(() => {
  if (autojsUtil.stoped() && ss.get("threadsStart", true)) {
    log("停止所有子线程");
    threads.shutDownAll();
  }
}, 1000);

setInterval(() => {
  if (ss.get("start", false) && !ss.get("threadsStart", false)) {
    ss.put("threadsStart", true);
    log("开启工作线程");
    toastLog("开启任务");
    threads.start(function () {
      try {
        work();
      } catch (error) {
        log(error);
        log("异常结束"); //中断结束
        toastLog("任务结束");
        log("恢复标志位");
        autojsUtil.recoverStoped();
        toastLog("结束任务");
        ss.put("threadsStart", false);
        ss.put("start", false);
      }
    });
  }
}, 1000);
