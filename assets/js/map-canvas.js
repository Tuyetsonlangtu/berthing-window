/**
 * Created by Hien Tran on 8/1/2017.
 */

var MapCanvas = (function () {
  var _rulerLeftSVG;
  var _mapContentSVG;
  var _rulerTopSVG;
  var _vslGroupContent;

  var _isRulerLeft = false, _isMapContent = true
  var _zoomHeightRate = 1, _zoomHeightMin = 1, _zoomHeightMax = 5, _zoomHeightStep = 1;
  var _zoomWidthRate = 3, _zoomWidthMin = 1, _zoomWidthMax = 5, _zoomWidthStep = 1;
  var _rulerDateData = [];
  var _fontFamily = '맑은고딕,Malgun Gothic,Arial, Verdana, Geneva, Helvetica, sans-serif, Apple-Gothic,애플고딕,Droid Sans,돋움,Dotum';
  var _mapWidth = 0, _mapHeight = 0;
  var _hoursOfDay = 24;
  var _partOfDay = 4; // One day divided into 4 parts
  var _hoursOfPart = 6;
  var _previousDate;
  var _bitts = [];
  var _berthData = {};
  var _vesselData = [];
  var _dx, _dy;
  var _timeChange = 30; // 30 | 60 <=> 30' or 1h for one step when move vessel direction top - bottom
  var _movementDistance = 5;
  var _mooringDistance = 5;
  var _currentPoint = {
    x: 0,
    y: 0
  }
  var _dragbarW = _dragbarH = 10;
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
    vslLeft: null,
    vslBottom: null,
    vslHeight: null,
    vslTopOrigin: null,
    vslBottomOrigin: null,
    vslLeftOrigin: null,
    vslRightOrigin: null
  }

  var _d3VslSelected = null;
  var _isFlag = false;
  var _keyCode = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    esc: 27,
    del: 46
  }
  var _berthDir, _berthArr = [];
  var _showBridge = true, _showRamp = true, _showGridDetail = true;
  var _vslColorType = 'calling_status_color'; //calling_status_color, calling_type_color, service_lane_color
  /*
   * .addClassSVG(className)
   * Adds the specified class(es) to each of the set of matched SVG elements.
   */
  $.fn.addClassSVG = function (className) {
    $(this).attr('class', function (index, existingClassNames) {
      return ((existingClassNames !== undefined) ? (existingClassNames + ' ') : '') + className;
    });
    return this;
  };

  /*
   * .removeClassSVG(className)
   * Removes the specified class to each of the set of matched SVG elements.
   */
  $.fn.removeClassSVG = function (className) {
    $(this).attr('class', function (index, existingClassNames) {
      var re = new RegExp('\\b' + className + '\\b', 'g');
      return existingClassNames.replace(re, '');
    });
    return this;
  };

  function _draw(strDate, number, berthData, bitts, vesselData, config) {
    $("#ruler-top-svg").remove();
    $("#map-content-svg").remove();
    $("#ruler-left-svg").remove();

    _previousDate = moment(strDate, Common.format);
    _rulerDateData = Common.createDateData(strDate, Common.format, number);
    if (berthData) _berthData = berthData;
    if (bitts) _bitts = bitts;
    if (vesselData) _vesselData = vesselData;
    if (config) {
      _vslColorType = config.vslColor;
      _timeChange = config.timechange;
      _showRamp = config.displayRamp;
      _showBridge = config.displayBridge;
      _showGridDetail = config.displayGridDetail;
      _mooringDistance = config.mooringDistance;
      _movementDistance = config.movementDistance;
    }

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
      .attr("y1", 1)
      .attr("x2", widthCal)
      .attr("y2", 1)
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
      .attr("transform", "translate(0,0)");

    _vslGroupContent = _mapContentSVG.append("g")
      .attr("transform",
        "translate(" + Common.mapContent.margin.left + "," + Common.mapContent.margin.top + ")");

    var lineGroup = _vslGroupContent.append("g").attr("class", "map-content-grid")

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

        if (j % _hoursOfPart != 0) {
          line.attr("class", 'grid-detail ' + (_showGridDetail ? '' : 'hide'));
          line.style("stroke-dasharray", ("1, 1"));
        }
        else
          line.attr("class", 'start-hours');

        yPost += gridHeight;
      }
    }

    var vesselLength = _vesselData.length;
    for (var i = 0; i < vesselLength; i++) {
      _createVessel(_vesselData[i]);
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
    var arrLength = 0, groupWidth = 0, xPosGroup = 0;
    var rectSvg = null, textSVG = null, isCreate = true;

    _berthArr = berthData[Common.berthDir.leftRight];
    _berthDir = Common.berthDir.leftRight;
    if (!_berthArr) {
      _berthArr = berthData[Common.berthDir.rightLeft];
      _berthDir = Common.berthDir.rightLeft;
    }

    if (_berthArr) {
      arrLength = _berthArr.length;
      for (var i = 0; i < arrLength; i++) {
        var xPos = _zoomInWidth(Common.getPosByBerthDir(_berthArr[i].start_postion, width, _berthDir));
        var widthBerth = _zoomInWidth(_berthArr[i].length);
        var rectHeight = 20;
        var xPosText = xPos + widthBerth / 2;

        if (i > 0 && _berthArr[i].group == _berthArr[i - 1].group) {
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
            .attr("x", _berthDir == Common.berthDir.leftRight ? xPos : xPos - widthBerth)
            .attr("y", 0)
            .attr("height", rectHeight)
            .attr("width", groupWidth);

          textSVG = berthGroup.append("text")
            .style("fill", "#000")
            .attr("x", _berthDir == Common.berthDir.leftRight ? (xPos + groupWidth / 2) : (xPos + groupWidth / 2 - widthBerth))
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr('font-family', _fontFamily)
            .attr('font-size', '14px')
            .text(_berthArr[i].group);
        }
        else {
          rectSvg.attr("width", groupWidth);
          rectSvg.attr("x", _berthDir == Common.berthDir.leftRight ? xPosGroup : xPosGroup - groupWidth)
          textSVG.attr("x", _berthDir == Common.berthDir.leftRight ? (xPosGroup + groupWidth / 2) : (xPosGroup + groupWidth / 2 - groupWidth))
        }

        berthGroup.append("rect")
          .attr("fill", 'white')
          .attr("stroke", "rgb(171, 171, 171)")
          .attr("stroke-width", '1px')
          .attr("x", _berthDir == Common.berthDir.leftRight ? xPos : xPos - widthBerth)
          .attr("y", rectHeight)
          .attr("height", rectHeight)
          .attr("width", widthBerth)
        berthGroup.append("text")
          .style("fill", "#000")
          .attr("x", _berthDir == Common.berthDir.leftRight ? xPosText : xPosText - widthBerth)
          .attr("y", rectHeight + 15)
          .attr("text-anchor", "middle")
          .attr('font-family', _fontFamily)
          .attr('font-size', '14px')
          .text(_berthArr[i].name);
      }
    }

    //Rule style
    var lineGroup = _rulerTopSVG.append("g").attr("class", "ruler-top");
    var step = 0, count = 0;
    var xPos = _berthDir == Common.berthDir.leftRight ? 0 : widthCal;
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
      xPos = _berthDir == Common.berthDir.leftRight ? step : widthCal - step;
    }

    var lineBittGroup = _rulerTopSVG.append("g").attr("class", "bitts-top");
    var bittLength = _bitts.length;
    var xPos = 0;
    yPos = heightCal - 30;
    for (var i = 0; i < bittLength; i++) {
      xPos = _zoomInWidth(Common.getPosByBerthDir(_bitts[i].start_position_original, width, _berthDir));
      _bitts[i].start_position = xPos;
      _bitts[i].end_position = _zoomInWidth(Common.getPosByBerthDir(_bitts[i].end_position_original, width, _berthDir));

      lineBittGroup.append("line")
        .attr("bitt-idx", _bitts[i].id)
        .attr("stroke-width", '5px')
        .attr("x1", xPos)
        .attr("y1", yPos - 8)
        .attr("x2", xPos)
        .attr("y2", yPos)
        .attr("stroke", "black");

      lineBittGroup.append("text")
        .attr("fill", "#000")
        .attr("bitt-text-idx", _bitts[i].id)
        .attr("x", xPos)
        .attr("y", yPos - 15)
        .attr("text-anchor", "middle")
        .attr('font-family', _fontFamily)
        .attr('font-size', '13px')
        .text(_bitts[i].name);
    }
    _bitts = _.sortBy(_bitts, 'start_position');
    // console.log('_bitts: ', _bitts);
  }

  function _getBittByIdx(idx) {
    return _.find(_bitts, function (obj) {
      return obj.idx == idx;
    })
  }

  function _getVslInfo(berthDir, vesselDir, head, LOA, bridgeToStern) {
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

  function _checkVesselDupplicate(id) {
    var vslInfo = _getVslDrawInfo(id);
    var arrLength = _vesselData.length;
    var rect1 = {top: vslInfo.vslTop, left: vslInfo.vslLeft, right: vslInfo.vslRight, bottom: vslInfo.vslBottom}
    for (var i = 0; i < arrLength; i++) {
      if (_vesselData[i].id != id && !_vesselData[i].data_error) {
        vslInfo = _getVslDrawInfo(_vesselData[i].id);
        var rect2 = {top: vslInfo.vslTop, left: vslInfo.vslLeft, right: vslInfo.vslRight, bottom: vslInfo.vslBottom}
        if (Common.checkIntersectRect(rect1, rect2)) {
          console.log("vessel is duplicate: ", true);
          return true;
        }
      }
    }
    return false;
  }

  function _createVessel(vslData) {
    var vslWidth = 0, vslHeight = 0;
    var vslLeft = 0, vslRight = 0, vslTop = 0, vslBottom, vslHead = 0, vslStern = 0, vslbridge = 0, mooringWidth = 0, mooringLeft = 0, mooringRight = 0;
    var sternRampWidth, sternRampStart, sternRampLeft, isSternRampDraw = false;
    var sideRampWidth, sideRampStart, sideRampLeft, isSideRampDraw = false;
    var result = _getVslInfo(vslData.berth_dir_cd, vslData.along_side, vslData.head_position, vslData.LOA, vslData.bridge_to_stern);
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

    // console.log("vslHeight: ", vslHeight);

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

    var rectGroup = _vslGroupContent.append("g")
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
      .attr("vsl-top-origin", vslTop)
      .attr("vsl-bottom-origin", vslBottom)
      .attr("vsl-left-origin", vslLeft)
      .attr("vsl-right-origin", vslRight)
      .attr("berth-dir", vslData.berth_dir_cd)
      .attr("vsl-dir", vslData.along_side)
      .attr("mooring-left", mooringLeft)
      .attr("mooring-right", mooringRight)
      .on("mouseover", function () {
        var target = d3.select(this);
        var vslIdx = target.attr('vsl-group-idx');
        target.classed("active", true);
        target.style('cursor', 'move');
        _vesselMouseover(vslIdx);
        _isFlag = true;
      })
      .on("mouseout", function () {
        var target = d3.select(this);
        var vslIdx = target.attr('vsl-group-idx');
        target.classed("active", false);
        target.style('cursor', 'default');
        _vesselMouseout(vslIdx);
        _isFlag = false;
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
    rectGroup.append("line")
      .attr("mooring-line-left-idx", vslData.id)
      .attr("class", "ruler-line")
      .attr("ruler-line", vslData.id)
      .attr("stroke-width", '1px')
      .attr("x1", mooringLeft)
      .attr("y1", 0)
      .attr("x2", mooringLeft)
      .attr("y2", vslTop)
      .attr("stroke", "black")
      .style("stroke-dasharray", ("5, 2"));
    rectGroup.append("line")
      .attr("mooring-line-right-idx", vslData.id)
      .attr("class", "ruler-line")
      .attr("ruler-line", vslData.id)
      .attr("stroke-width", '1px')
      .attr("x1", mooringLeft + mooringWidth + 1)
      .attr("y1", 0)
      .attr("x2", mooringLeft + mooringWidth + 1)
      .attr("y2", vslTop)
      .attr("stroke", "black")
      .style("stroke-dasharray", ("5, 2"));

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
    var vslColor = vslData[_vslColorType].length > 0 ? vslData[_vslColorType] : 'none';
    rectGroup.append("rect")
      .attr("class", "vessel-rect")
      .attr("vsl-status", vslData.status)
      .attr("vsl-idx", vslData.id)
      .attr("fill", vslColor)
      .attr("stroke", "red")
      .attr("stroke-width", '2px')
      .attr("x", vslLeft)
      .attr("y", vslTop)
      .attr("width", vslWidth)
      .attr("height", vslHeight - 1)
      .datum({x: vslLeft, y: vslTop})
      .on("click", _vesselClicked);
    rectGroup.append("line")
      .attr("vessel-line-left-idx", vslData.id)
      .attr("class", "ruler-line")
      .attr("ruler-line", vslData.id)
      .attr("stroke-width", '1px')
      .attr("x1", vslLeft)
      .attr("y1", 0)
      .attr("x2", vslLeft)
      .attr("y2", vslTop)
      .attr("stroke", "black")
      .style("stroke-dasharray", ("5, 2"));
    rectGroup.append("line")
      .attr("vessel-line-right-idx", vslData.id)
      .attr("class", "ruler-line")
      .attr("ruler-line", vslData.id)
      .attr("stroke-width", '1px')
      .attr("x1", vslLeft + vslWidth + 1)
      .attr("y1", 0)
      .attr("x2", vslLeft + vslWidth + 1)
      .attr("y2", vslTop)
      .attr("stroke", "black")
      .style("stroke-dasharray", ("5, 2"));

    var fullWidth = _zoomInWidth(_mapWidth) + Common.mapContent.margin.left; //Plus if have ruler right + Common.mapContent.margin.right;
    _mapContentSVG.append("line")
      .attr("vessel-line-top-idx", vslData.id)
      .attr("class", "ruler-line")
      .attr("stroke-width", '1px')
      .attr("x1", 0)
      .attr("y1", vslTop)
      .attr("x2", fullWidth)
      .attr("y2", vslTop)
      .attr("stroke", "black")
      .style("stroke-dasharray", ("5, 2"));
    _mapContentSVG.append("line")
      .attr("vessel-line-bottom-idx", vslData.id)
      .attr("class", "ruler-line")
      .attr("stroke-width", '1px')
      .attr("x1", 0)
      .attr("y1", vslBottom)
      .attr("x2", fullWidth)
      .attr("y2", vslBottom)
      .attr("stroke", "black")
      .style("stroke-dasharray", ("5, 2"));

    rectGroup.append("rect")
      .attr("class", "resize-control")
      .attr("resize-top-idx", vslData.id)
      .attr("fill", "white")
      .attr("stroke", "#00b3ff")
      .attr("fill-opacity", 1)
      .attr("x", vslLeft + vslWidth / 2 - _dragbarW / 2)
      .attr("y", vslTop)
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
      .attr("y", vslBottom - _dragbarH)
      .attr("width", _dragbarW)
      .attr("height", _dragbarH)
      .attr("cursor", "pointer")
      .on("mousedown", function () {
        var vslIdx = d3.select(this).attr('resize-bottom-idx');
        $("g.vessel-group[vsl-group-idx=" + vslIdx + "]").attr('drag-stop', true);
      })
      .datum({x: vslLeft + vslWidth / 2 - _dragbarW / 2, y: vslBottom})
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
      .attr("class", "bridge " + (_showBridge ? '' : 'hide'))
      .attr("vsl-bridge-idx", vslData.id)
      .attr("stroke-width", '2px')
      .attr("stroke", 'red')
      .attr("x1", vslbridge)
      .attr("y1", vslTop)
      .attr("x2", vslbridge)
      .attr("y2", vslBottom)
      .style("stroke-dasharray", ("8, 4"));
    bridgeGroup.append("line")
      .attr("bridge-line-idx", vslData.id)
      .attr("class", "ruler-line bridge " + (_showBridge ? '' : 'hide'))
      .attr("ruler-line", vslData.id)
      .attr("stroke-width", '2px')
      .attr("x1", vslbridge)
      .attr("y1", 0)
      .attr("x2", vslbridge)
      .attr("y2", vslTop)
      .attr("stroke", 'red')
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
        .attr("class", "ramp " + (_showRamp ? '' : 'hide'))
        .attr("stern-ramp-idx", vslData.id)
        .attr("stroke-width", '6px')
        .attr("stroke", 'red')
        .attr("x1", sternRampLeft)
        .attr("y1", vslBottom - 3)
        .attr("x2", sternRampLeft + sternRampWidth)
        .attr("y2", vslBottom - 3);
      _rulerTopSVG.append("line")
        .attr("class", "ruler-line ramp " + (_showRamp ? '' : 'hide'))
        .attr("stern-ramp-ruler-idx", vslData.id)
        .attr("stroke-width", '4px')
        .attr("stroke", 'red')
        .attr("originX1", sternRampLeft)
        .attr("originX2", sternRampLeft + sternRampWidth)
        .attr("x1", sternRampLeft)
        .attr("y1", _zoomInHeight(Common.rulerTop.height) - 1)
        .attr("x2", sternRampLeft + sternRampWidth)
        .attr("y2", _zoomInHeight(Common.rulerTop.height) - 1);
      rectGroup.append("line")
        .attr("stern-ramp-line-idx", vslData.id)
        .attr("class", "ruler-line ramp " + (_showRamp ? '' : 'hide'))
        .attr("ruler-line", vslData.id)
        .attr("stroke-width", '1px')
        .attr("x1", sternRampLeft + 1)
        .attr("y1", 0)
        .attr("x2", sternRampLeft + 1)
        .attr("y2", vslTop + vslHeight - 5)
        .attr("stroke", "red")
        .style("stroke-dasharray", ("5, 2"));
      rectGroup.append("line")
        .attr("stern-ramp-line-idx", vslData.id)
        .attr("class", "ruler-line ramp " + (_showRamp ? '' : 'hide'))
        .attr("ruler-line", vslData.id)
        .attr("stroke-width", '1px')
        .attr("x1", sternRampLeft + sternRampWidth)
        .attr("y1", 0)
        .attr("x2", sternRampLeft + sternRampWidth)
        .attr("y2", vslTop + vslHeight - 5)
        .attr("stroke", "red")
        .style("stroke-dasharray", ("5, 2"));
    }

    //Side Ramp
    if (isSideRampDraw) {
      rectGroup.append("line")
        .attr("class", "ramp " + (_showRamp ? '' : 'hide'))
        .attr("side-ramp-idx", vslData.id)
        .attr("stroke-width", '6px')
        .attr("stroke", 'red')
        .attr("x1", sideRampLeft)
        .attr("y1", vslBottom - 3)
        .attr("x2", sideRampLeft + sideRampWidth)
        .attr("y2", vslBottom - 3);
      _rulerTopSVG.append("line")
        .attr("class", "ruler-line ramp " + (_showRamp ? '' : 'hide'))
        .attr("side-ramp-ruler-idx", vslData.id)
        .attr("stroke-width", '4px')
        .attr("stroke", 'red')
        .attr("originX1", sideRampLeft)
        .attr("originX2", sideRampLeft + sideRampWidth)
        .attr("x1", sideRampLeft)
        .attr("y1", _zoomInHeight(Common.rulerTop.height) - 1)
        .attr("x2", sideRampLeft + sideRampWidth)
        .attr("y2", _zoomInHeight(Common.rulerTop.height) - 1);
      rectGroup.append("line")
        .attr("side-ramp-line-idx", vslData.id)
        .attr("class", "ruler-line ramp " + (_showRamp ? '' : 'hide'))
        .attr("ruler-line", vslData.id)
        .attr("stroke-width", '1px')
        .attr("x1", sideRampLeft + 1)
        .attr("y1", 0)
        .attr("x2", sideRampLeft + 1)
        .attr("y2", vslTop + vslHeight - 5)
        .attr("stroke", "red")
        .style("stroke-dasharray", ("5, 2"));
      rectGroup.append("line")
        .attr("side-ramp-line-idx", vslData.id)
        .attr("class", "ruler-line ramp " + (_showRamp ? '' : 'hide'))
        .attr("ruler-line", vslData.id)
        .attr("stroke-width", '1px')
        .attr("x1", sideRampLeft + sideRampWidth)
        .attr("y1", 0)
        .attr("x2", sideRampLeft + sideRampWidth)
        .attr("y2", vslTop + vslHeight - 5)
        .attr("stroke", "red")
        .style("stroke-dasharray", ("5, 2"));
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
      .text(Common.roundNumber(textLeft))

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
      .text(Common.roundNumber(textRight))

    if (vslData.status == 'P') {
      rectGroup.datum({x: 0, y: 0})
        .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
        .call(d3.drag()
          .on("start", _dragstart)
          .on("drag", _dragged)
          .on("end", _dragended));
    }
  }

  function _vesselClicked(target) {
    _d3VslSelected = d3.select(this);
    d3.select(this).classed("active", true);
    var vslId = d3.select(this).attr("vsl-idx");
    var vslData = _getVesselById(vslId);
    if (!vslData) return;
    _removeBittSelected();
    _setBittColor(vslData.mooring_head);
    _setBittColor(vslData.mooring_stern);
    _showVesselRuler(vslId);
  }

  function _showVesselRuler(vslId) {
    _hideVesselRuler();
    $("g.vessel-group[vsl-group-idx=" + vslId + "]").find('.ruler-line').addClassSVG('active');
    $("#ruler-top-content").find('line.ruler-line[stern-ramp-ruler-idx=' + vslId + ']').addClassSVG('active');
    $("#ruler-top-content").find('line.ruler-line[side-ramp-ruler-idx=' + vslId + ']').addClassSVG('active');
    $("line[vessel-line-top-idx=" + vslId + "]").addClassSVG('active');
    $("line[vessel-line-bottom-idx=" + vslId + "]").addClassSVG('active');
  }

  function _hideVesselRuler() {
    $("#map-content-svg").find('.ruler-line').removeClassSVG('active');
    $("#ruler-top-content").find('line.ruler-line').removeClassSVG('active');
  }

  function _setBittColor(id) {
    $(".bitts-top line[bitt-idx='" + id + "']")
      .attr("bitt-selected", true)
      .attr("stroke", "red");
    $(".bitts-top text[bitt-text-idx='" + id + "']")
      .attr("bitt-text-selected", true)
      .attr("fill", "red");
  }

  function _removeBittSelected() {
    $(".bitts-top line[bitt-selected='true']")
      .attr("bitt-selected", '')
      .attr("stroke", "black");

    $(".bitts-top text[bitt-text-selected='true']")
      .attr("bitt-selected", '')
      .attr("fill", "black");
  }

  function _vesselMouseover(vslIdx) {
    $("rect[resize-top-idx=" + vslIdx + "]").show();
    $("rect[resize-bottom-idx=" + vslIdx + "]").show();
  }

  function _vesselMouseout(vslIdx) {
    $("rect[resize-top-idx=" + vslIdx + "]").hide();
    $("rect[resize-bottom-idx=" + vslIdx + "]").hide();
  }

  function _reCalcVesselInfo(target, x, y, isMooring) {
    var vslIdx = target.attr('vsl-group-idx');
    var vslInfo = _getVslDrawInfo(vslIdx);
    if (!vslInfo) return;

    var vslTop = vslInfo.vslTopOrigin + y;
    var vslBottom = vslInfo.vslBottomOrigin + y;
    var vslLeft = vslInfo.vslLeftOrigin + x;
    var vslRight = vslInfo.vslRightOrigin + x;

    var vslBridge = vslInfo.vslBridge + x;
    var vslHead = vslInfo.vslHead + x;

    if (isMooring) {
      var mooringDistance = _zoomInWidth(_mooringDistance);
      var left = vslLeft - mooringDistance;
      var right = vslRight + mooringDistance;
      var bittLeft = _getBittLeftByPos(left, vslLeft);
      var bittRight = _getBittRightByPos(right, vslRight);

      var originLeft = Common.getPosByBerthDir(_zoomOutWidth(vslLeft), _mapWidth, vslInfo.berthDir);
      var originRight = Common.getPosByBerthDir(_zoomOutWidth(vslRight), _mapWidth, vslInfo.berthDir);
      var mooringHead, mooringStern;
      if (bittLeft && bittRight) {
        if (vslInfo.vslDir == Common.vesselDir.leftRight) {
          mooringHead = bittRight.idx;
          mooringStern = bittLeft.idx;
        }
        else {
          mooringHead = bittLeft.idx;
          mooringStern = bittRight.idx;
        }

        _removeBittSelected();
        _setBittColor(mooringHead);
        _setBittColor(mooringStern);

        var mooringTarget = $("rect[mooring-idx=" + vslIdx + "]");
        var mooringWidth = Math.abs(bittLeft.start_position - bittRight.start_position);
        var morringLeft = bittLeft.start_position - x;
        var morringRight = morringLeft + mooringWidth;
        if (mooringTarget) {
          mooringTarget.attr('x', morringLeft);
          mooringTarget.attr('width', mooringWidth);

          //Mooring line left
          if (!d3.select("line[mooring-line-left-idx=" + vslIdx + "]").empty()) {
            d3.select("line[mooring-line-left-idx=" + vslIdx + "]")
              .attr("x1", morringLeft)
              .attr("x2", morringLeft);
          }

          if (!d3.select("line[mooring-line-right-idx=" + vslIdx + "]").empty()) {
            d3.select("line[mooring-line-right-idx=" + vslIdx + "]")
              .attr("x1", morringRight + 1)
              .attr("x2", morringRight + 1);
          }
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

      }

      var textLeft = $("text[text-left=" + vslIdx + "]");
      if (textLeft) textLeft.text(Common.roundNumber(originLeft));

      var textRight = $("text[text-right=" + vslIdx + "]");
      if (textRight) textRight.text(Common.roundNumber(originRight));

      var bridgeObj = _getBridgePos(vslBridge, vslInfo.berthDir);
      var bridgeText = $("text[bridge-text=" + vslIdx + "]");
      if (bridgeObj && textRight)
        bridgeText.text(bridgeObj.text);

      _vslInfo.mooring_head = mooringHead;
      _vslInfo.mooring_stern = mooringStern;
    }
    else {
      _vslInfo.mooring_head = null;
      _vslInfo.mooring_stern = null;
    }

    $("line[ruler-line=" + vslIdx + "]").attr('y1', -y);

    //vessel line
    if (!d3.select("line[vessel-line-top-idx=" + vslIdx + "]").empty()) {
      d3.select("line[vessel-line-top-idx=" + vslIdx + "]")
        .attr("y1", vslTop)
        .attr("y2", vslTop);
    }

    if (!d3.select("line[vessel-line-bottom-idx=" + vslIdx + "]").empty()) {
      d3.select("line[vessel-line-bottom-idx=" + vslIdx + "]")
        .attr("y1", vslBottom)
        .attr("y2", vslBottom);
    }

    var x1, x2;
    //Stern Ramp
    if (!d3.select("line[stern-ramp-ruler-idx=" + vslIdx + "]").empty()) {
      x1 = d3.select("line[stern-ramp-ruler-idx=" + vslIdx + "]").attr('originX1');
      x2 = d3.select("line[stern-ramp-ruler-idx=" + vslIdx + "]").attr('originX2');
      d3.select("line[stern-ramp-ruler-idx=" + vslIdx + "]")
        .attr("x1", parseFloat(x1) + x)
        .attr("x2", parseFloat(x2) + x);
    }

    //Side Ramp
    if (!d3.select("line[side-ramp-ruler-idx=" + vslIdx + "]").empty()) {
      x1 = d3.select("line[side-ramp-ruler-idx=" + vslIdx + "]").attr('originX1');
      x2 = d3.select("line[side-ramp-ruler-idx=" + vslIdx + "]").attr('originX2');
      d3.select("line[side-ramp-ruler-idx=" + vslIdx + "]")
        .attr("x1", parseFloat(x1) + x)
        .attr("x2", parseFloat(x2) + x);
    }

    var startDate = _getVesselDateFromPos(vslTop);
    var endDate = _getVesselDateFromPos(vslBottom);
    // console.log("startDate, endDate: ", startDate, endDate);

    _vslInfo.id = vslIdx;
    _vslInfo.head_position = Common.roundNumber(Common.getPosByBerthDir(_zoomOutWidth(vslHead), _mapWidth, vslInfo.berthDir));
    _vslInfo.eta_date = moment(startDate).format('DD/MM/YYYY HH:mm');
    _vslInfo.etd_date = moment(endDate).format('DD/MM/YYYY HH:mm');
    _updateVesselData();

    console.log("vslTop, vslBottom : ", vslTop, vslBottom);
    _vslDrawInfo.id = vslIdx;
    _vslDrawInfo.vslTop = vslTop;
    _vslDrawInfo.vslLeft = vslLeft;
    _vslDrawInfo.vslRight = vslRight;
    _vslDrawInfo.vslBottom = vslBottom;
  }

  function _updateVesselData() {
    var vslObj = _getVesselById(_vslInfo.id);
    if (vslObj) {
      if (_vslInfo.head_position)
        vslObj.head_position = _vslInfo.head_position;

      if (_vslInfo.mooring_head)
        vslObj.mooring_head = _vslInfo.mooring_head;

      if (_vslInfo.mooring_stern)
        vslObj.mooring_stern = _vslInfo.mooring_stern;

      if (_vslInfo.eta_date)
        vslObj.eta_date = _vslInfo.eta_date;

      if (_vslInfo.etd_date)
        vslObj.etd_date = _vslInfo.etd_date;

      console.log("eta_date: " + vslObj.eta_date, " etd_date: " + vslObj.etd_date);
    }

    _vslInfo.id = null;
    _vslInfo.head_position = null;
    _vslInfo.mooring_head = null;
    _vslInfo.mooring_stern = null;
    _vslInfo.eta_date = null;
    _vslInfo.etd_date = null;
  }

  function _getVesselById(id) {
    return _.find(_vesselData, function (obj) {
      return obj.id == id;
    })
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
    var vslTopOrigin = parseFloat(target.attr('vsl-top-origin'));
    var vslBottomOrigin = parseFloat(target.attr('vsl-bottom-origin'));
    var vslLeftOrigin = parseFloat(target.attr('vsl-left-origin'));
    var vslRightOrigin = parseFloat(target.attr('vsl-right-origin'));

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
      mooringRight: mooringRight,
      vslTopOrigin: vslTopOrigin,
      vslBottomOrigin: vslBottomOrigin,
      vslLeftOrigin: vslLeftOrigin,
      vslRightOrigin: vslRightOrigin
    }
  }

  function _updateVslDrawInfo() {
    var d3Group = $("g.vessel-group[vsl-group-idx=" + _vslDrawInfo.id + "]");
    if (!d3Group) return;

    if (_vslDrawInfo.vslTop != null)
      d3Group.attr('vsl-top', _vslDrawInfo.vslTop);

    if (_vslDrawInfo.vslLeft != null)
      d3Group.attr('vsl-left', _vslDrawInfo.vslLeft);

    if (_vslDrawInfo.vslRight != null)
      d3Group.attr('vsl-right', _vslDrawInfo.vslRight);

    if (_vslDrawInfo.vslBottom != null)
      d3Group.attr('vsl-bottom', _vslDrawInfo.vslBottom);

    if (_vslDrawInfo.vslHeight != null)
      d3Group.attr('vsl-height', _vslDrawInfo.vslHeight);

    if (_vslDrawInfo.vslTopOrigin != null)
      d3Group.attr('vsl-top-origin', _vslDrawInfo.vslTopOrigin);

    if (_vslDrawInfo.vslBottomOrigin != null)
      d3Group.attr('vsl-bottom-origin', _vslDrawInfo.vslBottomOrigin);

    if (_vslDrawInfo.vslLeftOrigin != null)
      d3Group.attr('vsl-left-origin', _vslDrawInfo.vslLeftOrigin);

    if (_vslDrawInfo.vslRightOrigin != null)
      d3Group.attr('vsl-right-origin', _vslDrawInfo.vslRightOrigin);

    _vslDrawInfo.id = null;
    _vslDrawInfo.vslTop = null;
    _vslDrawInfo.vslLeft = null;
    _vslDrawInfo.vslRight = null;
    _vslDrawInfo.vslBottom = null;
    _vslDrawInfo.vslHeight = null;

    _vslDrawInfo.vslTopOrigin = null;
    _vslDrawInfo.vslBottomOrigin = null;
    _vslDrawInfo.vslLeftOrigin = null;
    _vslDrawInfo.vslRightOrigin = null;
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
    var vslTop = eta_number_days * 6 * (gridHeight * 4) + (eta_hh) * gridHeight + distance_ss_top;
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

  function _dragstart(d){
    _dx = null, _dy = null;
  }

  function _dragged(d) {
    if (d3.select(this).attr('drag-stop')) return;
    if (d3.event.x == _currentPoint.x && d3.event.y == _currentPoint.y) {
      console.log("position don't change");
      return;
    }
    _currentPoint.x = d3.event.x;
    _currentPoint.y = d3.event.y;
    _moveVessel(d3.select(this), d3.select(this).attr('vsl-group-idx'), d3.event.x, d3.event.y, true, false, false);
  }

  function _dragended(d) {
    if (d3.select(this).attr('drag-stop')) return;
    if (_dx && _dy) {
      _reCalcVesselInfo(d3.select(this), _dx, _dy, true);
      _updateVslDrawInfo();
      var isError = _checkVesselDupplicate(d3.select(this).attr("vsl-group-idx"));
      if (isError) {
       _showMessage('Notification', "<p>The bitt of vessel berthing position can't be used for another vessel.</p>");
      }
    }
  }

  function _moveVessel(target, vslIdx, dx, dy, isDrag, isUpDown, isLeftRight) {
    var vslInfo = _getVslDrawInfo(vslIdx);
    var left = 0, width = 0, right = 0, top = 0, bottom = 0;
    if (vslInfo) {
      left = vslInfo.vslLeftOrigin - _zoomInWidth(_mooringDistance);
      right = vslInfo.vslRightOrigin + _zoomInWidth(_mooringDistance);
      top = vslInfo.vslTopOrigin;
      bottom = vslInfo.vslBottomOrigin;

      var minPos = _getMinBerthPos();
      var maxPos = _getMaxBerthPos();
      var gridHeight = _timeChange == 30 ? (_zoomInHeight(Common.gridHeight) / 2) : _zoomInHeight(Common.gridHeight);
      var gridY = Math.round(dy / gridHeight) * gridHeight;
      var x = Math.max(-left + minPos, Math.min(maxPos - right, dx));
      var y = Math.max(-top, Math.min(_zoomInHeight(_mapHeight) - bottom, gridY));
      if (isUpDown && y == _dy) return;
      if (isLeftRight && x == _dx) return;

      _dx = x;
      _dy = y;
      if (isDrag || isLeftRight) {
        width = vslInfo.vslWidth + 2 * _zoomInWidth(_mooringDistance);
        var mooringTarget = $("rect[mooring-idx=" + vslIdx + "]");
        var bittLeftText = $("text[mooring-text-left=" + vslIdx + "]");
        if (bittLeftText) bittLeftText.attr('x', left + 2);

        var bittRightText = $("text[mooring-text-right=" + vslIdx + "]");
        if (bittRightText) bittRightText.attr('x', right - 2);

        mooringTarget.attr('x', left);
        mooringTarget.attr('width', width);
      }

      target.attr("transform", function (d) {
        d.x = _dx;
        d.y = _dy;
        console.log("_dy: ", _dy);
        return "translate(" + _dx + "," + _dy + ")";
      });
      _reCalcVesselInfo(target, _dx, _dy, !isUpDown);
      if (isUpDown || isLeftRight) {
        _updateVslDrawInfo();
      }
    }
  }

  function _getTranslateVal(string) {
    var arr = string.substring(string.indexOf("(") + 1, string.indexOf(")")).split(",");
    return {
      x: parseFloat(arr[0]),
      y: parseFloat(arr[1])
    }
  }

  function _moveUpDown(type) {
    if (!_d3VslSelected) return;
    if (_d3VslSelected.attr('vsl-status') != 'P') return;

    var vslIdx = _d3VslSelected.attr('vsl-idx');
    var target = d3.select(".vessel-group[vsl-group-idx=" + vslIdx + "]");
    var translate = _getTranslateVal(target.attr('transform'));
    var dx = translate.x, dy = translate.y;
    var gridHeight = _timeChange == 30 ? (_zoomInHeight(Common.gridHeight) / 2) : _zoomInHeight(Common.gridHeight);
    if (type == _keyCode.down)
      dy += gridHeight;
    else
      dy -= gridHeight;
    _moveVessel(target, vslIdx, dx, dy, false, true, false);
  }

  function _moveLeftRight(type) {
    if (!_d3VslSelected) return;
    if (_d3VslSelected.attr('vsl-status') != 'P') return;

    var movementDistance = _zoomInWidth(_movementDistance);
    var vslIdx = _d3VslSelected.attr('vsl-idx');
    var target = d3.select(".vessel-group[vsl-group-idx=" + vslIdx + "]");
    var translate = _getTranslateVal(target.attr('transform'));
    var dx = translate.x, dy = translate.y;
    if (type == _keyCode.left)
      dx -= movementDistance;
    else
      dx += movementDistance;
    _moveVessel(target, vslIdx, dx, dy, false, false, true);
  }

  function _resizeBottom(d) {
    var vslId = d3.select(this).attr('resize-bottom-idx');
    var vslInfo = _getVslDrawInfo(vslId);
    if (_heightTMP == 0) _heightTMP = vslInfo.vslHeight;
    var target = d3.select('g[vsl-group-idx='+ vslId +']');
    var translate = _getTranslateVal(target.attr('transform'));
    var gridHeight = _timeChange == 30 ? (_zoomInHeight(Common.gridHeight) / 2) : _zoomInHeight(Common.gridHeight);
    var gridY = Math.round(d3.event.y / gridHeight) * gridHeight;
    var vslBottomDraw = d.y = Math.max(vslInfo.vslTop + gridHeight - translate.y, Math.min(_zoomInHeight(_mapHeight), gridY));
    var vslBottom = Math.max(gridY + translate.y, vslInfo.vslTop + gridHeight);
    console.log("vslBottom: ",vslBottom);

    _heightTMP = vslBottom - vslInfo.vslTop;
    d3.select(this).attr("y", function (d) {
      return vslBottomDraw - _dragbarH;
    });

    //Vessel
    if (!d3.select("rect[vsl-idx=" + vslId + "]").empty()) {
      d3.select("rect[vsl-idx=" + vslId + "]")
        .attr("height", _heightTMP - 1);
    }

    //Mooring box
    if (!d3.select("rect[mooring-idx=" + vslId + "]").empty()) {
      d3.select("rect[mooring-idx=" + vslId + "]")
        .attr("height", _heightTMP - 1);
    }

    //Bridge
    if (!d3.select("line[vsl-bridge-idx=" + vslId + "]").empty()) {
      d3.select("line[vsl-bridge-idx=" + vslId + "]").attr("y2", vslBottomDraw);
    }
    if (!d3.select("text[bridge-text=" + vslId + "]").empty()) {
      d3.select("text[bridge-text=" + vslId + "]").attr("y", vslBottomDraw - 5);
    }

    //Head
    var d3Head = d3.select("g[head-idx=" + vslId + "]");
    if (!d3Head.empty()) {
      var triangleTop = vslBottomDraw - _heightTMP / 2 - 13;
      var trxOrigin = d3Head.attr('trxOrigin');
      d3Head.attr("transform", "translate(" + trxOrigin + "," + triangleTop + ")");
    }

    //Mooring text left, right
    if (!d3.select("text[text-left=" + vslId + "]").empty()) {
      d3.select("text[text-left=" + vslId + "]")
        .attr("y", vslBottomDraw - 8)
    }

    if (!d3.select("text[text-right=" + vslId + "]").empty()) {
      d3.select("text[text-right=" + vslId + "]")
        .attr("y", vslBottomDraw - 8);
    }

    //Vessel alongside
    var d3VslAlongside = d3.select("g[vsl-alongside=" + vslId + "]");
    if (!d3VslAlongside.empty()) {
      var alongsideTop = vslBottomDraw - 22;
      var trxOrigin = d3VslAlongside.attr('trxOrigin');
      d3VslAlongside.attr("transform", "translate(" + trxOrigin + "," + alongsideTop + ")");
    }

    //Stern ramp
    if (!d3.select("line[stern-ramp-idx=" + vslId + "]").empty()) {
      d3.select("line[stern-ramp-idx=" + vslId + "]")
        .attr("y1", vslBottomDraw - 3)
        .attr("y2", vslBottomDraw - 3);
    }

    //Side ramp
    if (!d3.select("line[side-ramp-idx=" + vslId + "]").empty()) {
      d3.select("line[side-ramp-idx=" + vslId + "]")
        .attr("y1", vslBottomDraw - 3)
        .attr("y2", vslBottomDraw - 3);
    }

    if (!d3.select("line[vessel-line-bottom-idx=" + vslId + "]").empty()) {
      d3.select("line[vessel-line-bottom-idx=" + vslId + "]")
        .attr('y1', vslBottom)
        .attr('y2', vslBottom);
    }

    $("line.ramp[ruler-line=" + vslId + "]").attr('y2', vslBottomDraw);

    _vslDrawInfo.id = vslId;
    _vslDrawInfo.vslTop = vslBottom - _heightTMP;
    _vslDrawInfo.vslHeight = _heightTMP;
    _vslDrawInfo.vslBottom = vslBottom;
    _vslDrawInfo.vslBottomOrigin = vslBottom - translate.y;

    var endDate = _getVesselDateFromPos(vslBottom);
    _vslInfo.id = vslId;
    _vslInfo.eta_date = null;
    _vslInfo.etd_date = moment(endDate).format('DD/MM/YYYY HH:mm');
  }

  function _resizeTop(d) {
    var vslId = d3.select(this).attr('resize-top-idx');
    var vslInfo = _getVslDrawInfo(vslId);
    if (_heightTMP == 0) _heightTMP = vslInfo.vslHeight;
    var target = d3.select('g[vsl-group-idx='+ vslId +']');
    var translate = _getTranslateVal(target.attr('transform'));
    var oldy = d.y;
    var gridHeight = _timeChange == 30 ? (_zoomInHeight(Common.gridHeight) / 2) : _zoomInHeight(Common.gridHeight);

    var gridY1 = Math.round(d3.event.y / gridHeight) * gridHeight;
    var vslTopDraw = d.y = Math.max(-translate.y, Math.min(vslInfo.vslBottom - gridHeight - translate.y, gridY1));
    // console.log("vslTopDraw: ", vslTopDraw);

    var gridY2 = Math.round(d3.event.y / gridHeight) * gridHeight;
    var vslTop = Math.min(Math.max(gridY2 + translate.y, 0) , vslInfo.vslBottom - gridHeight) ;
    console.log("vslTop: ", vslTop);

    _heightTMP = _heightTMP + (oldy - d.y);
    d3.select(this).attr("y", function (d) {
      return d.y;
    });

    //Vessel
    d3.select("rect[vsl-idx=" + vslId + "]")
      .attr("y", function (d) {
        return vslTopDraw
      })
      .attr("height", _heightTMP - 1);

    //Mooring box
    d3.select("rect[mooring-idx=" + vslId + "]")
      .attr("y", function (d) {
        return vslTopDraw
      })
      .attr("height", _heightTMP - 1);

    //Bridge
    d3.select("line[vsl-bridge-idx=" + vslId + "]").attr("y1", vslTopDraw);

    //Head
    var d3Head = d3.select("g[head-idx=" + vslId + "]");
    if (d3Head) {
      var triangleTop = vslTopDraw + _heightTMP / 2 - 13;
      var trxOrigin = d3Head.attr('trxOrigin');
      d3Head.attr("transform", "translate(" + trxOrigin + "," + triangleTop + ")");
    }

    //vessel code
    d3.select("text[vsl-code=" + vslId + "]").attr("y", vslTopDraw + 14);

    //Vessel Status
    var d3VslStt = d3.select("g[vsl-status=" + vslId + "]");
    if (d3VslStt) {
      var triangleTop = vslTopDraw + 1;
      var trxOrigin = d3VslStt.attr('trxOrigin');
      d3VslStt.attr("transform", "translate(" + trxOrigin + "," + triangleTop + ")");
    }

    //Mooring text left, right
    d3.select("text[mooring-text-left=" + vslId + "]")
      .attr("y", vslTopDraw + 12)
    d3.select("text[mooring-text-right=" + vslId + "]")
      .attr("y", vslTopDraw + 12)

    d3.select("line[vessel-line-top-idx=" + vslId + "]")
      .attr('y1', vslTop)
      .attr('y2', vslTop);

    $("line[ruler-line=" + vslId + "]:not(.ramp)").attr('y2', vslTopDraw);

    _vslDrawInfo.id = vslId;
    _vslDrawInfo.vslTop = vslTop;
    _vslDrawInfo.vslHeight = _heightTMP;
    _vslDrawInfo.vslBottom = vslTop + _heightTMP;
    _vslDrawInfo.vslTopOrigin = vslTop - translate.y;

    var startDate = _getVesselDateFromPos(vslTop);
    _vslInfo.id = vslId;
    _vslInfo.eta_date = moment(startDate).format('DD/MM/YYYY HH:mm');
    _vslInfo.etd_date = null;
  }

  function _vesselResized(d) {
    _vslInfo.head_position = null;
    _vslInfo.mooring_head = null;
    _vslInfo.mooring_stern = null;
    _updateVesselData();
    _updateVslDrawInfo(_vslDrawInfo);

    //Reset data
    _heightTMP = 0;
    $("g.vessel-group").removeAttr('drag-stop');
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
    $("#ruller-left").unbind('mouseenter');
    $("#ruller-left").mouseenter(function () {
      _isRulerLeft = true;
    })
      .mouseleave(function () {
        _isRulerLeft = false;
      });

    $("#map-content").unbind('mouseenter');
    $("#map-content").mouseenter(function () {
      _isMapContent = true;
    })
      .mouseleave(function () {
        _isMapContent = false;
      });

    $("a.zoom-width").unbind('click');
    $("a.zoom-width").click(function () {
      var name = $(this).attr('name');
      if (name == 'btn-zoom-in')
        _applyZoomWidth('zoom-in');
      else
        _applyZoomWidth('zoom-out');
    });

    $("a.zoom-height").unbind('click');
    $("a.zoom-height").click(function () {
      var name = $(this).attr('name');
      if (name == 'btn-zoom-in')
        _applyZoomHeight('zoom-in');
      else
        _applyZoomHeight('zoom-out');
    });

    $(document).unbind('click');
    $(document).on('click', '#map-content', function (e) {
      $("g.vessel-group").removeAttr('drag-stop');
      if (!_isFlag && _d3VslSelected) {
        _d3VslSelected.classed("active", false);
        _d3VslSelected = null;
        _removeBittSelected();
        _hideVesselRuler();
      }
    });

    $(document).unbind('keydown');
    $(document).keydown(function (e) {
      switch (e.keyCode) {
        case _keyCode.esc:
          if (_d3VslSelected) {
            _d3VslSelected.classed("active", false);
            _d3VslSelected = null;
            _removeBittSelected();
            _hideVesselRuler();
          }
          break;
        case _keyCode.down:
        case _keyCode.up:
          _moveUpDown(e.keyCode);
          e.preventDefault();
          break;
        case _keyCode.left:
        case _keyCode.right:
          _moveLeftRight(e.keyCode)
          e.preventDefault();
          break;
      }
    });

    $('a.btn-ok, #btn_close').unbind('click');
    $('a.btn-ok, #btn_close').click(function () {
      $('#dialog-overlay, #dialog-box').hide();
      return false;
    });
  }

  function _enableOrDisableZoom() {
    if (_zoomHeightRate == _zoomHeightMin)
      $(".zoom-height[name='btn-zoom-out']").addClassSVG('disable-link');
    else
      $(".zoom-height[name='btn-zoom-out']").removeClassSVG('disable-link');

    if (_zoomHeightRate == _zoomHeightMax)
      $(".zoom-height[name='btn-zoom-in']").addClassSVG('disable-link');
    else
      $(".zoom-height[name='btn-zoom-in']").removeClassSVG('disable-link');

    if (_zoomWidthRate == _zoomWidthMin)
      $(".zoom-width[name='btn-zoom-out']").addClassSVG('disable-link');
    else
      $(".zoom-width[name='btn-zoom-out']").removeClassSVG('disable-link');

    if (_zoomWidthRate == _zoomWidthMax)
      $(".zoom-width[name='btn-zoom-in']").addClassSVG('disable-link');
    else
      $(".zoom-width[name='btn-zoom-in']").removeClassSVG('disable-link');
  }

  function _getVesselData() {
    return _validateData() ? _vesselData : null;
  }

  function _displayGridDetail(isVisible) {
    _displayLine('grid-detail', isVisible);
    _showGridDetail = isVisible;
  }

  function _displayBridge(isVisible) {
    _displayLine('bridge', isVisible);
    _showBridge = isVisible;
  }

  function _displayRamp(isVisible) {
    _displayLine('ramp', isVisible);
    _showRamp = isVisible;
  }

  function _displayLine(classNm, isVisible) {
    if (isVisible)
      $("line." + classNm + "").removeClassSVG('hide');
    else
      $("line." + classNm + "").addClassSVG('hide');
  }

  function _changeVesselColor(type) {
    _vslColorType = type;
    for (var i = 0; i < _vesselData.length; i++) {
      var vslId = _vesselData[i].id;
      var color = _vesselData[i][type].length > 0 ? _vesselData[i][type] : 'none';
      var target = $("rect[vsl-idx=" + vslId + "]").attr("fill", color);
    }
  }

  function _validateData() {
    return (!_checkValidVslInBerthGroup() && !_checkValidationVessel());
  }

  function _checkValidationVessel() {
    var isError = false;
    var errMsg = "";
    var arrLength = _vesselData.length;
    for (var i = 0; i < arrLength; i++) {
      if (_checkVesselDupplicate(_vesselData[i].id)) {
        isError = true;
        errMsg += _vesselData[i].code + ", ";
      }
    }

    if (isError) _showMessage('Notification', "<p>The bitt of vessel berthing position can't be used for another vessel.</p>" + "<p style='color: red;'>"+errMsg.substr(0,errMsg.length -2)+"</p>");
    return isError;
  }

  function _checkValidVslInBerthGroup() {
    var isError = false, errMsg = "";
    var arrLength = _vesselData.length;
    for (var i = 0; i < arrLength; i++) {
      var item = _vesselData[i];
      if (item.data_error == true) continue;
      var mooringHead = _getBittByIdx(item.mooring_head);
      var mooringStern = _getBittByIdx(item.mooring_stern);
      if (mooringHead && mooringStern) {
        var b1 = _getBerthById(mooringHead.berth_idx);
        var b2 = _getBerthById(mooringStern.berth_idx);
        if (b1.group != b2.group) {
          isError = true;
          errMsg += item.code + ", ";
        }
      }
    }

    if (isError) _showMessage('Notification', "<p>Vessel Position is not valid.</p>"+ "<p>Check Berth Group.</p>" + "<p style='margin-top: 5px;'>" + isError.substr(0, isError.length - 2) + "</p>");
    return isError;
  }

  function _showMessage(msgType, html) {
    console.log("html: ", html);
  }

  function _getBerthByPos(pos) {
    var length = _berthArr.length;
    for (var i = 0; i < length; i++) {
      var left = _berthArr[i].start_postion, right = _berthArr[i].end_position;
      if (( left == 0 ? pos >= left : pos > left) && pos <= right) {
        return _berthArr[i];
      }
    }
  }

  function _getBerthById(id) {
    return _.find(_berthArr, function (obj) {
      return obj.id == id;
    })
  }

  //Popup dialog
  function _showMessage(title,message,type) {
    if (type == "error") {
      $("div.dialog-title").css("background", "red");
      $("div.dialog-content a").css("background", "red");
    }
    else {
      $("div.dialog-title").css("background", "#59A9FD");
      $("div.dialog-content a").css("background", "#59A9FD");
    }

    var maskHeight = $(document).height();
    var maskWidth = $(window).width();
    var dialogTop = (maskHeight / 3) - ($('#dialog-box').height());
    var dialogLeft = (maskWidth / 2) - ($('#dialog-box').width() / 2);

    $('#dialog-overlay').css({height: maskHeight, width: maskWidth}).show();
    $('#dialog-box').css({top: "40%", left: dialogLeft}).show();
    $("#dialog-title").html(title);
    $('#dialog-message').html(message);
  }

  return {
    draw: _draw,
    setMooringDistance: _setMooringDistance,
    setMovementDistance: _setMovementDistance,
    setTimeChange: _setTimeChange,
    getVesselData: _getVesselData,
    displayGridDetail: _displayGridDetail,
    displayBridge: _displayBridge,
    displayRamp: _displayRamp,
    changeVesselColor: _changeVesselColor,
    validateData: _validateData
  }
}());