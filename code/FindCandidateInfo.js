var console = require("console");
var http = require("http");
var utils = require("./Utils.js");

const whichinfotype = {
  "all": "",
  "정당": "JD_NAME",
  "성별": "GENDER",
  "생일": "BIRTHDAY",
  "나이": "AGE",
  "주소": "ADDR",
  "직업": "JOB",
  "학력": "EDU",
  "경력": "CAREER1,CAREER2"
}

function get_birthday (bday) {
  bday = String(bday);
  var year = bday.slice(0, 4);
  var month = bday.slice(4, 6);
  var day = bday.slice(6);
  if (month[0] == "0") month = month[1];
  return year + "년 " + month + "월 " + day + "일";
}

module.exports.function = function findCandidateInfo (candidateName, personalInfoType) {
  // Default election set as "제20대 대통령선거" - this may change in future implementations
  var election_code = utils.get_election_code("제20대 대통령선거");
  var jsoninfo = utils.get_candidate_info(candidateName, election_code);

  const images = {
    "이재명": "../assets/images/candidates/leejaemyung.jpg",
    "윤석열": "../assets/images/candidates/yoonseokyoul.jpg",
    "안철수": "../assets/images/candidates/ahncheolsoo.jpg",
    "심상정": "../assets/images/candidates/simsangjung.jpg"
  }
  var result = [];
  var infotype = whichinfotype[personalInfoType];
  var candidateimg = images[candidateName];

  result.push({
    candidateName: candidateName,
    personalInfoType: "정당",
    personalInfoData: jsoninfo["JD_NAME"],
    candidateImg: candidateimg
  })
  result.push({
    candidateName: candidateName,
    personalInfoType: "나이",
    personalInfoData: jsoninfo["AGE"],
    candidateImg: candidateimg
  })
  if (personalInfoType == "all") {
    result.push({
      candidateName: candidateName,
      personalInfoType: "학력",
      personalInfoData: jsoninfo["EDU"],
      candidateImg: candidateimg
    })
    result.push({
      candidateName: candidateName,
      personalInfoType: "경력",
      personalInfoData: jsoninfo["CAREER1"] + ", " + jsoninfo["CAREER2"],
      candidateImg: candidateimg
    })
  }
  else if (personalInfoType == "경력") {
    var temp = infotype.split(",");
    result.push({
      candidateName: candidateName,
      personalInfoType: personalInfoType,
      personalInfoData: jsoninfo[temp[0]] + ", " + jsoninfo[temp[1]],
      candidateImg: candidateimg
    })
  }
  else if (personalInfoType == "나이") {
    result.push({
      candidateName: candidateName,
      personalInfoType: personalInfoType,
      personalInfoData: jsoninfo[infotype] + "세",
      candidateImg: candidateimg
    })
  }
  else if (personalInfoType == "성별") {
    result.push({
      candidateName: candidateName,
      personalInfoType: personalInfoType,
      personalInfoData: jsoninfo[infotype] + "성",
      candidateImg: candidateimg
    })
  }
  else if (personalInfoType == "생일") {
    result.push({
      candidateName: candidateName,
      personalInfoType: personalInfoType,
      personalInfoData: get_birthday(jsoninfo[infotype]),
      candidateImg: candidateimg
    })
  }
  else {
    result.push({
      candidateName: candidateName,
      personalInfoType: personalInfoType,
      personalInfoData: jsoninfo[infotype],
      candidateImg: candidateimg
    })
  }

  console.log(result) // for debugging
  return result
}

