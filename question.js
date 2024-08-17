const { questionLib } = require("./questionLib");

let hasAnsweredListForMutilAnswer = [];

function getQuestionElesInCurrentScreen() {
  let texts = className("TextView")
    .boundsInside(0, 300, device.width, device.height)
    .find();
  const regex = /^\d+\./;

  questionEles = [];
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
}

// getQuestionEleInCurrentScreen();

function getAnswerClickRangesInScreen(questionsELes) {
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
  return range;
}

function scrollTopnextQuestion(nextQuestionEle) {
  let e = nextQuestionEle;
  // log(e.bounds());
  swipe(device.width / 3, e.bounds().top, device.width / 3, 300, 500);
}

function choose(QA, range, option) {
  log("填写答案 %s", option);

  function clickAnswer(answerText) {
    let aE = text(answerText)
      .boundsInside(0, range.range.start, device.width, range.range.end)
      .findOne(8000);
    if (aE) {
      aE.click();
      return true;
    } else {
      log("选项找不到 %s", answerText);
      return false;
    }
  }

  if (option == "A") {
    // 去除前后空格
    QA.answer_a = QA.answer_a.trim();

    log(QA.answer_a);
    if (QA.answer_a == "A、正确") {
      log("A、正确 -> 对");

      QA.answer_a = "对";
    }

    return clickAnswer(QA.answer_a);
  } else if (option == "B") {
    // 去除前后空格
    QA.answer_b = QA.answer_b.trim();

    log(QA.answer_b);
    if (QA.answer_b == "B、错误") {
      log("B、错误 -> 错");
      QA.answer_b = "错";
    }

    return clickAnswer(QA.answer_b);
  } else if (option == "C") {
    // 去除前后空格
    QA.answer_c = QA.answer_c.trim();
    log(QA.answer_c);

    return clickAnswer(QA.answer_c);
  } else if (option == "D") {
    // 去除前后空格
    QA.answer_d = QA.answer_d.trim();
    log(QA.answer_d);
    return clickAnswer(QA.answer_d);
  } else if (option == "E") {
    // 去除前后空格
    QA.answer_e = QA.answer_e.trim();
    log(QA.answer_e);
    return clickAnswer(QA.answer_e);
  } else {
    console.error("选项异常 %s", option);
    return false;
  }
}

function answerAndNextScreen() {
  let questionEles = getQuestionElesInCurrentScreen();
  let ranges = getAnswerClickRangesInScreen(questionEles);

  for (r of ranges) {
    log("开始回答题目##>：%s", r.title);

    // 去除题目中的多余关键字。
    // 去除【多选题】
    r.title = r.title.replace(/【多选题】$/, "");
    // log("去除多余关键字后的题目：%s", r.title);

    let QA = questionLib.getQAByQuestion(r.title);
    if (QA) {
      log(QA);
      if (QA.type == "单选题") {
        log("单选题-答案为：%s", QA.answer);

        if (choose(QA, r, QA.answer)) {
          // 本题目完成
          continue;
        }

        log("有个选项没有找到，全表扫描题库");
        let allQA = questionLib.getAllQAByQuestion(QA.question);
        if (allQA.length == 1) {
          // 只有一个，说明，确实没有其他答案。本题结束。
          log("本题目本选项 %s失败结束", QA.answer);
          continue;
        }

        for (let qa of allQA) {
          // 切换到其他题目，点击那个选项。
          if (choose(qa, r, QA.answer)) {
            continue;
          }
        }
      } else if (QA.type == "多选题") {
        log("题库答案为：%s", QA.answer);

        let hasAnswered = false;
        for (let ha of hasAnsweredListForMutilAnswer) {
          if (ha == QA.question) {
            log("已经回答过，跳过");
            hasAnswered = true;
          }
        }

        if (hasAnswered) {
          continue;
        }

        let answer = QA.answer;
        for (a of answer) {
          if (choose(QA, r, a)) {
            // 本题目完成
            continue;
          }

          log("有个选项没有找到，全表扫描题库");
          let allQA = questionLib.getAllQAByQuestion(QA.question);
          if (allQA.length == 1) {
            // 只有一个，说明，确实没有其他答案。本题结束。
            log("本题目本选项 %s失败结束", a);
            continue;
          }

          for (let qa of allQA) {
            // 切换到其他题目，点击那个选项。
            if (choose(qa, r, a)) {
              log("选项纠错 %s成功", a);
              continue;
            }
          }
        }

        // 多选题有反选的功能。所以，写过的，最好让他别再写了。
        hasAnsweredListForMutilAnswer.push(QA.question);
      } else if (QA.type == "判断题") {
        log("判断题-答案为：%s", QA.answer);

        choose(QA, r, QA.answer);
      } else if (QA.type == "填空题") {
        log("填空题-答案为：%s", QA.answer);
        //todo
      }
    } else {
      console.warn("没有找到答案");

      // 判断，是否是填空题
      // 填空题目的title获取不全。所以，填空题，从题库中找不到答案。

      let ets = className("EditText")
        .clickable()
        // 输入框比较大。用坐标的话，不太行。需要稍微放大一点。
        .boundsInside(0, r.range.start - 10, device.width, r.range.end + 10)
        .find();

      if (ets.size() > 0) {
        log("当前为填空题");
        //
        let texts = className("TextView")
          .boundsInside(0, r.range.start, device.width, r.range.end)
          .find();

        // 去除最后一个*。匹配多了
        if (texts.size() > 0) {
          if (texts[texts.size() - 1].text() == "*") {
            texts.pop();
          }
        }

        let QAFillBlankQuestion = questionLib.getQAFillBlankQuestion(texts);

        if (QAFillBlankQuestion) {
          log("填空题-答案为：%s", QAFillBlankQuestion.answer);
          // 填空题，需要输入文字。
          for (let i = 0; i < ets.size(); i++) {
            log("输入答案->%s", QAFillBlankQuestion.answer);
            ets[i].setText(QAFillBlankQuestion.answer);
          }
        }
      } else {
        console.warn("没有找到答案");
      }
    }
  }

  sleep(800);
  scrollTopnextQuestion(questionEles[questionEles.length - 1]);
  sleep(800);
}

