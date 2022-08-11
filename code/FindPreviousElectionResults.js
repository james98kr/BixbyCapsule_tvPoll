var console = require("console");
var http = require("http");
var utils = require("./Utils.js");

module.exports.function = function findPreviousElectionResults (previousElection) {
  var election_code = utils.get_election_code(previousElection);
  var jsonresponse = utils.get_prev_election_results(election_code);

  var totalvotenum = jsonresponse["YUTUSU"];
  var result = [];

  for (i = 0;i < 5;i++) {
    var candidatename = jsonresponse["HBJ0" + String(i + 1)];
    var partyname = jsonresponse["JD0" + String(i + 1)];
    var votenum = Number(jsonresponse["DUGSU0" + String(i + 1)]);
    var voterate = votenum * 100 / totalvotenum;
    if (voterate < 1) {
      continue;
    }
    result.push({
      electionName: previousElection,
      generalCandidateName: candidatename,
      partyName: partyname,
      voteRate: voterate.toFixed(1),
      voteNum: votenum,
      candidateImg: utils.get_naver_imgs(partyname + candidatename + "사진")
    });
  }

  console.log(result) // for debugging
  return result
}
