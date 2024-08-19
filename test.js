const { ThreadFix } = require("./threadFix");

ThreadFix.job = function () {
  console.log("请重写job方法，运行任务");

  while (1) {
    sleep(1000);
    console.log("job running");
    ThreadFix.exitIfStoped();
  }
};

// while (1) {
ThreadFix.start();
sleep(10000);
ThreadFix.stop();
sleep(10000);
ThreadFix.start();
// }
