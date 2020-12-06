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
  const _canvasWidth = Math.floor(window.innerWidth) > 1920 ? 1920 : Math.floor(window.innerWidth)
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
  // const _color = {mapLine: "#CCCCCC", mainBG: "#303642", cluster: "#4766b5", subBG: "#F5F7F6", legend: "#72C285", premiumPrice: "#F65E5D", resaleVolume: "#0382ed", msrp: "#808080", text: "#CCCCCC", greyText: '#8C8C8C'}
  const _color = {mapLine: "#CCCCCC", mainBG: "#f9f9f9", subBG: "#F5F7F6", legend: "#303642", premiumPrice: "#F65E5D", clusterAlpha: "rgba(67,100,203,0.8)", resaleVolume: "#0382ed", msrp: "#808080", text: "#303642", greyText: '#8C8C8C'}
  const _colorXScale = _canvasWidth - (_margin.left * 2) - _margin.right;
  let colorMapData = [], avgSumOfSold = 0;
  let flag4cluster = true;

  // READ DATA
  Promise.all([
    d3.csv('data/Yeezy_sales_performace.csv'),
    d3.json('data/deltaE.json')
  ]).then(function([stockX, colorDistance]) {
    // stringify number to be number
    stockX.forEach((d, i) => {
      d.category = [...d.title.matchAll(/(QNTM\s|\d{3}\sMNVN\s|\d{3}\s)+(\w{1}\d{1})*/gm)][0][0].replaceAll(/\s$/gm,'');
      d.shorten_title = d.title.replaceAll(/(adidas\sYeezy\s|Boost|QNTM\s|\d{3}\s)+(\w{1}\d{1})*/gm, '').replaceAll(/^\s{1,2}|^\s\w*\s$/gm,'');
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
    let  maxTradingHigh = 0, maxSoldNum = 0;
    let minAvgResalePrice = 200
    let maxAvgResalePrice = 1000
    let maxNumOfAsks = 200
    let maxNumOfBids = 1000
  
    colorDistance.filter((obj, index) => {
      avgOfSold = Math.round(avgSumOfSold/stockX.length);
      stockX.forEach((d, i) => {
        if (obj.target == d.title) {
          maxTradingHigh = maxTradingHigh < d.trade_range_high ? d.trade_range_high : maxTradingHigh;
          maxSoldNum = maxSoldNum < d.number_of_sales ? d.number_of_sales : maxSoldNum
          maxAvgResalePrice = d.trade_range_high > maxAvgResalePrice ? d.trade_range_high : maxAvgResalePrice
          minAvgResalePrice = d.trade_range_low < minAvgResalePrice ? d.trade_range_low : minAvgResalePrice
          maxNumOfAsks = d.number_of_Asks > maxNumOfAsks ? d.number_of_Asks : maxNumOfAsks
          maxNumOfBids = d.number_of_Bids > maxNumOfBids ? d.number_of_Bids : maxNumOfBids
          
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
    let sumUpGap1 = 0, sumUpWidth1 = 0;
    _colorMapByPrimaryD.forEach((dict, i) => {
      const width_value = _canvasWidth * _onGetRatio(70, _canvasWidth, null)
      const gap_value = i != _colorMapByPrimaryD.length - 1 ? _colorMapByPrimaryD[i + 1].values[0].difference_primary : 0
      dict.values.forEach((d, index) => {
        if (index == 0) {
          sumUpGap1 += d.difference_primary
          if (i != 0) sumUpWidth1 += width_value
          else sumUpWidth1 = 0
          dict.clusterBar = {gap: gap_value, sumUpGap: sumUpGap1, width: width_value, sumUpWidth: sumUpWidth1}
        }
      })
    })
    let sumUpGap2 = 0, sumUpWidth2 = 0;
    _colorMapByReleaseD.forEach((dict, i) => {
      const width_value = _canvasWidth * _onGetRatio(70, _canvasWidth, null)
      const gap_value = i != _colorMapByPrimaryD.length - 1 ? _colorMapByPrimaryD[i + 1].values[0].difference_primary : 0
      dict.values.forEach((d, index) => {
        if (index == 0) {
          sumUpGap2 += d.difference_primary
          if (i != 0) sumUpWidth2 += width_value
          else sumUpWidth2 = 0
          dict.clusterBar = {gap: gap_value, sumUpGap: sumUpGap2, width: width_value, sumUpWidth: sumUpWidth2}
        }
        d.difference_date = index == 0 ? '' : `${new Date(dict.values[index].dateddate - dict.values[index - 1].dateddate).getUTCFullYear() - 1970} years and ${new Date(dict.values[index - 1].dateddate - dict.values[index].dateddate).getUTCMonth()} months and ${new Date(dict.values[index - 1].dateddate - dict.values[index].dateddate).getUTCDate() - 1} days`.replaceAll(/(0\s*years\sand\s)*(0\s*months\sand\s)*(0\s*days)*/gm, '')
        if (d.difference_date == '') d.difference_date = '0 days'
      })
    })
    console.log(_colorMapByPrimaryD, _colorMapByReleaseD)
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
  
    // create body title text wraping with max value within tspan
    function _createTitleNBodyTxt(target, bodyTitleContext, bodyContext, maxLength, textAnchor, classes, textColor) {
      const bodyTitleGroup = _createStackedText(_margin.left, _margin.top * 1.2, bodyTitleContext, textAnchor, classes, textColor)
      // bodytext
      let count4wrap = 0;
      const bodyText = _createText(0, 0, id = null, 'xAxisLabel', textAnchor, dominantBaseline = null, textColor, textContent = null) 
            bodyText.setAttribute('x', 0)
            bodyText.setAttribute('y', 0)
      for (var i = 0; i < 11; i++) {
        const startY = (i == 0) ? _margin.top * 1.1 : _chart2.big_gap
        const bodyTspan = _createTspan(_margin.left * 2, startY, 'bodyTspan' ,'mideum-body', 'start', textColor, '')
        bodyText.appendChild(bodyTspan)
        if (i == 0) {
          bodyTitleGroup.appendChild(bodyText)
          target.appendChild(bodyTitleGroup)
        } 
      }
      _wrapText2Tspan(bodyText.childNodes, maxLength, bodyContext, count4wrap, textColor)
      return target
    }
    function _createBodyNLegend(target, typeFeature) {
      // title text
      const tradingContxt = ''
      const ResaleContext = ''
      // const bodyColor = typeFeature == 'tradingRange' ? _color.premiumPrice : _color.resaleVolume
      const bodyTitleContext = typeFeature == 'tradingRange' ? ['Black has the', 'highest premium.', 'Grey+Blue is next.'] : ['Black is sold', 'the most.', 'White is next.']
      const bodySubTitleContext = typeFeature == 'tradingRange' ? tradingContxt : ResaleContext
      _createTitleNBodyTxt(target, bodyTitleContext, bodySubTitleContext, _canvasWidth /2, textAnchor = null, "bigger-body", _color.text)
      // legend
      const LTitle = typeFeature == 'tradingRange' ? 'Trading Range' : 'Resale Volume'
      const LSubTitle = '(12 Mos.)'
      const LPrimaryFeature = typeFeature == 'tradingRange' ? 'Price Premium' : 'Number of sales'
      const LSecondaryFeature = typeFeature == 'tradingRange' ? 'Manufacturer Suggested Retail Price' : null
      const LColor = typeFeature == 'tradingRange' ? [_color.premiumPrice, _color.msrp] : [_color.resaleVolume]
      const legendG = _createLegend(LTitle, LSubTitle, LPrimaryFeature, LSecondaryFeature, LColor)
            legendG.setAttribute('display', 'none')
            target.appendChild(legendG)
      return
    }
    function _createStackedText(x, y, context, textAnchor, classes, textColor, i) {
      const bodyTGroup = document.createElementNS(_svgNS, 'g');
            bodyTGroup.setAttribute('class', 'title-context');
      if (typeof context != 'string') {
        for (var m = 0; m < context.length; m++) {
          if (typeof i == 'object' && context[m] != '') {  // ('detail-infos') - Title
          if (m == 1) y = y + (m * _chart2.big_gap)
          else if (m == 3) y = y - 3
          else  y = y + (m * _chart2.smst_gap * 1.2)
          const textClas = m == 0 || m == 1 ? "bigger-body" : "small-body"
          // const textCol = m == 0 || m == 1 ? "white" : _color.greyText
          const bodyTitle = _createText(x, y, id = null, textClas, textAnchor, dominantBaseline = null, _color.greyText, context[m])
                bodyTGroup.appendChild(bodyTitle)
          } else if (i == 1 && m == 1 || i == 2 && m == 1 || i == 3 && m == 1) { // ('detail-infos') - Big thin Number
            const newx = i == 2 ? (_margin.gap * 0.6) : x
            const bodyTitle = _createText(newx, y + (_chart2.big_gap * 2), id = null, "thin-biggest-body", textAnchor, dominantBaseline = null, "white", context[m])
                  bodyTGroup.appendChild(bodyTitle)
          } else if (typeof i == 'undefined') { // ('sneakersMap) -Title
            y = m == 1 ? y + (m * _chart2.big_gap) : y + (m * _chart2.smst_gap * 1.104)
            const bodyBody = _createText(x, y, id = null, classes, textAnchor, dominantBaseline = null, textColor, context[m])
                  bodyTGroup.appendChild(bodyBody)
          } else {
            // console.log(i, m, context[m])
            const newGap = m == 3 || m == 5 ? m * _margin.top * 1.1 : m * _margin.top * 1.05  
            const bodyBody = _createText(x, y + newGap, id = null, "small-body", textAnchor, dominantBaseline = null, textColor, context[m])
                bodyTGroup.appendChild(bodyBody)
          }
        }
      } else {
        const bodyBody = _createText(x, y + (_margin.top * 0.93), id = null, "small-body", textAnchor, dominantBaseline = null, textColor, context)
              bodyTGroup.appendChild(bodyBody)
      }
      return bodyTGroup
    }
    // create bar charts and the inner elements (legend, yAxis)
    function _createYAxis(maxValue, interval, yScalText, typeFeature) {
      let yAxisColor, startText, description;
      if (typeFeature == '') {
        yAxisColor = _color.greyText;
        startText = _chart2.smer_gap * 0.8
        description = 'Trading Range ($)'
      } else {
        yAxisColor = _color.resaleVolumeTxt
        startText = _chart2.sm_gap * 1.1
        description = 'Resale (Volume)'
      }
      // yAxis bar
      const yAxisGroup = document.createElementNS(_svgNS, 'g');
            yAxisGroup.setAttribute('id', 'yAxis');
      // yAxis text
      const yAxisTextEl = _createText(0, 0, id = null, 'yAxisText', textAnchor = null, dominantBaseline = null, color = null, textContent = null)
      const yAxisDesc = _createText(_margin.left * 0.97, _chart2.height, id = null, 'smaller-body', 'end', 'hanging', color = null, description)
      let flag = 0;
      for (var i = maxValue; i >= 0; i -= interval) {
        flag ++;
        const newDy = flag == 2 ? startText : yScalText
        const colorLine = flag % 2 != 0 ?  _color.mapBG : _color.mapLine
        const yAxisBar = _createLine(_margin.left, _margin.left * 1.04, _chart2.height * i / maxValue, _chart2.height * i / maxValue, id = null, 'yAxis',  colorLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
        const yAxisTspan = _createTspan(_margin.left * 0.97, newDy, id = null, 'smaller-body', 'end', yAxisColor, i.toLocaleString())
                yAxisGroup.appendChild(yAxisBar)
                if (flag % 2 == 0) yAxisTextEl.appendChild(yAxisTspan)
      }
      yAxisGroup.appendChild(yAxisDesc)
      yAxisGroup.appendChild(yAxisTextEl)
      return yAxisGroup;
    }
    function _createLegend(title, subTitle, primaryLegend, secondaryLegend, LegendColor) {
      const bgX = (secondaryLegend != null) ? _canvasWidth - _margin.left - _margin.columnWidth : _canvasWidth - _margin.left - (_margin.columnWidth * 0.6)
      const bgW = (secondaryLegend != null) ? _margin.columnWidth : (_margin.columnWidth * 0.65)
      const bgH = (secondaryLegend != null) ? _margin.bottom * 1.56 : _margin.bottom * 1.3
  
      const legendG = document.createElementNS(_svgNS, 'g');
            legendG.setAttribute('id', 'legend')
      const legendBG = _createRect(0, 0, id = null, classes = null, bgW, bgH, "rgba(255, 255, 255, 0.88)")
            legendG.appendChild(legendBG)
      const textEl = _createText(0, 0, id = null, 'legendText', textAnchor = null, dominantBaseline = null, color = null, textContent = null)
      const tspan1El1 = _createTspan(bgW - _margin.gap/2, _chart2.bigger_gap, id = null, 'small-body bold', 'end', _color.text, title)
            textEl.appendChild(tspan1El1)
  
      if (subTitle == null && primaryLegend == null && secondaryLegend == null) {
        legendG.setAttribute('transform', `translate(${bgX - (_margin.left*1.1)}, ${_chart2.sm_gap})`);
        legendBG.setAttribute('width', _margin.columnWidth * 1.566)
        legendBG.setAttribute('height', _margin.bottom * 1.76)
        legendBG.setAttribute('fill', LegendColor)
  
        const textFilter = ['0 <= 1.0', '1 ~ 2', '2 ~ 10', '11 ~ 49', '100']
        const textDescription = ['Not perceptible by the human eye',
                                 'Perceptible through close observation',
                                 'Perceptible at a glance',
                                 'Colors are more similar than the opposite',
                                 'Colors are exactly the opposite']
        for (var q = 0; q < 5; q++) {
          const clusterFilter = _createText(_chart2.big_gap, _chart2.big_gap * 1.2 + (_chart2.sm_gap * q * 1.16), id = null, 'smaller-body', textAnchor = null, dominantBaseline = null, "white", textFilter[q])
                legendG.appendChild(clusterFilter)
          const clusterDescription = _createText(_margin.right * 1.2, _chart2.big_gap  * 1.2+ (_chart2.sm_gap * q * 1.16), id = null, 'smaller-body', textAnchor = null, dominantBaseline = null, _color.greyText, textDescription[q])
                legendG.appendChild(clusterDescription)
        }
      } else {
        legendG.setAttribute('transform', `translate(${bgX}, ${_chart2.sm_gap})`);
        const tspan2El1 = _createTspan(bgW - _margin.gap/2, _chart2.sm_gap, id = null, 'smaller-body', 'end', _color.text, subTitle)
              textEl.appendChild(tspan2El1) 
        const legendRext1 = _createRect(bgW - _margin.gap, _chart2.bigger_gap * 1.9, id = null, classes = null, _margin.gap/2, _margin.gap/2, LegendColor[0])
              legendG.appendChild(legendRext1)
        const tspan3El1 = _createTspan(bgW - (_margin.gap * 1.1), _chart2.big_gap, id = null, 'smaller-body', 'end', _color.text, primaryLegend)
              textEl.appendChild(tspan3El1)
        if (secondaryLegend != null) {
          const legendRext2 = _createRect(bgW - _margin.gap, _chart2.bigger_gap * 2.5, id = null, classes = null, _margin.gap/2, _margin.gap/2, LegendColor[1])
                legendG.appendChild(legendRext2)
          const tspan4El1 = _createTspan(bgW - (_margin.gap * 1.1), _chart2.sm_gap , id = null, 'smaller-body', 'end', _color.text, secondaryLegend)
                textEl.appendChild(tspan4El1)
        }
        legendG.appendChild(textEl)
      }
      return legendG;
    }
    function _createBarChart(target, c) {
      const newShortentitle = ['','',''];
      for (var i = 1; i <= c; i++) {
        const barG = document.createElementNS(_svgNS, 'g');
              barG.setAttribute('id', `BarGroup${i}`);
              barG.setAttribute('transform', `translate(${0}, ${0})`);
        // bar
        const barBg = _createRect(0, 0, id = null, 'bottom_bar', 0, 0, _color.mapBG)
              barG.appendChild(barBg)
        const barMsrp = _createRect(0, 0, id = null, 'second_bar', 0, 0, _color.msrp)
              barG.appendChild(barMsrp)
        const barPremium = _createRect(0, 0, id = null, 'first_bar', 0, 0, _color.premiumPrice)
              barG.appendChild(barPremium)
        // bar text
        const barTextEl1 = _createText(0, 0, id = null, 'barText small-body', 'middle', 'hanging', 'white', '') 
              barG.appendChild(barTextEl1)
        // if (typeFeature == "tradingRange") {
        //   const barTextEl2 = _createText(0, 0, id = null, 'barText small-body', 'middle', 'hanging', _color.premiumPrice, '') 
        //         barG.appendChild(barTextEl2)
        //   const barTextEl3 = _createText(0, 0, id = null, 'barText small-body', 'middle', 'hanging','white', '')
        //         barG.appendChild(barTextEl3)
        // } 
        // sneakers name
        const xAxisTextEl = _createText(0, 0, id = null, 'xAxisLabel', textAnchor = null, dominantBaseline = null, color = null, textContent = null) 
        newShortentitle.forEach((item, i) => {
        const xAxisTspan1 = _createTspan(0, 0, id = null, 'small-body bold', 'start', _color.text, item)
              xAxisTextEl.appendChild(xAxisTspan1)
        })
        const xAxisTspan2 = _createTspan(0, 0, id = null, 'smaller-body', 'start', _color.greyText, "")
              xAxisTextEl.appendChild(xAxisTspan2)
        const xAxisTspan3 = _createTspan(0, 0, id = null, 'smaller-body', 'start', _color.greyText, "")
              xAxisTextEl.appendChild(xAxisTspan3)
        const barImg = _createImage(0, 0, id = null, classes = null,'', 0, height = null)
              barG.appendChild(xAxisTextEl)
              barG.appendChild(barImg)
              target.appendChild(barG);
      }
    }

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
        const xScaledGap = _colorXScale * clusterD.gap / maxValue4MaxScale
        const xScaledSumGap = _colorXScale * clusterD.sumUpGap / maxValue4MaxScale
        const xScaledWidth = _colorXScale * clusterD.width / maxValue4MaxScale
        const xScaledSumWidth = _colorXScale * clusterD.sumUpWidth / maxValue4MaxScale
        const clusterX = _margin.left + xScaledSumGap + xScaledSumWidth
        const clusterBarW = clusterD.width
        const clusterTooltipG = document.createElementNS(_svgNS, 'g');
              clusterTooltipG.setAttribute('id', 'tooltip-svg');
        const clusterImgGroup = document.createElementNS(_svgNS, 'g');
              clusterImgGroup.setAttribute('id', 'lined-sneakers');
        let countCluster;
        // add sneakers images BY toggleOpt
        colorMapData.forEach((d, index) => {
          if (d.range_cluster == key) {
            if (index == 0) countCluster = 3
            else countCluster += d.difference_primary;
            const clusterAlpha =  `rgba(${colorMapData[0].fullRGB[0].replaceAll(' ', ', ')}, 0.92)`
            if (index == 0) {
              // add Cluster Bar
              if (colorMapData.length == 1) clusterHeight = colorMapData.length * _chart2.bigger_gap
              else if (colorMapData.length == 2) clusterHeight = colorMapData.length * _chart2.big_gap * 0.8
              else if (colorMapData.length >= 2 && colorMapData.length < 4) clusterHeight = colorMapData.length * _chart2.big_gap * 1.2
              else clusterHeight = colorMapData.length * _chart2.big_gap * 0.4
              const clusteY = _canvasHeight * 0.2 - _margin.top - clusterHeight;
              const clusterBarRect = _createRect(clusterX, clusteY, id = null, "cluster-bar", clusterBarW, clusterHeight, clusterAlpha)
                    clusterBarRect.setAttribute('rx', _canvasWidth * _onGetRatio(4, _canvasWidth, null))
                    clusterBarRect.setAttribute('ry', _canvasWidth * _onGetRatio(4, _canvasWidth, null))
                    bgGroup.appendChild(clusterBarRect);
                    gsap.from(clusterBarRect, {delay: 0.4, duration: 0.6, scaleY: 0, yPercent: 0, ease: "power4.out", stagger: {from: 0, amount: 0.2}});
              // add description texts
              for (var u = 0; u < 2; u++) {    
                if (_clusterNames[key].includes(' + ') && u == 0) {
                  for (var t = 0; t < 2; t++) {
                    const textY = t == 0 ? clusteY - (_chart2.big_gap * 0.88) : clusteY - (_chart2.smst_gap * 0.6)
                    const textTitle = t == 0 ? _clusterNames[key].split(' + ')[0] + ' +' : _clusterNames[key].split(' + ')[1]
                    const ct = _createText(clusterX + (_margin.gap * 0.3), textY, id = null, 'smaller-body', textAnchor = null, dominantBaseline = null, _color.text, textTitle)
                          target.appendChild(ct)
                    gsap.from(ct, {delay: 0.8, duration: 1.2, opacity: 0, y: -textY + _chart2.height, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
                  }
                } else {
                  const clusterTextY = u == 0 ? clusteY - (_chart2.smst_gap * 0.66) : clusteY + (_chart2.smst_gap * 1.8)
                  const clusterContents = u == 0 ? _clusterNames[key] : colorMapData.length
                  let colorTweek;
                  if (_clusterNames[key] == 'White') colorTweek = u == 0 ? _color.text : _color.text
                  else colorTweek = u == 0 ? _color.text : _color.mainBG
                  const clusterText = _createText(clusterX + (_margin.gap * 0.3), clusterTextY, id = null, 'smaller-body', textAnchor = null, dominantBaseline = null, colorTweek, clusterContents) 
                  if (u == 1) clusterText.setAttribute('class', 'smaller-body');
                  target.appendChild(clusterText);
                  gsap.from(clusterText, {delay: 0.8, duration: 1, opacity: 0, y: -clusterTextY + _chart2.height, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
                }
              }
              // add tooltip for longer distance change
              if (i != mapData.length - 1) { // bar count : 12, gap count: 11 (so don't count the last one for gap spacing)
              const clusterX4Tooltip = _canvasWidth < 1300 ? clusterX + xScaledWidth : clusterX + xScaledWidth - (_margin.gap)
              const startEndX = i == 3 || i == 14 ? clusterX4Tooltip + (xScaledGap * 0.7) : clusterX4Tooltip + (xScaledGap * 0.005)
              const scaleArrow = _canvasWidth < 1300 ? _canvasWidth * _onGetRatio(34, _canvasWidth, null) : _canvasWidth * _onGetRatio(54, _canvasWidth, null)
                  const clusterArrowStart = _createImage(clusterX4Tooltip, _canvasHeight * 0.171, id = null, "tooltip-svg", `img/arrow-start.svg`, scaleArrow, height = null)
                      clusterTooltipG.appendChild(clusterArrowStart);
                  const clusterArrowEnd = _createImage(startEndX, _canvasHeight * 0.171, id = null, "tooltip-svg", `img/arrow-end.svg`, scaleArrow, height = null)
                      clusterTooltipG.appendChild(clusterArrowEnd);
                  const clusterTootipImg1 = _createImage(clusterX4Tooltip, _canvasHeight * 0.18, id = null, "tooltip-svg", `img/tooltip.svg`, _canvasWidth * _onGetRatio(40, _canvasWidth, null), height = null)
                      // clusterTooltipG.appendChild(clusterTootipImg1);
                  const clustertxt1 = _createText(clusterX4Tooltip + (xScaledGap * 0.8), _canvasHeight * 0.18, id = null, 'smaller-body bold', 'start', 'hanging', _color.legend, textContent = clusterD.gap) 
                      clusterTooltipG.appendChild(clustertxt1);
                      gsap.from([clusterArrowStart, clusterArrowEnd], {delay: 0.52, opacity: 0, duration: 0.2, scaleY: 0, yPercent: 10, ease: "power4.out"});   
                      gsap.from([clusterTootipImg1, clustertxt1], {delay: 0.52, opacity: 0, duration: 0.9, scaleY: 0, yPercent: 10, ease: "power4.out", stagger: {from: 0, amount: 0.4}});   
              }
            }
            if (i == clusterD.length - 1) gsap.from(".cluster-bar", {delay: 0.39, duration: 0.3, scaleY: 0, yPercent: 100, ease: "power1.inOut", stagger: {from: 0, amount: 0.4}});
            // add Sneakers Bar
            if (index == colorMapData.length - 1) {
              const clusterBarheight = _canvasHeight * _onGetRatio(16.2, null, _canvasHeight) * countCluster
              const clusterSneakersBar = _createRect(clusterX, _canvasHeight * 0.2 - _margin.top, id = null, "sneakers-bar", clusterD.width, clusterBarheight, clusterAlpha)
                    clusterSneakersBar.setAttribute('rx', _canvasWidth * _onGetRatio(4, _canvasWidth, null))
                    clusterSneakersBar.setAttribute('ry', _canvasWidth * _onGetRatio(4, _canvasWidth, null)) 
                    bgGroup.appendChild(clusterSneakersBar)
                    gsap.from(clusterSneakersBar, {delay: 0.7, duration: 1.2, scaleY: 0, yPercent: 0, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
                    gsap.to(clusterSneakersBar, {delay: 2, duration: 1.2, fill:_color.subBG, ease: "power4.out"})
            }
            // add sneakers image
            const imageY = (_chart2.height * 0.94) + (_canvasHeight * _onGetRatio(16, null, _canvasHeight) * countCluster)
            const sec1Img = _createImage(clusterX + (_margin.gap * 0.4), imageY, `_${index}_${d.title}_map`, 'sneakers-inline', `img/${d.title}.png`, _canvasWidth * _onGetRatio(72, _canvasWidth, null), height = null)
                  sec1Img.setAttribute('id', `colorCluster_${d.title}`)
                  sec1Img.setAttribute('class', 'below-sneakers-img')      
                  clusterImgGroup.appendChild(sec1Img);
                  gsap.from(sec1Img, {delay: 2, duration: 2, opacity: 0, xPercent: -1, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.3}});
            //  add tooltip among cluster
            if (index != 0) {
              const clusterTootipLine = _createImage(clusterX + (_margin.gap * 0.5), imageY, id = null, "tooltip-line", `img/line-topbottom.svg`, _canvasWidth * _onGetRatio(5, _canvasWidth, null), height = null)
                    clusterTooltipG.appendChild(clusterTootipLine);
              const clusterTootipImg2 = _createImage(clusterX - _margin.gap, imageY, id = null, "tooltip-right", `img/tooltip_right.svg`, _canvasWidth * _onGetRatio(34, _canvasWidth, null), height = null)
              const clustertxt2 = _createText(clusterX + (_margin.gap * 0.9), imageY + (_chart2.smst_gap * 0.52), id = null, 'smaller-body', 'start', 'hanging', _color.greyText, d.difference_primary) 
                    clusterTooltipG.appendChild(clustertxt2);
                    gsap.from([clusterTootipLine, clusterTootipImg2, clustertxt2], {delay: 1.6, opacity: 0, duration: 3, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
            }
          }
        })
        target.appendChild(clusterImgGroup);
        target.appendChild(clusterTooltipG);
      })
    }
    
    function _mouseClickHandler(x, y) {
        //description - mouse click
        const descGroup2 = document.createElementNS(_svgNS, 'g');
              descGroup2.setAttribute('id', 'mouse-click');
              descGroup2.setAttribute('transform', `translate(${x}, ${y})`);
              descGroup2.setAttribute('width', _canvasWidth * _onGetRatio(20, _canvasWidth, null));
              descGroup2.setAttribute('height', _canvasHeight * 0.2/2);
        const imageTag2 = _createImage(0, 0, id = null, classes = null, 'img/mouse_click.svg', _chart2.bigger_gap * 1.8, height = null)
              descGroup2.appendChild(imageTag2);
              gsap.to(imageTag2, {duration: 1, scaleX:0.92, scaleY:0.92, force3D:true, yoyo:true, repeat:-1, ease: "power1.inOut"});
        const text4desc2 = 'Click sneakers for more details here.'
        const hovorText2 = _createText(_margin.gap, _chart2.sm_gap + _margin.top * 2, id = null, 'small-body', 'middle', dominantBaseline = null, _color.text, text4desc2)
              descGroup2.appendChild(hovorText2)
      return descGroup2
    }
    // set attribute bar charts
    function _setAttributeResale(c, sneakersGroup, newX, soldH, barW, x1, newShortentitle, newShortenMonth, newShortenYear, number_of_sales, title) {
      const groupX = _margin.left + (barW * c) + (newX * (c - 1))
      const newTextY = soldH > _margin.top ? _chart2.smer_gap * 0.2 : _chart2.big_gap * -1
      const newColor = soldH < _margin.top ? _color.resaleVolume : "white"
      sneakersGroup.setAttribute('transform', `translate(${groupX}, ${_chart2.height - soldH})`)
      sneakersGroup.firstChild.setAttribute('x', 0) // sold_bar
      sneakersGroup.firstChild.setAttribute('y', 0)
      sneakersGroup.firstChild.setAttribute('width', barW)
      sneakersGroup.firstChild.setAttribute('height', soldH)
      sneakersGroup.firstChild.setAttribute('fill', _color.resaleVolume)
      sneakersGroup.firstChild.nextElementSibling.setAttribute('x', x1) //sold_text
      sneakersGroup.firstChild.nextElementSibling.setAttribute('y', newTextY)
      sneakersGroup.firstChild.nextElementSibling.setAttribute('fill', newColor)
      sneakersGroup.firstChild.nextElementSibling.textContent = number_of_sales
      sneakersGroup.lastChild.previousSibling.setAttribute('y', soldH + _chart2.bigger_gap) //xAxis label
     
      sneakersGroup.lastChild.previousSibling.childNodes.forEach((textEl, index) => {
        const newDy = index == 0 ? _chart2.bigger_gap * 1.4 : _chart2.smer_gap 
        if (newShortentitle.length == 1 && index == 0) {
          sneakersGroup.lastChild.previousSibling.childNodes[index].setAttribute('dy', newDy)
          sneakersGroup.lastChild.previousSibling.childNodes[index].textContent = newShortentitle[index]
        } else if (newShortentitle.length == 2 && index < 2) {
          sneakersGroup.lastChild.previousSibling.childNodes[index].setAttribute('dy', newDy)
          sneakersGroup.lastChild.previousSibling.childNodes[index].textContent = newShortentitle[index]
        } else if (newShortentitle.length == 3 && index < 3) {
          sneakersGroup.lastChild.previousSibling.childNodes[index].setAttribute('dy', newDy)
          sneakersGroup.lastChild.previousSibling.childNodes[index].textContent = newShortentitle[index]
        } else {
          sneakersGroup.lastChild.previousSibling.childNodes[index].setAttribute('dy', -_chart2.smer_gap)
          sneakersGroup.lastChild.previousSibling.childNodes[index].textContent = ''
        }
      })
      sneakersGroup.lastChild.previousSibling.childNodes[3].setAttribute('dy', _chart2.sm_gap)
      sneakersGroup.lastChild.previousSibling.childNodes[3].textContent = newShortenMonth
      sneakersGroup.lastChild.previousSibling.childNodes[4].setAttribute('dy', _chart2.smer_gap)
      sneakersGroup.lastChild.previousSibling.childNodes[4].textContent = newShortenYear
  
      sneakersGroup.lastChild.setAttribute('x', -_chart2.smer_gap) // image
      sneakersGroup.lastChild.setAttribute('y', soldH - (_chart2.smer_gap * 0.4))
      sneakersGroup.lastChild.setAttribute('id', `resale_${title}`)
      sneakersGroup.lastChild.setAttribute('class', 'below-sneakers-img')
      if (title != null) sneakersGroup.lastChild.setAttribute('href', `img/${title}.png`)
      sneakersGroup.lastChild.setAttribute('width', barW * 2)
    }
    function _setAttributeTrading(c, sneakersGroup, newX, mstpH, premiumH, baseH, barW, x1, y1, y2, y3, newShortentitle, newShortenMonth, newShortenYear, range_trade_high, range_trade_low, retail_price, title) {
      sneakersGroup.setAttribute('transform', `translate(${_margin.left + (barW * c) + (newX * (c - 1))}, ${_chart2.height - premiumH})`)
      sneakersGroup.firstChild.setAttribute('y', premiumH - baseH) // base_bar
      sneakersGroup.firstChild.setAttribute('width', barW)
      sneakersGroup.firstChild.setAttribute('height', baseH)
      sneakersGroup.firstChild.setAttribute('fill', _color.mapLine)
      sneakersGroup.firstChild.nextElementSibling.setAttribute('y', y1) // msrp_bar
      sneakersGroup.firstChild.nextElementSibling.setAttribute('width', barW)
      sneakersGroup.firstChild.nextElementSibling.setAttribute('height', mstpH)
      sneakersGroup.firstChild.nextElementSibling.setAttribute('fill', _color.msrp)
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.setAttribute('y', y2) // premium_bar
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.setAttribute('width', barW)
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.setAttribute('height', premiumH - baseH)
  
      const newx1 =   (premiumH - baseH < _chart2.bigger_gap) ? _canvasWidth * _onGetRatio(40, _canvasWidth, null) : x1
      const newy2 =   (premiumH - baseH < _chart2.bigger_gap) ? _chart2.sm_gap * -0.55 : y2
      const newy3 =   (premiumH - baseH < _chart2.bigger_gap) ? (premiumH - baseH) * 0.45 : y3
      const newColor1 = (premiumH - baseH < _chart2.bigger_gap) ? _color.premiumPrice : "white"
      sneakersGroup.lastChild.previousSibling.previousSibling.setAttribute('x', newx1)// premium_text
      sneakersGroup.lastChild.previousSibling.previousSibling.setAttribute('y', newy2) 
      sneakersGroup.lastChild.previousSibling.previousSibling.setAttribute('fill', newColor1)
      sneakersGroup.lastChild.previousSibling.previousSibling.textContent = range_trade_high
      sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.setAttribute('x', newx1) //row_text
      sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.setAttribute('y', newy3) 
      sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.textContent = range_trade_low 
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('x', x1) //msrp_text
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('y', y1) 
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.textContent = retail_price
      sneakersGroup.lastChild.previousSibling.setAttribute('y', y2 + _chart2.bigger_gap) // xAxis label
  
      sneakersGroup.lastChild.previousSibling.childNodes.forEach((textEl, index) => {
        const newDy = index == 0 ? premiumH + (_chart2.bigger_gap * 1.4) : _chart2.smer_gap 
        if (newShortentitle.length == 1 && index == 0) {
          sneakersGroup.lastChild.previousSibling.childNodes[index].setAttribute('dy', newDy)
          sneakersGroup.lastChild.previousSibling.childNodes[index].textContent = newShortentitle[index]
        } else if (newShortentitle.length == 2 && index < 2) {
          sneakersGroup.lastChild.previousSibling.childNodes[index].setAttribute('dy', newDy)
          sneakersGroup.lastChild.previousSibling.childNodes[index].textContent = newShortentitle[index]
        } else if (newShortentitle.length == 3 && index < 3) {
          sneakersGroup.lastChild.previousSibling.childNodes[index].setAttribute('dy', newDy)
          sneakersGroup.lastChild.previousSibling.childNodes[index].textContent = newShortentitle[index]
        } else {
          sneakersGroup.lastChild.previousSibling.childNodes[index].setAttribute('dy', -_chart2.smer_gap)
          sneakersGroup.lastChild.previousSibling.childNodes[index].textContent = ''
        }
      })
      sneakersGroup.lastChild.previousSibling.childNodes[3].setAttribute('dy', _chart2.sm_gap)
      sneakersGroup.lastChild.previousSibling.childNodes[3].textContent = newShortenMonth
      sneakersGroup.lastChild.previousSibling.childNodes[4].setAttribute('dy', _chart2.smer_gap)
      sneakersGroup.lastChild.previousSibling.childNodes[4].textContent = newShortenYear
  
      sneakersGroup.lastChild.setAttribute('x', _chart2.smer_gap * -0.4) // image
      sneakersGroup.lastChild.setAttribute('y', premiumH - (_chart2.smer_gap * 0.4))
      sneakersGroup.lastChild.setAttribute('id', `premium_${title}`)
      sneakersGroup.lastChild.setAttribute('class', 'below-sneakers-img')
      if (title != null) sneakersGroup.lastChild.setAttribute('href', `img/${title}.png`)
      sneakersGroup.lastChild.setAttribute('width', barW * 2)
    }
  
    // set animation on bar charts
    function _onTweenChart(c, target, arrData, typeFeature) {
      const getIdx = target.id.split('_')[1];
      const targetChart = target.parentNode.parentNode.firstChild.lastChild.childNodes;
      let sumUp4avg;
      
      arrData.forEach((d, index) => {
        if (getIdx == index) {
          if (typeFeature == 'tradingRange') {
            const newX = _chart2.bigger_gap * 1.3
            const mstpH = _chart2.height * d.retail_price / maxTradingHigh
            const premiumH = _chart2.height * d.range_trade_high / maxTradingHigh
            const baseH = _chart2.height * d.range_trade_low / maxTradingHigh 
            const barW = _canvasWidth * _onGetRatio(26, _canvasWidth, null) //(_chart2.width / targetChart.length) * _margin.gap ? _canvasWidth * _onGetRatio(20, _canvasWidth, null) : _canvasWidth * _onGetRatio(20, _canvasWidth, null)
            const x1 = barW / 2;
            const y1 = premiumH - mstpH
            const y2 = 0;
            const y3 = premiumH - baseH + (_chart2.smer_gap * 0.05)
            const shortentitle = d.shorten_title;
            const newShortentitle = shortentitle.split(' ').length != 1 ? shortentitle.split(' ') : [shortentitle];
            const newShortenMonth = d.release_MY.split(' ').splice(0,2).join(' ');
            const newShortenYear = d.release_MY.split(' ').pop();
            const range_trade_high =  d.range_trade_high.toLocaleString()
            const range_trade_low =  d.range_trade_low.toLocaleString()
            const retail_price =  d.retail_price.toLocaleString()
            const title = d.title
            sumUp4avg = (d.range_trade_high + d.range_trade_low) / 2
            _setAttributeTrading(c, targetChart[c], newX, mstpH, premiumH, baseH, barW, x1, y1, y2, y3, newShortentitle, newShortenMonth, newShortenYear, range_trade_high, range_trade_low, retail_price, title);
          } else if (typeFeature == 'resaleVolume') {
            const newX = _chart2.bigger_gap * 1.3
            const soldH = _chart2.height * d.number_of_sales / maxSoldNum
            const barW = _canvasWidth * _onGetRatio(34, _canvasWidth, null) //(_chart2.width / targetChart.length) * _margin.gap ? _canvasWidth * _onGetRatio(20, _canvasWidth, null) : _canvasWidth * _onGetRatio(20, _canvasWidth, null)
            const x1 = barW / 2;
            const shortentitle = d.shorten_title;
            const newShortentitle = shortentitle.split(' ').length != 1 ? shortentitle.split(' ') : [shortentitle];
            const newShortenMonth = d.release_MY.split(' ').splice(0,2).join(' ');
            const newShortenYear = d.release_MY.split(' ').pop();
            const number_of_sales = d.number_of_sales.toLocaleString()
            const title = d.title
            sumUp4avg = d.number_of_sales
            _setAttributeResale(c, targetChart[c], newX, soldH, barW, x1, newShortentitle, newShortenMonth, newShortenYear, number_of_sales, title);
          }
        }
      })
      return sumUp4avg
    }
    function _onTweenMap(item, mouseX, radians, newX, newY, startX, endX) {
      radians = ((detectArea - (item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value - mouseX)) * (90/detectArea)) * (Math.PI/180)
      newX = mouseX + (Math.cos(radians) * radius);
      newY = -_margin.top + (Math.sin(-radians) * _canvasHeight * _onGetRatio(180, null, _canvasHeight));
      gsap.to(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling, {id: "imgRise", duration: 0.75, x: newX - item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value, y: newY, ease: "elastic.out(1, 0.5)", onUpdate: onUpdate});
      item.firstChild.setAttribute("stroke-opacity","1");
      item.firstChild.nextElementSibling.setAttribute("stroke-opacity","1");
      item.firstChild.nextElementSibling.nextElementSibling.setAttribute("fill-opacity","1");
      item.firstChild.nextElementSibling.nextElementSibling.setAttribute("stroke-opacity","1");
  
      function onUpdate() {
        item.firstChild.nextElementSibling.setAttribute("x2", item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value + parseFloat(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.getAttribute('transform').split(' ',1)[0].split(',')[4]))
        item.firstChild.nextElementSibling.setAttribute("y2", _canvasHeight * 0.2 - _margin.top + parseFloat(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.getAttribute('transform').split(' ',1)[0].split(',')[5]))
      }
      startX = mouseX + _canvasWidth * _onGetRatio(100, _canvasWidth, null) <= _margin.left ? _margin.left : mouseX + _canvasWidth * _onGetRatio(100, _canvasWidth, null)
      endX = mouseX + _canvasWidth * _onGetRatio(180, _canvasWidth, null) >= _canvasWidth - _margin.left ? _canvasWidth - _margin.left : mouseX + _canvasWidth * _onGetRatio(180, _canvasWidth, null)
      item.parentNode.parentNode.firstChild.setAttribute('fill-opacity', '1');
      item.parentNode.parentNode.firstChild.setAttribute("d", `M${startX} ${_canvasHeight * 0.2 - _margin.top} L${endX} ${_canvasHeight * 0.2 - _margin.top} L${_canvasWidth - _margin.left} ${_canvasHeight * 0.2 + _margin.bottom} L${_margin.left} ${_canvasHeight * 0.2 + _margin.bottom} Z`)
      return item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value - mouseX
    }
  
    // check mouseXY for animation
    const detectArea = _canvasWidth * _onGetRatio(74, _canvasWidth, null);
    const radius = _canvasWidth * _onGetRatio(240, _canvasWidth, null);
    function _updateMouseX(e, isHover, sneakersData, typeFeature) {
      let mouseX, targetX;
      let radians, newX, newY;
      let startX, endX;
      let avg_value;
      let sumUp4avg = 0;
      let c = 0; //detected sneakersCount on every mouse hover
      const typeText = typeFeature == "tradingRange" ? "Avg. Resale Price " : "Avg. Resale Volume "
      const maxValue4avg = typeFeature == "tradingRange" ? maxTradingHigh : maxSoldNum
      if (isHover) {
        e.target.parentNode.firstChild.lastChild.childNodes.forEach((value, index) => {
          if (index != 0) _setAttributeResale(c, value, 0, 0, 0, 0, "", "", "", "", title = null)
          if (index != 0) _setAttributeTrading(c, value, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", "", "", "", "", "", title = null)
        })
        e.target.previousSibling.childNodes.forEach(item => {
          mouseX = e.pageX - (Math.floor(window.innerWidth) - _canvasWidth) / 2 - _margin.left;
          targetX = item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value;
          if (Math.abs(item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value - mouseX) <= detectArea && item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.getAttribute('transform')) {
            c += 1;
            _onTweenMap(item, mouseX, radians, newX, newY, startX, endX)
            avg_value = _onTweenChart(c, item, sneakersData, typeFeature)
            sumUp4avg += avg_value
            item.parentNode.parentNode.firstChild.firstChild.nextElementSibling.setAttribute('y1', _chart2.height - (_chart2.height * (sumUp4avg / c) / maxValue4avg))
            item.parentNode.parentNode.firstChild.firstChild.nextElementSibling.setAttribute('y2', _chart2.height - (_chart2.height * (sumUp4avg / c) / maxValue4avg))
            item.parentNode.parentNode.firstChild.firstChild.nextElementSibling.nextElementSibling.setAttribute('y', _chart2.height - (_chart2.height * (sumUp4avg / c) / maxValue4avg) - (_chart2.smer_gap * 0.5))
            item.parentNode.parentNode.firstChild.firstChild.nextElementSibling.nextElementSibling.textContent = typeText + parseInt(sumUp4avg / c).toLocaleString()
          } else {
            item.firstChild.setAttribute("stroke-opacity","0");
            item.firstChild.nextElementSibling.setAttribute("x2", targetX)
            item.firstChild.nextElementSibling.setAttribute("y2", _canvasHeight * 0.2 - _margin.top)
            item.firstChild.nextElementSibling.setAttribute("stroke-opacity","0");
            item.firstChild.nextElementSibling.nextElementSibling.setAttribute("fill-opacity","0");
            item.firstChild.nextElementSibling.nextElementSibling.setAttribute("stroke-opacity","0");
            gsap.to(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling, {id: "imgFall", duration: 0.75, rotation: 0, x: 0 , y:0, ease: "elastic.out(1, 0.5)"})
          }
        })
      } else {
        e.target.parentNode.firstChild.lastChild.childNodes.forEach((value, index) => {   
          if (index != 0) {
            if (typeFeature == 'tradingRange') _setAttributeTrading(c, value, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", "", "", "", "", "", title = null)
            if (typeFeature == 'resaleVolume') _setAttributeResale(c, value, 0, 0, 0, 0, "", "", "", "", title = null)
          }
        })
        e.target.previousSibling.childNodes.forEach(item => {
          if (gsap.getById("imgRise")) {gsap.getById("imgRise").reverse();}
          item.firstChild.setAttribute("stroke-opacity","0");
          item.firstChild.nextElementSibling.setAttribute("stroke-opacity","0");
          item.parentNode.parentNode.firstChild.setAttribute('fill-opacity', '0');
          gsap.to(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling, {id: "letFall", duration: 0.75,  rotation: 0, x: 0 , y:0, ease: "elastic.out(1, 0.5)"})
        })
        e.target.parentNode.firstChild.firstChild.nextElementSibling.setAttribute('y1', -10)
        e.target.parentNode.firstChild.firstChild.nextElementSibling.setAttribute('y2', -10)
        e.target.parentNode.firstChild.firstChild.nextElementSibling.nextElementSibling.setAttribute('y', -10)
      }
    }
    function _Tween4DisplayDetails(typeFeature) {
      const sneakersGroup = document.querySelectorAll('.below-sneakers-img')
      const detailBG = document.getElementById('empty-detail-BG')
      const mouseCL = document.getElementById('mouse-click')
      sneakersGroup.forEach(item => {
        item.style.cursor = "pointer"
        item.addEventListener("click", (e)=> {
          detailBG.setAttribute('display', 'none')
          mouseCL.setAttribute('display', 'none')
          _onInitDetailInfos(e.target, typeFeature)
        })
      })
    }
    // call initial main map + below chart
    function _OnInitColorCluster(sec0Svg, mapData) {
      const sec0G = document.createElementNS(_svgNS, 'g');
            sec0G.setAttribute('transform', `translate(${_margin.left}, 0)`);
      const sec0Line = document.createElementNS(_svgNS, 'path');
            sec0Line.setAttribute('id', 'navigation');
            sec0Line.setAttribute('d', `M${_margin.left} ${_canvasHeight * 0.2 - _margin.top} L${_margin.left + _canvasWidth * _onGetRatio(120, _canvasWidth, null)} ${_canvasHeight * 0.2 - _margin.top} L${_canvasWidth - _margin.left} ${_canvasHeight * 0.2 + _margin.bottom} L${_margin.left} ${_canvasHeight * 0.2 + _margin.bottom} Z`);
            sec0Line.setAttribute('fill', _color.chartBG);
            sec0Line.setAttribute('fill-opacity', '0');
            sec0Svg.appendChild(sec0Line);
      const sec0Rect = _createRect(0, 0, 'mapBG', classes = null, _canvasWidth,  _canvasHeight * 0.2 - _margin.top, _color.mainBG)
            sec0Svg.appendChild(sec0Rect);   
      // add body & title
      const bodyTitleContext = ['Color Clusters', 'By Delta E*', 'Algorithms']
      const bodyContext = 'As most definitions of color difference are distances within a color space, the standard means of determining distances is the Euclidean distance. If one presently has an RGB (Red, Green, Blue) tuple and wishes to find the color difference, computationally one of the easiest is to consider R, G, B linear dimensions defining the color space.'
      _createTitleNBodyTxt(sec0Svg, bodyTitleContext, bodyContext,_chart2.width/1.7, textAnchor = null, "bigger-body", _color.text)
      // add external link
      const txt4DeltaE = document.createElementNS(_svgNS, 'text');
            txt4DeltaE.setAttribute('x', _margin.left);
            txt4DeltaE.setAttribute('y', _margin.bottom * 1.78)
            txt4DeltaE.setAttribute('class', 'smaller-body')
            txt4DeltaE.setAttribute('fill', _color.greyText)
            txt4DeltaE.innerHTML = `<a target="blank" fill="${_color.greyText}" xlink:href="http://zschuessler.github.io/DeltaE/learn/">Delta-E * </a>`
            txt4DeltaE.setAttribute('text-decoration', 'underline')
            sec0Svg.appendChild(txt4DeltaE)
      // legend
      const clusterLegendG = _createLegend('Standard Perception Ranges', LSubTitle = null, LPrimaryFeature = null, LSecondaryFeature = null, _color.legend)
            sec0Svg.appendChild(clusterLegendG)
      // create color cluster map
      if (document.getElementById('clusterGroup')) {
        _removeAllChildNodes(document.getElementById('clusterGroup'));
        _createColorChart(target = null, mapData)
      } else {
        const clusterGroup = document.createElementNS(_svgNS, 'svg');
              clusterGroup.setAttribute('id', 'clusterGroup');
              sec0Svg.appendChild(clusterGroup)
              _createColorChart(clusterGroup, mapData)
      }
      return
    }
    function _OnInitPopupChart(popupChart) {
      // bg
      const sec2RectBG = _createRect(_margin.left, 0, 'chart-bg', classes = null, _chart2.width - _margin.left, _chart2.height, _color.chartBG)
            sec2RectBG.setAttribute('display', 'none')
            popupChart.appendChild(sec2RectBG);
      // create avg. price premium guideline in dash
      const avg_line1 = _createLine(_margin.left, _chart2.width, -10, -10, 'avg_guideline', classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
            avg_line1.setAttribute('stroke-dasharray', _margin.gap * 0.1)
            popupChart.appendChild(avg_line1);
      const avg_text1 = _createText(_chart2.width, _canvasHeight * 0.2 - (_margin.bottom * 2.6), id = null, 'small-body', 'end', dominantBaseline = null, _color.text, "") 
            popupChart.appendChild(avg_text1);
      // xAxis
      const sec2xAxis = _createLine(_margin.left, _chart2.width, _chart2.height, _chart2.height, 'xAxis', classes = null, _color.text, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
            popupChart.appendChild(sec2xAxis);
      // group tag
      const sec2Group1 = document.createElementNS(_svgNS, 'g');
            sec2Group1.setAttribute('id', 'below-chart-bar-group')
            popupChart.appendChild(sec2Group1)
      // yAxis
    //   const maxYscale = typeFeature == 'tradingRange' ? maxTradingHigh + 4 : maxSoldNum + 3131
    //   const maxYText = typeFeature == 'tradingRange' ? 60 : 4000
    //   const yScalText = typeFeature == 'tradingRange' ? _chart2.sm_gap * 1.13 : _chart2.bigger_gap * 1.214
      const sec2yAxis = _createYAxis(maxTradingHigh + 4, 60, _chart2.sm_gap * 1.13)
            sec2yAxis.setAttribute('display', 'none')
            popupChart.appendChild(sec2yAxis)
            // create dummy bar chart
            _createBarChart(sec2Group1, 24);
            popupChart.appendChild(sec2Group1);
      return
    }
    function _onInitDetailInfos(target, typeFeature) {
      const titleId = target.id.split('_')[1]
  
      const sideDetail = document.getElementById('detail-infos')
      const detailMapY = typeFeature == 'colorCluster' ? _canvasHeight * 0.366 : _canvasHeight * 0.46
      const detailMapX = typeFeature == 'colorCluster' ? _canvasWidth * 0.655 : _margin.left
      const detailMapWidth = typeFeature == 'colorCluster' ? _canvasWidth * 0.345 - _margin.left : _canvasWidth - (_margin.left * 2)
      const detailMapHeight = typeFeature == 'colorCluster' ? _canvasHeight * 0.5 : _canvasHeight * 0.224 - _margin.bottom
     
      const detailInfos = document.createElementNS(_svgNS, 'g')
            detailInfos.setAttribute('id', 'detail-chart')
            detailInfos.setAttribute('transform', `translate(${0}, ${detailMapY})`);
        
     const sec1Rect = _createRect(detailMapX, 0, id = null, 'detail-BG', detailMapWidth, detailMapHeight, _color.text)
            sec1Rect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            sec1Rect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            detailInfos.appendChild(sec1Rect);
      const widthby3 = ((_canvasWidth - (_margin.left * 2)) - (_margin.gap * 10))/4 > _canvasWidth * _onGetRatio(176, _canvasWidth, null) ? ((_canvasWidth - (_margin.left * 2)) - (_margin.gap * 10))/4 : _canvasWidth * _onGetRatio(176, _canvasWidth, null)
      let leftYTxt, rightYTxt, middleTxt, collectText;
  
      colorMapData.forEach((d, i) => {
        if (titleId == d.title) {
          for (var i = 0; i < 4; i++) {
            // grouping four columns
            const groupX = i == 0 ? _margin.left + (_margin.gap * 1.4) : _margin.left + (_margin.gap * 2.6 * i) + (widthby3 * i);
            const secRectGroup = document.createElementNS(_svgNS, 'g')
                  secRectGroup.setAttribute('id', `info-bar-group_${i}`)
            // change the group x, y
            if (typeFeature == 'colorCluster') {
              console.log('see width', widthby3 + (_margin.gap * 2), sec1Rect.width.animVal.value)
              if (sec1Rect.width.animVal.value < _canvasWidth/2) {
                if (i == 0) secRectGroup.setAttribute('transform', `translate(${detailMapX + (_margin.gap * 2)}, ${_margin.top * 1.8})`);
                if (i == 1) secRectGroup.setAttribute('transform', `translate(${detailMapX + (_margin.gap * 2)}, ${_margin.bottom * 5})`);
                if (i == 2) secRectGroup.setAttribute('transform', `translate(${detailMapX + (_margin.gap * 2)}, ${_margin.bottom * 9})`);
                if (i == 3) secRectGroup.setAttribute('display', 'none')
              }
            } else {
              secRectGroup.setAttribute('transform', `translate(${groupX}, ${_margin.top * 1.6})`);
            }
            if (i == 0) {
              leftYTxt = [d.range_category, d.shorten_title, _clusterNames[d.range_cluster]]
              rightYTxt = ['', '', '', d.release_date]
              const stackedTxtLeft = _createStackedText(0, 0, leftYTxt, "start", "big-body", "white", i = null)
              const stackedTxtRight = _createStackedText(widthby3, 0, rightYTxt, "end", "small-body", _color.greyText, i = null)
              const detailThmnail = _createImage(0, _chart2.sm_gap, id = null, "detail-info-thmnail", `img/${d.title}.png`, widthby3,  _canvasHeight * _onGetRatio(160, null, _canvasHeight))
                    secRectGroup.appendChild(stackedTxtLeft)
                    secRectGroup.appendChild(stackedTxtRight)
                    secRectGroup.appendChild(detailThmnail)
            } else if (i == 1) {
              leftYTxt = ['Color Difference', d.difference_highlight, 'Delta E', '0'] // 
              rightYTxt = ['Base & Highlight', '', '', '100']
              middleTxt = ['', '', '', d.difference_highlight]
              bar1Width = widthby3 * d.difference_highlight / 100
              const secLetfText = _createStackedText(0, 0, leftYTxt, "start", "small-body", _color.greyText, i)
                    secRectGroup.appendChild(secLetfText)
              const secRightText = _createStackedText(widthby3, 0, rightYTxt, "end", "small-body", _color.greyText, i)
                    secRectGroup.appendChild(secRightText)
              const secMddText = _createStackedText(bar1Width, 0, middleTxt, "start", "small-body", _color.cluster, i)
                    secRectGroup.appendChild(secMddText)
              const secBar1BGChart = _createRect(0, _margin.bottom + (_margin.top * 0.7), id = null, "detail-info-bar-bg", widthby3, _chart2.big_gap, _color.chartBG)
                    secRectGroup.appendChild(secBar1BGChart)
              const secBar1Rect = _createRect(0, _margin.bottom + (_margin.top * 0.7), id = null, "detail-info-bar-grey", bar1Width, _chart2.big_gap, _color.cluster)
                    secRectGroup.appendChild(secBar1Rect)
              const secImgGroup = document.createElementNS(_svgNS, 'g')
                    secImgGroup.setAttribute('transform', `translate(0, ${_margin.bottom * 2.2})`);
                    secRectGroup.appendChild(secImgGroup)
              const secHighlightImg = _createImage(0, 0, id = null, 'detail-info-color-code-img', `img/color_shade/${d.title}_code.png`, _canvasWidth * _onGetRatio(102, _canvasWidth, null),  _canvasHeight * _onGetRatio(58, null, _canvasHeight))
                    secImgGroup.appendChild(secHighlightImg)
              for (var n = 0; n < 2; n++) {
                const rectColor = n == 0 ? `rgb(${d.fullRGB[0].replaceAll(' ', ', ')})` : `rgb(${d.fullRGB[1].replaceAll(' ', ', ')})`
                const rectText = n == 0 ? "Base" : "Highlight"
                const rectHighlightChart = _createRect(_canvasWidth * _onGetRatio(106, _canvasWidth, null), _margin.top * 1.1 * n, id = null, "detail-info-color-code", widthby3 / 2 - _margin.gap, _canvasHeight * _onGetRatio(27, null, _canvasHeight), rectColor)
                      secImgGroup.appendChild(rectHighlightChart)
                const rectBarText = _createText(_canvasWidth * _onGetRatio(170, _canvasWidth, null) - _margin.gap, (_margin.top * 1.1 * n) + _chart2.smst_gap, id = null, "small-body", "middle", "hanging", "white", rectText)
                      secImgGroup.appendChild(rectBarText)
              }
            } else if (i == 2) {
              leftYTxt = ['Price Premium', `${(d.price_premium * 100).toFixed(0).toLocaleString()}%`, 'Avg. Resale Price', `$${(minAvgResalePrice).toLocaleString()}`, 'Trading Range', `$${("" + d.range_trade_low).toLocaleString()}`]
              rightYTxt = [`MSRP: $${d.retail_price}`, '', '', `$${(maxAvgResalePrice).toLocaleString()}`, '', `$${(maxAvgResalePrice).toLocaleString()}`]
              middleTxt = ['', '', '', `$${(d.retail_price + (d.retail_price * d.price_premium)).toFixed(0).toLocaleString()}`, '', `$${("" + d.range_trade_high).toLocaleString()}`]
              const secLetfText = _createStackedText(0, 0, leftYTxt, "start", "small-body", _color.greyText, i)
                    secRectGroup.appendChild(secLetfText)
              const secRightText = _createStackedText(widthby3, 0, rightYTxt, "end", "small-body", _color.greyText, i)
                    secRectGroup.appendChild(secRightText)
              const arrowSymbol = (d.price_premium > 0.01) ? 'arrow_up' : 'arrow_down'
              const detailSymbol = _createImage(0, _chart2.big_gap, id = null, "detail-info-arrow", `img/${arrowSymbol}.svg`, _chart2.smst_gap, height = null)
                    secRectGroup.appendChild(detailSymbol)
              for (var m = 0; m < 2; m++) {
                const secBarBGChart = _createRect(0, _margin.bottom + (m * 1.3 * _margin.bottom + (_margin.top * 0.7)), id = null, "detail-info-bar-bg", widthby3, _chart2.big_gap, _color.chartBG)
                      secRectGroup.appendChild(secBarBGChart)
                bar2Width = m == 0 ? (widthby3 * (d.retail_price + (d.retail_price * d.price_premium)) / maxAvgResalePrice) : widthby3 * d.range_trade_high / maxAvgResalePrice
                barStartX = m == 0 ? 0 : widthby3 * d.range_trade_low / maxAvgResalePrice
                collectText = m == 0 ? middleTxt[3] : middleTxt[5]
                const secMddText = _createStackedText(bar2Width, _margin.bottom + (m * 1.326 * _margin.bottom + (_margin.top * 0.71)), collectText, "start", "small-body", _color.premiumPrice, i)
                      secRectGroup.appendChild(secMddText)
                const secPremiumChart = _createRect(barStartX, _margin.bottom + (m * 1.3 * _margin.bottom + (_margin.top * 0.7)), id = null, "detail-info-bar-primary", bar2Width, _chart2.big_gap, _color.premiumPrice)
                      secRectGroup.appendChild(secPremiumChart)
                if (m == 1) {
                  bar1Width = widthby3 * d.retail_price / maxAvgResalePrice
                  const secBarGreyRect = _createRect(0, _margin.bottom + (m * 1.3 * _margin.bottom + (_margin.top * 0.7)), id = null, "detail-info-bar-grey", bar1Width, _chart2.big_gap, _color.msrp)
                        secRectGroup.appendChild(secBarGreyRect)
                }
              }
             } else {
              leftYTxt = ['Total Resale Volume', '204', 'Number of Asks',  '', 'Number of Bids']
              rightYTxt = ['' , '', '', `${(maxNumOfAsks).toLocaleString()}`, '', `${(maxNumOfBids).toLocaleString()}`]
              middleTxt = ['' , '', '', `${(d.number_of_Asks).toLocaleString()}`, '', `${(d.number_of_Bids).toLocaleString()}`]
              const secLetfText = _createStackedText(0, 0, leftYTxt, "start", "small-body", _color.greyText, i)
                    secRectGroup.appendChild(secLetfText)
              const secRightText = _createStackedText(widthby3, 0, rightYTxt, "end", "small-body", _color.greyText, i)
                    secRectGroup.appendChild(secRightText)
              for (var m = 0; m < 2; m++) { 
                bar2Width = m == 0 ? widthby3 * d.number_of_Asks / maxNumOfAsks : widthby3 * d.number_of_Bids / maxNumOfBids
                collectText =  m == 0 ? middleTxt[3] : middleTxt[5]
                const secBarBGChart = _createRect(0, _margin.bottom + (m * 1.3 * _margin.bottom + (_margin.top * 0.7)), id = null, "detail-info-bar-bg", widthby3, _chart2.big_gap, _color.chartBG)
                      secRectGroup.appendChild(secBarBGChart)
                const secMddText = _createStackedText(bar2Width, _margin.bottom + (m * 1.3 * _margin.bottom + (_margin.top * 0.7)), collectText, "start", "small-body", _color.resaleVolume, i)
                      secRectGroup.appendChild(secMddText)
                const secresaleChart = _createRect(0, _margin.bottom + (m * 1.3 * _margin.bottom + (_margin.top * 0.7)), id = null, "detail-info-bar-primary", bar2Width, _chart2.big_gap, _color.resaleVolume)
                      secRectGroup.appendChild(secresaleChart)
              }
            }
              detailInfos.appendChild(secRectGroup)
          }
          sideDetail.appendChild(detailInfos)
        }
      })
    }    
    // remove children nodes from parent
    function _removeAllChildNodes(parent) {
      while (parent.firstChild) parent.removeChild(parent.firstChild);
    } 
  
    // init main map + below chart
    function _onInit(colorMapData){
      if (container) _removeAllChildNodes(container);
      if (document.getElementById('toggle-button'))  _removeAllChildNodes(document.getElementById('toggle-button'));
      // create toggle btn
      const toggleWidth = _canvasWidth * _onGetRatio(120, _canvasWidth, null) 
      const toggleStartX = _canvasWidth - Math.floor(window.innerWidth) < 0 ? Math.floor(window.innerWidth) - ((Math.floor(window.innerWidth) - _canvasWidth)/2) - toggleWidth : _canvasWidth - _margin.left - toggleWidth
      const togBtn = document.getElementById('toggle-button');
            togBtn.setAttribute('width', Math.floor(window.innerWidth) - toggleStartX);
            togBtn.setAttribute('height', _margin.bottom * 2);
      const togGroup = document.createElementNS(_svgNS, 'g')
            togGroup.setAttribute('transform', `translate(${_margin.gap}, ${_margin.top * 1.1})`);
      const togTxt1 = _createText(_canvasWidth * _onGetRatio(37, _canvasWidth, null), _chart2.big_gap * 1.3, 'color-difference', "smaller-body", "start", dominantBaseline= null, _color.text, 'Color Difference')
            togTxt1.setAttribute('opacity', 1)
      const togTxt2 = _createText(_canvasWidth * _onGetRatio(32, _canvasWidth, null), _chart2.big_gap * 1.3, 'release-date', "smaller-body", "start", dominantBaseline= null, _color.text, 'Release Date')
            togTxt2.setAttribute('opacity', 0)
      const togBody = _createRect(0, 0, 'toggle-body',  "no-action", toggleWidth, _canvasHeight * _onGetRatio(36, null, _canvasHeight), _color.legend)
            togBody.setAttribute('fill-opacity', 0.66)
            togBody.setAttribute('rx', _canvasWidth * _onGetRatio(20, _canvasWidth, null))
            togBody.setAttribute('ry', _canvasWidth * _onGetRatio(20, _canvasWidth, null))
      const togCircle = _createCircle(_margin.gap, _chart2.big_gap * 1.14, 'toggle-circle', "pointer", _canvasWidth * _onGetRatio(13, _canvasWidth, null), _color.mapLine, 1, stroke=null, strokeWidth=null, strokeOpacity=null)
            togGroup.appendChild(togBody)
            togGroup.appendChild(togTxt1)
            togGroup.appendChild(togTxt2)
            togGroup.appendChild(togCircle)
            togBtn.appendChild(togGroup)
      // create init map
      const sec0Svg = document.createElementNS(_svgNS, 'svg');
            sec0Svg.setAttribute('id', '  color-cluster');
            sec0Svg.setAttribute('width', _canvasWidth);
            sec0Svg.setAttribute('height', _canvasHeight * 1.4);
            container.appendChild(sec0Svg)
      _OnInitColorCluster(sec0Svg, _colorMapByPrimaryD);
      //description - mouse click
      // const descGroup2 = _mouseClickHandler(_canvasWidth * 0.76, _canvasHeight * 0.59)
      //       sec0Svg.appendChild(descGroup2)\
      //       _Tween4DisplayDetails(typeFeature)
      //popup page
      const mainSVG = document.createElementNS(_svgNS, 'svg');
            mainSVG.setAttribute('id', 'popup-chart');
      const popupChart = document.createElementNS(_svgNS, 'g')
            popupChart.setAttribute('id', 'below-chart')
            popupChart.setAttribute('transform', `translate(0, ${_canvasHeight * 0.22})`);
            mainSVG.appendChild(popupChart)
            _OnInitPopupChart(popupChart);
      const sideDetail = document.createElementNS(_svgNS, 'svg')
            sideDetail.setAttribute('id', 'detail-infos');
            mainSVG.appendChild(sideDetail)
      const sec1Rect = _createRect(_margin.left, _canvasHeight * 0.46, 'empty-detail-BG', 'detail-BG', _canvasWidth - (_margin.left * 2), _canvasHeight * 0.224 - _margin.bottom, "rgba(220,220,220,0.08)")
            sec1Rect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            sec1Rect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            mainSVG.appendChild(sec1Rect);
      // call animation on each sneakers
      let isHover = false, isToggle = false;
      const clickCircle = document.getElementById('toggle-circle')
      const toggleTxt1 = document.getElementById('color-difference')
      const toggleTxt2 = document.getElementById('release-date')
      clickCircle.addEventListener("click", (e)=> {
        if (isToggle) {
          gsap.to(togCircle, {delay: 0.2, duration: 0.9, xPercent:0, fill: _color.mapLine, ease: "power4.out", stagger: {from: 0, amount: 0.4}});
          gsap.to(togBody, {delay: 0.2, duration: 0.9, fill: _color.legend, ease: "power4.out", stagger: {from: 0, amount: 0.4}});
          gsap.to(toggleTxt1, {delay: 0.4, duration: 0.9, opacity: 1, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.4}});   
          gsap.to(toggleTxt2, {delay: 0.2, duration: 0.5, opacity: 0, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.4}});
          isToggle = false;
          _OnInitColorCluster(sec0Svg, _colorMapByPrimaryD);
        } else {
          gsap.to(togCircle, {delay: 0.2, duration: 0.9, xPercent:310, fill: _color.mapBG, ease: "power4.out", stagger: {from: 0, amount: 0.4}});
          gsap.to(togBody, {delay: 0.2, duration: 0.9, fill: _color.mapLine, ease: "power4.out", stagger: {from: 0, amount: 0.4}});
          gsap.to(toggleTxt1, {delay: 0.2, duration: 0.5, opacity: 0, xPercent:0, ease: "power4.out", stagger: {from: 0, amount: 0.4}});
          gsap.to(toggleTxt2, {delay: 0.4, duration: 0.9, opacity: 1, xPercent:-30, ease: "power4.out", stagger: {from: 0, amount: 0.4}});    
          isToggle = true;
          _OnInitColorCluster(sec0Svg, _colorMapByReleaseD);
        }
      })
      // const hoverRect = document.getElementById('display-none')
      // hoverRect.addEventListener("mouseover", (e)=> {
      //   if (!isHover) {
      //     isHover = true;
      //     // document.getElementById('empty-detail-BG').setAttribute('display', 'block')
      //     // document.getElementById('mouse-click').setAttribute('display', 'block');
      //   }
      // })
      // hoverRect.addEventListener("mousemove", (e)=> {
      //   if (isHover) {
      //     console.log(`isHover ${isHover}`);
      //     // document.getElementById('mouse-hover').setAttribute('display', 'none');
      //     document.getElementById('chart-bg').setAttribute('display', 'block');
      //     document.getElementById('legend').setAttribute('display', 'block');
      //     document.getElementById('yAxis').setAttribute('display', 'block');
      //     const detailInfos = document.getElementById('detail-infos');
      //     if (detailInfos) _removeAllChildNodes(detailInfos);
      //     _updateMouseX(e, isHover, colorMapData, typeFeature);
      //   }
      // })
      // hoverRect.addEventListener("mouseout", (e)=> {
      //   if (isHover) {
      //     isHover = false;
      //     // document.getElementById('mouse-hover').setAttribute('display', 'block');
      //     // document.getElementById('mouse-click').setAttribute('display', 'none');
      //     document.getElementById('chart-bg').setAttribute('display', 'none');
      //     document.getElementById('legend').setAttribute('display', 'none');
      //     document.getElementById('yAxis').setAttribute('display', 'none');
      //     _updateMouseX(e, isHover, colorMapData, typeFeature); 
      //     }
      // })
      // hoverRect.addEventListener("click", (e)=> {
      //   isHover = false
      //   if (gsap.getById("imgRise")) gsap.getById("imgRise").pause(); //imgFall
      //   if (!isHover && gsap.getById("imgRise")) gsap.getById("imgRise").paused( !gsap.getById("imgRise").paused());
      //   _Tween4DisplayDetails(typeFeature)
      // })
  }
    
    // set button trigger and reset chart map
    // const buttons = document.getElementById('buttons')
    // buttons.addEventListener("click", (e)=> {
    //   e.target.parentNode.childNodes.forEach(item => {
    //     if (e.target.id == item.id) item.classList.add(item.id);
    //     else if (e.target.id != item.id && item.nodeType == 1) item.classList.remove(item.id);
    //     initValue = item.id
    //   })
    //   toggleBtn.childNodes.forEach(item => {
    //     if (toggleBtn.classList.contains('selected')) {
    //       if (item.nodeType == 1 && item.id == 'circle-txt') item.classList.remove('toggleTxt') 
    //       else if (item.nodeType == 1 && item.id == 'circle-xs' || item.id == 'circle-xl' && item.nodeType == 1) item.classList.remove('toggleBG')
    //     }
    //   })
    //   toggleBtn.classList.remove('selected')
    //   const featureData = e.target.id == 'redBtn' ? 'tradingRange' : 'resaleVolume'
    //   _onInit(colorMapData)
    //   flag4cluster = false;
    // })
    
    // ON WINDOW RESIZE
    window.addEventListener('resize', () => {
      const _canvasWidth = Math.floor(window.innerWidth) > 1366 ? 1366 : Math.floor(window.innerWidth)
      _onInit(colorMapData)
    });
  
    _onInit(colorMapData)
})
    