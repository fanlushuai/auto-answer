let storage = storages.create("xxx");
storage.put("command", ""); //启动，或者停止
storage.put("threadHasStart", false); // 线程是否处于启动状态。
storage.put("interrupt", false); // 是否要中断。

threads.start(() => {
  setInterval(function () {
    // log("xxx");
    let command = storage.get("command", "");
    if (command == "start" && storage.get("threadHasStart", false) == false) {
      storage.put("command", "");
      storage.put("threadHasStart", true);
      storage.put("interrupt", false);

      function funcWrapper() {
        try {
          console.log("任务启动");
          toastLog("任务启动");
          ThreadFix.job();
        } catch (error) {
          console.log(error);
          log("线程异常退出");
          // 恢复状态。
          storage.put("threadHasStart", false);
          toastLog("任务结束");
        }
      }

      threads.start(funcWrapper);
    } else if (command == "stop") {
      storage.put("command", "");
      storage.put("interrupt", true);
      if (storage.get("threadHasStart", false)) {
        console.log("停止线程");
      }
    } else {
      // log("未知命令");
    }
  }, 1000);
});
// 使用例子
// ThreadFix.job = function () {
// console.log("请重写job方法，运行任务");

// while (1) {
//   sleep(1000);
//   console.log("job running");
//   ThreadFix.exitIfStoped();
// };

// ThreadFix.start();
// ThreadFix.stop();

const ThreadFix = {
  job: function () {
    log("请重写job方法，运行任务");
  },
  start: function () {
    log("命令->启动");
    storage.put("command", "start");
  },
  stop: function () {
    log("命令->停止");
    storage.put("command", "stop");
  },
  exitIfStoped: function () {
    // 在find方法之前之后使用。用来结束那些顽固任务。
    if (storage.get("interrupt") == true) {
      console.log("中断线程");
      threads.currentThread().interrupt();
    }
  },
};

module.exports = { ThreadFix };
