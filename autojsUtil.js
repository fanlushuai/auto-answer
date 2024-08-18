let s = storages.create("autojsUtil-stop");
s.put("stoped", false); //初始化，为false

const autojsUtil = {
  exitIfStoped: function () {
    if (this.stoped()) {
      console.warn("中断线程");
      threads.currentThread().interrupt();
    }
  },
  stoped: function () {
    return s.get("stoped", false);
  },
  stop: function () {
    s.put("stoped", true);
  },
};

module.exports = { autojsUtil };
