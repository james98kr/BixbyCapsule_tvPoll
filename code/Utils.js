var console = require("console");
var http = require("http");
var base64 = require("base64")
const api_key = "kZsGaM%2Fu%2BTPJmQfkfIMIrPus20kmchCxpYQaBq11E1k18eZYlsHALAt5ZG3B2EqSmc3PWKwMajUSAawJDxUOeQ%3D%3D";
const naver_client_id = 'ka8vzEegEkJXu18fJdvv';
const naver_client_secret = 'PyrJ85J6lv';

exports.find_latest_time = find_latest_time;
exports.find_requested_time = find_requested_time;
exports.csvurl_to_array = csvurl_to_array;
exports.approvalRate_from_array = approvalRate_from_array;
exports.get_election_code = get_election_code;
exports.get_candidate_info = get_candidate_info;
exports.get_prev_election_results = get_prev_election_results;
exports.get_naver_news = get_naver_news;
exports.get_naver_imgs = get_naver_imgs;
exports.findlastweek = findlastweek;
exports.findnextweek = findnextweek;

function strmonth (month) {
  var string = ""
  if (String(month).length == 1) {
    string = "0" + String(month)
  }
  else {
    string = String(month)
  }
  return string
}

function find_current_week () {
  var d = new Date();
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

  return cnt
}

function find_latest_time () {
  var d = new Date();
  var curweeknum = 5;
  var curmonth = d.getMonth() + 1;
  var curyear = d.getFullYear();
  var url = "https://raw.githubusercontent.com/james98kr/BixbyDevelopment/main/candidates/candidate";
  var temp = ""
  var flag = 0;

  while (flag == 0) {
    try {
      flag = 1;
      temp = "";
      temp = url + "_" + String(curyear);
      temp = temp + "_" + strmonth(String(curmonth));
      temp = temp + "_week" + String(curweeknum) + ".csv";
      var response = http.getUrl(temp);
    }
    catch (e) {
      flag = 0;
      if (curweeknum > 1) {
        curweeknum--;
      }
      else {
        curweeknum = 5;
        if (curmonth > 1) {
          curmonth--;
        }
        else {
          curmonth = 12;
          curyear--;
        }
      }
    }
  }

  return {year: String(curyear), month: String(curmonth), weekNum: String(curweeknum)}
}

function find_requested_time (year, month, weekNum) {
  var d = new Date();
  var url = "https://raw.githubusercontent.com/james98kr/BixbyDevelopment/main/candidates/candidate";
  var temp = ""
  var flag = 0;

  var curyear = (Number(year) == 0) ? d.getFullYear() : Number(year);
  var curweeknum = (Number(weekNum) == 0) ? find_current_week() : Number(weekNum);
  var curmonth = Number(month)
  // It is assumed that user always specifies month, but not necessarily year/weekNum
  // If weeknum is not specified, it is set to 1 as default

  if (Number(year) != 0 && Number(month) != 0 && Number(weekNum) != 0) {
    try {
      temp = url + "_" + String(curyear);
      temp = temp + "_" + strmonth(String(curmonth));
      temp = temp + "_week" + String(curweeknum) + ".csv";
      var response = http.getUrl(temp);
    }
    catch (e) {
    }
  }
  else if (Number(year) != 0 && Number(month) != 0 && Number(weekNum) == 0) {
    for (i = 1;i < 6;i++) {
      try {
        flag = 1;
        temp = "";
        temp = url + "_" + String(curyear);
        temp = temp + "_" + strmonth(String(curmonth));
        temp = temp + "_week" + String(curweeknum) + ".csv";
        var response = http.getUrl(temp);
      }
      catch (e) {
        flag = 0;
        curweeknum++;
      }
      finally {
        if (flag == 1) break;
      } 
    }
  }
  else if (Number(year) == 0 && Number(month) != 0 && Number(weekNum) != 0) {
    for (i = d.getFullYear();i > 2000;i--) {
      try {
        flag = 1;
        temp = "";
        temp = url + "_" + String(curyear);
        temp = temp + "_" + strmonth(String(curmonth));
        temp = temp + "_week" + String(curweeknum) + ".csv";
        var response = http.getUrl(temp);
      }
      catch (e) {
        flag = 0;
        curyear--;
      }
      finally {
        if (flag == 1) break;
      }
    }
  }
  else {
    for (i = d.getFullYear();i > 2000;i--) {
      for (j = curweeknum;j < 6;j++) {
        try {
          flag = 1;
          temp = "";
          temp = url + "_" + String(i);
          temp = temp + "_" + strmonth(String(curmonth));
          temp = temp + "_week" + String(j) + ".csv";
          var response = http.getUrl(temp);
        }
        catch (e) {
          flag = 0;
        }
        finally {
          if (flag == 1) {
            curyear = i;
            curweeknum = j;
            break;
          }
        }
      }
      if (flag == 1) break;
    }
  }

  return {year: String(curyear), month: String(curmonth), weekNum: String(curweeknum)}
}

