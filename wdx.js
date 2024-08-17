const { questionLib } = require("./questionLib");

// 问答星
const wdx = {
  topHeight: 350,
  hasAnsweredListForMutilAnswer: [],
  getQuestionElesInCurrentScreen: function () {
    let texts = className("TextView")
      .boundsInside(0, this.topHeight, device.width, device.height)
      .find();
    const regex = /^\d+\./;

    let questionEles = [];
    let nextTextIsQuestion = false;
    for (t of texts) {
      // log(t.getText());

      if (nextTextIsQuestion) {
        questionEles.push(t);
        log("获取页面题目--> %s", t.getText());
        nextTextIsQuestion = false;
      }
      if (regex.test(t.getText())) {
        nextTextIsQuestion = true;
      }
    }

    return questionEles;
  },
  getAnswerClickRangesInScreen: function (questionsELes) {
    let range = [];
    for (let i = 0; i < questionsELes.length; i++) {
      let q1 = questionsELes[i];
      if (i + 1 < questionsELes.length) {
        let r = {
          title: questionLib.standardQuestion(q1.getText()),
          range: {
            start: q1.bounds().top,
            end: questionsELes[i + 1].bounds().top,
          },
        };
        console.log("题目和答案坐标范围==> %j", r);
        range.push(r);
      }
    }

    // 判断是否到达底部
    let commitEles = text("提交")
      .boundsInside(0, this.topHeight, device.width, device.height)
      .clickable()
      .find();
    if (commitEles && commitEles.length > 0) {
      log("到达底部");
      log("本次回答最后一题");
      let lastQuestion = questionsELes[questionsELes.length - 1];

      range.push({
        title: questionLib.standardQuestion(lastQuestion.getText()),
        range: {
          start: lastQuestion.bounds().top,
          end: commitEles[0].bounds().top,
        },
      });
    }

    return range;
  },
  scrollTopnextQuestion: function (nextQuestionEle) {
    swipe(
      device.width / 3,
      nextQuestionEle.bounds().top,
      device.width / 3,
      this.topHeight,
      500
    );
  },
  clickAnswer: function (range, answerText) {
    log("点击答案 %s", answerText);
    // 换成textMatch，兼容性更强。
    // uiselector.textMatches(/\s*\s*/)
    let aE = text(answerText)
      .boundsInside(0, range.range.start, device.width, range.range.end)
      .findOne(5000);
    if (aE) {
      aE.click();
      return true;
    } else {
      log("点选失败，找不到选项： %s", answerText);
      return false;
    }
  },
  choose: function (QA, range, option) {
    log("填写答案 %s", option);

    if (option == "A") {
      log(QA.answer_a);

      if (this.clickAnswer(range, QA.answer_a)) {
        return true;
      }

      //  对判断题进行兼容
      if (QA.type == "判断题") {
        log("判断题，对，正确，进行兼容");

        // 换到下一种
        if (QA.answer_a.indexOf("对") > -1) {
          QA.answer_a = "正确";
        } else if (QA.answer_a.indexOf("正") > -1) {
          QA.answer_a = "对";
        }

        return this.clickAnswer(range, QA.answer_a);
      }

      return false;
    } else if (option == "B") {
      if (this.clickAnswer(range, QA.answer_b)) {
        return true;
      }

      //  对判断题进行兼容
      if (QA.type == "判断题") {
        log("判断题，错误，错，进行兼容");

        // 换到下一种
        if (QA.answer_b.indexOf("错误") > -1) {
          QA.answer_b = "错";
        } else if (QA.answer_b.indexOf("错") > -1) {
          QA.answer_b = "错误";
        }

        return this.clickAnswer(range, QA.answer_b);
      }
      return false;
    } else if (option == "C") {
      return this.clickAnswer(range, QA.answer_c);
    } else if (option == "D") {
      return this.clickAnswer(range, QA.answer_d);
    } else if (option == "E") {
      return this.clickAnswer(range, QA.answer_e);
    } else {
      console.error("选项异常 %s", option);
      return false;
    }
  },
  answerOneQuestion: function (range) {
    log("开始答题：%s", range.title);
    let QA = questionLib.getQAByQuestion(range.title);
    if (QA) {
      log("题库解答:%j", QA);

      if (QA.type == "单选题") {
        if (this.choose(QA, range, QA.answer)) {
          return true;
        }
        // 切换到其他题目，点击那个选项。
        log("本题没有找到，全表扫描题库");
        let allQA = questionLib.getAllQAByQuestion(QA.question);
        if (allQA.length > 1) {
          for (let qa of allQA) {
            if (qa.answer == QA.answer) {
              continue;
            }

            if (this.choose(qa, range, qa.answer)) {
              return true;
            }
          }
        }

        log("本题失败");
        return false;
      } else if (QA.type == "多选题") {
        // 暴力一点，直接全表扫描
        let allQA = questionLib.getAllQAByQuestion(QA.question);
        //  直接拿到所有的选项
        let option = [];

        for (let qa of allQA) {
          for (let answer of qa.answer) {
            if (answer == "A") {
              option.push(qa.answer_a);
            } else if (answer == "B") {
              option.push(qa.answer_b);
            } else if (answer == "C") {
              option.push(qa.answer_c);
            } else if (answer == "D") {
              option.push(qa.answer_d);
            } else if (answer == "E") {
              option.push(qa.answer_e);
            }
          }
        }

        // 去重

        function unique(arr) {
          if (!Array.isArray(arr)) {
            console.log("type error!");
            return;
          }
          var array = [];
          for (var i = 0; i < arr.length; i++) {
            if (array.indexOf(arr[i]) === -1) {
              array.push(arr[i]);
            }
          }
          return array;
        }
        option = unique(option);

        for (let a of option) {
          // 多选题，只能直接点击了

          let hasAnswered = false;
          // 多选题，需要判断是否已经回答过。不然会出现反选的情况。
          // 选项级别的去重
          for (let ha of this.hasAnsweredListForMutilAnswer) {
            if (ha == QA.question + a) {
              console.warn("已经回答过，跳过");
              hasAnswered = true;
              break;
            }
          }

          if (hasAnswered) {
            continue;
          }

          this.clickAnswer(range, a);
          this.hasAnsweredListForMutilAnswer.push(QA.question + a);
        }

        return true;
      } else if (QA.type == "判断题") {
        return this.choose(QA, range, QA.answer);
      } else if (QA.type == "填空题") {
        let ets = className("EditText")
          .clickable()
          // 输入框比较大。用坐标的话，不太行。需要稍微放大一点。
          .boundsInside(
            0,
            range.range.start - 10,
            device.width,
            range.range.end + 10
          )
          .find();

        log("输入答案->%s", QA.answer);
        ets[0].setText(QA.answer);
        return true;
      } else {
        console.warn("未知题型：%s", QA.type);
      }
    } else {
      log("题库没有解答,可能是填空题，获取不全的题目");
      // 尝试进行Edit特征判断
      let ets = className("EditText")
        .clickable()
        // 输入框比较大。用坐标的话，不太行。需要稍微放大一点。
        .boundsInside(
          0,
          range.range.start - 10,
          device.width,
          range.range.end + 10
        )
        .find();
      if (ets.size() > 0) {
        log("当前为填空题");

        let texts = className("TextView")
          .boundsInside(0, range.range.start, device.width, range.range.end)
          .find();

        let ts = [];
        for (let t of texts) {
          log("抓取到文本：[%s]", t.text());
          ts.push(t.text());
        }

        // 去除后面的空白
        // log(texts.size());
        while (1) {
          if (ts[ts.length - 1] == undefined || ts[ts.length - 1] == "") {
            log("去除，最后的一个空白");
            ts.pop();
            log("x:%s", ts.length);
          } else {
            break;
          }
        }

        // 去除最后一个*。匹配多了
        if (ts.length > 0) {
          if (ts[ts.length - 1] == "*") {
            ts.pop();
          }
        }
        let QAFillBlankQuestion = questionLib.getQAFillBlankQuestion(ts);

        if (QAFillBlankQuestion) {
          log("填空题-答案为：%s", QAFillBlankQuestion.answer);

          //   一般填空题的答案，只有一个。
          log("输入答案->%s", QAFillBlankQuestion.answer);
          ets[0].setText(QAFillBlankQuestion.answer);

          return true;
        }
      }

      return false;
    }
  },

  answerAndNextScreen: function () {
    let questionEles = this.getQuestionElesInCurrentScreen();

    //   因为要滚动，需要第二个题目。所以只有一个问题，就轻微向下移动一些。直到，超过1个。
    if (questionEles.length == 1) {
      log("内容向下滚动，到至少两道题出现");
      swipe(
        device.width / 3,
        questionEles[0].bounds().top,
        device.width / 3,
        wdx.topHeight,
        500
      );
      sleep(5 * 1000);
      questionEles = this.getQuestionElesInCurrentScreen();
    }

    let ranges = this.getAnswerClickRangesInScreen(questionEles);

    for (range of ranges) {
      this.answerOneQuestion(range);
    }

    sleep(800);
    this.scrollTopnextQuestion(questionEles[questionEles.length - 1]);
    sleep(800);
  },
};

module.exports = { wdx };
