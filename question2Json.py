import sys
import xlwings as xw
from xlwings.utils import rgb_to_int
import json, re


# // 注意：题库，中，存在，（）（  ）（）括号中英文，以及中间空格多少的问题。需要进行，统一的处理。把题库的
# // 题库中，题目和选项都需要trim一下。有的多空格。
def standard_question(question: str) -> str:
    question = re.sub(r"（\s*）", "()", question)
    question = re.sub(r"\(\s*\)", "()", question)
    return question.strip()


# testStr = "（）dfds() fdsfs (   )（     ）（dfdsfd）(dfdf)"
# print(standard_question(testStr))
# sys.exit(0)


def standard_answer(question: str) -> str:
    if question is None:
        return
    return question.strip()


app = xw.App(visible=False, add_book=False)  # 界面设置
app.display_alerts = True  # 关闭提示信息
app.screen_updating = True  # 关闭显示更新

import os

# 获取当前工作目录
current_directory = os.getcwd()

# 打印当前工作目录
print("当前目录是:", current_directory)


wb = app.books.open(current_directory + "\题库(2024年).xlsx")
ws = wb.sheets[0]  # 0是第一个sheet
cell = ws.used_range.last_cell
rows = cell.row
columns = cell.column

print(rows, columns)

# x = ws.range((2, 1), (3, 10))
# for v in x:
#     print(v.row, v.column)
sheet = wb.sheets[0]

# 讲所有的题目，中的（）（  ）中英文。或者中间带空格的。全部，替换为。英文括号不带空格。（）


data = []
for row in sheet.range((2, 1), (1001, 10)).rows:

    row_dict = {
        "type": row[0].value,
        "question": standard_question(row[1].value),  # 进行标准化处理
        "answer_a": standard_answer(row[2].value),
        "answer_b": standard_answer(row[3].value),
        "answer_c": standard_answer(row[4].value),
        "answer_d": standard_answer(row[5].value),
        "answer_e": standard_answer(row[6].value),
        "answer": (
            re.sub("\.0$", "", str(row[7].value))  # 去除小数点后，多余的0
            if str(row[0].value) == "填空题"
            else row[7].value
        ),
    }
    print(row_dict)
    data.append(row_dict)

# 将数据转换为JSON格式
json_data = json.dumps(data, indent=4, ensure_ascii=False)

# 将JSON数据写入文件
with open(current_directory + "\question.json", "w", encoding="utf-8") as f:
    f.write(json_data)

# 关闭Excel文件
wb.close()
# 退出xlwings应用
app.quit()
