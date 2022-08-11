var console = require("console");
var http = require("http");
var utils = require("./Utils.js");

function find_which_week (year, month, date) {
  var d = new Date(year, month - 1, date);
  var day = d.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  if (day == 0) day = 7;
  d.setDate(d.getDate() + 4 - day);

  var cnt = 0;
  var curyear = d.getFullYear()
  var curmonth = d.getMonth();
  while (d.getMonth() == curmonth) {
    d.setDate(d.getDate() - 7);
    cnt++;
  }

  return {year: curyear, month: curmonth + 1, weekNum: cnt }
}

module.exports.function = function findPollTime (year, month, weekNum, dateTimeExpression) {
  // Expressions such as "지난 주" or "저번 달" (expressions where month or week is not 
  // numerically specified) are passed to dateTimeExpression 
  if (dateTimeExpression == undefined) {
    return {
      year: year,
      month: month,
      weekNum: weekNum
    }
  }

  var interval;
  if (dateTimeExpression.dateInterval) {
    interval = {
      start: dateTimeExpression.dateInterval.start,
      end: dateTimeExpression.dateInterval.end
    }
  }
  if (dateTimeExpression.dateTimeInterval) {
    interval = {
      start: dateTimeExpression.dateTimeInterval.start.date,
      end: dateTimeExpression.dateTimeInterval.end.date
    }
  }
  if (dateTimeExpression.date) {
    // Using same date for both start and end
    interval = {
      start: dateTimeExpression.date,
      end: dateTimeExpression.date
    }
  }

  var startdate = interval["start"];
  var enddate = interval["end"];

  if (startdate["year"] == enddate["year"] && (enddate["month"] - startdate["month"]) >= 11) {
    // If interval only specifies year
    return {
      year: startdate["year"],
      month: month,
      weekNum: weekNum
    }
  }
  else if (startdate["year"] == enddate["year"] && enddate["month"] == startdate["month"] && (enddate["day"] - startdate["day"]) > 7) {
    // If interval specifies year and month only
    if (month != 0) {
      return {
        year: year,
        month: month,
        weekNum: weekNum
      }
    }
    else {
      return {
        year: startdate["year"],
        month: startdate["month"],
        weekNum: 0
      }
    }
  }
  else {
    // If specific date or week is specified
    if (month != 0) {
      return {
        year: year,
        month: month,
        weekNum: weekNum
      }
    }
    return find_which_week(Number(startdate["year"]), Number(startdate["month"]), Number(startdate["day"]));
  }
}
