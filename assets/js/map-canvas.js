/**
 * Created by Hien Tran on 8/1/2017.
 */

var MapCanvas = (function () {
  var _rulerLeftSVG;
  var _mapContentSVG;
  var _rulerTopSVG;
  var _isRulerLeft = false, _isMapContent = true
  var _zoomHeightRate = 1, _zoomHeightMin = 1, _zoomHeightMax = 4, _zoomHeightStep = 1;
  var _zoomWidthRate = 2, _zoomWidthMin = 1, _zoomWidthMax = 4, _zoomWidthStep = 1;
  var _rulerDateData = [];
  var _fontFamily = '맑은고딕,Malgun Gothic,Arial, Verdana, Geneva, Helvetica, sans-serif, Apple-Gothic,애플고딕,Droid Sans,돋움,Dotum';
  var _mapWidth = 0, _mapHeight = 0;
  var _hoursOfDay = 24;
  var _partOfDay = 4; // One day divided into 4 parts
  var _hoursOfPart = 6;
  var _previousDate;
  var _bitts = [{
    "berth_idx": "2",
    "start_position": 19,
    "end_position": 69,
    "id": 13,
    "idx": 13,
    "name": "14",
    "start_position_original": 346,
    "end_position_original": 365,
    "id_temp": 13
  }, {
    "berth_idx": "2",
    "start_position": 69,
    "end_position": 94,
    "id": 12,
    "idx": 12,
    "name": "13",
    "start_position_original": 296,
    "end_position_original": 346,
    "id_temp": 12
  }, {
    "berth_idx": "2",
    "start_position": 94,
    "end_position": 119,
    "id": 11,
    "idx": 11,
    "name": "12",
    "start_position_original": 271,
    "end_position_original": 296,
    "id_temp": 11
  }, {
    "berth_idx": "2",
    "start_position": 119,
    "end_position": 144,
    "id": 10,
    "idx": 10,
    "name": "11",
    "start_position_original": 246,
    "end_position_original": 271,
    "id_temp": 10
  }, {
    "berth_idx": "2",
    "start_position": 144,
    "end_position": 169,
    "id": 9,
    "idx": 9,
    "name": "10",
    "start_position_original": 221,
    "end_position_original": 246,
    "id_temp": 9
  }, {
    "berth_idx": "2",
    "start_position": 169,
    "end_position": 194,
    "id": 8,
    "idx": 8,
    "name": "09",
    "start_position_original": 196,
    "end_position_original": 221,
    "id_temp": 8
  }, {
    "berth_idx": "2",
    "start_position": 194,
    "end_position": 219,
    "id": 7,
    "idx": 7,
    "name": "08",
    "start_position_original": 171,
    "end_position_original": 196,
    "id_temp": 7
  }, {
    "berth_idx": "2",
    "start_position": 219,
    "end_position": 244,
    "id": 6,
    "idx": 6,
    "name": "07",
    "start_position_original": 146,
    "end_position_original": 171,
    "id_temp": 6
  }, {
    "berth_idx": "2",
    "start_position": 244,
    "end_position": 269,
    "id": 5,
    "idx": 5,
    "name": "06",
    "start_position_original": 121,
    "end_position_original": 146,
    "id_temp": 5
  }, {
    "berth_idx": "2",
    "start_position": 269,
    "end_position": 294,
    "id": 4,
    "idx": 4,
    "name": "05",
    "start_position_original": 96,
    "end_position_original": 121,
    "id_temp": 4
  }, {
    "berth_idx": "2",
    "start_position": 294,
    "end_position": 319,
    "id": 3,
    "idx": 3,
    "name": "04",
    "start_position_original": 71,
    "end_position_original": 96,
    "id_temp": 3
  }, {
    "berth_idx": "2",
    "start_position": 319,
    "end_position": 344,
    "id": 2,
    "idx": 2,
    "name": "03",
    "start_position_original": 46,
    "end_position_original": 71,
    "id_temp": 2
  }, {
    "berth_idx": "2",
    "start_position": 344,
    "end_position": 363.55,
    "id": 1,
    "idx": 1,
    "name": "02",
    "start_position_original": 21,
    "end_position_original": 46,
    "id_temp": 1
  }, {
    "berth_idx": "2",
    "start_position": 363.55,
    "end_position": 363.55,
    "id": 0,
    "idx": 0,
    "name": "01",
    "start_position_original": 1.45,
    "end_position_original": 21,
    "id_temp": 0
  }]
  var _berthData = {
    '0042RL': [{
      'berth_name': 'A1',
      'direction': '0042RL',
      'group': 'G1',
      'id_berth': 2,
      'berth_width': 365,
      'berth_start_position': 0,
      'berth_end_position': 365
    },
      // {
      //   'berth_name': 'A2',
      //   'direction' : '0042RL',
      //   'group': 'G1',
      //   'id_berth': 3,
      //   'berth_width': 365,
      //   'berth_start_position': 365,
      //   'berth_end_position': 730
      // }
    ],
    'berth_total_width': 365
  };
  var _vesselData = [{
    "id": "ADR00100012017",
    "berth_id": "2",
    "code": "ADR001/0001/2017",
    "vsl_voy_no": "ADR001/0001/2017",
    "name": "ADRIATIC HIGHWAY",
    "LOA": 150,
    "LBP": 0,
    "bridge_to_stern": 50,
    "vessel_color": "#2957e3",
    "calling_status_color": "#2957e3",
    "calling_type_color": "",
    "service_lane_color": "",
    "along_side": "0123S",
    "along_side_name": "S",
    "head_position": 30,
    "berth_dir_cd": "0042RL",
    "status": "P",
    "status_code": "0103P",
    "eta_date": "31/05/2017 10:00",
    "etb_date": "01/05/2017 20:52",
    "etd_date": "31/05/2017 20:00",
    "ata_date": "",
    "atb_date": "",
    "atd_date": "",
    "stern_ramp": {"ramp_width": 8, "ramp_start_position": 0, "ramp_degree": 150, "ramp_occupied_distance": 16},
    "side_ramp": {"ramp_width": 5, "ramp_start_position": 30, "ramp_degree": 90, "ramp_occupied_distance": 5},
    "operator_cd": "ECL",
    "mooring_head": "1",
    "mooring_stern": "8",
    "volume_d": "0",
    "volume_l": "0",
    "volume_r": "0",
    "data_error": false,
    "vsl_tp_nm": "ROLL-ON/ROLL-OFF",
    "vsl_opr_nm": "SIAM ECL CO., LTD."
  }, {
    "id": "MON00200012017",
    "berth_id": "2",
    "code": "MON002/0001/2017",
    "vsl_voy_no": "MON002/0001/2017",
    "name": "MONZA EXPRESS",
    "LOA": 200,
    "LBP": 0,
    "bridge_to_stern": 150,
    "vessel_color": "#2957e3",
    "calling_status_color": "#2957e3",
    "calling_type_color": "",
    "service_lane_color": "",
    "along_side": "0123P",
    "along_side_name": "P",
    "head_position": 300,
    "berth_dir_cd": "0042RL",
    "status": "P",
    "status_code": "0103P",
    "eta_date": "05/06/2017 10:00",
    "etb_date": "05/06/2017 08:00",
    "etd_date": "08/06/2017 14:00",
    "ata_date": "",
    "atb_date": "",
    "atd_date": "",
    "stern_ramp": {"ramp_width": 8, "ramp_start_position": 0, "ramp_degree": 150, "ramp_occupied_distance": 16},
    "side_ramp": {"ramp_width": 5, "ramp_start_position": 30, "ramp_degree": 90, "ramp_occupied_distance": 5},
    "operator_cd": "NYK",
    "mooring_head": "13",
    "mooring_stern": "3",
    "volume_d": "0",
    "volume_l": "0",
    "volume_r": "0",
    "data_error": false,
    "vsl_tp_nm": "ROLL-ON/ROLL-OFF",
    "vsl_opr_nm": "NYK LINE (THAILAND) CO.,LTD."
  }]
  var _dx, _dy;
  var _timeChange = 30; // 30 | 60 <=> 30' or 1h for one step when move vessel direction top - bottom
  var _movementDistance = 5;
  var _mooringDistance = 5;
  var _currentPoint = {
    x: 0,
    y: 0
  }
  var _dragbarW = _dragbarH = 12;
  var _heightTMP = 0;
  var _vslInfo = {
    id: null,
    head_position: null,
    mooring_head: null,
    mooring_stern: null,
    eta_date: null,
    etd_date: null
  }
  var _vslDrawInfo = {
    id: null,
    vslTop: null,
    vslBottom: null,
    vslHeight: null
  }

  function _draw() {
    var strDate = '2017-05-31', number = 5;

    _previousDate = moment(strDate, Common.format);
    _rulerDateData = Common.createDateData(strDate, Common.format, number);

    _mapWidth = _berthData.berth_total_width;
    _mapHeight = (number + 1) * _hoursOfDay * Common.gridHeight;

    _drawRulerTop(_mapWidth, Common.rulerTop.height, _berthData);
    _drawRulerLeft(Common.rulerLeft.width, _mapHeight, _rulerDateData);
    _drawMapContent(_mapWidth, _mapHeight, _rulerDateData);

    _initScroll();
    _initEvent();
    _enableOrDisableZoom();
  }

  function _applyZoomWidth(type) {
    var isZoom = false;
    if (type == 'zoom-in' && _zoomWidthRate < _zoomWidthMax) {
      _zoomWidthRate += _zoomWidthStep;
      isZoom = true;
    }
    if (type == 'zoom-out' && _zoomWidthRate > _zoomWidthMin) {
      _zoomWidthRate -= _zoomWidthStep;
      isZoom = true;
    }

    if (isZoom) {
      $("#ruler-top-svg").remove();
      $("#map-content-svg").remove();
      _drawRulerTop(_mapWidth, Common.rulerTop.height, _berthData);
      _drawMapContent(_mapWidth, _mapHeight, _rulerDateData);
      _enableOrDisableZoom();
    }
  }

  function _applyZoomHeight(type) {
    var isZoom = false;
    if (type == 'zoom-in' && _zoomHeightRate < _zoomHeightMax) {
      _zoomHeightRate += _zoomHeightStep;
      isZoom = true;
    }
    if (type == 'zoom-out' && _zoomHeightRate > _zoomHeightMin) {
      _zoomHeightRate -= _zoomHeightStep;
      isZoom = true;
    }

    if (isZoom) {
      $("#ruler-left-svg").remove();
      $("#map-content-svg").remove();
      _drawRulerLeft(Common.rulerLeft.width, _mapHeight, _rulerDateData);
      _drawMapContent(_mapWidth, _mapHeight, _rulerDateData);
      _enableOrDisableZoom();
    }
  }

  function _zoomInHeight(num) {
    return _zoomHeightRate * num;
  }

  function _zoomOutHeight(num) {
    return num / _zoomHeightRate;
  }

  function _zoomInWidth(num) {
    return _zoomWidthRate * num;
  }

  function _zoomOutWidth(num) {
    return num / _zoomWidthRate;
  }

  function _setMooringDistance(value) {
    _mooringDistance = value;
  }

  function _setMovementDistance(value) {
    _movementDistance = value;
  }

  function _setTimeChange(value) {
    _timeChange = value;
  }

  function _drawRulerLeft(width, height, rulerDateData) {
    _rulerLeftSVG = d3.select("#ruller-left").append("svg")
      .attr('id', 'ruler-left-svg')
      .attr("width", width + Common.rulerLeft.margin.left + Common.rulerLeft.margin.right)
      .attr("height", _zoomInHeight(height) + Common.rulerLeft.margin.top + Common.rulerLeft.margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + Common.rulerLeft.margin.left + "," + Common.rulerLeft.margin.top + ")");

    var widthCal = width;
    var heightCal = _zoomInHeight(height);
    var lineGroup = _rulerLeftSVG.append("g").attr("class", "ruller-grid");
    var colBetwWidth = 60;
    var gridHeight = _zoomInHeight(Common.gridHeight);

    lineGroup.append("line")
      .attr("stroke-width", Common.rulerLeft.strokeWidth + 'px')
      .attr("x1", 1)
      .attr("y1", 0)
      .attr("x2", 1)
      .attr("y2", heightCal)
    lineGroup.append("line")
      .attr("stroke-width", Common.rulerLeft.strokeWidth + 'px')
      .attr("x1", colBetwWidth)
      .attr("y1", 0)
      .attr("x2", colBetwWidth)
      .attr("y2", heightCal)
    lineGroup.append("line")
      .attr("stroke-width", Common.rulerLeft.strokeWidth + 'px')
      .attr("x1", widthCal)
      .attr("y1", 0)
      .attr("x2", widthCal)
      .attr("y2", heightCal)

    lineGroup.append("line")
      .attr("stroke-width", Common.rulerLeft.strokeWidth + 'px')
      .attr("x1", 1)
      .attr("y1", 0)
      .attr("x2", widthCal)
      .attr("y2", 0)
    lineGroup.append("line")
      .attr("stroke-width", Common.rulerLeft.strokeWidth + 'px')
      .attr("x1", 1)
      .attr("y1", heightCal)
      .attr("x2", widthCal)
      .attr("y2", heightCal)

    //Create hours ruller
    var arrLength = rulerDateData.length;
    var yPos = 0, yPosChild = 0, yRulerLinePos = 0;
    for (var i = 0; i < arrLength; i++) {
      var item = rulerDateData[i];
      var textSvg = lineGroup.append("text")
        .attr("x", colBetwWidth / 2)
        .attr("y", yPos + 5)
        .attr("text-anchor", "middle")
        .attr('font-family', _fontFamily)
        .attr('font-size', '14px');

      textSvg.append('tspan')
        .style("fill", (item.isSunday || item.isSaturday) ? "red" : "#000")
        .text(item.title.toUpperCase())
        .attr("x", colBetwWidth / 2)
        .attr("y", yPos + 15)

      textSvg.append('tspan')
        .style("fill", (item.isSunday || item.isSaturday) ? "red" : "#000")
        .text(item.name.toUpperCase())
        .attr("x", colBetwWidth / 2)
        .attr("y", yPos + colBetwWidth / 2)

      lineGroup.append("line")
        .attr("stroke-width", Common.rulerLeft.strokeWidth + 'px')
        .attr("x1", 0)
        .attr("y1", yPos)
        .attr("x2", widthCal)
        .attr("y2", yPos)

      for (var j = 0; j < _partOfDay; j++) {
        var textChildSvg = lineGroup.append("text")
          .style("fill", "#000")
          .attr("x", colBetwWidth + 15)
          .attr("y", yPosChild + 15)
          .attr("text-anchor", "middle")
          .attr('font-family', _fontFamily)
          .attr('font-size', '14px')
          .text(item.value[j]);

        lineGroup.append("line")
          .attr("stroke-width", Common.rulerLeft.strokeWidth + 'px')
          .attr("x1", colBetwWidth)
          .attr("y1", yPosChild)
          .attr("x2", widthCal)
          .attr("y2", yPosChild)

        for (var k = 0; k < _hoursOfPart; k++) {
          lineGroup.append("line")
            .attr("stroke-width", Common.rulerLeft.strokeWidth + 'px')
            .attr("x1", widthCal - 5)
            .attr("y1", yRulerLinePos)
            .attr("x2", widthCal)
            .attr("y2", yRulerLinePos)

          yRulerLinePos += gridHeight;
        }

        yPosChild += gridHeight * _hoursOfPart;
      }

      yPos += gridHeight * _hoursOfDay;
    }
  }

  function _drawMapContent(width, height, rulerDateData) {
    var widthCal = _zoomInWidth(width);
    var heightCal = _zoomInHeight(height);
    var gridHeight = _zoomInHeight(Common.gridHeight);

    _mapContentSVG = d3.select("#map-content").append("svg")
      .attr('id', 'map-content-svg')
      .attr("width", widthCal + Common.mapContent.margin.left + Common.mapContent.margin.right)
      .attr("height", heightCal + Common.mapContent.margin.top + Common.mapContent.margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + Common.mapContent.margin.left + "," + Common.mapContent.margin.top + ")");

    var lineGroup = _mapContentSVG.append("g").attr("class", "map-content-grid")

    $("#bottom-scroll").css('margin-left', Common.rulerLeft.width + Common.mapContent.margin.left - 1);
    $("#scroll-content").css('width', widthCal + Common.mapContent.margin.left + Common.mapContent.margin.right)

    //Ver line
    lineGroup.append("line")
      .attr("stroke-width", Common.mapContent.strokeWidth + 'px')
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", heightCal)
    lineGroup.append("line")
      .attr("stroke-width", Common.mapContent.strokeWidth + 'px')
      .attr("x1", widthCal)
      .attr("y1", 0)
      .attr("x2", widthCal)
      .attr("y2", heightCal)

    //Hoz line
    lineGroup.append("line")
      .attr("stroke-width", Common.mapContent.strokeWidth + 'px')
      .attr("x1", 0)
      .attr("y1", 1)
      .attr("x2", widthCal)
      .attr("y2", 1)
    lineGroup.append("line")
      .attr("stroke-width", Common.mapContent.strokeWidth + 'px')
      .attr("x1", 0)
      .attr("y1", heightCal)
      .attr("x2", widthCal)
      .attr("y2", heightCal)

    //Create gridlines
    var arrLength = rulerDateData.length;
    var yPost = gridHeight;
    for (var i = 0; i < arrLength; i++) {
      for (var j = 1; j <= _hoursOfDay; j++) {
        var line = lineGroup.append("line")
          .attr("stroke-width", Common.mapContent.strokeWidth + 'px')
          .attr("x1", 0)
          .attr("y1", yPost)
          .attr("x2", widthCal)
          .attr("y2", yPost)
          .attr("stroke", "black");

        if (j % _hoursOfPart != 0)
          line.style("stroke-dasharray", ("1, 1"));
        else
          line.attr("class", 'start-hours');

        yPost += gridHeight;
      }
    }

    var vesselLength = _vesselData.length;
    for (var i = 0; i < vesselLength; i++) {
      _createVessel(_vesselData[i], _mapContentSVG);
    }
  }

  function _drawRulerTop(width, height, berthData) {
    var widthCal = _zoomInWidth(width);
    var heightCal = height;
    _rulerTopSVG = d3.select("#ruler-top-content").append("svg")
      .attr('id', 'ruler-top-svg')
      .attr("width", widthCal + Common.rulerTop.margin.left + Common.rulerTop.margin.right)
      .attr("height", heightCal + Common.rulerTop.margin.top + Common.rulerTop.margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + Common.rulerTop.margin.left + "," + Common.rulerTop.margin.top + ")");

    var berthGroup = _rulerTopSVG.append("g").attr("class", "berth-group");
    var berthDir, berthArr = [];
    var arrLength = 0, groupWidth = 0, xPosGroup = 0;
    var rectSvg = null, textSVG = null, isCreate = true;

    berthArr = berthData[Common.berthDir.leftRight];
    berthDir = Common.berthDir.leftRight;
    if (!berthArr) {
      berthArr = berthData[Common.berthDir.rightLeft];
      berthDir = Common.berthDir.rightLeft;
    }

    if (berthArr) {
      arrLength = berthArr.length;
      for (var i = 0; i < arrLength; i++) {
        var xPos = _zoomInWidth(Common.getPosByBerthDir(berthArr[i].berth_start_position, width, berthDir));
        var widthBerth = _zoomInWidth(berthArr[i].berth_width);
        var rectHeight = 20;
        var xPosText = xPos + widthBerth / 2;

        if (i > 0 && berthArr[i].group == berthArr[i - 1].group) {
          isCreate = false;
          groupWidth += widthBerth;
        }
        else {
          isCreate = true;
          groupWidth = widthBerth;
          xPosGroup = xPos;
        }

        if (isCreate) {
          rectSvg = berthGroup.append("rect")
            .attr("fill", 'rgb(185, 185, 185)')
            .attr("stroke", "rgb(171, 171, 171)")
            .attr("stroke-width", '1px')
            .attr("x", berthDir == Common.berthDir.leftRight ? xPos : xPos - widthBerth)
            .attr("y", 0)
            .attr("height", rectHeight)
            .attr("width", groupWidth);

          textSVG = berthGroup.append("text")
            .style("fill", "#000")
            .attr("x", berthDir == Common.berthDir.leftRight ? (xPos + groupWidth / 2) : (xPos + groupWidth / 2 - widthBerth))
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr('font-family', _fontFamily)
            .attr('font-size', '14px')
            .text(berthArr[i].group);
        }
        else {
          rectSvg.attr("width", groupWidth);
          rectSvg.attr("x", berthDir == Common.berthDir.leftRight ? xPosGroup : xPosGroup - groupWidth)
          textSVG.attr("x", berthDir == Common.berthDir.leftRight ? (xPosGroup + groupWidth / 2) : (xPosGroup + groupWidth / 2 - groupWidth))
        }

        berthGroup.append("rect")
          .attr("fill", 'white')
          .attr("stroke", "rgb(171, 171, 171)")
          .attr("stroke-width", '1px')
          .attr("x", berthDir == Common.berthDir.leftRight ? xPos : xPos - widthBerth)
          .attr("y", rectHeight)
          .attr("height", rectHeight)
          .attr("width", widthBerth)
        berthGroup.append("text")
          .style("fill", "#000")
          .attr("x", berthDir == Common.berthDir.leftRight ? xPosText : xPosText - widthBerth)
          .attr("y", rectHeight + 15)
          .attr("text-anchor", "middle")
          .attr('font-family', _fontFamily)
          .attr('font-size', '14px')
          .text(berthArr[i].berth_name);
      }
    }

    //Rule style
    var lineGroup = _rulerTopSVG.append("g").attr("class", "ruler-top");
    var step = 0, count = 0;
    var xPos = berthDir == Common.berthDir.leftRight ? 0 : widthCal;
    while (step <= widthCal) {
      lineGroup.append("line")
        .attr("stroke-width", '2px')
        .attr("x1", xPos)
        .attr("y1", heightCal - 8)
        .attr("x2", xPos)
        .attr("y2", heightCal)
        .attr("stroke", "black");

      lineGroup.append("text")
        .style("fill", "#000")
        .attr("x", xPos)
        .attr("y", heightCal - 15)
        .attr("text-anchor", "middle")
        .attr('font-family', _fontFamily)
        .attr('font-size', '13px')
        .text(count * 100);

      count++;
      step = count * _zoomInWidth(100);
      xPos = berthDir == Common.berthDir.leftRight ? step : widthCal - step;
    }

    var lineBittGroup = _rulerTopSVG.append("g").attr("class", "bitts-top");
    var bittLength = _bitts.length;
    var xPos = 0;
    yPos = heightCal - 30;
    for (var i = 0; i < bittLength; i++) {
      xPos = _zoomInWidth(Common.getPosByBerthDir(_bitts[i].start_position_original, width, berthDir));
      _bitts[i].start_position = xPos;
      _bitts[i].end_position = _zoomInWidth(Common.getPosByBerthDir(_bitts[i].end_position_original, width, berthDir));

      lineBittGroup.append("line")
        .attr("stroke-width", '5px')
        .attr("x1", xPos)
        .attr("y1", yPos - 8)
        .attr("x2", xPos)
        .attr("y2", yPos)
        .attr("stroke", "black");

      lineGroup.append("text")
        .style("fill", "#000")
        .attr("x", xPos)
        .attr("y", yPos - 15)
        .attr("text-anchor", "middle")
        .attr('font-family', _fontFamily)
        .attr('font-size', '13px')
        .text(_bitts[i].name);
    }
    _bitts = _.sortBy(_bitts, 'start_position');
    console.log('_bitts: ', _bitts);
  }

  function _getBittByIdx(idx) {
    return _.find(_bitts, function (obj) {
      return obj.idx == idx;
    })
  }

  function _getVslBridgeAndStern(berthDir, vesselDir, head, LOA, bridgeToStern) {
    var berth_direction = "";
    var stern = 0;
    var bridge = 0;

    if (berthDir == Common.berthDir.leftRight) {
      if (vesselDir == Common.vesselDir.leftRight) {
        stern = head - LOA;
        bridge = head - LOA + bridgeToStern;
      }
      else if (vesselDir == Common.vesselDir.rightLeft) {
        stern = head + LOA;
        bridge = head + LOA - bridgeToStern;
      }
    }
    else {
      if (vesselDir == Common.vesselDir.leftRight) {
        stern = head + LOA;
        bridge = head + LOA - bridgeToStern;
      }
      else if (vesselDir == Common.vesselDir.rightLeft) {
        stern = head - LOA;
        bridge = head - LOA + bridgeToStern;
      }
    }

    return {
      head: head,
      bridge: bridge,
      stern: stern
    }
  }

  function _createVessel(vslData, control) {
    var vslWidth = 0, vslHeight = 0;
    var vslLeft = 0, vslRight = 0, vslTop = 0, vslBottom, vslHead = 0, vslStern = 0, vslbridge = 0, mooringWidth = 0, mooringLeft = 0, mooringRight = 0;
    var sternRampWidth, sternRampStart, sternRampLeft, isSternRampDraw = false;
    var sideRampWidth, sideRampStart, sideRampLeft, isSideRampDraw = false;
    var result = _getVslBridgeAndStern(vslData.berth_dir_cd, vslData.along_side, vslData.head_position, vslData.LOA, vslData.bridge_to_stern);
    var head = result.head, bridge = result.bridge, stern = result.stern;
    var mooringHead = _getBittByIdx(vslData.mooring_head);
    var mooringStern = _getBittByIdx(vslData.mooring_stern);
    var mooringTextLeft, mooringTextRight;
    if (mooringHead && mooringStern)
      mooringWidth = Math.abs(mooringHead.start_position - mooringStern.start_position);

    //calc vessel top, height from date - to date
    var posInfo = _getVesselPosFromDate(vslData.eta_date, vslData.etb_date, vslData.etd_date);
    vslHeight = _zoomInHeight(posInfo.vslHeight);
    vslTop = _zoomInHeight(posInfo.vslTop);
    vslBottom = vslTop + vslHeight;
    vslWidth = _zoomInWidth(vslData.LOA);
    vslHead = _zoomInWidth(Common.getPosByBerthDir(head, _mapWidth, vslData.berth_dir_cd));
    vslStern = _zoomInWidth(Common.getPosByBerthDir(stern, _mapWidth, vslData.berth_dir_cd));
    vslbridge = _zoomInWidth(Common.getPosByBerthDir(bridge, _mapWidth, vslData.berth_dir_cd));

    console.log("vslHeight: ", vslHeight);

    if (vslData.stern_ramp) {
      sternRampWidth = _zoomInWidth(vslData.stern_ramp.ramp_width);
      sternRampStart = _zoomInWidth(vslData.stern_ramp.ramp_start_position);
      isSternRampDraw = true;
    }

    if (vslData.side_ramp) {
      sideRampWidth = _zoomInWidth(vslData.side_ramp.ramp_width);
      sideRampStart = _zoomInWidth(vslData.side_ramp.ramp_start_position);
      isSideRampDraw = true;
    }

    var rectGroup = control.append("g")
      .attr("class", "vessel-group")
      .attr("vsl-group-idx", vslData.id);

    var triangleLeft = 0;
    var triangleTop = vslTop + vslHeight / 2 - 13;
    var trianglePoints = '0 0, 0 0, 0 0';
    var vslTextLeft, vslTextTop = vslTop + 14, vslTextAnchor;

    var vslStatusLeft = 0, vslStatusTop = vslTop + 1, vslStatusLineLeft = 0

    var vslAlongsideLeft = 0, vslAlongsideTop = vslTop + vslHeight - 22, vslAlongsideLineLeft = 0;

    var vslbridgeLeft = 0, vslbridgeBottom = 0, vslBridgeText = '';
    var textLeft = '', textRight = '';

    var bridgeObj = _getBridgePos(vslbridge, vslData.berth_dir_cd);

    if (vslData.along_side == Common.vesselDir.leftRight) {
      vslLeft = vslHead - vslWidth;
      vslRight = vslHead;

      trianglePoints = '0 0, 12 12, 0 24';
      triangleLeft = vslHead - 16;

      vslTextLeft = vslLeft + 5;
      vslTextAnchor = 'start';

      vslStatusLeft = vslHead - 21;
      vslStatusLineLeft = 0;

      vslAlongsideLeft = vslLeft + 1;
      vslAlongsideLineLeft = 20;

      vslbridgeLeft = vslbridge - 5;

      if (isSternRampDraw)
        sternRampLeft = vslLeft - (sternRampWidth - sternRampStart);
      if (isSideRampDraw)
        sideRampLeft = vslLeft - (sideRampWidth - sideRampStart);

      textLeft = stern;
      textRight = head;

      if (mooringStern) {
        mooringTextLeft = mooringStern.name;
        mooringLeft = mooringStern.start_position;
      }
      if (mooringHead) {
        mooringTextRight = mooringHead.name;
        mooringRight = mooringHead.start_position;
      }
    }
    else {
      vslLeft = vslHead;
      vslRight = vslHead + vslWidth;

      trianglePoints = '0 12, 12 0, 12 24';
      triangleLeft = vslHead + 4;

      vslTextLeft = vslRight - 5;
      vslTextAnchor = 'end';

      vslStatusLeft = vslHead + 1;
      vslStatusLineLeft = 20;

      vslAlongsideLeft = vslRight - 21;
      vslAlongsideLineLeft = 1;

      vslbridgeLeft = vslbridge + 5;

      if (isSternRampDraw)
        sternRampLeft = vslLeft + (vslWidth - sternRampStart);
      if (isSideRampDraw)
        sideRampLeft = vslLeft + (vslWidth - sideRampStart);

      textLeft = head;
      textRight = stern;

      if (mooringHead) {
        mooringTextLeft = mooringHead.name;
        mooringLeft = mooringHead.start_position;
      }
      if (mooringStern) {
        mooringTextRight = mooringStern.name;
        mooringRight = mooringStern.start_position;
      }
    }

    rectGroup.attr("vsl-width", vslWidth)
      .attr("vsl-width", vslWidth)
      .attr("vsl-height", vslHeight)
      .attr("vsl-bridge", vslbridge)
      .attr("vsl-head", vslHead)
      .attr("vsl-stern", vslStern)
      .attr("vsl-top", vslTop)
      .attr("vsl-bottom", vslBottom)
      .attr("vsl-left", vslLeft)
      .attr("vsl-right", vslRight)
      .attr("vsl-right", vslRight)
      .attr("berth-dir", vslData.berth_dir_cd)
      .attr("vsl-dir", vslData.along_side)
      .attr("mooring-left", mooringLeft)
      .attr("mooring-right", mooringRight)
      .on("mouseover", function () {
        var target = d3.select(this);
        var vslIdx = target.attr('vsl-group-idx');
        target.classed("active", true);
        _vesselMouseover(vslIdx);
      })
      .on("mouseout", function () {
        var target = d3.select(this);
        var vslIdx = target.attr('vsl-group-idx');
        target.classed("active", false);
        _vesselMouseout(vslIdx)
      })

    //draw mooring box
    rectGroup.append("rect")
      .attr("mooring-idx", vslData.id)
      .attr("fill", 'white')
      .attr("fill-opacity", '0')
      .attr("stroke", "#000")
      .attr("stroke-width", '2px')
      .attr("x", mooringLeft)
      .attr("y", vslTop)
      .attr("width", mooringWidth)
      .attr("height", vslHeight - 1)
      .datum({x: mooringLeft, y: vslTop})

    //Mooring bitt
    rectGroup.append("text")
      .style("fill", "#000")
      .attr("mooring-text-left", vslData.id)
      .attr("x", mooringLeft + 2)
      .attr("y", vslTop + 12)
      .attr("text-anchor", 'start')
      .attr('font-family', _fontFamily)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(mooringTextLeft);
    rectGroup.append("text")
      .style("fill", "#000")
      .attr("mooring-text-right", vslData.id)
      .attr("x", mooringRight - 2)
      .attr("y", vslTop + 12)
      .attr("text-anchor", 'end')
      .attr('font-family', _fontFamily)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(mooringTextRight)

    //draw vessel
    rectGroup.append("rect")
      .attr("vsl-idx", vslData.id)
      .attr("fill", vslData.vessel_color)
      .attr("stroke", "red")
      .attr("stroke-width", '2px')
      .attr("x", vslLeft)
      .attr("y", vslTop)
      .attr("width", vslWidth)
      .attr("height", vslHeight - 1)
      .datum({x: vslLeft, y: vslTop})
      .call(d3.drag().on("drag", function (d){
        d3.select(this)
          // .attr("x", d.x = Math.max(0, d3.event.x))
          // .attr("y", d.y = Math.max(0, d3.event.y));
      }));

    rectGroup.append("rect")
      .attr("class", "resize-control")
      .attr("resize-top-idx", vslData.id)
      .attr("fill", "white")
      .attr("stroke", "#00b3ff")
      .attr("fill-opacity", 1)
      .attr("x", vslLeft + vslWidth / 2 - _dragbarW / 2)
      .attr("y", vslTop - 5)
      .attr("width", _dragbarW)
      .attr("height", _dragbarH)
      .attr("cursor", "pointer")
      .on("mousedown", function () {
        var vslIdx = d3.select(this).attr('resize-top-idx');
        $("g.vessel-group[vsl-group-idx=" + vslIdx + "]").attr('drag-stop', true);
      })
      .datum({x: vslLeft + vslWidth / 2 - _dragbarW / 2, y: vslTop})
      .call(d3.drag()
        .on("drag", _resizeTop)
        .on("end", _vesselResized));

    rectGroup.append("rect")
      .attr("class", "resize-control")
      .attr("resize-bottom-idx", vslData.id)
      .attr("fill", "white")
      .attr("stroke", "#00b3ff")
      .attr("fill-opacity", 1)
      .attr("x", vslLeft + vslWidth / 2 - _dragbarW / 2)
      .attr("y", vslBottom - 5)
      .attr("width", _dragbarW)
      .attr("height", _dragbarH)
      .attr("cursor", "pointer")
      .on("mousedown", function () {
        var vslIdx = d3.select(this).attr('resize-bottom-idx');
        $("g.vessel-group[vsl-group-idx=" + vslIdx + "]").attr('drag-stop', true);
      })
      .datum({x: vslLeft + vslWidth / 2 - _dragbarW / 2, y: vslTop})
      .call(d3.drag()
        .on("drag", _resizeBottom)
        .on("end", _vesselResized));

    //header
    var triangle = rectGroup.append("g")
      .attr("head-idx", vslData.id)
      .attr("trxOrigin", triangleLeft)
      .attr("tryOrigin", triangleTop)
      .attr('transform', 'translate(' + triangleLeft + ',' + triangleTop + ')')
      .append('polyline')
      .attr('points', trianglePoints)
      .style('fill', '#000')
      .datum({x: triangleLeft, y: triangleTop});

    //vsl_voy_no
    rectGroup.append("text")
      .style("fill", "#000")
      .attr("vsl-code", vslData.id)
      .attr("x", vslTextLeft)
      .attr("y", vslTextTop)
      .attr("text-anchor", vslTextAnchor)
      .attr('font-family', _fontFamily)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text(vslData.vsl_voy_no + '(' + vslData.operator_cd + ')');

    //Vessel status
    var vslStatus = rectGroup.append("g")
      .attr("vsl-status", vslData.id)
      .attr("trxOrigin", vslStatusLeft)
      .attr("tryOrigin", vslStatusTop)
      .attr('transform', 'translate(' + vslStatusLeft + ',' + vslStatusTop + ')')
      .datum({x: vslStatusLeft, y: vslStatusTop});
    vslStatus.append("text")
      .style("fill", "#000")
      .attr("x", 14)
      .attr("y", 15)
      .attr("text-anchor", 'end')
      .attr('font-family', _fontFamily)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(vslData.status);
    vslStatus.append("line")
      .attr("stroke-width", '1px')
      .attr("stroke", '#000')
      .attr("x1", vslStatusLineLeft)
      .attr("y1", 0)
      .attr("x2", vslStatusLineLeft)
      .attr("y2", 20)
    vslStatus.append("line")
      .attr("stroke-width", '1px')
      .attr("stroke", '#000')
      .attr("x1", 0)
      .attr("y1", 20)
      .attr("x2", 20)
      .attr("y2", 20)

    //Vessel alongside
    var vslAlongside = rectGroup.append("g")
      .attr("vsl-alongside", vslData.id)
      .attr("trxOrigin", vslAlongsideLeft)
      .attr("tryOrigin", vslAlongsideTop)
      .attr('transform', 'translate(' + vslAlongsideLeft + ',' + vslAlongsideTop + ')')
      .datum({x: vslAlongsideLeft, y: vslAlongsideTop});
    vslAlongside.append("text")
      .style("fill", "#000")
      .attr("x", 14)
      .attr("y", 15)
      .attr("text-anchor", 'end')
      .attr('font-family', _fontFamily)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(vslData.along_side_name);
    vslAlongside.append("line")
      .attr("stroke-width", '1px')
      .attr("stroke", '#000')
      .attr("x1", vslAlongsideLineLeft)
      .attr("y1", 0)
      .attr("x2", vslAlongsideLineLeft)
      .attr("y2", 20)
    vslAlongside.append("line")
      .attr("stroke-width", '1px')
      .attr("stroke", '#000')
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 20)
      .attr("y2", 0)

    //Bridge
    var bridgeGroup = rectGroup.append("g")
    bridgeGroup.append("line")
      .attr("vsl-bridge-idx", vslData.id)
      .attr("stroke-width", '2px')
      .attr("stroke", 'red')
      .attr("x1", vslbridge)
      .attr("y1", vslTop)
      .attr("x2", vslbridge)
      .attr("y2", vslBottom)
      .style("stroke-dasharray", ("8, 4"));
    if (bridgeObj) {
      bridgeGroup.append("text")
        .style("fill", "#000")
        .attr("bridge-text", vslData.id)
        .attr("x", vslbridge + 5)
        .attr("y", vslBottom - 5)
        .attr("text-anchor", 'start')
        .attr('font-family', _fontFamily)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(bridgeObj.text);
    }

    //Stern Ramp
    if (isSternRampDraw) {
      rectGroup.append("line")
        .attr("stern-ramp-idx", vslData.id)
        .attr("stroke-width", '6px')
        .attr("stroke", 'red')
        .attr("x1", sternRampLeft)
        .attr("y1", vslBottom - 3)
        .attr("x2", sternRampLeft + sternRampWidth)
        .attr("y2", vslBottom - 3);
    }

    //Side Ramp
    if (isSideRampDraw) {
      rectGroup.append("line")
        .attr("side-ramp-idx", vslData.id)
        .attr("stroke-width", '6px')
        .attr("stroke", 'red')
        .attr("x1", sideRampLeft)
        .attr("y1", vslBottom - 3)
        .attr("x2", sideRampLeft + sideRampWidth)
        .attr("y2", vslBottom - 3);
    }

    // Head number
    rectGroup.append("text")
      .style("fill", "#000")
      .attr("text-left", vslData.id)
      .attr("x", vslLeft - 2)
      .attr("y", vslBottom - 8)
      .attr("text-anchor", 'end')
      .attr('font-family', _fontFamily)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(textLeft)

    //Stern number
    rectGroup.append("text")
      .style("fill", "#000")
      .attr("text-right", vslData.id)
      .attr("x", vslRight + 2)
      .attr("y", vslBottom - 8)
      .attr("text-anchor", 'start')
      .attr('font-family', _fontFamily)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(textRight)

    rectGroup.datum({x: 0, y: 0})
      .call(d3.drag()
        .on("start", _dragstarted)
        .on("drag", _dragged)
        .on("end", _dragended));
  }

  function _vesselMouseover(vslIdx) {
    // $("rect[resize-top-idx=" + vslIdx + "]").show();
    // $("rect[resize-bottom-idx=" + vslIdx + "]").show();
  }

  function _vesselMouseout(vslIdx) {
    // $("rect[resize-top-idx=" + vslIdx + "]").hide();
    // $("rect[resize-bottom-idx=" + vslIdx + "]").hide();
  }

  function _reCalcVesselInfo(target, x, y) {
    var vslIdx = target.attr('vsl-group-idx');
    var vslInfo = _getVslDrawInfo(vslIdx);
    if (!vslInfo) return;

    var vslLeft = vslInfo.vslLeft + x;
    var vslRight = vslLeft + vslInfo.vslWidth;
    var vslBridge = vslInfo.vslBridge + x;
    var vslHead = vslInfo.vslHead + x;

    var mooringDistance = _zoomInWidth(_mooringDistance);
    var left = vslLeft - mooringDistance;
    var right = vslRight + mooringDistance;
    var bittLeft = _getBittLeftByPos(left, vslLeft);
    var bittRight = _getBittRightByPos(right, vslRight);

    var originLeft = Common.getPosByBerthDir(_zoomOutWidth(vslLeft), _mapWidth, vslInfo.berthDir);
    var originRight = Common.getPosByBerthDir(_zoomOutWidth(vslRight), _mapWidth, vslInfo.berthDir);
    var mooringHead, mooringStern;
    console.log("bittLeft: ", bittLeft.name);
    console.log("bittRight: ", bittRight.name);
    if (bittLeft && bittRight) {
      if (vslInfo.vslDir == Common.vesselDir.leftRight) {
        mooringHead = bittRight.idx;
        mooringStern = bittLeft.idx;
      }
      else {
        mooringHead = bittLeft.idx;
        mooringStern = bittRight.idx;
      }

      var mooringTarget = $("rect[mooring-idx=" + vslIdx + "]");
      var mooringWidth = Math.abs(bittLeft.start_position - bittRight.start_position);
      var morringLeft = bittLeft.start_position - x;
      var morringRight = morringLeft + mooringWidth;
      if (mooringTarget) {
        mooringTarget.attr('x', morringLeft);
        mooringTarget.attr('width', mooringWidth);
      }

      var bittLeftText = $("text[mooring-text-left=" + vslIdx + "]");
      if (bittLeftText) {
        bittLeftText.text(bittLeft.name);
        bittLeftText.attr('x', morringLeft + 2);
      }

      var bittRightText = $("text[mooring-text-right=" + vslIdx + "]");
      if (bittRightText) {
        bittRightText.text(bittRight.name);
        bittRightText.attr('x', morringRight - 2);
      }

      var textLeft = $("text[text-left=" + vslIdx + "]");
      if (textLeft) textLeft.text(Common.roundNumber(originLeft));

      var textRight = $("text[text-right=" + vslIdx + "]");
      if (textRight) textRight.text(Common.roundNumber(originRight));

      var bridgeObj = _getBridgePos(vslBridge, vslInfo.berthDir);
      var bridgeText = $("text[bridge-text=" + vslIdx + "]");
      if (bridgeObj && textRight)
        bridgeText.text(bridgeObj.text);
    }

    var startDate = _getVesselDateFromPos(vslInfo.vslTop + y);
    var endDate = _getVesselDateFromPos(vslInfo.vslBottom + y);
    // console.log("startDate, endDate: ", startDate, endDate);

    _vslInfo.id = vslIdx;
    _vslInfo.head_position = Common.roundNumber(Common.getPosByBerthDir(_zoomOutWidth(vslHead), _mapWidth, vslInfo.berthDir));
    _vslInfo.mooring_head = mooringHead;
    _vslInfo.mooring_stern = mooringStern;
    _vslInfo.eta_date = moment(startDate).format('DD/MM/YYYY HH:mm');
    _vslInfo.etd_date = moment(endDate).format('DD/MM/YYYY HH:mm');
    _updateVesselData(_vslInfo);
  }

  function _updateVesselData(vslData) {
    var vslObj = _getVesselById(vslData.id);
    if (vslObj) {
      if (vslData.head_position)
        vslObj.head_position = vslData.head_position;

      if (vslData.mooring_head)
        vslObj.mooring_head = vslData.mooring_head;

      if (vslData.mooring_stern)
        vslObj.mooring_stern = vslData.mooring_stern;

      if (vslData.eta_date)
        vslObj.eta_date = vslData.eta_date;

      if (vslData.etd_date)
        vslObj.etd_date = vslData.etd_date;
      console.log("data Changed: ", vslObj);
    }
  }

  function _getVesselById(id) {
    return _.find(_vesselData, function (obj) {
      return obj.id == id;
    });
  }

  function _getVslDrawInfo(vslIdx) {
    var target = $("g.vessel-group[vsl-group-idx=" + vslIdx + "]");
    if (target.length == 0) return;
    var vslWidth = parseFloat(target.attr('vsl-width'));
    var vslHeight = parseFloat(target.attr('vsl-height'));
    var vslBridge = parseFloat(target.attr('vsl-bridge'));
    var vslHead = parseFloat(target.attr('vsl-head'));
    var vslStern = parseFloat(target.attr('vsl-stern'));
    var vslTop = parseFloat(target.attr('vsl-top'));
    var vslBottom = parseFloat(target.attr('vsl-bottom'));
    var vslLeft = parseFloat(target.attr('vsl-left'));
    var vslRight = parseFloat(target.attr('vsl-right'));
    var mooringLeft = parseFloat(target.attr('mooring-left'));
    var mooringRight = parseFloat(target.attr('mooring-right'));
    var berthDir = target.attr('berth-dir');
    var vslDir = target.attr('vsl-dir');

    return {
      vslWidth: vslWidth,
      vslHeight: vslHeight,
      vslBridge: vslBridge,
      vslHead: vslHead,
      vslStern: vslStern,
      vslTop: vslTop,
      vslBottom: vslBottom,
      vslLeft: vslLeft,
      vslRight: vslRight,
      berthDir: berthDir,
      vslDir: vslDir,
      mooringLeft: mooringLeft,
      mooringRight: mooringRight
    }
  }

  function _updateVslDrawInfo() {
    console.log("_updateVslDrawInfo: ", _vslDrawInfo);
    var d3Group = $("g.vessel-group[vsl-group-idx=" + _vslDrawInfo.id + "]");
    if (!d3Group) return;

    if (_vslDrawInfo.vslTop != null)
      d3Group.attr('vsl-top', _vslDrawInfo.vslTop);
    if (_vslDrawInfo.vslHeight != null)
      d3Group.attr('vsl-height', _vslDrawInfo.vslHeight);
    if (_vslDrawInfo.vslBottom != null)
      d3Group.attr('vsl-bottom', _vslDrawInfo.vslBottom);

    _vslDrawInfo.id = null;
    _vslDrawInfo.vslTop = null;
    _vslDrawInfo.vslHeight = null;
    _vslDrawInfo.vslBottom = null;
  }

  function _getVesselPosFromDate(eta_date, etb_date, etd_date) {

    var format = "DD/MM/YYYY hh:mm";
    var ETA_Date = moment(eta_date, format);
    var ETB_Date = moment(etb_date, format);
    var ETD_Date = moment(etd_date, format);

    var format_temp = "DD/MM/YYYY";
    var ETA_Date_temp = moment(eta_date, format_temp);
    var ETD_Date_temp = moment(etd_date, format_temp);

    var eta_number_days = ETA_Date.diff(_previousDate, 'days');
    var eta_hh = parseInt(ETA_Date.format("HH"));
    var eta_ss = parseInt(ETA_Date.format("mm"));

    var etd_number_days = ETD_Date_temp.diff(ETA_Date_temp, 'days');
    var etd_hh = parseInt(ETD_Date.format("HH"));
    var etd_ss = parseInt(ETD_Date.format("mm"));


    var gridHeight = Common.gridHeight;
    var distance_ss_top = 0;
    if (eta_ss >= 30)
      distance_ss_top = gridHeight / 2;

    var distance_ss_bottom = 0;
    if (etd_ss >= 30)
      distance_ss_bottom = gridHeight / 2;

    //Vessel top
    var vslTop = eta_number_days * (gridHeight * 4) + (eta_hh) * gridHeight + distance_ss_top;
    //Vessel height
    var vessel_height = 0;
    if (etd_number_days <= 0)
      vslHeight = (24 - eta_hh) * gridHeight - ((24 - etd_hh) * gridHeight) + distance_ss_bottom - distance_ss_top;
    else
      vslHeight = (24 - eta_hh) * gridHeight + (etd_number_days - 1) * 24 * gridHeight + etd_hh * gridHeight + distance_ss_bottom - distance_ss_top;

    return {
      vslTop: vslTop,
      vslHeight: vslHeight,
      ETA_Date: ETA_Date,
      ETB_Date: ETB_Date,
      ETD_Date: ETD_Date
    }
  }

  function _getVesselDateFromPos(vslPos) {
    var gridHeight = _zoomInHeight(Common.gridHeight);
    var totalHour = vslPos / gridHeight;
    var days = Math.floor(totalHour / 24);
    var hours = totalHour % 24;
    return Common.plusDate(_previousDate, days, hours);
  }

  function _getBridgePos(bridgePos, berthDir) {
    var arrLength = _bitts.length, bitt, operator = '';
    for (var i = 0; i < arrLength; i++) {
      var start = _bitts[i].start_position;
      var end = i < arrLength - 1 ? _bitts[i + 1].start_position : start;
      if (bridgePos >= start && bridgePos <= end) {
        var midd = (end - start) / 2;
        if (midd >= (bridgePos - start)) {
          operator = berthDir == Common.berthDir.leftRight ? '+' : '-';
          bitt = _bitts[i];
        }
        else {
          operator = operator = berthDir == Common.berthDir.leftRight ? '-' : '+';
          bitt = i < arrLength - 1 ? _bitts[i + 1] : _bitts[i];
        }
      }
    }

    if (!bitt) return;
    var result = {bitt: bitt, text: ''}
    if (operator == '+')
      result.text = bitt.name + " + " + Math.abs(Math.round(_zoomOutWidth(bridgePos - bitt.start_position))) + "m";
    else if (operator == '-')
      result.text = bitt.name + " - " + Math.abs(Math.round(_zoomOutWidth(bitt.start_position - bridgePos))) + "m";
    return result;
  }

  function _getBittLeftByPos(leftPos, vslLeft) {
    var arrLength = _bitts.length, bitt;
    for (var i = 0; i < arrLength; i++) {
      var start = _bitts[i].start_position;
      var end = i < arrLength - 1 ? _bitts[i + 1].start_position : start;
      if (leftPos >= start && leftPos <= end) {
        var midd = (end - start) / 2;
        if (midd >= (leftPos - start)) {
          bitt = _bitts[i];
          break;
        }
        else {
          bitt = i < arrLength - 1 ? _bitts[i + 1] : _bitts[i];
          if (bitt.start_position >= vslLeft || bitt.start_position >= leftPos)
            bitt = _bitts[i];
          break;
        }
      }
    }
    return (!bitt && arrLength > 0) ? _bitts[0] : bitt;
  }

  function _getBittRightByPos(rightPos, vslRight) {
    var arrLength = _bitts.length, bitt;
    for (var i = 0; i < arrLength; i++) {
      var start = _bitts[i].start_position;
      var end = i < arrLength - 1 ? _bitts[i + 1].start_position : start;
      if (rightPos >= start && rightPos <= end) {
        var midd = (end - start) / 2;
        if (midd >= (rightPos - start)) {
          bitt = _bitts[i];
          if (bitt.start_position <= vslRight || bitt.start_position <= rightPos)
            bitt = i < arrLength - 1 ? _bitts[i + 1] : _bitts[i];
          break;
        }
        else {
          bitt = i < arrLength - 1 ? _bitts[i + 1] : _bitts[i];
          break;
        }
      }
    }
    return (!bitt && arrLength > 0) ? _bitts[arrLength - 1] : bitt;
  }

  function _getMinBerthPos() {
    if (_bitts && _bitts.length > 0)
      return _bitts[0].start_position
    else
      return 0;
  }

  function _getMaxBerthPos() {
    if (_bitts && _bitts.length > 0)
      return _bitts[_bitts.length - 1].start_position
    else
      return 0;
  }

  function _dragstarted(d) {
    d3.select(this).raise().classed("active", true);
  }

  function _dragged(d) {
    if(d3.select(this).attr('drag-stop')) return;
    if (d3.event.x == _currentPoint.x && d3.event.y == _currentPoint.y) {
      console.log("position don't change");
      return;
    }
    _currentPoint.x = d3.event.x;
    _currentPoint.y = d3.event.y;

    var vslIdx = d3.select(this).attr('vsl-group-idx');
    var mooringTarget = $("rect[mooring-idx=" + vslIdx + "]");
    var vslInfo = _getVslDrawInfo(vslIdx);
    var left = 0, width = 0, right = 0, top = 0, bottom = 0;
    if (vslInfo && mooringTarget) {
      width = vslInfo.vslWidth + 2 * _zoomInWidth(_mooringDistance);
      left = vslInfo.vslLeft - _zoomInWidth(_mooringDistance);
      right = vslInfo.vslRight + _zoomInWidth(_mooringDistance);
      top = vslInfo.vslTop;
      bottom = vslInfo.vslBottom;

      mooringTarget.attr('x', left);
      mooringTarget.attr('width', width);

      var bittLeftText = $("text[mooring-text-left=" + vslIdx + "]");
      if (bittLeftText) bittLeftText.attr('x', left + 2);

      var bittRightText = $("text[mooring-text-right=" + vslIdx + "]");
      if (bittRightText) bittRightText.attr('x', right - 2);

      var minPos = _getMinBerthPos();
      var maxPos = _getMaxBerthPos();
      var gridHeight = _timeChange == 30 ? (_zoomInHeight(Common.gridHeight) / 2) : _zoomInHeight(Common.gridHeight);
      var gridY = Math.round(d3.event.y / gridHeight) * gridHeight;
      _dx = Math.max(-left + minPos, Math.min(maxPos - right, d3.event.x));
      _dy = Math.max(-top, Math.min(_zoomInHeight(_mapHeight) - bottom, gridY));
      d3.select(this).attr("transform", "translate(" + (d.x = _dx) + "," + (d.y = _dy) + ")")
    }
  }

  function _dragended(d) {
    d3.select(this).classed("active", false);
    if(d3.select(this).attr('drag-stop')) return;
    if (_dx && _dy) {
      _reCalcVesselInfo(d3.select(this), _dx, _dy);
    }
  }

  function _resizeBottom(d) {
    var vslId = d3.select(this).attr('resize-bottom-idx');
    var vslInfo = _getVslDrawInfo(vslId);
    if (_heightTMP == 0) _heightTMP = vslInfo.vslHeight;
    var vslBottom = Math.max(d.y + (_dragbarW / 2), Math.min(_zoomInHeight(_mapHeight), d.y + _heightTMP + d3.event.dy));
    _heightTMP = vslBottom - d.y;

    d3.select(this).attr("y", function (d) {
      return vslBottom - (_dragbarW / 2)
    });

    //Vessel
    d3.select("rect[vsl-idx=" + vslId + "]")
      .attr("height", _heightTMP - 1);

    //Mooring box
    d3.select("rect[mooring-idx=" + vslId + "]")
      .attr("height", _heightTMP - 1);

    //Bridge
    d3.select("line[vsl-bridge-idx=" + vslId + "]").attr("y2", vslBottom);
    d3.select("text[bridge-text=" + vslId + "]").attr("y", vslBottom - 5);

    //Head
    var d3Head = d3.select("g[head-idx=" + vslId + "]");
    if (d3Head) {
      var triangleTop = vslBottom - _heightTMP / 2 - 13;
      var trxOrigin = d3Head.attr('trxOrigin');
      d3Head.attr("transform", "translate(" + trxOrigin + "," + triangleTop + ")");
    }

    //Mooring text left, right
    d3.select("text[text-left=" + vslId + "]")
      .attr("y", vslBottom - 8)
    d3.select("text[text-right=" + vslId + "]")
      .attr("y", vslBottom - 8);

    //Vessel alongside
    var d3VslAlongside = d3.select("g[vsl-alongside=" + vslId + "]");
    if (d3VslAlongside) {
      var alongsideTop = vslBottom - 22;
      var trxOrigin = d3VslAlongside.attr('trxOrigin');
      d3VslAlongside.attr("transform", "translate(" + trxOrigin + "," + alongsideTop + ")");
    }

    //Stern ramp
    d3.select("line[stern-ramp-idx=" + vslId + "]")
      .attr("y1", vslBottom - 3)
      .attr("y2", vslBottom - 3);
    //Side ramp
    d3.select("line[side-ramp-idx=" + vslId + "]")
      .attr("y1", vslBottom - 3)
      .attr("y2", vslBottom - 3);

    _vslDrawInfo.id = vslId;
    _vslDrawInfo.vslTop = vslBottom - _heightTMP;
    _vslDrawInfo.vslHeight = _heightTMP;
    _vslDrawInfo.vslBottom =  vslBottom;

    var endDate = _getVesselDateFromPos(vslBottom);
    _vslInfo.id = vslId;
    _vslInfo.eta_date = null;
    _vslInfo.etd_date = moment(endDate).format('DD/MM/YYYY HH:mm');
  }

  function _resizeTop(d) {
    var vslId = d3.select(this).attr('resize-top-idx');
    var vslInfo = _getVslDrawInfo(vslId);
    if (_heightTMP == 0) _heightTMP = vslInfo.vslHeight;
    var oldy = d.y;
    var gridHeight = _timeChange == 30 ? (_zoomInHeight(Common.gridHeight) / 2) : _zoomInHeight(Common.gridHeight);
    var vslTop = d.y = Math.max(0, Math.min(d.y + _heightTMP - (_dragbarW / 2), d3.event.y));
    console.log("vslTop: ", vslTop,  d.y);

    _heightTMP = _heightTMP + (oldy - d.y);

    //Update pos Resize Ctrl
    d3.select(this).attr("y", function (d) {
      return d.y - _dragbarW / 2;
    });

    //Vessel
    d3.select("rect[vsl-idx=" + vslId + "]")
      .attr("y", function (d) {
        return vslTop
      })
      .attr("height", _heightTMP - 1);

    //Mooring box
    d3.select("rect[mooring-idx=" + vslId + "]")
      .attr("y", function (d) {
        return vslTop
      })
      .attr("height", _heightTMP - 1);

    //Bridge
    d3.select("line[vsl-bridge-idx=" + vslId + "]").attr("y1", vslTop);

    //Head
    var d3Head = d3.select("g[head-idx=" + vslId + "]");
    if(d3Head) {
      var triangleTop = vslTop + _heightTMP / 2 - 13;
      var trxOrigin = d3Head.attr('trxOrigin');
      d3Head.attr("transform", "translate(" + trxOrigin + "," + triangleTop + ")");
    }

    //vessel code
    d3.select("text[vsl-code=" + vslId + "]").attr("y", vslTop + 14);

    //Vessel Status
    var d3VslStt = d3.select("g[vsl-status=" + vslId + "]");
    if(d3VslStt) {
      var triangleTop = vslTop + 1;
      var trxOrigin = d3VslStt.attr('trxOrigin');
      d3VslStt.attr("transform", "translate(" + trxOrigin + "," + triangleTop + ")");
    }

    //Mooring text left, right
    d3.select("text[mooring-text-left=" + vslId + "]")
      .attr("y", vslTop + 12)
    d3.select("text[mooring-text-right=" + vslId + "]")
      .attr("y", vslTop + 12)

    _vslDrawInfo.id = vslId;
    _vslDrawInfo.vslTop = vslTop;
    _vslDrawInfo.vslHeight = _heightTMP;
    _vslDrawInfo.vslBottom = vslTop + _heightTMP;

    var startDate = _getVesselDateFromPos(vslTop);
    _vslInfo.id = vslId;
    _vslInfo.eta_date = moment(startDate).format('DD/MM/YYYY HH:mm');;
    _vslInfo.etd_date = null;
  }

  function _vesselResized(d) {
    _vslInfo.head_position = null;
    _vslInfo.mooring_head = null;
    _vslInfo.mooring_stern = null;
    _updateVesselData(_vslInfo);
    _updateVslDrawInfo(_vslInfo);

    //Reset data
    _heightTMP = 0;
  }

  function _initScroll() {
    $("#bottom-scroll").on('scroll', function (e) {
      $('#map-content').scrollLeft($(this).scrollLeft());
      $('#ruler-top-content').scrollLeft($(this).scrollLeft());
    });

    $("#ruller-left").on('scroll', function (e) {
      if (_isRulerLeft)
        $('#map-content').scrollTop($(this).scrollTop());
    });

    $("#map-content").on('scroll', function (e) {
      if (_isMapContent)
        $('#ruller-left').scrollTop($(this).scrollTop());
    });
  }

  function _initEvent() {
    $("#ruller-left").mouseenter(function () {
      _isRulerLeft = true;
    })
      .mouseleave(function () {
        _isRulerLeft = false;
      });

    $("#map-content").mouseenter(function () {
      _isMapContent = true;
    })
      .mouseleave(function () {
        _isMapContent = false;
      });

    $("a.zoom-width").click(function () {
      var name = $(this).attr('name');
      if (name == 'btn-zoom-in')
        _applyZoomWidth('zoom-in');
      else
        _applyZoomWidth('zoom-out');
    });

    $("a.zoom-height").click(function () {
      var name = $(this).attr('name');
      if (name == 'btn-zoom-in')
        _applyZoomHeight('zoom-in');
      else
        _applyZoomHeight('zoom-out');
    });

    $(document).on('click', '#map-content', function (e) {
      $("g.vessel-group").removeAttr('drag-stop');
      console.log("click");
    })
  }

  function _enableOrDisableZoom() {
    if (_zoomHeightRate == _zoomHeightMin)
      $(".zoom-height[name='btn-zoom-out']").addClass('disable-link');
    else
      $(".zoom-height[name='btn-zoom-out']").removeClass('disable-link');

    if (_zoomHeightRate == _zoomHeightMax)
      $(".zoom-height[name='btn-zoom-in']").addClass('disable-link');
    else
      $(".zoom-height[name='btn-zoom-in']").removeClass('disable-link');

    if (_zoomWidthRate == _zoomWidthMin)
      $(".zoom-width[name='btn-zoom-out']").addClass('disable-link');
    else
      $(".zoom-width[name='btn-zoom-out']").removeClass('disable-link');

    if (_zoomWidthRate == _zoomWidthMax)
      $(".zoom-width[name='btn-zoom-in']").addClass('disable-link');
    else
      $(".zoom-width[name='btn-zoom-in']").removeClass('disable-link');
  }

  function _getVesselData() {
    return _vesselData;
  }

  return {
    draw: _draw,
    setMooringDistance: _setMooringDistance,
    setMovementDistance: _setMovementDistance,
    setTimeChange: _setTimeChange,
    getVesselData: _getVesselData
  }
}());