function answerLastQuestion() {
  let questionEles = getQuestionElesInCurrentScreen();

  // 将提交，作为一个假的题目，搞进去。
  let mannulQuestion = text("提交").findOne(8000);
  questionEles.push(mannulQuestion);

  let ranges = getAnswerClickRangesInScreen(questionEles);
  let r = ranges[ranges.length - 1];

  log("最后回答题目##>：%s", r.title);

  // 去除题目中的多余关键字。
  // 去除【多选题】
  r.title = r.title.replace(/【多选题】$/, "");
  // log("去除多余关键字后的题目：%s", r.title);

  let QA = questionLib.getQAByQuestion(r.title);
  if (QA) {
    log(QA);
    if (QA.type == "单选题") {
      log("单选题-答案为：%s", QA.answer);

      if (choose(QA, r, QA.answer)) {
        // 本题目完成
        return;
      }

      log("有个选项没有找到，全表扫描题库");
      let allQA = questionLib.getAllQAByQuestion(QA.question);
      if (allQA.length == 1) {
        // 只有一个，说明，确实没有其他答案。本题结束。
        log("本题目本选项 %s失败结束", QA.answer);
        return;
      }

      for (let qa of allQA) {
        // 切换到其他题目，点击那个选项。
        if (choose(qa, r, QA.answer)) {
          continue;
        }
      }
    } else if (QA.type == "多选题") {
      log("题库答案为：%s", QA.answer);
      let answer = QA.answer;
      for (a of answer) {
        if (choose(QA, r, a)) {
          // 本题目完成
          continue;
        }

        log("有个选项没有找到，全表扫描题库");
        let allQA = questionLib.getAllQAByQuestion(QA.question);
        if (allQA.length == 1) {
          // 只有一个，说明，确实没有其他答案。本题结束。
          log("本题目本选项 %s失败结束", a);
          continue;
        }

        for (let qa of allQA) {
          // 切换到其他题目，点击那个选项。
          if (choose(qa, r, a)) {
            log("选项纠错 %s成功", a);
            continue;
          }
        }
      }
    } else if (QA.type == "判断题") {
      log("判断题-答案为：%s", QA.answer);

      choose(QA, r, QA.answer);
    } else if (QA.type == "填空题") {
      log("填空题-答案为：%s", QA.answer);
      //todo
    }
  } else {
    console.warn("没有找到答案");

    // 判断，是否是填空题
    // 填空题目的title获取不全。所以，填空题，从题库中找不到答案。

    let ets = className("EditText")
      .clickable()
      // 输入框比较大。用坐标的话，不太行。需要稍微放大一点。
      .boundsInside(0, r.range.start - 10, device.width, r.range.end + 10)
      .find();

    if (ets.size() > 0) {
      log("当前为填空题");
      //
      let texts = className("TextView")
        .boundsInside(0, r.range.start, device.width, r.range.end)
        .find();

      // 去掉空的。在匹配最后一题的时候，会出现
      // 这种去掉所有*和所有空的情况，有点模糊，不是很准。但是，大概率不会有问题

      let ttttt = [];
      for (let t of texts) {
        if (t.getText() != "" && t.getText() != "*") {
          ttttt.push(t);
        }
      }

      texts = ttttt;

      // 去除最后一个*。匹配多了
      if (texts.length > 0) {
        if (texts[texts.length - 1].text() == "*") {
          texts.pop();
        }
      }

      let QAFillBlankQuestion = questionLib.getQAFillBlankQuestion(texts);

      if (QAFillBlankQuestion) {
        log("填空题-答案为：%s", QAFillBlankQuestion.answer);
        // 填空题，需要输入文字。
        for (let i = 0; i < ets.size(); i++) {
          log("输入答案->%s", QAFillBlankQuestion.answer);
          ets[i].setText(QAFillBlankQuestion.answer);
        }
      }
    } else {
      console.warn("没有找到答案");
    }
  }
}
