var console = require("console");
var http = require("http");
var fail = require("fail");
var utils = require("./Utils.js");

module.exports.function = function findCandidateApprovalRate (candidateName, pollCategory, invalidCategory, pollTimeWeekBased) {
  var year = pollTimeWeekBased.year
  var month = pollTimeWeekBased.month
  var weekNum = pollTimeWeekBased.weekNum
  var master_array = [];
  var result = [];

  const images = {
    "더불어민주당 이재명": "../assets/images/candidates/leejaemyung.jpg",
    "국민의힘 윤석열": "../assets/images/candidates/yoonseokyoul.jpg",
    "국민의당 안철수": "../assets/images/candidates/ahncheolsoo.jpg",
    "정의당 심상정": "../assets/images/candidates/simsangjung.jpg",
  }
  const category_list = {
    "전체": "전체",
    "18-29세": "20대",
    "30-39세": "30대",
    "40-49세": "40대",
    "50-59세": "50대",
    "60-69세": "60대",
    "70세 이상": "70세 이상",
    "서울": "서울",
    "인천/경기": "인천/경기",
    "대전/세종/충청": "대전/세종/충청",
    "광주/전라": "광주/전라",
    "대구/경북": "대구/경북",
    "부산/울산/경남": "부산/울산/경남",
    "강원/제주": "강원/제주"
  }

  if (invalidCategory) {
    throw new fail.checkedError("InvalidCategory", "InvalidCategory", {})
  }

  if (Number(year) == 0 && Number(month) == 0 && Number(weekNum) == 0) {
    var latest = utils.find_latest_time();
    year = latest["year"];
    month = latest["month"];
    weekNum = latest["weekNum"];
    master_array = utils.csvurl_to_array(year, month, weekNum);
  }
  else if (Number(month) == 0) {
    throw new fail.checkedError("InvalidTime_NoMonth", "InvalidTime_NoMonth", {})
  }
  else {
    var requested = utils.find_requested_time(year, month, weekNum);
    year = requested["year"];
    month = requested["month"];
    weekNum = requested["weekNum"];
    try {
      master_array = utils.csvurl_to_array(year, month, weekNum);
    }
    catch (e) {
      throw new fail.checkedError("InvalidTime_NoData", "InvalidTime_NoData", {})
    }
  }

  var searchkeyword = "";
  var searchresults = utils.approvalRate_from_array(master_array, candidateName, pollCategory);
  for (i = 0;i < searchresults.length;i++) {
    searchkeyword = "";
    if (searchresults.length > 1) {
      searchkeyword = "대선 후보";
    }
    else {
      searchkeyword = "대선" + candidateName;
    }

    var lwflag = 0;
    var nwflag = 0;
    var lwapprovalrate = "데이터 없음";
    var nwapprovalrate = "데이터 없음";
    var lwtime = utils.findlastweek(Number(year), Number(month), Number(weekNum));
    var nwtime = utils.findnextweek(Number(year), Number(month), Number(weekNum));

    try {
      lwflag = 1;
      var lwarray = utils.csvurl_to_array(lwtime["year"], lwtime["month"], lwtime["weekNum"])
    }
    catch (e) {
      lwflag = 0;
    }
    if (lwflag == 1) {
      var lwresult = utils.approvalRate_from_array(lwarray, searchresults[i][1], pollCategory);
      lwapprovalrate = lwresult[0][2] + "%";
    }

    try {
      nwflag = 1;
      var nwarray = utils.csvurl_to_array(nwtime["year"], nwtime["month"], nwtime["weekNum"])
    }
    catch (e) {
      nwflag = 0;
    }
    if (nwflag == 1) {
      var nwresult = utils.approvalRate_from_array(nwarray, searchresults[i][1], pollCategory);
      nwapprovalrate = nwresult[0][2] + "%";
    }

    var lastweekdata = {lastWeekApprovalRate: lwapprovalrate, lastWeekPollTimeWeekBased: lwtime};
    var nextweekdata = {nextWeekApprovalRate: nwapprovalrate, nextWeekPollTimeWeekBased: nwtime};

    result.push({
      category: category_list[searchresults[i][0]],
      candidateName: searchresults[i][1].split(" ")[1],
      partyName: searchresults[i][1].split(" ")[0],
      approvalRate: String(searchresults[i][2]) + "%",
      pollTimeWeekBased: { year: year, month: month, weekNum: weekNum },
      naverNews: utils.get_naver_news(searchkeyword),
      candidateImg: images[searchresults[i][1]],
      lastWeek: lastweekdata,
      nextWeek: nextweekdata,
    })
  }
  
  console.log(result); // for debugging
  return result
}