function csvurl_to_array (year, month, weekNum) {
  var url = "https://raw.githubusercontent.com/james98kr/BixbyDevelopment/main/candidates/candidate";
  url = url + "_" + String(year);
  url = url + "_" + strmonth(String(month));
  url = url + "_week" + String(weekNum) + ".csv";

  var response = http.getUrl(url);
  let master_array = [];
  var list = response.split("\n");
  for (i = 0;i < list.length;i++) {
    var original_line = list[i].split(",");
    master_array.push(original_line);
  }
  return master_array
}

function approvalRate_from_array (master_array, candidateName, pollCategory) {
  var candidateindex = -1;
  if (candidateName != "all") {
    for (i = 0;i < master_array[0].length;i++) {
      if (master_array[0][i].indexOf(candidateName) != -1) {
        candidateindex = i;
        break;
      }
    }
  }

  var categoryindex = -1;
  var category = "전체";
  if (pollCategory != "all") {
    for (i = 0;i < master_array.length;i++) {
      if (master_array[i][0].indexOf(pollCategory) != -1) {
        categoryindex = i;
        break;
      }
    }
    category = pollCategory
  }

  var result = [];
  if (categoryindex == -1 && candidateindex == -1) {
    for (i = 0;i < 4;i++) {
      result.push([category, master_array[0][i+2], master_array[1][i+2]])
    }
  }
  else if (categoryindex != -1 && candidateindex == -1) {
    for (i = 0;i < 4;i++) {
      result.push([category, master_array[0][i+2], master_array[categoryindex][i+2]])
    }
  }
  else if (categoryindex == -1 && candidateindex != -1) {
    result.push([category, master_array[0][candidateindex], master_array[1][candidateindex]])
  }
  else if (categoryindex != -1 && candidateindex != -1) {
    result.push([category, master_array[0][candidateindex], master_array[categoryindex][candidateindex]])
  }
  return result
}

function get_election_code (keyword) {
  var url = "http://apis.data.go.kr/9760000/CommonCodeService/getCommonSgCodeList";
  url = url + "?serviceKey=" + api_key;
  url = url + "&resultType=" + "json";
  url = url + "&pageNo=" + "1";
  url = url + "&numOfRows=" + "1000";

  var response = http.getUrl(url);
  var jsonresponse = JSON.parse(response);
  jsonresponse = jsonresponse["getCommonSgCodeList"]["item"];

  for (i = 0;i < jsonresponse.length;i++) {
    if (jsonresponse[i]["SG_NAME"] == keyword) {
      return jsonresponse[i]["SG_ID"]
    }
  }
}

function get_candidate_info (candidate_name, election_code) {
  var yebi_url = "http://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPoelpcddRegistSttusInfoInqire";
  var cand_url = "http://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire";
  var url = cand_url;

  url = url + "?serviceKey=" + api_key;
  url = url + "&sgId=" + election_code;
  url = url + "&sgTypecode=" + "1";
  url = url + "&resultType=" + "json";
  url = url + "&pageNo=" + "1";
  url = url + "&numOfRows=" + "1000";

  var response = http.getUrl(url);
  var jsonresponse = JSON.parse(response);
  jsonresponse = jsonresponse["getPofelcddRegistSttusInfoInqire"]["item"]

  for (i = 0;i < jsonresponse.length;i++) {
    if (jsonresponse[i]["NAME"] == candidate_name) {
      return jsonresponse[i]
    }
  }
}

function get_prev_election_results (election_code) {
  var url = "http://apis.data.go.kr/9760000/VoteXmntckInfoInqireService2/getXmntckSttusInfoInqire";
  url = url + "?serviceKey=" + api_key;
  url = url + "&sgId=" + election_code;
  url = url + "&sgTypecode=" + "1";
  url = url + "&resultType=" + "json";
  url = url + "&pageNo=" + "1";
  url = url + "&numOfRows=" + "1000";

  var response = http.getUrl(url);
  var jsonresponse = JSON.parse(response);
  jsonresponse = jsonresponse["getXmntckSttusInfoInqire"]["item"][0]

  return jsonresponse
}

