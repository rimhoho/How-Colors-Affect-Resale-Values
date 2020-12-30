 // set ratio for sapcing and font size
 function _onGetRatio(val, width, height){
    if (width) {
      return val / width;
    } else {
      return val / height;
    }
  }
  // SET RESPONSIVE FIGURE
  const container = document.getElementById('container')
  const _svgNS = "http://www.w3.org/2000/svg";
  const _canvasWidth = Math.floor(window.innerWidth) > 1580 ? 1580 : Math.floor(window.innerWidth)
  const _canvasHeight = Math.floor(window.innerHeight)
  const _clusterNames = {cluster0: 'Black', cluster1:'Grey', cluster2: 'Blue + Grey', cluster3: 'Blue', cluster4: 'Grey + Red', 
                        cluster5: 'Pink', cluster6: 'Orange', cluster7: "Orange + Brown", cluster8: 'Brown', cluster9:'Tan', 
                        cluster10: 'Lemon', cluster11: 'White', cluster12: "Green", cluster13: 'Yellow'}
  const _margin = {gap: _canvasWidth * _onGetRatio(20, _canvasWidth, null), top: _canvasHeight * _onGetRatio(30, null, _canvasHeight), 
                   right: _canvasWidth * _onGetRatio(60, _canvasWidth, null), bottom: _canvasHeight * _onGetRatio(50, null, _canvasHeight), 
                   left: _canvasWidth * _onGetRatio(140, _canvasWidth, null), columnWidth: _canvasWidth * _onGetRatio(170, _canvasWidth, null)};
  const _chart2 = {width: _canvasWidth - _margin.left, height: _canvasHeight * 0.2 * 0.8,
                   bigger_gap: _canvasHeight * _onGetRatio(22, null, _canvasHeight), big_gap: _canvasHeight * _onGetRatio(16, null, _canvasHeight),
                   sm_gap: _canvasHeight * _onGetRatio(12, null, _canvasHeight), smer_gap: _canvasHeight * _onGetRatio(10, null, _canvasHeight),
                   smst_gap: _canvasHeight * _onGetRatio(8, null, _canvasHeight)}
  const _color = {mapLine: "#cccccc", mainBG: "#f9f9f9", subBG: "#f4f4f4", legend: "#484f59", premiumPrice: "#F65E5D", premiumLowPrice: "#0382ed",
                  resaleVolume: "#ffd62c", msrp: "#808080", text: "#303642", greyText: '#a5a5a5', lightGrey: "#d8d8d8", popupBG: "#FDFDFD", blueGrey: "#484f59"}
  const _colorXScale = _canvasWidth - (_margin.left * 2) - _margin.right;
  let colorMapData = [], avgSumOfSold = 0;
  let flag4cluster = true;
  let isHover = false, isToggle = false;

  // READ DATA
  Promise.all([
    d3.csv('data/Yeezy_sales_performace.csv'),
    d3.json('data/deltaE.json')
  ]).then(function([stockX, colorDistance]) {
    // stringify number to be number
    stockX.forEach((d, i) => {
      d.category = [...d.title.matchAll(/(QNTM\s|\d{3}\sMNVN\s|\d{3}\s)+(\w{1}\d{1})*/gm)][0][0].replaceAll(/\s$/gm,'');
      d.shorten_title = d.title.replaceAll(/(adidas\sYeezy\s|Boost|QNTM\s|MNVN\s|\d{3}\s)+(\w{1}\d{1})*/gm, '').replaceAll(/^\s{1,2}|^\s\w*\s$/gm,'');
      d.release_date = d.release_date.replaceAll(/(Release:\s)+/gm, '');
      d.dateddate = new Date(d.release_date)
      d.release_year = d.release_date.split('/')[2];
      d.release_MY = new Date(d.release_date).toDateString().substring(4, 15);
      d.number_of_sales = +d.number_of_sales;
      d.retail_price = +d.retail_price;
      d.average_sale_price = +d.average_sale_price;
      d.trade_range_high = +d.trade_range_high;
      d.trade_range_low = +d.trade_range_low;
      d.number_of_Asks = +d.number_of_Asks;
      d.number_of_Bids = +d.number_of_Bids;
      d.price_premium = +d.price_premium;
      avgSumOfSold += d.number_of_sales;
    })
    // convert with color distance data to stockX
    let maxTradingHigh = 0, maxSoldNum = 0;
    let minAvgResalePrice = 200
    let maxAvgResalePrice = 1000
    let maxNumOfBids = 844
    let maxNumOfAsks = 3278

    colorDistance.filter((obj, index) => {
      avgOfSold = Math.round(avgSumOfSold/stockX.length);
      stockX.forEach((d, i) => {
        if (obj.target == d.title) {
          maxTradingHigh = maxTradingHigh < d.trade_range_high ? d.trade_range_high : maxTradingHigh;
          maxSoldNum = maxSoldNum < d.number_of_sales ? d.number_of_sales : maxSoldNum
          maxAvgResalePrice = d.trade_range_high > maxAvgResalePrice ? d.trade_range_high : maxAvgResalePrice
          minAvgResalePrice = d.trade_range_low < minAvgResalePrice ? d.trade_range_low : minAvgResalePrice
          maxNumOfBids = d.number_of_Bids > maxNumOfBids ? d.number_of_Bids : maxNumOfBids
          maxNumOfAsks = d.number_of_Asks > maxNumOfAsks ? d.number_of_Asks : maxNumOfAsks
          
          colorMapData.push({'range_category': d.category,
                             'shorten_title': d.shorten_title,
                             'title': obj.target,
                             'difference_primary': obj.distance_primary,
                             'difference_highlight': obj.distance_highlight,
                             'range_cluster': obj.cluster,
                             'fullRGB': obj.fullRGB,
                             'primary_color': obj.fullRGB[0].split(' ').map(d => parseInt(d)),
                             'price_premium': d.price_premium,
                             'retail_price': d.retail_price,
                             'thumb_url': d.thumb_url,
                             'product_url': d.product_url,
                             'description': d.description,
                             'release_date': d.release_date,
                             'dateddate': d.dateddate,
                             'release_MY': d.release_MY,
                             'release_year': d.release_year,
                             'number_of_sales': d.number_of_sales,
                             'average_sale_price': d.average_sale_price,
                             'range_trade_high': d.trade_range_high,
                             'range_trade_low': d.trade_range_low,
                             'number_of_Asks': d.number_of_Asks,
                             'number_of_Bids': d.number_of_Bids
                            })
        }
      })
    })
    const _colorMapByPrimaryD = d3.nest()
                                .key(function(d) { return d.range_cluster; })
                                .entries(colorMapData);
    const _colorMapByReleaseD = d3.nest()
                                .key(function(d) { return d.range_cluster; })
                                .sortValues(function(a,b) { return a.dateddate - b.dateddate})
                                .entries(colorMapData);
    function _createUnits4Cluster(mapData) {
      let sumUpGap = 0, sumUpWidth = 0;
      mapData.forEach((dict, i) => {
        const width_value = _canvasWidth * _onGetRatio(66, _canvasWidth, null)
        const gap_value = i != _colorMapByPrimaryD.length - 1 ? _colorMapByPrimaryD[i + 1].values[0].difference_primary : 0
        dict.values.forEach((d, index) => {
          if  (index != 0) {
            var yearCheck = new Date(dict.values[index].dateddate - dict.values[index - 1].dateddate).getUTCFullYear() - 1970 != 1 ? 'yrs' : 'yr' 
            var monthCheck = new Date(dict.values[index - 1].dateddate - dict.values[index].dateddate).getUTCMonth() != 1 ? 'mos' : 'mo' 
            var dayCheck = new Date(dict.values[index - 1].dateddate - dict.values[index].dateddate).getUTCDate() - 1 != 1 ? 'days' : 'day' 
          }
          d.difference_date = index == 0 ? 0 : (new Date(dict.values[index].dateddate - dict.values[index - 1].dateddate).getUTCFullYear() - 1970) * 365 + new Date(dict.values[index - 1].dateddate - dict.values[index].dateddate).getUTCMonth() * 12 + new Date(dict.values[index - 1].dateddate - dict.values[index].dateddate).getUTCDate() - 1 * 0.01
          d.difference_date_str = index == 0 ? '' : `${new Date(dict.values[index].dateddate - dict.values[index - 1].dateddate).getUTCFullYear() - 1970} ${yearCheck}・${new Date(dict.values[index - 1].dateddate - dict.values[index].dateddate).getUTCMonth()} ${monthCheck}・${new Date(dict.values[index - 1].dateddate - dict.values[index].dateddate).getUTCDate() - 1} ${dayCheck}`.replaceAll(/(0\s*yrs)*(0\s*yr)*(・0\s*mos)*/gm, '')
          d.difference_date_str = d.difference_date_str.replaceAll(/(^・)*(・0\s*mos)*(・0\s*mo)*(・0\s*days)*/gm, '')
          if (d.difference_date_str == '') d.difference_date_str = '0 days'
          if (index == 0) {
            sumUpGap += _canvasWidth * _onGetRatio(26, _canvasWidth, null)
            if (i != 0) sumUpWidth += width_value
            else sumUpWidth = 0
            dict.clusterBar = {gap: gap_value, sumUpGap: sumUpGap, width: width_value, sumUpWidth: sumUpWidth}
          }
        })
      })
      return mapData
    }
    const dataPrimaryD = _createUnits4Cluster(_colorMapByPrimaryD)
    const dataReleaseD = _createUnits4Cluster(_colorMapByReleaseD)

    // create svg elements - image, circle, line, rect, tspan, and wraping texts with max width within tspan 
    function _createImage(x, y, id, classes, href, width, height) {
      const image = document.createElementNS(_svgNS, 'image');
            image.setAttribute('x', x);
            image.setAttribute('y',y);
            if (id != null) image.setAttribute('id', id);
            if (classes != null) image.setAttribute('class', classes);
            image.setAttribute('href', href);
            if (width != null) image.setAttribute('width', width);
            if (height != null) image.setAttribute('height', height);
      return image;
    }
    function _createCircle(cx, cy, id, classes, r, color, fillOpacity, stroke, strokeWidth, strokeOpacity) {
      const circle = document.createElementNS(_svgNS, 'circle');
            circle.setAttribute('cx', cx)
            circle.setAttribute('cy', cy);
            if (id != null) circle.setAttribute('id', id);
            if (classes != null) circle.setAttribute('class', classes);
            circle.setAttribute('r', r);
            circle.setAttribute('fill', color);
            if (fillOpacity != null) circle.setAttribute('fill-opacity', fillOpacity);
            if (stroke != null) circle.setAttribute('stroke', stroke);
            if (strokeWidth != null) circle.setAttribute('stroke-width', strokeWidth);
            if (strokeOpacity != null) circle.setAttribute('stroke-opacity', strokeOpacity);
      return circle;
    }
    function _createLine(x1, x2, y1, y2, id, classes, stroke, strokeWidth, strokeOpacity) {
      const line = document.createElementNS(_svgNS, 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('x2', x2);
            line.setAttribute('y1', y1);
            line.setAttribute('y2', y2);
            if (id != null) line.setAttribute('id', id);
            if (classes != null) line.setAttribute('class', classes);
            line.setAttribute("stroke",stroke);
            line.setAttribute('stroke-width', strokeWidth);
            line.setAttribute('stroke-opacity', strokeOpacity);
      return line
    }
    function _createRect(x, y, id, classes, width, height, color) {
      const rect = document.createElementNS(_svgNS, 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            if (id != null) rect.setAttribute('id', id);
            if (classes != null) rect.setAttribute('class', classes);
            rect.setAttribute('width', width);
            rect.setAttribute('height', height);
            rect.setAttribute('fill', color);
      return rect;
    }
    function _createText(x, y, id, classes, textAnchor, dominantBaseline, color, textContent) {
      const text = document.createElementNS(_svgNS, 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            if (id != null) text.setAttribute('id', id);
            if (classes != null) text.setAttribute('class', classes);
            if (textAnchor != null) text.setAttribute('text-anchor', textAnchor);
            if (dominantBaseline != null) text.setAttribute('dominant-baseline', dominantBaseline)
            if (color != null) text.setAttribute('fill', color);
            if (textContent != null) text.textContent = textContent;
      return text
    }
    function _createTspan(x, dy, id, classes, textAnchor, color, textContent) {
      const tspan = document.createElementNS(_svgNS, 'tspan');
            tspan.setAttribute('x', x);
            tspan.setAttribute('dy', dy);
            if (id != null) tspan.setAttribute('id', id);
            if (classes != null) tspan.setAttribute('class', classes);
            if (textAnchor != null) tspan.setAttribute('text-anchor', textAnchor);
            tspan.setAttribute('fill', color);
            tspan.textContent = textContent;
      return tspan;
    }
    function _wrapText2Tspan(bodyTextEl, maxWidth, bodyContext, count4wrap, textColor) {
      var words = bodyContext.length != 1 && bodyContext.split(" ");
      var length = words.length;
      var temp_text = "";
      for (var i = count4wrap; i < length; i++) {
        const previous = temp_text
        temp_text = temp_text + ' ' + words[i]
        bodyTextEl[count4wrap].textContent = temp_text
        bodyTextEl[count4wrap].setAttribute('fill', textColor)
        const maxWidthText = bodyTextEl[count4wrap].getComputedTextLength()
        if (maxWidthText > maxWidth - _margin.left) {
          bodyTextEl[count4wrap].textContent = previous;
          temp_text = words[i];
          count4wrap++;
          _wrapText2Tspan(bodyTextEl, maxWidth, temp_text, count4wrap, textColor)
        }
      }
    }
    function _createStackedText(x, y, context, textAnchor, classes, textColor) {
      const bodyTGroup = document.createElementNS(_svgNS, 'g');
            bodyTGroup.setAttribute('class', 'title-context');
      for (var m = 0; m < context.length; m++) {
          let textX, textY, textClass;
          if (context[m] == 'Price Premium' || context[m] == 'Total Resale Volume' || context[m] == 'Color Difference') {
              textClass = "small-body bold"
              textX = x
              textY = y
              console.log()
          } else if (m == 1 && typeof context[m] == 'number' || m == 1 && context[m].includes('%') || m == 1 && Number(context[m].replace(',',''))) {
              textClass = "thin-biggest-body"
              textX = x
              textY = _margin.top * 0.88
              if (typeof context[m] != 'number' && context[m].includes('%')) textX = _margin.gap * 0.6
          } else if (m == 0) {
              if (classes == "big-body") textClass = "big-body"
              else if (classes == "smallest-body") textClass = "smallest-body"
              else textClass = "small-body"
              textX = x
              textY = y
          } else if (m == 1) {
              textClass = classes
              textX = x
              textY = _margin.top * 0.5
              if (context[m].includes('MSRP:')) textColor = _color.msrp
              else if (context[m].includes('Contrast')) textY = _margin.top * 0.72
          } else if (m == 3) {
              textClass = "smaller-body"
              textX = x
              textY = m * _margin.top * 0.945
              textColor = _color.lightGrey
          } else {
              textClass = "smallest-body"
              textX = x
              textY = m * _margin.top * 0.8
          }
          const bodyTitle = _createText(textX, textY, id = null, textClass, textAnchor, dominantBaseline = null, textColor, context[m])
                bodyTGroup.appendChild(bodyTitle)
        }
      return bodyTGroup
    }

    // create bar charts and the inner elements (legend, yAxis)
    function _createXAxis(maxValue, interval, contentWidth) {
      const xAxisGroup = document.createElementNS(_svgNS, 'g');
            xAxisGroup.setAttribute('id', 'popup-xaXis-group');
            xAxisGroup.setAttribute('transform', `translate(${_margin.right * 2.4}, ${_margin.bottom * 1.4 + _margin.top * 0.4})`)
      // yAxis horizontal line
      const xAxisLine = _createLine(0, contentWidth, _margin.top * 0.6, _margin.top * 0.6, 'xAxis-line', classes = null, _color.text, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
            xAxisGroup.appendChild(xAxisLine)
      // yAxis texts with vertical lines
      const xAxisDesc = _createText(-_margin.gap, _chart2.smer_gap, id = null, 'smallest-body', 'end', 'hanging', _color.lightGrey, '( StockX.com, 12 Mos. )')
            xAxisGroup.appendChild(xAxisDesc)
      let flag = 0;
      for (var i = maxValue; i >= 0; i -= interval) {
        flag ++;
        const startLine = flag % 2 != 0 ? _chart2.sm_gap : _chart2.sm_gap * 1.16
        const endLine = flag % 2 != 0 ? _chart2.big_gap * 1.1 : _chart2.big_gap * 1.1
        const yAxisBar = _createLine(contentWidth * i / maxValue, contentWidth * i / maxValue, startLine, endLine, id = null, 'yAxis',  _color.legend , _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
        const yAxisText = _createText(contentWidth * i / maxValue, _chart2.smst_gap * 0.5, id = null, 'smaller-body', 'middle', dominantBaseline = null, _color.text, `$${i.toLocaleString()}`)
                xAxisGroup.appendChild(yAxisBar)
                if (flag % 2 != 0) xAxisGroup.appendChild(yAxisText)
      }
      return xAxisGroup;
    }
    function _createLegend(target, typeFeature) {
      const legendCopyG = document.createElementNS(_svgNS, 'g');
            legendCopyG.setAttribute('id', 'legend-copy-group');
            legendCopyG.setAttribute('transform', `translate(${0}, ${0})`);
            target.appendChild(legendCopyG)
      const legendBoxG = document.createElementNS(_svgNS, 'g');
            legendBoxG.setAttribute('id', 'legend-box-group');
            target.appendChild(legendBoxG)
      let titleContext, bodyContext, bgX, bgW, bgH, title, legendColor, maxLength;
      if (typeFeature == 'colorDifference') {
            titleContext = ['Filter By', 'Delta E', 'Algorithms']
            bodyContext = 'Delta E is a metric for understanding how the human eye perceives color differences. A sneaker that has a primary color that relatively closes to RGB(0, 0, 0) was selected to applying the first-ever Delta E - Euclidean Distance formula and measuring the distance between the two points in 3D space. Based on the standard perception ranges (0 to 100), the collected Delta E distributions were divided into 11 clusters by 9.43 - The number comes from several tries around ±10 to figure which numbers can be clustered or not.'
            bgX = _canvasWidth - _margin.left - (_margin.columnWidth * 0.6)
            bgW = _margin.columnWidth * 1.566
            bgH = _margin.bottom * 1.76
            title = 'Standard Perception Ranges'
            legendColor = _color.blueGrey
            maxLength = _chart2.width/1.48
            const textFilter = ['0 <= 1.0', '1 ~ 2', '2 ~ 10', '11 ~ 49', '100']
            const textDescription = ['Not perceptible by the human eye',
                                          'Perceptible through close observation',
                                          'Perceptible at a glance',
                                          'Colors are more similar than the opposite',
                                          'Colors are exactly the opposite']
            const legendBG = _createRect(0, 0, id = null, classes = null, bgW, bgH, legendColor)
                  legendBoxG.appendChild(legendBG)
            for (var q = 0; q < 5; q++) {
                  const clusterFilter = _createText(_chart2.big_gap, _chart2.big_gap * 1.2 + (_chart2.sm_gap * q * 1.16), id = null, 'smaller-body', textAnchor = null, dominantBaseline = null, _color.mainBG, textFilter[q])
                        legendBoxG.appendChild(clusterFilter)
                  const clusterDescription = _createText(_margin.right * 1.2, _chart2.big_gap  * 1.2+ (_chart2.sm_gap * q * 1.16), id = null, 'smallest-body', textAnchor = null, dominantBaseline = null, _color.lightGrey, textDescription[q])
                        legendBoxG.appendChild(clusterDescription)
            }
            const titleTxtEl = _createText(bgW, _chart2.sm_gap * -0.4, 'legend-title', 'smallest-body', 'end', dominantBaseline = null, _color.text, title)
                  legendBoxG.appendChild(titleTxtEl)
                  legendBoxG.setAttribute('transform', `translate(${bgX - (_margin.left * 1.1)}, ${_chart2.bigger_gap})`);
            // add external link
            const txt4DeltaE = document.createElementNS(_svgNS, 'text');
                  txt4DeltaE.setAttribute('x', _margin.left * 1.384);
                  txt4DeltaE.setAttribute('y', _margin.bottom)
                  txt4DeltaE.setAttribute('class', 'smaller-body')
                  txt4DeltaE.innerHTML = `<a target="blank" fill="${_color.blueGrey}" class="thin-biggest-body" xlink:href="http://zschuessler.github.io/DeltaE/learn/">٭</a>`
                  // txt4DeltaE.setAttribute('text-decoration', 'underline')
                  legendCopyG.appendChild(txt4DeltaE)
      } else {
            titleContext = ['Sort By', 'Release Date', '']
            bodyContext = 'Sorting by release date on each color cluster map gives the reasonably important fact that the price premium gets lower among the cluster. Only a few sneakers with huge different layouts get higher premium prices than the average of the cluster. Check out 700 V3Alvah sneakers in the “Black” cluster released on Apr 11, 2020. Also, the “White” cluster has two significant sneakers to look at - 700 V2 static released on Dec 29, 2018, and Azael sneakers released on Dec 23, 2019.'
            bgX = _canvasWidth - _margin.left - (_margin.columnWidth * 0.6)
            bgW = _margin.columnWidth * 0.65
            bgH = _margin.bottom * 1.3
            legendColor = _color.lightGrey
            maxLength = _chart2.width/1.05
      }
      // add legend copy - titletext
      for (var m = 0; m < titleContext.length; m++) {
            const textY = m == 0 ? (m + 1.1) * _margin.top : (m + 2) * _chart2.big_gap * 1.09
            const bodyTitle = _createText(_margin.left, textY, id = null, classes, textAnchor = null, dominantBaseline = null, _color.text, titleContext[m])
                  legendCopyG.appendChild(bodyTitle)
      }
      // add legend copy - bodytext
      let count4wrap = 0;
      const bodyText = _createText(0, 0, id = null, 'xAxisLabel', textAnchor = null, dominantBaseline = null, _color.text, textContent = null) 
            bodyText.setAttribute('x', 0)
            bodyText.setAttribute('y', 0)
      for (var i = 0; i < 11; i++) {
            const startY = (i == 0) ? _margin.top * 1.1 : _chart2.big_gap
            const bodyTspan = _createTspan(_margin.left * 2, startY, 'bodyTspan' ,'mideum-body', 'start', _color.text, '')
            bodyText.appendChild(bodyTspan)
            if (i == 0) {
            legendCopyG.appendChild(bodyText)
            } 
      }
      _wrapText2Tspan(bodyText.childNodes, maxLength, bodyContext, count4wrap, _color.text)
    }

    // create init color cluster
    function _createColorChart(target, mapData) {
      if (target == null)  target = document.getElementById('clusterGroup')
      const barGroup = document.createElementNS(_svgNS, 'g');
            barGroup.setAttribute('id', 'barGroup');
            target.appendChild(barGroup)
      const bgGroup = document.createElementNS(_svgNS, 'g');
            bgGroup.setAttribute('id', 'bgGroup');
            target.appendChild(bgGroup)

      // cluster main navigation
      mapData.forEach((dicts, i) => {
        const key = dicts.key
        const colorMapData = dicts.values
        const clusterD = dicts.clusterBar
        // create basic elements - bar, Bg, description texts
        const maxValue4MaxScale = mapData[mapData.length - 1].clusterBar.sumUpGap + mapData[mapData.length - 1].clusterBar.sumUpWidth
        const xScaledSumGap = _colorXScale * clusterD.sumUpGap / maxValue4MaxScale
        const xScaledSumWidth = _colorXScale * clusterD.sumUpWidth / maxValue4MaxScale
        const clusterX = _margin.left + xScaledSumGap + xScaledSumWidth - (clusterD.width/3)
        const clusterBarW = clusterD.width + (clusterD.width/6)
        const clusterTooltipG = document.createElementNS(_svgNS, 'g');
              clusterTooltipG.setAttribute('id', 'tooltip-svg');
        const clusterImgGroup = document.createElementNS(_svgNS, 'g');
              clusterImgGroup.setAttribute('id', 'lined-sneakers');
        let countCluster, arr_countCluster = [];
        clusterD['countCluster'] = dicts.values.reduce((a, b) => a + b.difference_primary, 0) - dicts.values[0].difference_primary;
        // add sneakers images BY toggleOpt
        colorMapData.forEach((d, index) => {
          if (d.range_cluster == key) {
            if (index == 0) countCluster = 0
            else countCluster += d.difference_primary; 
            arr_countCluster.push(countCluster)
            const clusterAlpha = `rgb(${colorMapData[0].fullRGB[0].replaceAll(' ', ', ')})`
            if (index == 0) {
              // add Cluster Bar
              if (colorMapData.length == 1) clusterHeight = colorMapData.length * _chart2.bigger_gap
              else if (colorMapData.length == 2) clusterHeight = colorMapData.length * _chart2.big_gap * 0.8
              else if (colorMapData.length >= 2 && colorMapData.length < 4) clusterHeight = colorMapData.length * _chart2.big_gap * 1.2
              else clusterHeight = colorMapData.length * _chart2.big_gap * 0.4
              const clusteY = _canvasHeight * 0.2 - _margin.top - clusterHeight;
              const clusterBarRect = _createRect(clusterX, clusteY, key, "cluster-bar pointer", clusterBarW, clusterHeight, clusterAlpha)
                    clusterBarRect.setAttribute('rx', _canvasWidth * _onGetRatio(4, _canvasWidth, null))
                    clusterBarRect.setAttribute('ry', _canvasWidth * _onGetRatio(4, _canvasWidth, null))
                    barGroup.appendChild(clusterBarRect);
                    if (mapData[0].values[0].shorten_title != 'Pirate Black 2015') gsap.from(clusterBarRect, {delay: 0.2, duration: 0.6, scaleY: 0, yPercent: 0, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
              // add description texts
              for (var u = 0; u < 2; u++) {    
                if (_clusterNames[key].includes(' + ') && u == 0) {
                  for (var t = 0; t < 2; t++) {
                    const textY = t == 0 ? clusteY - (_chart2.big_gap * 0.88) : clusteY - (_chart2.smst_gap * 0.6)
                    const textTitle = t == 0 ? _clusterNames[key].split(' + ')[0] + ' +' : _clusterNames[key].split(' + ')[1]
                    const ct = _createText(clusterX + (_margin.gap * 0.3), textY, id = null, 'small-body bold', textAnchor = null, dominantBaseline = null, _color.legend, textTitle)
                          target.appendChild(ct)
                    gsap.from(ct, {delay: 0.6, duration: 1.2, opacity: 0, y: -textY + _chart2.height, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
                  }
                } else {
                  const clusterTextY = u == 0 ? clusteY - (_chart2.smst_gap * 0.66) : clusteY + (_chart2.smst_gap * 1.8)
                  const clusterContents = u == 0 ? _clusterNames[key] : colorMapData.length
                  let colorTweek;
                  if (_clusterNames[key] == 'White') colorTweek = u == 0 ? _color.legend : _color.legend
                  else colorTweek = u == 0 ? _color.legend : _color.mainBG
                  const clusterText = _createText(clusterX + (_margin.gap * 0.3), clusterTextY, id = null, 'small-body bold', textAnchor = null, dominantBaseline = null, colorTweek, clusterContents) 
                  if (u == 1) clusterText.setAttribute('class', 'smaller-body');
                  target.appendChild(clusterText);
                  gsap.from(clusterText, {delay: 0.6, duration: 1, opacity: 0, y: -clusterTextY + _chart2.height, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
                }
              }
            }
            if (i == clusterD.length - 1) gsap.from(".cluster-bar", {delay: 0.2, duration: 0.3, scaleY: 0, yPercent: 100, ease: "power1.inOut", stagger: {from: 0, amount: 0.4}});
            
            let sneakersX, clusterBarheight, imageY, tooltipTxt;
            if (mapData[0].values[0].shorten_title != 'Pirate Black 2015') {
              if (index == 0) clusterBarheight = _canvasHeight * _onGetRatio(16.4, null, _canvasHeight) * (clusterD.countCluster + 2)
              imageY = (_chart2.height * 1.1) + (_canvasHeight * _onGetRatio(16, null, _canvasHeight) * countCluster)
              textY = (_chart2.height * 1.22) + (_canvasHeight * _onGetRatio(16, null, _canvasHeight) * (countCluster - (arr_countCluster[index] - arr_countCluster[index - 1])/2))
              tooltipTxt = index != 0 ? d.difference_primary.toFixed(1) : 0
              sneakersX = _margin.left + xScaledSumGap + xScaledSumWidth
              colorBG = _color.mainBG
            } else {
              clusterBarheight = _canvasHeight * _onGetRatio(50, null, _canvasHeight) * (index + 1)
              imageY = (_chart2.height * 1.1) + _canvasHeight * _onGetRatio(50, null, _canvasHeight) * index
              textY = (_chart2.height * 1.27) + _canvasHeight * _onGetRatio(50, null, _canvasHeight) * index
              tooltipTxt = d.release_MY
              sneakersX = _margin.left + xScaledSumGap + xScaledSumWidth + (clusterD.width/1.8)
              colorBG = _color.mainBG
            }
            // add Sneakers Bar
            if (clusterBarheight) {
                  if (colorMapData.length <= 2) clusterBarheight = clusterBarheight + (_margin.top * 0.4)
                  else clusterBarheight = clusterBarheight
                  const clusterLine = _createRect(clusterX, _canvasHeight * 0.2 - (_margin.top * 1.052), id = null, "-bar", clusterBarW, clusterBarheight + (_margin.top * 0.04), clusterAlpha)
                        clusterLine.setAttribute('rx', _canvasWidth * _onGetRatio(4, _canvasWidth, null))
                        clusterLine.setAttribute('ry', _canvasWidth * _onGetRatio(4, _canvasWidth, null))       
                  bgGroup.appendChild(clusterLine)
                        gsap.from(clusterLine, {delay: 1.2, opacity: 0, duration: 1.2, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
                  const clusterSneakersBar = _createRect(clusterX + (_margin.gap * 0.05), _canvasHeight * 0.2 - (_margin.top * 1.052), id = null, "sneakers-bar", clusterBarW - (_margin.gap * 0.1), clusterBarheight, clusterAlpha)
                        clusterSneakersBar.setAttribute('rx', _canvasWidth * _onGetRatio(4, _canvasWidth, null))
                        clusterSneakersBar.setAttribute('ry', _canvasWidth * _onGetRatio(4, _canvasWidth, null)) 
                        bgGroup.appendChild(clusterSneakersBar)
                  const clusterSneakersLine = _createRect(0, _canvasHeight * 0.2 - (_margin.top * 1.052), id = null, "sneakers-above-line", _canvasWidth, _canvasWidth * _onGetRatio(0.5, _canvasWidth, null), _color.legend)
                        bgGroup.appendChild(clusterSneakersLine)      
                        gsap.from([clusterSneakersBar, clusterSneakersLine], {delay: 0.5, duration: 1.2, scaleY: 0, yPercent: 0, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
                        gsap.to(clusterSneakersBar, {delay: 1.2, duration: 1.2, fill: colorBG, ease: "power4.out"})
                  if (mapData[0].values[0].shorten_title != 'Pirate Black 2015') {
                        const gradationBar = _createImage(sneakersX - _margin.gap, _canvasHeight * 0.2 - _margin.top, id = null, "gradation-bar", 'img/gradation-bar.svg', _canvasWidth * _onGetRatio(10, _canvasWidth, null), height = null)
                              gsap.fromTo(gradationBar, {opacity: 0}, {delay: 1.2, duration: 1.2, opacity: 1, scaleY: clusterBarheight/2, transformOrigin: "left top", ease: "power4.out", stagger: {from: 0, amount: 0.1}});
                              clusterTooltipG.appendChild(gradationBar);
                              bgGroup.appendChild(clusterTooltipG);
                  }
                  const legendGroup = document.getElementById('total-legend-group')
                  gsap.fromTo(legendGroup, {opacity: 0}, {delay: 0.4, opacity: 1, duration: 1.2, yPercent: 0, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
            }
            // add sneakers image
            const imageX = mapData[0].values[0].shorten_title != 'Pirate Black 2015' ? clusterX + (_margin.gap * 0.9) : clusterX + (_margin.gap * 0.7)
            const sec1Img = _createImage(imageX, imageY, `_${index}_${d.title}_map`, 'sneakers-inline', `img/${d.title}.png`, _canvasWidth * _onGetRatio(52, _canvasWidth, null), height = null)
                  sec1Img.setAttribute('id', `${key}_${d.title}`)
                  sec1Img.setAttribute('class', 'sneakers-img pointer')      
                  clusterImgGroup.appendChild(sec1Img);
                  gsap.from(sec1Img, {delay: 1.2, duration: 2, opacity: 0, xPercent: -1, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.3}});
            //  add tooltip among cluster
            if (mapData[0].values[0].shorten_title != 'Pirate Black 2015') {
                  const clusterTootipLine = _createLine(sneakersX - (_margin.gap * 1.04), sneakersX - (_margin.gap * 0.5), imageY + (_chart2.bigger_gap * 1.4), imageY + (_chart2.bigger_gap * 1.4), id = null, 'calibration',  _color.legend, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
                        clusterTooltipG.appendChild(clusterTootipLine)
                        gsap.from(clusterTootipLine, {delay: 0.8, opacity: 0, duration: 3, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
              if (index != 0) {
                  const clustertxt1 = _createText(sneakersX - (_margin.gap * 0.8), textY, id = null, 'legend-body', 'middle', 'hanging', _color.text, tooltipTxt) 
                        clusterTooltipG.appendChild(clustertxt1);
                        gsap.from(clustertxt1, {delay: 0.8, opacity: 0, duration: 3, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
              } else {
                  const clustertxt2 = _createText(sneakersX - (_margin.gap * 0.8), _chart2.height * 1.14, id = null, 'legend-body', 'middle', 'hanging', _color.lightGrey, "ΔE") 
                        clusterTooltipG.appendChild(clustertxt2);
                        gsap.from(clustertxt2, {delay: 0.8, opacity: 0, duration: 3, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
              }
            } else {
              const clustertxt2 = _createText(sneakersX - _margin.gap, textY, id = null, 'smallest-body', 'middle', 'hanging', _color.text, tooltipTxt) 
                    clusterTooltipG.appendChild(clustertxt2);
                    gsap.from(clustertxt2, {delay: 1.2, duration: 2, opacity: 0, xPercent: -1, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.3}});
            }
            bgGroup.appendChild(clusterTooltipG);
          }
        })
        target.appendChild(clusterImgGroup);  
      })
      _checkEventOnCluster(mapData)
    }
    function _checkEventOnCluster(mapData) {
      const clusterBar = document.querySelectorAll('.cluster-bar')
      clusterBar.forEach(item => {
        item.addEventListener("click", (e)=> {
          document.getElementById('popup-chart-svg').setAttribute('display', 'block');
          const index = parseInt(e.target.id.replaceAll(/cluster/gi, ''))
          _onInitPopUpChart(mapData[index].values)
        })
      })
      const detailBar = document.querySelectorAll('.sneakers-img')
      detailBar.forEach(item => {
        item.addEventListener("click", (e)=> {
          document.getElementById('detail-vertical-infos-svg').setAttribute('display', 'block');
          const index = parseInt(e.target.id.split('_')[0].replaceAll(/cluster/gi, ''))
          const title = e.target.id.split('_')[1]
          mapData[index].values.forEach(d => {
            const sneakersData = d.title == title && d
            clusterOnClicked = true
            if (sneakersData != false) _onInitDetailVertical(sneakersData)
          })
        })
      })      
    }
    function _checkEventOnToggleBtn(e) {
            const togBody = document.getElementById('toggle-body')
            const toggleTxt1 = document.getElementById('delta-E')
            const toggleTxt2 = document.getElementById('release-date')
            const togCircle = document.getElementById('toggle-circle')
            const naviBar = document.getElementById('navi-bg')
            const topTitle = document.getElementById('top-title')
            const topBody = document.getElementById('top-body')
            const topDollar = document.getElementById('dollar-sign')
            const colorChart1 = document.getElementById('color-chart1')
            const colorChart2 = document.getElementById('color-chart2')
            document.getElementById('popup-chart-svg').setAttribute('display', 'none');
            if (isToggle) {
            colorChart1.setAttribute('display', 'block')
            colorChart2.setAttribute('display', 'none')
            gsap.to(togCircle, {delay: 0.2, duration: 0.9, boxShadow: "0 30px 12px -6px #777", xPercent:0, fill: _color.mainBG, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            gsap.to(togBody, {delay: 0.1, duration: 0.9, fill: _color.lightGrey, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            gsap.to(toggleTxt1, {delay: 0.2, duration: 0.9, opacity: 1, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}});   
            gsap.to(toggleTxt2, {delay: 0.1, duration: 0.5, opacity: 0, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            gsap.to(naviBar, {delay: 0.2, duration: 0.9, fill:_color.blueGrey, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            gsap.to(topTitle, {delay: 0.2, duration: 0.9, fill: _color.mainBG, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}}); 
            gsap.to(topBody, {delay: 0.2, duration: 0.9, fill: _color.lightGrey, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            gsap.to(topDollar, {delay: 0.2, duration: 0.9, opacity: 0.1, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            isToggle = false;
            _removeAllChildNodes(document.getElementById('total-legend-group'));
            _createLegend(document.getElementById('total-legend-group'), 'colorDifference')
            _removeAllChildNodes(clusterGroup);
            _removeAllChildNodes(document.getElementById('detail-chart'));
            _createColorChart(target = null, dataPrimaryD)
            } else {
            colorChart1.setAttribute('display', 'none')
            colorChart2.setAttribute('display', 'block')
            gsap.to(togCircle, {delay: 0.2, duration: 0.9, boxShadow: "0 30px 12px -6px #777", xPercent:252, fill: _color.mapLine, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            gsap.to(togBody, {delay: 0.1, duration: 0.9, fill: _color.blueGrey, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            gsap.to(toggleTxt1, {delay: 0.1, duration: 0.5, opacity: 0, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            gsap.to(toggleTxt2, {delay: 0.2, duration: 0.9, opacity: 1, xPercent:-36, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            gsap.to(naviBar, {delay: 0.2, duration: 0.9, fill: "#e5e5e5", xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}}); 
            gsap.to(topTitle, {delay: 0.2, duration: 0.9, fill: _color.text, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}}); 
            gsap.to(topBody, {delay: 0.2, duration: 0.9, fill: _color.greyText, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
            gsap.to(topDollar, {delay: 0.2, duration: 0.9, opacity: 1, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.2}}); 
            isToggle = true;
            _removeAllChildNodes(document.getElementById('total-legend-group'));
            _createLegend(document.getElementById('total-legend-group'), 'releaseDate')
            _removeAllChildNodes(clusterGroup);
            _removeAllChildNodes(document.getElementById('detail-chart'));
            _createColorChart(target = null, dataReleaseD)
            }
    }

    function _onInitPopUpChart(mapData) {
      const popupWidth = _canvasWidth - (_margin.left * 2)
      // bg
      const popupChart = document.getElementById('popup-chart')
      const sec1RectBg = _createRect(-_margin.left, _canvasHeight * -0.6, 'outside-popup-BG', classes = null, _canvasWidth, _canvasHeight * 1.4, _color.blueGrey)
            sec1RectBg.setAttribute('fill-opacity', 0.38)
            popupChart.appendChild(sec1RectBg);
      const sec1Rect = _createRect(0, 0, 'popup-BG', classes = null, popupWidth, _canvasHeight * 0.4, "white")
            sec1Rect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            sec1Rect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            popupChart.appendChild(sec1Rect);
      const popupMainSvg = document.createElementNS(_svgNS, 'svg');
            popupMainSvg.setAttribute('id', 'popup-main-svg')
            popupMainSvg.setAttribute('width', popupWidth)
            popupMainSvg.setAttribute('height', _canvasHeight * 0.4)
            popupChart.appendChild(popupMainSvg)
      const sec0XBtn = _createImage(_canvasWidth - (_margin.left * 2.32), _margin.top * 0.6, 'x-button-black', "pointer", `img/x-button-black.svg`, _canvasWidth * _onGetRatio(42, _canvasWidth, null), _canvasWidth * _onGetRatio(42, _canvasWidth, null))
            popupChart.appendChild(sec0XBtn);
      // title
      const titleTxt = _createText(_margin.left, _margin.top, id = null, 'thin-biggest-body title-txt', "start", "hanging", _color.text, 'Trading Range')
                  popupMainSvg.appendChild(titleTxt)
      // legend
      const legendGroup = document.createElementNS(_svgNS, 'g');
            legendGroup.setAttribute('id', 'popup-legend-group')
            legendGroup.setAttribute('transform', `translate(${popupWidth - (_margin.left * 3.3) + (_margin.gap * 0.4)}, ${_margin.top * 0.4})`)
            popupMainSvg.appendChild(legendGroup)
      const legendTitle = ['Bar Color', 'Text Color']
      const legendLeft = ['Higher Resale $ than MSRP', 'Lower Resale $ than MSRP']
      for (var t = 0; t < 2; t++) {
            const barLeftColor = t == 1 ? _color.greyText : _color.premiumPrice
            const legendRect = _createRect(t * _margin.left * 1.5 - (_margin.gap * 0.4), _margin.gap * 0.4, 'popup-legend-bar', classes = null, _margin.left * 1.46, _margin.bottom * 0.9, _color.lightGrey)
                  legendRect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
                  legendRect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
                  legendRect.setAttribute('opacity', 0.5);
                  legendGroup.appendChild(legendRect);
            const legendTitleTxt = _createText(t * _margin.left * 1.5, _chart2.big_gap, id = null, 'legend-body bold legend-title-txt', "start", "hanging", _color.text, legendTitle[t])
                  legendGroup.appendChild(legendTitleTxt)
            const legendLeftTxt = _createText(_margin.left * 0.7 * t, _chart2.big_gap * 2.44, id = null, 'legend-body legend-title-txt', "start", "hanging", _color.text, legendLeft[t])
                  legendGroup.appendChild(legendLeftTxt)
            const legendBG = _createRect(_margin.left * 0.7 * t, _chart2.big_gap * 1.8, id = null, classes = null, _margin.gap * 3, _chart2.smst_gap * 0.8, _color.lightGrey)
                  legendGroup.appendChild(legendBG)
            const legendBar = _createRect(_margin.gap * 2.4 + (_margin.left * 0.7 * t), _chart2.big_gap * 1.8, id = null, classes = null, _margin.gap * 2, _chart2.smst_gap * 0.8, barLeftColor)
                  legendGroup.appendChild(legendBar)
      }
      const legendTop = ['Retail Price', 'Lowest', 'Highest']
      const legendBottom = ['(MSRP)', 'Resale Price', 'Resale Price']
      const retailSymbol = _createImage(_margin.left * 1.5, _chart2.big_gap * 2, 'dollar-symbol', "pointer", `img/dollar-symbol.svg`, _canvasWidth * _onGetRatio(11, _canvasWidth, null), height = null)
            legendGroup.appendChild(retailSymbol);
      for (var w = 0; w < 3; w++) {
            const barTxtX = w == 0 ? (_margin.left * 1.5) + (_margin.gap * 0.76) : (_margin.left * 1.65) + (_margin.gap * 2.714) * w
            const barRightColor = w == 1 ? _color.premiumLowPrice : _color.premiumPrice
            const legendRightBar = _createRect((_margin.left * 1.5) + (_margin.gap * 3) * w, _chart2.big_gap * 2.1, id = null, classes = null, _margin.gap * 0.4, _chart2.smst_gap, barRightColor)
                  if (w != 0) legendGroup.appendChild(legendRightBar)
            const legendRightTopTxt = _createText(barTxtX, _chart2.big_gap * 1.8, id = null, 'legend-body legend-title-txt', "start", "hanging", _color.blueGrey, legendTop[w])
            const legendRightBottomTxt = _createText(barTxtX, _chart2.big_gap * 2.4, id = null, 'legend-body legend-title-txt', "start", "hanging", _color.blueGrey, legendBottom[w])
                  legendGroup.appendChild(legendRightTopTxt)
                  legendGroup.appendChild(legendRightBottomTxt)
      }
      // create empty detail-horizontal-info
      const detailSVG = document.createElementNS(_svgNS, 'svg');
            detailSVG.setAttribute('id', 'detail-horizontal-infos-svg');
            detailSVG.setAttribute('width', _canvasWidth);
            detailSVG.setAttribute('height', _canvasHeight * 0.896);
            detailSVG.setAttribute('class', 'top');
            popupChart.appendChild(detailSVG)
      // create bar chart
      _onTweenBarChart(mapData, 'tradingRange')
      // call trigger animation
      const Xbutton = document.getElementById('x-button-black')
      Xbutton.addEventListener("click", (e)=> {
            _removeAllChildNodes(document.getElementById('popup-chart'));
            document.getElementById('popup-chart-svg').setAttribute('display', 'none');
      })
      const outsideBG = document.getElementById('outside-popup-BG')
      outsideBG.addEventListener("click", (e)=> {
            _removeAllChildNodes(document.getElementById('popup-chart'));
            document.getElementById('popup-chart-svg').setAttribute('display', 'none')
      })
    }
    function _onTweenBarChart(mapData) {
      const svgHeight = mapData.length <= 7 ? _canvasHeight * 0.4 - (_margin.bottom * 2) - (_margin.top * 1.2) : mapData.length * (_canvasHeight * _onGetRatio(50, null, _canvasHeight))
      const popupMainSvg = document.getElementById('popup-main-svg')
      const popupWidth = _canvasWidth - (_margin.left * 2) + _margin.gap * 0.5
      const contentWidth = popupWidth - _margin.gap
      const detailWidth  = contentWidth - (_margin.gap * 1.2) - _margin.left
    
      const foreignObject = document.createElementNS(_svgNS, 'foreignObject')
            foreignObject.setAttribute('id', 'foreignObject')
            foreignObject.setAttribute('x', _margin.gap * 0.8)
            foreignObject.setAttribute('y', _margin.bottom * 2.16)
            foreignObject.setAttribute('width', contentWidth - (_margin.gap * 0.8))
            foreignObject.setAttribute('height', _canvasHeight * 0.4 - (_margin.bottom * 2.1) - (_margin.top * 0.5))
            popupMainSvg.appendChild(foreignObject)
      const divContent = document.createElement('div')
            divContent.style.cssText +=';'+ `max-height:${_canvasHeight * 0.4 - (_margin.bottom * 2) - (_margin.top * 0.7)}px; overflow:scroll;`
            foreignObject.appendChild(divContent)
      const popupContentSvg = document.createElementNS(_svgNS, 'svg')
            popupContentSvg.setAttribute('id', 'popup-content-svg')
            popupContentSvg.setAttribute('width', contentWidth - (_margin.gap * 1.2))
            popupContentSvg.setAttribute('height', svgHeight)
            divContent.appendChild(popupContentSvg)
      // group
      const yaXisGroup = document.createElementNS(_svgNS, 'g');
            yaXisGroup.setAttribute('id', 'popup-yaXis-group')
            yaXisGroup.setAttribute('transform', `translate(${_margin.right * 1.8}, ${-_margin.top})`)
            popupContentSvg.appendChild(yaXisGroup)
      // group
      const avgGroup = document.createElementNS(_svgNS, 'g');
            avgGroup.setAttribute('id', 'popup-avgline-group')
            avgGroup.setAttribute('transform', `translate(${_margin.left}, ${-_margin.top})`) 
      // group
      const popUpBarGroup = document.createElementNS(_svgNS, 'g');
            popUpBarGroup.setAttribute('id', 'popup-bar-group')
            popUpBarGroup.setAttribute('transform', `translate(${_margin.right * 2.1}, ${_margin.top * 0.7})`)
            popupContentSvg.appendChild(popUpBarGroup)
      let avgTradingValues = 0;
      // bar chart content
      mapData.forEach((sneakersData, i) => {
            const tradingBarWidth = detailWidth * sneakersData.range_trade_high / maxAvgResalePrice
            const imageStartX = (sneakersData.shorten_title == 'Turtledove') ? (detailWidth * sneakersData.range_trade_high / maxAvgResalePrice) * 0.92 : (detailWidth * sneakersData.range_trade_high / maxAvgResalePrice) * 0.95
            const tradingBarContent = [`$${(sneakersData.retail_price).toLocaleString()}`, `$${(sneakersData.range_trade_low).toLocaleString()}`, `$${(sneakersData.range_trade_high).toLocaleString()}`]
            const barColor = sneakersData.range_trade_high < sneakersData.retail_price ? _color.greyText : _color.premiumPrice
            // add Bar chart
            const popUpPremiumChart = _createRect(0, _margin.top * i * 1.42, id = null, "detail-info-bar-primary", tradingBarWidth, _chart2.big_gap, _color.subBG)
                  popUpBarGroup.appendChild(popUpPremiumChart)  
            const tradingPriceBar = _createRect(detailWidth * sneakersData.range_trade_low / maxAvgResalePrice, _margin.top * i * 1.42, id = null, classes = null, tradingBarWidth - detailWidth * sneakersData.range_trade_low / maxAvgResalePrice, _chart2.big_gap, barColor)
                  popUpBarGroup.appendChild(tradingPriceBar)
            // add Retail Price Symbol
            const popupRetailPriceImg = _createImage((detailWidth * sneakersData.retail_price / maxAvgResalePrice) - (_margin.gap * 0.7), (_margin.top * 0.05) + (_margin.top * i * 1.42), id = null, "retail-symbol", `img/dollar-symbol.svg`, _canvasWidth * _onGetRatio(13, _canvasWidth, null), height = null)
                  popUpBarGroup.appendChild(popupRetailPriceImg)
                  gsap.from(popupRetailPriceImg, {duration: 1, scale:0, ease: "power4.out", stagger: {from: 0, amount: 0.6}});
            // add bar text
            for (var t = 0; t < 3; t++) {
                  let textX, textColor, textAnchorNew;
                  if (t == 0) {
                        textX = detailWidth * sneakersData.retail_price / maxAvgResalePrice
                        textColor = _color.blueGrey
                        textY = (_margin.top * 0.6) + (_margin.top * i * 1.42)
                  } else if (t == 1) {
                        textX = detailWidth * sneakersData.range_trade_low / maxAvgResalePrice
                        textColor = _color.premiumLowPrice
                        textY = (_margin.top * 0.6) + (_margin.top * i * 1.42)
                  } else {
                        textX = detailWidth * sneakersData.range_trade_high / maxAvgResalePrice
                        textColor = _color.premiumPrice
                  }
                  if (t == 0 && sneakersData.range_trade_high < sneakersData.retail_price || t == 0 && sneakersData.range_trade_low < sneakersData.retail_price) textAnchorNew = 'start'
                  else if (t == 0) textAnchorNew ='end'
                  else if (t != 0 && sneakersData.range_trade_high < sneakersData.retail_price) textAnchorNew = 'end'
                  else if (t == 1 && sneakersData.range_trade_low < sneakersData.retail_price) textAnchorNew = 'end'
                  else if (t == 1 || t == 2 && sneakersData.range_trade_high - sneakersData.range_trade_low < _margin.gap) textAnchorNew = 'middle'
                  else textAnchorNew = 'start'
                  const tradingBarTxt = _createText(textX, (_margin.top * 0.6) + (_margin.top * i * 1.42), id = null, "smallest-body", textAnchorNew, 'hanging', textColor, tradingBarContent[t])
                        popUpBarGroup.appendChild(tradingBarTxt)
            }
            const txtStartX = (sneakersData.shorten_title == 'Turtledove') ? imageStartX - (_margin.right * 0.8) : imageStartX + (_margin.right * 1.1)
            const txtStartY = (sneakersData.shorten_title == 'Turtledove') ? (_margin.top * 0.2) + (_margin.top * i * 1.22) : (_margin.top * 0.3) + (_margin.top * i * 1.42)
            const resaleBarContent = _createText(txtStartX, txtStartY, 'avg-major feature-value', 'smallest-body', 'start', dominantBaseline = null, _color.greyText, `Total Resale Vol. ${sneakersData.number_of_sales.toLocaleString()}`) 
                  popUpBarGroup.appendChild(resaleBarContent);
            // add sneakers image
            const popupSneakerImg = _createImage(imageStartX, (_margin.top * -0.76) + (_margin.top * i * 1.42), `${sneakersData.range_cluster}_${sneakersData.title}`, "pop-up-thumnail pointer", `img/${sneakersData.title}.png`, _canvasWidth * _onGetRatio(60, _canvasWidth, null), height = null)
                  popUpBarGroup.appendChild(popupSneakerImg)
                  gsap.from(popupSneakerImg, {duration: 1, x: -txtStartX, ease: "power4.out", stagger: {from: 0, amount: 0.6}});
            // yAxis text
            const txtGroupY = (i == 0) ? _margin.bottom * 1.14 : (_margin.bottom * 1.14) + (_margin.top * i * 1.42)
            const yaXisTxtGroup = _createText(0, txtGroupY, id = null, 'xAxisLabel', textAnchor = null, dominantBaseline = null, _color.text, textContent = null) 
                  yaXisGroup.appendChild(yaXisTxtGroup);

            let yaXisText, yaXisClass, yaXisColor;
            for (var j = 0; j < 2; j++) {
                  if (j == 0) {
                        yaXisText = sneakersData.shorten_title
                        yaXisClass = 'small-body bold yaXisTxt'
                        yaXisColor =_color.text
                  } else {
                        yaXisText = sneakersData.release_MY
                        yaXisClass = 'smallest-body yaXisTxt'
                        yaXisColor =_color.mapLine
                  }
                  const yaXisTxtY = (j == 2) ? (_chart2.sm_gap * j) - _chart2.sm_gap : _chart2.sm_gap * j
                  const yaXisTxt = _createTspan(0, yaXisTxtY, id = null, yaXisClass, 'end', yaXisColor, yaXisText)
                        yaXisTxtGroup.appendChild(yaXisTxt)
            } 
            avgTradingValues += (sneakersData.range_trade_high + sneakersData.range_trade_low) / 2
      })
      // create avg. price premium guideline in dash
      const avgTradingLineX = detailWidth * (avgTradingValues/mapData.length) / maxAvgResalePrice
      const avgTradingtext = _createText(avgTradingLineX + _margin.left, _margin.bottom * 2.36, 'avg-trading-price', 'smallest-body', 'start', dominantBaseline = null, _color.msrp,  `Avg. Trading Price: $${(avgTradingValues/mapData.length).toFixed(0)}`) 
            if (mapData.length !== 1) popupMainSvg.appendChild(avgTradingtext);
      const avg_Tradingline = _createLine(avgTradingLineX, avgTradingLineX, _margin.top * 1.52, (mapData.length + 1) * (_canvasHeight * _onGetRatio(47, null, _canvasHeight)), 'avg_guideline', classes = null, _color.greyText, _canvasWidth * _onGetRatio(0.3, _canvasWidth, null), strokeOpacity = null)
            avg_Tradingline.setAttribute('stroke-dasharray', _margin.gap * 0.1)
            if (mapData.length !== 1) avgGroup.appendChild(avg_Tradingline);
            popupContentSvg.appendChild(avgGroup);
      // xAxis
      const sec2xAxisTxt = _createXAxis(maxTradingHigh + 15, 50, detailWidth)
            popupMainSvg.appendChild(sec2xAxisTxt)
      // default sneakers detail info
      _onInitDetailHorizon(mapData[0])
      // Check sneakers has been clicked - if yes, show detail infos
      const sneakersFromPopup = document.querySelectorAll('.pop-up-thumnail')
      sneakersFromPopup.forEach(item => {
            item.addEventListener("click", (e)=> {
                  const horizontalSVG = document.getElementById('detail-horizontal-infos-svg')
                  _removeAllChildNodes(horizontalSVG)
                  mapData.forEach(dict => {
                        if (dict.title == e.target.id.split('_')[1]) _onInitDetailHorizon(dict)
                  })
            })
      })
    }
    function _onInitDetailVertical(sneakersData) {
      const mouseX = _canvasWidth/2.4 //pageX >= 760 ? pageX - _margin.right - _canvasWidth * _onGetRatio(226, _canvasWidth, null) : pageX + _margin.right
      const mouseY = _canvasHeight/3.2//pageY >= 580 ? pageY - (_margin.bottom * 5.4) : pageY - (_margin.top * 1.1)
      const detailInfos = document.getElementById('detail-vertical-chart')
            detailInfos.setAttribute('transform', `translate(${mouseX}, ${mouseY})`);
      const detailOutBg = document.createElementNS(_svgNS, 'g');
            detailOutBg.setAttribute('id', 'outside-detail-vertical-BG-group');
            detailOutBg.setAttribute('transform', `translate(${-mouseX}, ${-mouseY})`);
            detailInfos.appendChild(detailOutBg)
      const sec0RectBg = _createRect(0, 0, 'outside-detail-vertical-BG', classes = null, _canvasWidth, _canvasHeight * 1.4, _color.blueGrey)
            sec0RectBg.setAttribute('fill-opacity', 0.4)
            detailOutBg.appendChild(sec0RectBg);
      const sec0RectBG1 = _createRect(0, 0, 'detail-vertical-BG1', classes = null, _canvasWidth * _onGetRatio(264, _canvasWidth, null), _canvasHeight * _onGetRatio(588, null, _canvasHeight), `rgb(${sneakersData.fullRGB[0].replaceAll(' ', ', ')})`)
            sec0RectBG1.setAttribute('rx', _canvasWidth * _onGetRatio(12, _canvasWidth, null))
            sec0RectBG1.setAttribute('ry', _canvasWidth * _onGetRatio(12, _canvasWidth, null))
            detailInfos.appendChild(sec0RectBG1);
      const sec0RectBG2 = _createRect(_margin.gap, _margin.bottom , 'detail-vertical-BG2', classes = null, _canvasWidth * _onGetRatio(224, _canvasWidth, null), _canvasHeight * _onGetRatio(516, null, _canvasHeight), "white")
            sec0RectBG2.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            sec0RectBG2.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            detailInfos.appendChild(sec0RectBG2);
      const sec0XSVG = document.createElementNS(_svgNS, 'g');
            sec0XSVG.setAttribute('class', 'top');
            sec0XSVG.setAttribute('transform', `translate(${_canvasWidth * _onGetRatio(226, _canvasWidth, null)}, ${-_margin.bottom})`);
            detailInfos.appendChild(sec0XSVG);
      const sec0XBtn = _createImage(_margin.gap * -0.5, _margin.bottom * 1.1, 'x-vertical-button-white', "pointer", `img/x-button-white.svg`, _canvasWidth * _onGetRatio(42, _canvasWidth, null), _canvasWidth * _onGetRatio(42, _canvasWidth, null))
            sec0XSVG.appendChild(sec0XBtn);
      const colorText = _clusterNames[sneakersData.range_cluster] != "White" ? "white" : _color.lightGrey
      const sec0Text = _createText(_margin.gap, _margin.bottom * 0.64, id = null, "mideum-body", "start", dominantBaseline = null, colorText, `Color Cluster: ${_clusterNames[sneakersData.range_cluster]}`)
            detailInfos.appendChild(sec0Text)
      const secRect1Group = document.createElementNS(_svgNS, 'g')
            secRect1Group.setAttribute('id', 'detail-vertical-content-01')
            secRect1Group.setAttribute('transform', `translate(${_margin.gap * 2}, ${_margin.bottom * 0.9 * 1.8})`);
      const secRect2Group = document.createElementNS(_svgNS, 'g')
            secRect2Group.setAttribute('id', 'detail-vertical-content-02')
            secRect2Group.setAttribute('transform', `translate(${_margin.gap * 2}, ${_margin.bottom * 3.8 * 1.2})`);
      const secRect3Group = document.createElementNS(_svgNS, 'g')
            secRect3Group.setAttribute('id', 'detail-vertical-content-03')
            secRect3Group.setAttribute('transform', `translate(${_margin.gap * 2}, ${_margin.bottom * 6.2 * 1.12})`);
      const secRect4Group = document.createElementNS(_svgNS, 'g')
            secRect4Group.setAttribute('id', 'detail-vertical-content-04')
            secRect4Group.setAttribute('transform', `translate(${_margin.gap * 2}, ${_margin.bottom * 7.56 * 1.1})`);

      const detailWidth  = _canvasWidth * _onGetRatio(180, _canvasWidth, null)
      const sec1leftYTxt = [sneakersData.range_category, sneakersData.shorten_title]
      const sec1rightYTxt = [sneakersData.release_MY, `MSRP: $${sneakersData.retail_price}`]
      const stackedTxtLeft = _createStackedText(0, 0, sec1leftYTxt, "start", "big-body", _color.legend)
      const stackedTxtRight = _createStackedText(detailWidth, 0, sec1rightYTxt, "end", "smaller-body", _color.lightGrey)
      const detailThmnail = _createImage(detailWidth * 0.1, _chart2.sm_gap, id = null, "detail-vertical-info-thmnail", `img/${sneakersData.title}.png`, detailWidth * 0.84,  _canvasHeight * _onGetRatio(125, null, _canvasHeight))
            secRect1Group.appendChild(stackedTxtLeft)
            secRect1Group.appendChild(stackedTxtRight)
            secRect1Group.appendChild(detailThmnail)
      const sec1Rect = _createLine(0,detailWidth, _margin.top, _margin.top, id = null, classes = null,_color.legend, _canvasWidth * _onGetRatio(1, _canvasWidth, null), strokeOpacity = null)
            secRect1Group.appendChild(sec1Rect)
      const sec2leftYTxt = ['Price Premium', `${(sneakersData.price_premium * 100).toFixed(0).toLocaleString()}%`, 'Trading Range (12 Mos.)','']// `$${sneakersData.retail_price}`]
      const sec2rightYTxt = ['', '', '', `$${(maxAvgResalePrice).toLocaleString()}`]
      const sec2middleTxt = [`$${(sneakersData.range_trade_low).toLocaleString()}`, `$${(sneakersData.range_trade_high).toLocaleString()}`]
      const sec2LetfText = _createStackedText(0, 0, sec2leftYTxt, "start", "small-body", _color.text)
            secRect2Group.appendChild(sec2LetfText)
      const sec2RightText = _createStackedText(detailWidth, 0, sec2rightYTxt, "end", "small-body", _color.text)
            secRect2Group.appendChild(sec2RightText)
      const arrowSymbol = (sneakersData.price_premium > 0.01) ? 'arrow_up' : 'arrow_down'
      const detailSymbol = _createImage(0, _chart2.big_gap * 0.6, id = null, "detail-vertical-info-arrow", `img/${arrowSymbol}.svg`, _chart2.smst_gap, height = null)
            secRect2Group.appendChild(detailSymbol)
      const sec2BarBGChart = _createRect(0, _margin.bottom * 1.18, id = null, "detail-vertical-info-bar-bg", detailWidth, _chart2.smer_gap, _color.mapLine)
            secRect2Group.appendChild(sec2BarBGChart)
      for (var t = 0; t < 2; t++) {
            const textX = t == 0 ? detailWidth * sneakersData.range_trade_low / maxAvgResalePrice : detailWidth * sneakersData.range_trade_high / maxAvgResalePrice
            const textAnchorNew = t == 0 ? 'end' : 'start'
            if (t == 0 || t == 1 && sneakersData.range_trade_high != maxAvgResalePrice) {
                  const sec2MddText = _createText(textX, _margin.bottom * 1.7, id = null, "smaller-body bold", textAnchorNew, dominantBaseline = null, _color.premiumPrice, sec2middleTxt[t])
                        secRect2Group.appendChild(sec2MddText)
            }
      }
      const sec2BarGreyRect = _createRect(0, _margin.bottom * 1.18, id = null, "detail-info-bar-grey", detailWidth * sneakersData.retail_price / maxAvgResalePrice, _chart2.smer_gap, _color.msrp)
            secRect2Group.appendChild(sec2BarGreyRect)
      const sec2PremiumChart = _createRect(detailWidth * sneakersData.range_trade_low / maxAvgResalePrice, _margin.bottom * 1.18, id = null, "detail-info-bar-primary", detailWidth * (sneakersData.range_trade_high - sneakersData.range_trade_low) / maxAvgResalePrice, _chart2.smer_gap, _color.premiumPrice)
            secRect2Group.appendChild(sec2PremiumChart)
      const sec2Rect = _createLine(0, detailWidth, _margin.bottom * 1.94, _margin.bottom * 1.94, id = null, "section-divider",_color.mapLine, _canvasWidth * _onGetRatio(0.25, _canvasWidth, null), strokeOpacity = null)
            secRect2Group.appendChild(sec2Rect)

      const sec3leftYTxt = ['Total Resale Volume', `${(sneakersData.number_of_sales).toLocaleString()}`]
      const sec3LetfText = _createStackedText(0, 0, sec3leftYTxt, "start", "small-body", _color.text)
            secRect3Group.appendChild(sec3LetfText)
      const sec3Rect = _createLine(0, detailWidth, _margin.bottom * 3.24, _margin.bottom * 3.24, id = null, "section-divider",_color.mapLine, _canvasWidth * _onGetRatio(0.25, _canvasWidth, null), strokeOpacity = null)
            secRect2Group.appendChild(sec3Rect)
          
      let wordContrast, textXcase;
      if (sneakersData.difference_highlight >= 22) wordContrast = 'High Contrast'
      else if (sneakersData.difference_highlight <= 11) wordContrast = 'Low Contrast'
      else wordContrast = 'Mid Contrast'
      if (sneakersData.difference_highlight.toString().length == 5) textXcase = _margin.gap * 2.54
      else if (sneakersData.difference_highlight.toString().length <= 2) textXcase = _margin.gap * 1.3
      else textXcase = _margin.gap * 2
      const sec4leftYTxt = ['Color Difference', sneakersData.difference_highlight, '0'] // 
      const sec4rightYTxt = ['Base & Highlight', '', '100']
      const bar1Width = detailWidth * sneakersData.difference_highlight / 100
      const sec4LetfText = _createStackedText(0, 0, sec4leftYTxt, "start", "smaller-body", _color.text)
            secRect4Group.appendChild(sec4LetfText)
      const sec4RightText = _createStackedText(detailWidth, 0, sec4rightYTxt, "end", "smallest-body", _color.lightGrey)
            secRect4Group.appendChild(sec4RightText)
      const sec2MddText1 = _createText(textXcase, _margin.top * 0.74, id = null, "smaller-body bold", "start", dominantBaseline = null, _color.text, wordContrast)
            secRect4Group.appendChild(sec2MddText1)
      const colorTextWhite = _clusterNames[sneakersData.range_cluster] != "White" ? `rgb(${sneakersData.fullRGB[0].replaceAll(' ', ', ')})` : _color.lightGrey
      const sec2MddText2 = _createText(bar1Width, _margin.top * 2, id = null, "smaller-body bold", "middle", dominantBaseline = null, colorTextWhite, sneakersData.difference_highlight)
            secRect4Group.appendChild(sec2MddText2)
      const sec4Bar1BGChart = _createRect(0, _margin.top * 1.3, id = null, "detail-info-bar-bg", detailWidth, _chart2.smer_gap, _color.mapLine)
            secRect4Group.appendChild(sec4Bar1BGChart)
      const sec4Bar1Rect = _createRect(0, _margin.top * 1.3, id = null, "detail-info-bar-grey", bar1Width, _chart2.smer_gap, `rgb(${sneakersData.fullRGB[0].replaceAll(' ', ', ')})`)
            secRect4Group.appendChild(sec4Bar1Rect)
      const sec4ImgGroup = document.createElementNS(_svgNS, 'g')
            sec4ImgGroup.setAttribute('transform', `translate(0, ${_margin.bottom * 1.38})`);
            secRect4Group.appendChild(sec4ImgGroup)
      const sec4HighlightImg = _createImage(0, 0, id = null, 'detail-vertical-info-color-code-img', `img/color_shade/${sneakersData.title}_code.png`, _canvasWidth * _onGetRatio(102, _canvasWidth, null),  _canvasHeight * _onGetRatio(58, null, _canvasHeight))
            sec4ImgGroup.appendChild(sec4HighlightImg)
      for (var n = 0; n < 2; n++) {
            const rectColor = n == 0 ? `rgb(${sneakersData.fullRGB[0].replaceAll(' ', ', ')})` : `rgb(${sneakersData.fullRGB[1].replaceAll(' ', ', ')})`
            const rectText = n == 0 ? "Base" : "Highlight"
            const rectHighlightChart = _createRect(_canvasWidth * _onGetRatio(106, _canvasWidth, null), _canvasHeight * _onGetRatio(32, null, _canvasHeight) * n, id = null, "detail-info-color-code", detailWidth / 2 - _margin.gap, _canvasHeight * _onGetRatio(27, null, _canvasHeight), rectColor)
                  sec4ImgGroup.appendChild(rectHighlightChart)
            const colorTextCheck = _clusterNames[sneakersData.range_cluster] != "White" ? "white" : _color.greyText
            const rectBarText = _createText(_canvasWidth * _onGetRatio(102, _canvasWidth, null) + (_margin.gap * 1.9), (_margin.top * 1.1 * n) + _chart2.smst_gap, id = null, "small-body", "middle", "hanging", colorTextCheck, rectText)
                  sec4ImgGroup.appendChild(rectBarText)
      }
      detailInfos.appendChild(secRect1Group)
      detailInfos.appendChild(secRect2Group)
      detailInfos.appendChild(secRect3Group)
      detailInfos.appendChild(secRect4Group)
      const Xbutton = document.getElementById('x-vertical-button-white')
      Xbutton.addEventListener("click", (e)=> {
            _removeAllChildNodes(document.getElementById('detail-vertical-chart'));
            document.getElementById('detail-vertical-infos-svg').setAttribute('display', 'none');
      })
      const detailSvg = document.getElementById('detail-vertical-infos-svg')
      detailSvg.addEventListener("click", (e)=> {
            _removeAllChildNodes(document.getElementById('detail-vertical-chart'));
            document.getElementById('detail-vertical-infos-svg').setAttribute('display', 'none');
      })
    }
    function _onInitDetailHorizon(sneakersData) {
      let txtX, txtY, barWidth;
      const detailMapY = _canvasHeight * 0.42
      const detailMapWidth = _canvasWidth - (_margin.left * 2)
      const detailMapHeight = _canvasHeight * 0.19 - _margin.bottom
      const innerColumnWidth = (detailMapWidth / 4) - _margin.gap// _canvasWidth * _onGetRatio(176, _canvasWidth, null)
      const innerColumnWidthEnd = innerColumnWidth - _margin.gap
      const detailSVG = document.getElementById('detail-horizontal-infos-svg')
      const detailInfos = document.createElementNS(_svgNS, 'g')
            detailInfos.setAttribute('id', 'detail-horizontal-chart')
            detailInfos.setAttribute('transform', `translate(${0}, ${detailMapY})`);
            detailSVG.appendChild(detailInfos)
      const sec1Rect = _createRect(0, 0, id = null, 'detail-horizontal-BG', detailMapWidth, detailMapHeight, _color.text)
            sec1Rect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            sec1Rect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            detailInfos.appendChild(sec1Rect);
      for (var i = 0; i < 4; i++) {
            // grouping four columns
            const secRectGroup = document.createElementNS(_svgNS, 'g')
                  secRectGroup.setAttribute('id', `detail_group_${i+1}`)
                  secRectGroup.setAttribute('transform', `translate(${(_margin.gap * 2) + (i * innerColumnWidth)}, ${_margin.top * 1.24})`);
                  detailInfos.appendChild(secRectGroup)
      }
      // first column 
      const firstGroup = document.getElementById('detail_group_1') 
      const txt1Left = [sneakersData.range_category, sneakersData.shorten_title]
      for (var i = 0; i < 3; i++) {
            const firstClass = i == 1 ? "thin-biggest-body" : "big-body"
            const stackedTxtLeft = _createText(0, _chart2.bigger_gap * i, id = null, firstClass,"start", dominantBaseline=null, _color.lightGrey, txt1Left[i])  
                  firstGroup.appendChild(stackedTxtLeft)    
      }
      const stackedTxtRight = _createText(innerColumnWidthEnd, 0, id = null, "smallest-body", "end", dominantBaseline=null, _color.greyText, sneakersData.release_MY)
            firstGroup.appendChild(stackedTxtRight) 
      const detailThmnail = _createImage(0, _chart2.sm_gap, id = null, "detail-info-thmnail", `img/${sneakersData.title}.png`, innerColumnWidth - _margin.gap,  _canvasHeight * _onGetRatio(160, null, _canvasHeight))
            firstGroup.appendChild(detailThmnail)
      // second column 
      const secondGroup = document.getElementById('detail_group_2') 
      const txt2Left = ['Color Difference', sneakersData.difference_highlight, 'Delta E', '0']
      const txt2Right = ['Base & Highlight', '', '', '100']
      barWidth = innerColumnWidth * sneakersData.difference_highlight / 100;

      for (var i = 0; i < 4; i++) {
            let secClass;
            if (i == 1) secClass = "thin-biggest-body" 
            else if (i == 3) secClass = "smallest-body"
            else secClass = "small-body"
            txtY = i == 1 ? _chart2.bigger_gap * i : _margin.top * 0.94 * i
            const secLetfText = _createText(0, txtY, id = null, secClass, "start", dominatBaseline=null, _color.lightGrey, txt2Left[i])
            const secRightText = _createText(innerColumnWidthEnd, txtY, id = null, "smallest-body", "end", dominatBaseline=null, _color.greyText, txt2Right[i])
            secondGroup.appendChild(secLetfText)
            secondGroup.appendChild(secRightText)
      }
      const secBar1BGChart = _createRect(0, _margin.bottom * 1.24, id = null, "detail-info-bar-bg", innerColumnWidth - _margin.gap, _chart2.big_gap * 0.76, _color.lightGrey)
            secBar1BGChart.setAttribute('opacity', 0.4) 
      const secBar1Rect = _createRect(0, _margin.bottom * 1.24, id = null, "detail-info-bar-grey", barWidth, _chart2.big_gap * 0.76, _color.lightGrey)
      const secMddText = _createText(barWidth, _margin.bottom + (_margin.top * 1.2), id = null, "small-body", "start", dominatBaseline=null, _color.lightGrey, sneakersData.difference_highlight)
            secondGroup.appendChild(secMddText)
      const secImgGroup = document.createElementNS(_svgNS, 'g')
            secondGroup.appendChild(secBar1BGChart)      
            secondGroup.appendChild(secBar1Rect)
            secondGroup.appendChild(secImgGroup) 
      const secHighlightImg = _createImage(0, 0, id = null, 'detail-info-color-code-img', `img/color_shade/${sneakersData.title}_code.png`, innerColumnWidth/2, _margin.top * 1.6)
            secImgGroup.setAttribute('transform', `translate(0, ${_margin.bottom * 2})`);
            secImgGroup.appendChild(secHighlightImg)
      for (var n = 0; n < 2; n++) {
            const rectColor = n == 0 ? `rgb(${sneakersData.fullRGB[0].replaceAll(' ', ', ')})` : `rgb(${sneakersData.fullRGB[1].replaceAll(' ', ', ')})`
            const rectText = n == 0 ? "Base" : "Highlight"
            const rectHighlightChart = _createRect(innerColumnWidth/2 + (_margin.gap * 0.5), _margin.top * 0.8 * n, id = null, "detail-info-color-code", innerColumnWidth/2 - (_margin.gap * 1.5), _canvasHeight * _onGetRatio(24, null, _canvasHeight), rectColor)
                  secImgGroup.appendChild(rectHighlightChart)
            const rectBarText = _createText(innerColumnWidth/2 + (_margin.gap * 0.5) + (innerColumnWidth/2 - (_margin.gap * 1.5))/2, (_margin.top * 0.8 * n) + _chart2.smst_gap, id = null, "smallest-body", "middle", "hanging", "white", rectText)
                  secImgGroup.appendChild(rectBarText)
      }
      // third column 
      const thirdGroup = document.getElementById('detail_group_3')
      const txt3Left = ['Price Premium', `${(sneakersData.price_premium * 100).toFixed(0).toLocaleString()}%`, 'Avg. Resale Price', `$${(minAvgResalePrice).toLocaleString()}`, 'Trading Range', `$${("" + sneakersData.range_trade_low).toLocaleString()}`]
      const txt3Right = [`MSRP: $${sneakersData.retail_price}`, '', '', `$${(maxAvgResalePrice).toLocaleString()}`, '', `$${(maxAvgResalePrice).toLocaleString()}`]
      const txt3Middle = ['', '', '', `$${(sneakersData.retail_price + (sneakersData.retail_price * sneakersData.price_premium)).toFixed(0).toLocaleString()}`, '', `$${("" + sneakersData.range_trade_high).toLocaleString()}`]
      const arrowSymbol = (sneakersData.price_premium > 0.01) ? 'arrow_up' : 'arrow_down'
      for (var i = 0; i < 6; i++) {
            let thirdClass;
            if (i == 1) thirdClass = "thin-biggest-body" 
            else if (i == 3 || i == 5) thirdClass = "smallest-body"
            else thirdClass = "small-body"
            txtX = i == 1 && txt3Left[i].includes('%') ? _margin.gap * 0.58 : 0
            if (i == 1) txtY = _chart2.bigger_gap * i 
            else if (i == 3) txtY = _chart2.bigger_gap * 1.3 * i
            else if (i == 5) txtY = _chart2.bigger_gap * 1.24 * i
            else txtY = _margin.top * 0.9 * i
            const thirdLetfText = _createText(txtX, txtY, id = null, thirdClass, "start", dominatBaseline=null, _color.lightGrey, txt3Left[i])
            const thirdRightText = _createText(innerColumnWidthEnd, txtY, id = null, "smallest-body", "end", dominatBaseline=null, _color.greyText, txt3Right[i])
            thirdGroup.appendChild(thirdLetfText)
            thirdGroup.appendChild(thirdRightText)
      }
      const detailSymbol = _createImage(0, _chart2.smst_gap * 0.8, id = null, "detail-info-arrow", `img/${arrowSymbol}.svg`, _margin.gap * 0.38, height = null)
            thirdGroup.appendChild(detailSymbol)
      for (var m = 0; m < 2; m++) {
            const thirdBarBGChart = _createRect(0, _margin.bottom + (m * _margin.bottom + (_margin.top * 0.42)), id = null, "detail-info-bar-bg", innerColumnWidth - _margin.gap, _chart2.big_gap * 0.76, _color.lightGrey)
                  thirdBarBGChart.setAttribute('opacity', 0.4) 
                  thirdGroup.appendChild(thirdBarBGChart)
            barWidth = m == 0 ? (innerColumnWidth * (sneakersData.retail_price + (sneakersData.retail_price * sneakersData.price_premium)) / maxAvgResalePrice) : innerColumnWidth * sneakersData.range_trade_high / maxAvgResalePrice
            const barWidth2 = m == 0 ? barWidth : innerColumnWidth * sneakersData.range_trade_high / maxAvgResalePrice
            collectText = m == 0 ? txt3Middle[3] : txt3Middle[5]
            const thirdMddText = _createText(barWidth, _margin.bottom + (m * _margin.bottom + (_margin.top * 1.34)), id = null, "small-body", "start", dominatBaseline=null, _color.premiumPrice, collectText)
                  thirdGroup.appendChild(thirdMddText)
            const thirdPremiumChart = _createRect(0, _margin.bottom + (m * _margin.bottom + (_margin.top * 0.42)), id = null, "detail-info-bar-primary", barWidth2, _chart2.big_gap * 0.76, _color.premiumPrice)
                  thirdGroup.appendChild(thirdPremiumChart)
      }
      // fourth column 
      const fourthGroup = document.getElementById('detail_group_4')   
      const txt4left = ['Total Resale Volume', '204', 'Number of Asks',  '', 'Number of Bids', '']
      const txt4right = ['' , '', '', `${(maxNumOfAsks).toLocaleString()}`, '', `${(maxNumOfBids).toLocaleString()}`]
      const txt4middle = ['' , '', '', `${(sneakersData.number_of_Asks).toLocaleString()}`, '', `${(sneakersData.number_of_Bids).toLocaleString()}`]
      for (var i = 0; i < 6; i++) {
            if (i == 1) txtY = _chart2.bigger_gap * i 
            else if (i == 3) txtY = _chart2.bigger_gap * 1.3 * i
            else if (i == 5) txtY = _chart2.bigger_gap * 1.24 * i
            else txtY = _margin.top * 0.9 * i
            const fourthClass = i == 1 ? "thin-biggest-body" : "small-body"
            const fourthLetfText = _createText(0, txtY, id = null, fourthClass, "start", dominatBaseline=null, _color.lightGrey, txt4left[i])
            const fourthRightText = _createText(innerColumnWidthEnd, txtY, id = null, "smallest-body", "end", dominatBaseline=null, _color.greyText, txt4right[i])
                  fourthGroup.appendChild(fourthLetfText)
                  fourthGroup.appendChild(fourthRightText)
      }
      for (var m = 0; m < 2; m++) { 
            bar2Width = m == 0 ? innerColumnWidth * sneakersData.number_of_Asks / maxNumOfAsks : innerColumnWidth * sneakersData.number_of_Bids / maxNumOfBids
            collectText =  m == 0 ? txt4middle[3] : txt4middle[5]
            const fourthBarBGChart = _createRect(0, _margin.bottom + (m * _margin.bottom + (_margin.top * 0.4)), id = null, "detail-info-bar-bg", innerColumnWidth - _margin.gap, _chart2.big_gap * 0.76, _color.lightGrey)
                  fourthBarBGChart.setAttribute('opacity', 0.4)      
                  fourthGroup.appendChild(fourthBarBGChart)
            const fourthMddText = _createText(bar2Width, _margin.bottom + (m * _margin.bottom + (_margin.top * 1.34)), id = null, "small-body", "start", dominatBaseline=null, _color.resaleVolume, collectText)
                  fourthGroup.appendChild(fourthMddText)
            const fourthresaleChart = _createRect(0, _margin.bottom + (m * _margin.bottom + (_margin.top * 0.4)), id = null, "detail-info-bar-primary", bar2Width, _chart2.big_gap * 0.76, _color.resaleVolume)
                  fourthGroup.appendChild(fourthresaleChart)
      }
    }

    // remove children nodes from parent
    function _removeAllChildNodes(parent) {
      while (parent.firstChild) parent.removeChild(parent.firstChild);
    } 
    // init main map + below chart
    function _onInit(){
      if (container) _removeAllChildNodes(container);
      if (document.getElementById('toggle-button'))  _removeAllChildNodes(document.getElementById('toggle-button'));
      // create toggle btn
      const toggleWidth = _canvasWidth * _onGetRatio(106, _canvasWidth, null)
      const naviBar = document.getElementById('navi-bar');
            naviBar.setAttribute('width', _canvasWidth);
            naviBar.setAttribute('height', _canvasHeight * _onGetRatio(70, null, _canvasHeight));
      const naviBg = _createRect(0, 0, 'navi-bg', classes = null, _canvasWidth, _canvasHeight * _onGetRatio(70, null, _canvasHeight), _color.blueGrey)
            naviBar.appendChild(naviBg)
      const colorChart1 = _createImage(-6, 0, 'color-chart1', classes = null, '/img/color-chart.svg', _canvasWidth * _onGetRatio(100, _canvasWidth, null), _canvasHeight * _onGetRatio(77, null, _canvasHeight))  
            colorChart1.setAttribute('display', 'block')
            naviBar.appendChild(colorChart1)
      const colorChart2 = _createImage(-6, 0, 'color-chart2', classes = null, '/img/color-chart-release-date.svg', _canvasWidth * _onGetRatio(100, _canvasWidth, null), _canvasHeight * _onGetRatio(77, null, _canvasHeight))  
            colorChart2.setAttribute('display', 'none')      
            naviBar.appendChild(colorChart2)
      const dollarSign = _createImage(_margin.left * 3.2, 0, 'dollar-sign', classes = null, '/img/dollar.svg', _canvasWidth * _onGetRatio(300, _canvasWidth, null), _canvasHeight * _onGetRatio(76, null, _canvasHeight))    
            dollarSign.setAttribute('opacity', 0.1)      
            naviBar.appendChild(dollarSign)
      const titleCopy = _createText(_margin.left, _margin.top * 1.2, 'top-title', 'title', 'start', dominantBaseline = null, _color.mainBG, 'How Colors Affect Resale Values')
            naviBar.appendChild(titleCopy)
      const bodyCopy = _createText(_margin.left, _margin.top * 1.4, 'top-body', 'smaller-body', 'start', 'hanging', _color.lightGrey, 'Hint: Right next four colors have higher average of the price premium than other clusters.')
            naviBar.appendChild(bodyCopy)
      const togGroup = document.createElementNS(_svgNS, 'g')
            togGroup.setAttribute('transform', `translate(${_canvasWidth - (_margin.left * 0.9) - toggleWidth}, ${_margin.top * 0.6})`);
      const togTxt1 = _createText(_canvasWidth * _onGetRatio(39, _canvasWidth, null), _chart2.big_gap * 1.3, 'delta-E', "smaller-body pointer", "start", dominantBaseline= null, _color.text, 'Delta E (ΔE)')
            togTxt1.setAttribute('opacity', 1)
      const togTxt2 = _createText(_canvasWidth * _onGetRatio(34, _canvasWidth, null), _chart2.big_gap * 1.3, 'release-date', "smaller-body pointer", "start", dominantBaseline= null, _color.mapLine, 'Release Date')
            togTxt2.setAttribute('opacity', 0)
      const togBody = _createRect(0, 0, 'toggle-body',  "pointer", toggleWidth, _canvasHeight * _onGetRatio(36, null, _canvasHeight), _color.lightGrey)
            togBody.setAttribute('rx', _canvasWidth * _onGetRatio(20, _canvasWidth, null))
            togBody.setAttribute('ry', _canvasWidth * _onGetRatio(20, _canvasWidth, null))
      const togCircle = _createCircle(_margin.gap * 1.04, _chart2.big_gap * 1.14, 'toggle-circle', "pointer", _canvasWidth * _onGetRatio(13, _canvasWidth, null), _color.mainBG, "1", stroke=null, _canvasHeight * _onGetRatio(1, null, _canvasHeight), strokeOpacity=null)
            togGroup.appendChild(togBody)
            togGroup.appendChild(togTxt1)
            togGroup.appendChild(togTxt2)
            togGroup.appendChild(togCircle)
            naviBar.appendChild(togGroup)
      //popup bar chart page
      const mainSVG = document.createElementNS(_svgNS, 'svg');
            mainSVG.setAttribute('id', 'popup-chart-svg');
            mainSVG.setAttribute('width', _canvasWidth);
            mainSVG.setAttribute('height', _canvasHeight * 0.896);
            mainSVG.setAttribute('class', 'top');
            mainSVG.setAttribute('display', 'none')
            container.appendChild(mainSVG);
      const popupChart = document.createElementNS(_svgNS, 'g')
            popupChart.setAttribute('id', 'popup-chart')
            popupChart.setAttribute('transform', `translate(${_margin.left}, ${_canvasHeight * 0.192})`);
            mainSVG.appendChild(popupChart)
      // popup detail infos
      const detailSVG = document.createElementNS(_svgNS, 'svg');
            detailSVG.setAttribute('id', 'detail-vertical-infos-svg');
            detailSVG.setAttribute('width', _canvasWidth);
            detailSVG.setAttribute('height', _canvasHeight * 0.896);
            detailSVG.setAttribute('class', 'top');
            detailSVG.setAttribute('display', 'none')
      const detailInfos = document.createElementNS(_svgNS, 'g')
            detailInfos.setAttribute('id', 'detail-vertical-chart')
            detailSVG.appendChild(detailInfos)
            container.appendChild(detailSVG);
      // create init map
      const sec0Svg = document.createElementNS(_svgNS, 'svg');
            sec0Svg.setAttribute('id', 'color-cluster');
            sec0Svg.setAttribute('class', 'bottom');
            sec0Svg.setAttribute('width', _canvasWidth);
            sec0Svg.setAttribute('height', _canvasHeight * 0.85);
            container.appendChild(sec0Svg)
      const sec0Rect = _createRect(0, 0, 'mapBG', classes = null, _canvasWidth,  _canvasHeight * 0.2 - _margin.top, _color.mainBG)
            sec0Svg.appendChild(sec0Rect);
      // const sec0Rect2 = _createRect(0, _canvasHeight * 0.2 - _margin.top, 'mapBG', classes = null, _canvasWidth,  _canvasHeight * 0.8, _color.blueGrey)
      //       sec0Rect2.setAttribute('fill-opacity', 0.8)
      //       sec0Svg.appendChild(sec0Rect2);      
      const sec0G = document.createElementNS(_svgNS, 'g');
            sec0G.setAttribute('transform', `translate(${_margin.left}, 0)`);
      const sec0Line = document.createElementNS(_svgNS, 'path');
            sec0Line.setAttribute('id', 'navigation');
            sec0Line.setAttribute('d', `M${_margin.left} ${_canvasHeight * 0.2 - _margin.top} L${_margin.left + _canvasWidth * _onGetRatio(120, _canvasWidth, null)} ${_canvasHeight * 0.2 - _margin.top} L${_canvasWidth - _margin.left} ${_canvasHeight * 0.2 + _margin.bottom} L${_margin.left} ${_canvasHeight * 0.2 + _margin.bottom} Z`);
            sec0Line.setAttribute('fill', _color.mainBG);
            sec0Line.setAttribute('fill-opacity', '0');
            sec0Svg.appendChild(sec0Line);
      // legend
      const totalLegendG = document.createElementNS(_svgNS, 'g')
            totalLegendG.setAttribute('id', 'total-legend-group')
            sec0Svg.appendChild(totalLegendG)
            _createLegend(totalLegendG, 'colorDifference')
      // create color cluster map
      const clusterGroup = document.createElementNS(_svgNS, 'svg');
            clusterGroup.setAttribute('id', 'clusterGroup'); 
            sec0Svg.appendChild(clusterGroup) 
            _createColorChart(clusterGroup, dataPrimaryD)
      //description - mouse click
      // const descGroup2 = _mouseClickHandler(_canvasWidth * 0.76, _canvasHeight * 0.59)
      //       sec0Svg.appendChild(descGroup2)\
      //       _Tween4DisplayDetails(typeFeature)
      // call animation on each sneakers
      togTxt1.addEventListener("click", _checkEventOnToggleBtn)
      togTxt2.addEventListener("click", _checkEventOnToggleBtn)
      togBody.addEventListener("click", _checkEventOnToggleBtn)
      togCircle.addEventListener("click", _checkEventOnToggleBtn)
  }
       
    // ON WINDOW RESIZE
    window.addEventListener('resize', () => {
      const _canvasWidth = Math.floor(window.innerWidth) > 1366 ? 1366 : Math.floor(window.innerWidth)
      _onInit(colorMapData)
    });
  
    _onInit(colorMapData)
})
    