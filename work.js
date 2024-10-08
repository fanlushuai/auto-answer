const { wdx } = require("./wdx");

function work() {
  while (1) {
    wdx.answerAndNextScreen();
    if (
      text("提交")
        .clickable()
        .boundsInside(0, 300, device.width, device.height)
        .exists()
    ) {
      log("到达底部");
      wdx.answerAndNextScreen();
      toast("到达底部,运行完成");
      break;
    }
  }
}

// work();

module.exports = { work };

// 获取当前屏幕中的所有题目
// 获取到，完整题目，的title和范围。比如，当前屏幕3个题目，那么前两个，是完整的，倒数第一个去掉之后的，一定是完整的。
// 拿到，多个完整的题目和范围。去题库搜索，并且回答。
// 在回答的过程中，如果遇到，找不到答案的，进行全题库扫描。切换同名题目的答案进行答题。（只能应对，相同答案，但是选项不同）
// 滑动最后一个不完整的题目，到屏幕最顶部。然后循环。
// 判断到底部之后。出现提交。到底部了。
// 最后一道题目。因为，只有题目，但是，没有范围了。无法进行复核判断。就造假，提交为题目。确定，题目的范围。
