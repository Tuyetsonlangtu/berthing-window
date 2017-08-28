/**
 * Created by Hien Tran on 8/1/2017.
 */

var Common = (function () {
  var _format = 'YYYY-MM-DD';
  var _margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
  var _berthDir = {
    leftRight: '0042LR',
    rightLeft: '0042RL'
  }

  //this img link detail https://upload.wikimedia.org/wikibooks/en/d/d0/Sail-Port-Starboard.jpg
  var _vesselDir = {
    leftRight: '0123S', //Starboard
    rightLeft: '0123P' // Portside
  }

  var _rulerLeft = {
    width: 90,
    height: 1000,
    strokeWidth: 1,
    margin: {
      top: 0,
      right: 0,
      bottom: 2,
      left: 0
    },
    rectHeight: 40
  }

  var _mapContent = {
    width: 1000,
    height: 1000,
    strokeWidth: 1,
    margin: {
      top: 0,
      right: 15,
      bottom: 2,
      left: 15
    }
  }

  var _rulerTop = {
    strokeWidth: 1,
    height: 115,
    margin: {
      top: 0,
      right: 15,
      bottom: 0,
      left: 15
    }
  }

  var _gridHeight = 8;

  function _getPosByBerthDir(pos, berthWidth, dir) {
    if (dir == _berthDir.leftRight)
      return pos;
    else
      return berthWidth - pos;
  }

  function _createDateData(strDate, format, number) {
    var arrResults = [];
    var date = moment(strDate, format);
    for (var i = 0; i < number + 1; i++) {
      var dateTmp = moment(date).add("days", i);
      var obj = {
        "idx": i + 1,
        "title": dateTmp.format("MM") + "/" + dateTmp.format("DD"),
        "name": "(" + dateTmp.format("ddd") + ")",
        "numberDay": 4,
        "value": ["00", "06", "12", "18"],
        "isSunday": false,
        "isSaturday": false,
        "date": dateTmp
      };
      if (dateTmp.day() == 6)
        obj.isSaturday = true;
      if (dateTmp.day() == 0)
        obj.isSunday = true;
      arrResults.push(obj);
    }
    return arrResults;
  }

  function _plusDate(date, days, hours) {
    var dateTmp = moment(date).add("days", days);
    var hour = Math.floor(hours);
    var mm = hours - hour;

    var newDate = new Date(dateTmp.toDate());
    newDate.setHours(newDate.getHours() + hours);
    if (mm >= 0.5)
      newDate.setMinutes(0.5 * 60);
    else
      newDate.setMinutes(0);
    return newDate;
  }

  function _roundNumber(num){
    return Math.round(num * 100) / 100
  }

  return {
    format: _format,
    margin: _margin,
    berthDir: _berthDir,
    vesselDir: _vesselDir,
    rulerLeft: _rulerLeft,
    mapContent: _mapContent,
    rulerTop: _rulerTop,
    createDateData: _createDateData,
    gridHeight: _gridHeight,
    getPosByBerthDir: _getPosByBerthDir,
    plusDate: _plusDate,
    roundNumber: _roundNumber
  }
}());