function handle_html_entities (str) {
  const htmlEntities = {
    "&amp;" : "&",
    "&lt;" : "<",
    "&gt;" : ">",
    "&quot;" : '"',
    "&apos;" : "'",
    "<b>" : "",
  };
  var new_str = str.replace(/&amp;|&lt;|&gt;|&quot;|&apos;|<b>/g, match => htmlEntities[match]);
  new_str = new_str.split("</b>").join("");
  return new_str
}

function get_naver_news (keyword) {
  var access_website_uri = "bixby://org.tizen.browser/tvWebBrowser.AccessWebsite/punchOut?url="
  var naver_url = "https://openapi.naver.com/v1/search/news.json?query=";
  var enc_keyword = encodeURIComponent(keyword);
  naver_url = naver_url + enc_keyword;
  naver_url = naver_url + "&sort=sim";

  var r = JSON.parse(http.getUrl(
    url=naver_url,
    options={
      headers: {
        "X-Naver-Client-Id": naver_client_id, 
        "X-Naver-Client-Secret": naver_client_secret
      }
    }
  ))
  r = r["items"];

  result = [];
  for (i = 0;i < r.length;i++) {
    result.push({
      title: handle_html_entities(r[i]["title"]),
      originalLink: r[i]["originallink"],
      link: access_website_uri + base64.encode(r[i]["originallink"]),
      description: handle_html_entities(r[i]["description"]),
      pubDate: r[i]["pubDate"]
    })
  }

  return result
}

function get_naver_imgs (keyword) {
  var naver_url = "https://openapi.naver.com/v1/search/image.json?query=";
  var enc_keyword = encodeURIComponent(keyword);
  naver_url = naver_url + enc_keyword;
  naver_url = naver_url + "&sort=sim";

  var r = JSON.parse(http.getUrl(
    url=naver_url,
    options={
      headers: {
        "X-Naver-Client-Id": naver_client_id,
        "X-Naver-Client-Secret": naver_client_secret
      }
    }
  ))
  r = r["items"];

  return r[0]["link"]
}

function findlastweek (year, month, weekNum) {
  var url = "https://raw.githubusercontent.com/james98kr/BixbyDevelopment/main/candidates/candidate";
  var result = {year: 0, month: 0, weekNum:0};
  if (weekNum > 1) {
    result = {year: year, month: month, weekNum: weekNum - 1};
  }
  else if (weekNum == 1) {
    weekNum = 5;
    if (month > 1) {
      result = {year: year, month: month - 1, weekNum: weekNum}
    } 
    else if (month == 1) {
      month = 12;
      result = {year: year - 1, month: month, weekNum: weekNum}
    }
  }
  if (result["weekNum"] == 5) {
    try {
      var a = csvurl_to_array(result["year"], result["month"], result["weekNum"]);
    }
    catch (e) {
      result["weekNum"] = result["weekNum"] - 1;
    }
  }

  return {year: String(result["year"]), month: String(result["month"]), weekNum: String(result["weekNum"])}
}

function findnextweek (year, month, weekNum) {
  var url = "https://raw.githubusercontent.com/james98kr/BixbyDevelopment/main/candidates/candidate";
  var result = {year: 0, month: 0, weekNum: 0};
  if (weekNum < 5) {
    result = {year: year, month: month, weekNum: weekNum + 1};
  }
  else if (weekNum == 5) {
    weekNum = 1;
    if (month < 12) {
      result = {year: year, month: month + 1, weekNum: weekNum}
    }
    else if (month == 12) {
      month = 1
      result = {year: year + 1, month: month, weekNum: weekNum}
    }
  }
  if (result["weekNum"] == 5) {
    try {
      var a = csvurl_to_array(result["year"], result["month"], result["weekNum"]);
    }
    catch (e) {
      result["weekNum"] = 1;
      if (result["month"] < 12) {
        result["month"] = result["month"] + 1;
      }
      else if (result["month"] == 12) {
        result["month"] = 1;
        result["year"] = result["year"] + 1;
      }
    }
  }
  
  return {year: String(result["year"]), month: String(result["month"]), weekNum: String(result["weekNum"])}
}