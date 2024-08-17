let questions = {};
function loadQuestion() {
  let questionJsonStr = files.read("./question.json").toString();
  questions = JSON.parse(questionJsonStr);
}
loadQuestion();

const questionLib = {
  standardQuestion: function (questionTitle) {
    function removeSpacesInParentheses(str) {
      // 使用正则表达式匹配括号及其内容，但捕获括号内容以供处理
      return str.replace(/\（([^）]+)\）/g, function (match, p1) {
        // p1 是括号内的内容，使用 replace 去除其中的所有空白字符
        return `（${p1.replace(/\s+/g, "")}）`;
      });
    }

    function removeSpacesInParenthesesEn(str) {
      // 使用正则表达式匹配括号及其内容，但捕获括号内容以供处理
      return str.replace(/\(([^)]+)\)/g, function (match, p1) {
        // p1 是括号内的内容，使用 replace 去除其中的所有空白字符
        return `（${p1.replace(/\s+/g, "")}）`;
      });
    }

    let s = removeSpacesInParentheses(questionTitle);
    s = removeSpacesInParenthesesEn(s);
    s = s.replace(/【多选题】$/, ""); // 去掉多选题 最后的【多选题】
    return s.replace(/（/g, "(").replace(/）/g, ")").trim();
  },
  getQAByQuestion: function (question) {
    for (q of questions) {
      if (q.question == question) {
        return q;
      }
    }
  },
  getAllQAByQuestion: function (question) {
    let qs = [];
    for (q of questions) {
      if (q.question == question) {
        qs.push(q);
      }
    }
    return qs;
  },
  getQAFillBlankQuestion: function (splitTexts) {
    let pageTitle = "";

    log("拼接元素：");
    for (let sT of splitTexts) {
      if (sT.getText() == "") {
        continue;
      }
      log(sT.getText());
      pageTitle += sT.getText();
      pageTitle += "()";
    }
    log("拼接结果");

    // 去掉刚才多拼接的 ”（）“

    if (splitTexts.length > 0) {
      pageTitle = pageTitle.slice(0, -2);
      // log("fuck %s", pageTitle);
    }

    // 将所有的（）（   ），全部替换为（）

    let cleanPageTitle = questionLib.standardQuestion(pageTitle);
    log("拼接页面填空题->%s", cleanPageTitle);

    for (let q of questions) {
      if (q.question == cleanPageTitle && q.type == "填空题") {
        return q;
      }
    }

    // 可能是（）xxxx。这种的。填空在句首
    cleanPageTitle = "()" + cleanPageTitle;
    for (let q of questions) {
      if (q.question == cleanPageTitle && q.type == "填空题") {
        return q;
      }
    }

    console.warn("此填空题无答案");
  },
};

module.exports = { questionLib };
