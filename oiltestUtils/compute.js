function accAdd(arg1, arg2) {
  var r1, r2, m;
  try {
  r1 = arg1.toString().split(".")[1].length;
  } catch (e) {
  r1 = 0
  }
  
  try {
  r2 = arg2.toString().split(".")[1].length;
  } catch (e) {
  r2 = 0
  }
  m = Math.pow(10, Math.max(r1, r2));
  return (arg1 * m + arg2 * m) / m;
  }
  Number.prototype.add = function(arg) {
  return accAdd(arg, this);
  }
  // 除法
  function accDiv(arg1, arg2) {
  var t1 = 0,
  t2 = 0,
  r1, r2;
  try {
  t1 = arg1.toString().split(".")[1].length;
  } catch (e) {
  r1 = 0
  }
  
  try {
  t2 = arg2.toString().split(".")[1].length;
  } catch (e) {
  r2 = 0
  }
  r1 = Number(arg1.toString().replace(".", ""));
  r2 = Number(arg2.toString().replace(".", ""));
  return (r1 / r2) * Math.pow(10, t2 - t1);
  }
  Number.prototype.div = function(arg) {
  return accDiv(this, arg);
  }
  // 乘法
  function accMul(arg1, arg2) {
  var m = 0,
  s1 = arg1.toString(),
  s2 = arg2.toString();
  try {
  m += s1.split(".")[1].length
  } catch (e) {
  }
  try {
  m += s2.split(".")[1].length
  } catch (e) {
  }
  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
  }
  Number.prototype.mul = function(arg) {
  return accMul(arg, this);
  }
  // 减法
  function acCut(arg1, arg2) {
  var r1, r2, m;
  try {
  r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
  r1 = 0
  }
  try {
  r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
  r2 = 0
  }
  m = Math.pow(10, Math.max(r1, r2));
  return (arg1 * m - arg2 * m) / m;
  }
  Number.prototype.cut = function(arg) {
  return acCut(this, arg);
  }
  
  String.prototype.format = function(args) {
  var result = this;
  if (arguments.length > 0) {
  if (arguments.length == 1 && typeof(args) == "object") {
  for (var key in args) {
  if (args[key] != undefined) {
  var reg = new RegExp("({" + key + "})", "g");
  result = result.replace(reg, args[key]);
  }
  }
  } else {
  for (var i = 0; i < arguments.length; i++) {
  if (arguments[i] != undefined) {
  //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题
  var reg = new RegExp("({)" + i + "(})", "g");
  result = result.replace(reg, arguments[i]);
  }
  }
  }
  }
  return result;
  }
  const isNumber = (val) => {
  const regPos = /^\d+(\.\d+)?$/ // 非负浮点数
  const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/ // 负浮点数
  if (regPos.test(val) || regNeg.test(val)) {
  return true
  } else {
  return false
  }
  }
  
  function getDecimals(arr) {
  const index = arr.indexOf('.')
  // 找到第一个小数点
  // 找到之后拿出前面的
  if (index != -1) {
  let arr1 = arr.slice(0, index)
  let arr2 = arr.slice(index + 1)
  // 将前面那一部分倒叙，然后拿出截止到计算符号之前的东西
  arr1 = arr1.reverse()
  let number1 = []
  let number2 = []
  let len1 = 0
  let len2 = 0
  for (let item of arr1) {
  if (isNumber(item)) {
  number1.push(item)
  len1 += 1
  } else {
  break
  }
  }
  // 直接操作后面那一部分的
  for (let item of arr2) {
  if (isNumber(item)) {
  number2.push(item)
  len2 += 1
  } else {
  break
  }
  }
  number1 = number1.reverse()
  // 将number1中的元素和number中的元素以及小数点拼接起来就是那个小数
  let arr3 = [...number1, '.', ...number2]
  let number3 = ''
  arr3.map(item => {
  number3 = number3 + `${item}`
  })
  arr.splice(index - len1, index + len2 - 1, Number(number3))
  return getDecimals(arr)
  } else {
  return arr
  }
  }
  
  function sumResutl(arr) {
  // 如果数组元素中有乘除加减运算符
  const i1 = arr.indexOf('*')
  const i2 = arr.indexOf('/')
  const i3 = arr.indexOf('-')
  const i4 = arr.indexOf('+')
  if (i1 !== -1) {
  // 拿到*运算符前面数字的索引
  const index = i1 - 1
  // 计算出结果
  const result = arr[index].mul(arr[i1 + 1])
  // 修改数组元素
  arr.splice(index, 3, result)
  // 如果剩下的元素不只一位,则继续调用函数自身
  if (arr.length > 1) {
  sumResutl(arr)
  }
  } else if (i2 !== -1) {
  // 拿到/运算符前面数字的索引
  const index = i2 - 1
  // 计算出结果
  const result = arr[index].div(arr[i2 + 1])
  // 修改数组元素
  arr.splice(index, 3, result)
  // 如果剩下的元素不只一位,则继续调用函数自身
  if (arr.length > 1) {
  sumResutl(arr)
  }
  } else if (i3 !== -1) {
  // 拿到-运算符前面数字的索引
  const index = i3 - 1
  // 计算出结果
  const result = arr[index].cut(arr[i3 + 1])
  // 修改数组元素
  arr.splice(index, 3, result)
  // 如果剩下的元素不只一位,则继续调用函数自身
  if (arr.length > 1) {
  sumResutl(arr)
  }
  } else if (i4 !== -1) {
  // 拿到+运算符前面数字的索引
  const index = i4 - 1
  // 计算出结果
  const result = arr[index].add(arr[i4 + 1])
  // 修改数组元素
  arr.splice(index, 3, result)
  // 如果剩下的元素不只一位,则继续调用函数自身
  if (arr.length > 1) {
  sumResutl(arr)
  }
  }
  return arr[0]
  }
  export function compute(str, arges) {
  let data = str.format(arges)
  // 拿到结果之后开始处理为运算
  const arr = data.split('')
  // 准备一个容器
  let newArray = []
  // 遍历字符串数组
  arr.forEach((item, i) => {
  // 如果当前字符串是数字
  if (isNumber(item)) {
  // 拿到最后一个数组元素
  let endStr = newArray[newArray.length - 1]
  // 拿到最后一个数组元素的索引
  const endIndex = newArray.length - 1
  // 判断最后一个数组元素是否是数字
  if (isNumber(endStr)) {
  // 如果最后一个数组元素是数字,则进行拼接
  endStr += item
  // 修改最后一个数组元素
  newArray.splice(endIndex, 1, endStr)
  } else {
  // 如果最后一个数组元素是运算符,则将当前项直接添加到数组
  newArray.push(item)
  }
  } else {
  // 如果当前项是运算符,则将当前项直接添加到数组
  newArray.push(item)
  }
  })
  // 将数字与运算符遍历,将字符串类型的数字转换成数字类型
  newArray = newArray.map((item) => (isNumber(item) ? parseFloat(item) : item))
  // 合并一下小数点
  let newData = getDecimals(newArray)
  let num = sumResutl(newData)
  return num
  }