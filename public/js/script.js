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
const _canvasWidth = Math.floor(window.innerWidth)
const _canvasHeight = Math.floor(window.innerHeight)
const clusterNames = {cluster0: 'Black', cluster1:'Grey+Blue', cluster2: 'Grey+Red', cluster3: 'Brown', cluster4: 'Yellow', cluster5: 'Neon', cluster6: 'Green+Yellow', cluster7: "White", cluster8: "White+Red", cluster9: "White+Blue", cluster10: "Blue", cluster11: "Orange"}
const _margin = {gap: _canvasWidth * _onGetRatio(20, _canvasWidth, null), top: _canvasHeight * _onGetRatio(30, null, _canvasHeight), 
                 right: _canvasWidth * _onGetRatio(60, _canvasWidth, null), bottom: _canvasHeight * _onGetRatio(50, null, _canvasHeight), 
                 left: _canvasWidth * _onGetRatio(140, _canvasWidth, null), columnWidth: _canvasWidth * _onGetRatio(170, _canvasWidth, null)};
const _chart2 = {width: _canvasWidth - _margin.left, height: _canvasHeight * 0.2 * 0.8,
                 bigger_gap: _canvasHeight * _onGetRatio(22, null, _canvasHeight), big_gap: _canvasHeight * _onGetRatio(16, null, _canvasHeight),
                 sm_gap: _canvasHeight * _onGetRatio(12, null, _canvasHeight), smer_gap: _canvasHeight * _onGetRatio(10, null, _canvasHeight),
                 smst_gap: _canvasHeight * _onGetRatio(8, null, _canvasHeight)}
const _color = {mapLine: "#CCCCCC", mapBG: "#F5F5F5", cluster: "#efc100", premiumPrice: "#F65E5D", resaleVolume: "#0382ed", msrp: "#808080", chartBG: "#FDFDFD", text: "#333333", greyText: '#999999'}
const _colorXScale = _canvasWidth - (_margin.left * 2) - _margin.right;
const _colorYScale = _canvasHeight - _chart2.height - _margin.left; 
let colorMapData = [], avgSumOfSold = 0;
let flag4cluster = false, clusterYHolder = [];;

// READ DATA
Promise.all([
  d3.csv('data/Yeezy_sales_performace.csv'),
  d3.json('data/deltaE.json')
]).then(function([stockX, colorDistance]) {
  stockX.forEach((d, i) => {
    d.title = d.title;
    d.category = [...d.title.matchAll(/(QNTM\s|\d{3}\sMNVN\s|\d{3}\s)+(\w{1}\d{1})*/gm)][0][0].replaceAll(/\s$/gm,'');
    d.shorten_title = d.title.replaceAll(/(adidas\sYeezy\s|Boost|QNTM\s|\d{3}\s)+(\w{1}\d{1})*/gm, '').replaceAll(/^\s{1,2}|^\s\w*\s$/gm,'');
    d.thumb_url = d.thumb_url;
    d.description = d.description;
    d.release_date = d.release_date.replaceAll(/(Release:\s)+/gm, '');
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
    d.price_premium_range = d.price_premium >= 4 ? 'Price Premium over 400%' : d.price_premium >= 2 ? 'Price Premium over 200%' : d.price_premium >= 0.5 ? 'Price Premium over 50%' : d.price_premium >= 0.05 ? 'Price Premium over 5%' : 'Lower price than MSRP'
    d.total_dollars = +d.total_dollars;
    d.volatility = +parseFloat(d.volatility).toFixed(4);
    avgSumOfSold += d.number_of_sales;
    // d.daysFromPriviousRelease = i < stockX.length - 1 ? _differenceInDays(d.release_date, _lookupReleaseDates[i + 1]) : 0//'Very first pair';
    // d.daysReleasRange = d.daysFromPriviousRelease <= 8 ? 'Released new within one week' : d.daysFromPriviousRelease <= 24 ? 'Released new within three weeks' : 'Released new after Avg. difference in days'
  })

  let sumPrimaryDistance = 0, maxPrimaryD = 0, maxTradingHigh = 0, maxSoldNum = 0;
  // set color cluster map
  let clusterWidths = {};
  let clusterCount = 0, sumUpWidth = 0, sumUpGap = 0;
  
  colorDistance.filter((obj, index) => {
    sumPrimaryDistance += obj.distance_primary;
    avgOfSold = Math.round(avgSumOfSold/stockX.length);
    stockX.forEach((d, i) => {
      if (obj.target == d.title) {
        if (maxPrimaryD < Math.round(sumPrimaryDistance)) {maxPrimaryD = Math.round(sumPrimaryDistance)}
        maxTradingHigh = maxTradingHigh < d.trade_range_high ? d.trade_range_high : maxTradingHigh;
        maxSoldNum = maxSoldNum < d.number_of_sales ? d.number_of_sales : maxSoldNum

        colorMapData.push({'range_category': d.category,
                           'shorten_title': d.shorten_title,
                           'title': obj.target,
                           'relative_primary': Math.round(sumPrimaryDistance),
                           'absolute_primary': obj.distance_primary,
                           'absolute_highlight': obj.distance_highlight,
                           'range_cluster': obj.cluster,
                           'fullRGB': obj.fullRGB,
                           'primary_color': obj.fullRGB[0].split(' ').map(d => parseInt(d)),
                           'price_premium': d.price_premium,
                           'retail_price': d.retail_price,
                           'thumb_url': d.thumb_url,
                           'product_url': d.product_url,
                           'description': d.description,
                           'release_date': d.release_date,
                           'release_MY': d.release_MY,
                           'release_year': d.release_year,
                           'number_of_sales': d.number_of_sales,
                           'average_sale_price': d.average_sale_price,
                           'range_trade_high': d.trade_range_high,
                           'range_trade_low': d.trade_range_low,
                           'number_of_Asks': d.number_of_Asks,
                           'number_of_Bids': d.number_of_Bids,
                          //  'range_price_premium': d.price_premium_range,
                          //  'total_dollars': d.total_dollars,
                          //  'volatility': d.volatility
                          })

        const comparisonC = (index != 0) ? colorDistance[index - 1].cluster : "cluster0";
        const widthRatio = clusterCount > 12 ? _canvasWidth * _onGetRatio(80, _canvasWidth, null) : _canvasWidth * _onGetRatio(80, _canvasWidth, null)
        if (comparisonC != obj.cluster) {
          const gapValue = (index != 0) ? obj.distance_primary : 0
          sumUpGap += gapValue
          sumUpWidth += widthRatio
          clusterWidths[comparisonC] = {'count': clusterCount, 'width': widthRatio, 'sumUpWidth': sumUpWidth, 'gap': gapValue, 'sumUpGap': sumUpGap}
          clusterCount = 1;
        } else {
          clusterCount++
        }
        if (index == colorDistance.length - 1) {
          clusterWidths[obj.cluster] = {'count': clusterCount, 'width': widthRatio, 'sumUpWidth': sumUpWidth, 'gap':  obj.distance_primary, 'sumUpGap': sumUpGap}
        }
      }
    })
  })
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
          circle.setAttribute('fill-opacity', fillOpacity);
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
          if (textAnchor != null) text.setAttribute('dominant-baseline', dominantBaseline)
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
    const legendBG = _createRect(0, 0, id = null, classes = null, bgW, bgH, "rgba(255, 255, 255, 0.8)")
          legendG.appendChild(legendBG)
    const textEl = _createText(0, 0, id = null, 'legendText', textAnchor = null, dominantBaseline = null, color = null, textContent = null)
    const tspan1El1 = _createTspan(bgW - _margin.gap/2, _chart2.bigger_gap, id = null, 'small-body bold', 'end', _color.text, title)
          textEl.appendChild(tspan1El1)

    if (subTitle == null && primaryLegend == null && secondaryLegend == null) {
      legendG.setAttribute('transform', `translate(${bgX - _margin.left}, ${_chart2.sm_gap})`);
      legendBG.setAttribute('width', _margin.columnWidth * 1.44)
      legendBG.setAttribute('height', _margin.bottom * 1.76)
      legendBG.setAttribute('fill', LegendColor)

      const textFilter = ['0 <= 1.0', '1 ~ 2', '2 ~ 10', '11 ~ 49', '100']
      const textDescription = ['Not perceptible by the human eye',
                               'Perceptible through close observation',
                               'Perceptible at a glance',
                               'Colors are more similar than the opposite',
                               'Colors are exactly the opposite']
      for (var q = 0; q < 5; q++) {
        const clusterFilter = _createText(_chart2.big_gap, _chart2.big_gap * 1.2 + (_chart2.sm_gap * q * 1.2), id = null, 'smaller-body bold', textAnchor = null, dominantBaseline = null, _color.cluster, textFilter[q])
        legendG.appendChild(clusterFilter)
        const clusterDescription = _createText(_margin.right, _chart2.big_gap  * 1.2+ (_chart2.sm_gap * q * 1.2), id = null, 'smaller-body', textAnchor = null, dominantBaseline = null, "white", textDescription[q])
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
  function _createBarChart(target, c, typeFeature) {
    const newShortentitle = ['','',''];
    for (var i = 1; i <= c; i++) {
      const barG = document.createElementNS(_svgNS, 'g');
            barG.setAttribute('id', `BarGroup${i}`);
            barG.setAttribute('transform', `translate(${0}, ${0})`);
      // bar
      const barBg = _createRect(0, 0, id = null, 'bottom_bar', 0, 0, _color.mapBG)
            barG.appendChild(barBg)
      if (typeFeature == "tradingRange") {
        const barMsrp = _createRect(0, 0, id = null, 'second_bar', 0, 0, _color.msrp)
              barG.appendChild(barMsrp)
        const barPremium = _createRect(0, 0, id = null, 'first_bar', 0, 0, _color.premiumPrice)
              barG.appendChild(barPremium)
      } 
      // bar text
      const barTextEl1 = _createText(0, 0, id = null, 'barText small-body', 'middle', 'hanging', 'white', '') 
            barG.appendChild(barTextEl1)
      if (typeFeature == "tradingRange") {
        const barTextEl2 = _createText(0, 0, id = null, 'barText small-body', 'middle', 'hanging', _color.premiumPrice, '') 
              barG.appendChild(barTextEl2)
        const barTextEl3 = _createText(0, 0, id = null, 'barText small-body', 'middle', 'hanging','white', '')
              barG.appendChild(barTextEl3)
      } 
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
  function _createColorChart(target, typeFeature) {
    const clusterGroup = document.createElementNS(_svgNS, 'svg');
          clusterGroup.setAttribute('id', 'clusterGroup');
    const barGroup = document.createElementNS(_svgNS, 'g');
          barGroup.setAttribute('id', 'barGroup');
          clusterGroup.appendChild(barGroup)
    const bgGroup = document.createElementNS(_svgNS, 'g');
          bgGroup.setAttribute('id', 'bgGroup');
          clusterGroup.appendChild(bgGroup)
    
    const clusterD = Object.values(clusterWidths)
    Object.keys(clusterWidths).forEach((key, i) => {
      // create basic elements - bar, Bg, description texts
      const maxValue4MaxScale =clusterWidths['cluster11'].sumUpGap + clusterWidths['cluster11'].sumUpWidth
      const xScaledSumGap = i != 0 ? _colorXScale * clusterD[i - 1].sumUpGap / maxValue4MaxScale :_colorXScale * clusterD[i].sumUpGap / maxValue4MaxScale
      const xScaledSumWidth = i != 0 ? _colorXScale * clusterD[i - 1].sumUpWidth / maxValue4MaxScale :_colorXScale * clusterD[i].sumUpWidth / maxValue4MaxScale
      const clusterX = i == 0 ? _margin.left : _margin.left + xScaledSumGap + xScaledSumWidth - (_margin.right/2)
      const xScaledWidth = _colorXScale * clusterD[i].width / maxValue4MaxScale
      const clusterHeight = i > 9 || i == 2 || i == 3 || i == 5 ? clusterD[i].count * _chart2.big_gap * 0.88 : clusterD[i].count * _chart2.smst_gap
      const clusterX4Tooltip = i < 9 ? clusterX + xScaledWidth : clusterX + xScaledWidth + (_colorXScale * clusterD[i].gap / maxValue4MaxScale/2)
      const clusteY =  _canvasHeight * 0.2 - _margin.top - clusterHeight
      const clusterBarColor = typeFeature == 'colorCluster' ? "rgba(51,51,51,0.9)" : "rgba(220,220,220,0.6)";
      const clusterBarRect = _createRect(clusterX, clusteY, id = null, "cluster-bar", clusterD[i].width, clusterHeight, clusterBarColor)
            clusterBarRect.setAttribute('rx', _canvasWidth * _onGetRatio(4, _canvasWidth, null))
            clusterBarRect.setAttribute('ry', _canvasWidth * _onGetRatio(4, _canvasWidth, null))
            target.appendChild(clusterBarRect);
            if (i == clusterD.length - 1) gsap.from(".cluster-bar", {delay: 0.39, duration: 0.3, scaleY: 0, yPercent: 100, ease: "power1.inOut", stagger: {from: 0, amount: 0.4}});
      for (var u = 0; u < 2; u++) {      
        if (clusterNames[key].includes(' + ') && u == 0) {
          for (var t = 0; t < 2; t++) {
            const textY = t == 0 ? clusteY - (_chart2.big_gap * 0.88) : clusteY - (_chart2.smst_gap * 0.6)
            const textTitle = t == 0 ? clusterNames[key].split(' + ')[0] + ' +' : clusterNames[key].split(' + ')[1]
            const ct = _createText(clusterX + (_margin.gap * 0.3), textY, id = null, 'small-body', textAnchor = null, dominantBaseline = null, _color.text, textTitle)
                  target.appendChild(ct)
            gsap.from(ct, {delay: 0.8, duration: 1.2, opacity: 0, y: -textY + _chart2.height, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
          }
        } else {
          const clusterTextX = u == 0 ? clusterX + (_margin.gap * 0.3) : clusterX + (_margin.gap * 0.6)
          const clusterTextY = u == 0 ? clusteY - (_chart2.smst_gap * 0.66) : clusteY + (_chart2.smst_gap * 1.6)
          const clusterContents = u == 0 ? clusterNames[key] : clusterD[i].count
          const clusterText = _createText(clusterTextX, clusterTextY, id = null, 'small-body', textAnchor = null, dominantBaseline = null, _color.text, clusterContents) 
                if (u == 1) {
                  typeFeature == 'colorCluster' ? clusterText.setAttribute('fill', "white") : clusterText.setAttribute('fill', _color.greyText)
                  clusterText.setAttribute('class', 'smaller-body');
                }
                target.appendChild(clusterText);
                gsap.from(clusterText, {delay: 0.8, duration: 1.2, opacity: 0, y: -clusterTextY + _chart2.height, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
        }
      }
      if (typeFeature == 'colorCluster') {
        // add sneakers bar-bg
        let clusterBarheight = 0;
        if (clusterD[i].count < 7 && clusterD[i].count >= 4) {
          clusterBarheight = clusterD[i].count * _canvasHeight * _onGetRatio(51.2, null, _canvasHeight)
        } else if (clusterD[i].count < 4 && clusterD[i].count > 1) {
          clusterBarheight = clusterD[i].count * _canvasHeight * _onGetRatio(56, null, _canvasHeight)
        } else if (clusterD[i].count < 2) {
          clusterBarheight = clusterD[i].count * _canvasHeight * _onGetRatio(74, null, _canvasHeight)
        } else {
          clusterBarheight = clusterD[i].count * _canvasHeight * _onGetRatio(48.2, null, _canvasHeight)
        }
        const clusterSneakersBar = _createRect(clusterX, _canvasHeight * 0.2 - _margin.top, id = null, "sneakers-bar", clusterD[i].width, clusterBarheight, _color.mapBG)
              clusterSneakersBar.setAttribute('rx', _canvasWidth * _onGetRatio(4, _canvasWidth, null))
              clusterSneakersBar.setAttribute('ry', _canvasWidth * _onGetRatio(4, _canvasWidth, null)) 
              bgGroup.appendChild(clusterSneakersBar)
              gsap.from(clusterSneakersBar, {delay: 0.52, duration: 0.7, scaleY: 0, yPercent: 0, ease: "power4.out", stagger: {from: 0, amount: 0.4}});
        // add tooltip for longer distance change
        const clusterTooltipG = document.createElementNS(_svgNS, 'g');
              clusterTooltipG.setAttribute('id', 'tooltip');
        const clusterImgGroup = document.createElementNS(_svgNS, 'g');
              clusterImgGroup.setAttribute('id', 'lined-sneakers');
        let countColor = 0;
        // add sneakers images
        colorMapData.forEach((d, index) => {
          if (d.range_cluster == key) {
            const comparisonC = (index != 0) ? colorMapData[index - 1].range_cluster : "cluster0";
            (comparisonC == key) ? countColor++ : countColor = 1;
            const imageY = _chart2.height + (_canvasHeight * _onGetRatio(46, null, _canvasHeight) * countColor)
            if (clusterYHolder.length < 78) clusterYHolder.push(imageY - _chart2.height)
            const sec1Img = _createImage(clusterX + (_margin.gap * 0.4), imageY, `_${index}_${d.title}_map`, 'sneakers-inline', `img/${d.title}.png`, _canvasWidth * _onGetRatio(62, _canvasWidth, null), height = null)
                  clusterImgGroup.appendChild(sec1Img);
                  gsap.from(sec1Img, {delay: 0.24, duration: 0.9, y: -imageY + _chart2.height, ease: "back.out(1.7)", stagger: {from: 0, amount: 0.4}});
            //  add tooltip among cluster 
            const clusterTootipImg1 = _createImage(clusterX - _margin.gap, imageY, id = null, classes = null, `img/tooltip_right.svg`, _canvasWidth * _onGetRatio(34, _canvasWidth, null), height = null)
                  if (countColor != 1) clusterTooltipG.appendChild(clusterTootipImg1);
            const clustertxt2 = _createText(clusterX - (_chart2.smst_gap * .5), imageY + (_chart2.smst_gap * .5), id = null, 'small-body', 'middle', 'hanging', _color.text, d.absolute_primary) 
                  if (countColor != 1) clusterTooltipG.appendChild(clustertxt2);
                  gsap.from(clusterTootipImg1, {delay: 1.6, opacity: 0, duration: 3, ease: "power4.out", stagger: {from: 0, amount: 0.4}});
                  gsap.from(clustertxt2, {delay: 1.6, opacity: 0, duration:3, ease: "power4.out", stagger: {from: 0, amount: 0.4}});
          }
        })
        if (i != 11) { // bar count : 12, gap count: 11 (so don't count the last one for gap spacing)
          const clusterTootipImg2 = _createImage(clusterX4Tooltip, _canvasHeight * 0.2 - (_margin.top * 0.8), id = null, classes = null, `img/tooltip.svg`, _canvasWidth * _onGetRatio(40, _canvasWidth, null), height = null)
                clusterTooltipG.appendChild(clusterTootipImg2);
          const clustertxt1 = _createText(clusterX4Tooltip + _margin.gap, _canvasHeight * 0.2 - (_margin.top * 0.5), id = null, 'small-body bold', 'middle', 'hanging', color = null, textContent = clusterD[i].gap) 
                clusterTooltipG.appendChild(clustertxt1);
                gsap.from(clusterTootipImg2, {delay: 0.52, opacity: 0, duration: 0.9, scaleY: 0, yPercent: 10, ease: "power4.out", stagger: {from: 0, amount: 0.4}});
                gsap.from(clustertxt1, {delay: 0.52, opacity: 0, duration: 0.9, scaleY: 0, yPercent: 10, ease: "power4.out", stagger: {from: 0, amount: 0.4}});      
        }
        clusterGroup.appendChild(clusterImgGroup);
        clusterGroup.appendChild(clusterTooltipG);
      }
    })
    target.appendChild(clusterGroup)
    return
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
    // sneakersGroup.firstChild.nextElementSibling.setAttribute('y', soldH + _chart2.smer_gap * 0.2)
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
  const detectArea = _canvasWidth * _onGetRatio(50, _canvasWidth, null);
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
        mouseX = e.pageX - _margin.left;
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
  function _createStackedText(x, y, bodyTitleContext, textAnchor, classes, textColor, i, widthby3) {
    const bodyTGroup = document.createElementNS(_svgNS, 'g');
          bodyTGroup.setAttribute('class', 'title-context');
          bodyTGroup.setAttribute('transform', `translate(${x}, 0)`);
    for (var m = 0; m < bodyTitleContext.length; m++) {
      let textContexts = bodyTitleContext[m];
      let newXTxt = 0
      if (i==0 && m== 1 || i==1 && m== 1 || i==2 && m== 1) {
        // console.log(m, i, bodyTitleContext[m])
        const nx = i == 1 ? _margin.gap * 0.6 : 0
        const bodyBigTitle = _createText(nx, y + (m * _chart2.bigger_gap * 1.2), id = null, "thin-biggest-body", "start", dominantBaseline = null, textColor, bodyTitleContext[m])
              bodyTGroup.appendChild(bodyBigTitle)
      } else if (i==0 && m== 2 || i==1 && m== 2 || i==2 && m== 2) {
        const body1stSubTitle = _createText(0, y + (m * _chart2.big_gap * 1.8), id = null, classes, "start", dominantBaseline = null, _color.greyText, bodyTitleContext[m])
        bodyTGroup.appendChild(body1stSubTitle)
      } else {
        let newYTxt;
        if (typeof i == "object" && m == 1) {
          newYTxt = y + (m * _chart2.sm_gap)
          textColor = _color.greyText
        } else if (typeof i == "undefined" && m == 1 || typeof i == "undefined" && m == 2) {
          newYTxt = y + (m * _chart2.big_gap)
          textColor = _color.text
        } else if (typeof i == "undefined" && m == 0) {
          newYTxt = y + (m * _chart2.big_gap * 2)
          textColor = _color.text
        } else if (i == 1 && m == 4 || i == 2 && m == 4) {
          textAnchor = 'start'
          newYTxt = y + (m * _chart2.big_gap * 1.9)
          textColor = _color.greyText
        } else if (typeof bodyTitleContext[m] == "object") {
          bodyTitleContext[m].forEach((item, index) => {
            textContexts = item
            if (i == 1 && m == 0 || i == 0 && index == 0) {
              newYTxt = y + (m * _chart2.big_gap * 1.9);
              newXTxt = (index == 1) ? widthby3 : 0
              textAnchor = index == 1 && "end"
            } else {
              if (index == 2 || i == 2 && index == 1 || m == 5 && index == 1) {
                // console.log(i, typeof item, item, m, index)
                newYTxt = y + (m * _chart2.big_gap * 2); 
                newXTxt = widthby3
                textAnchor = "end"
              } else if (m == 3 && index == 0) {
                // console.log(i, typeof item, item, m, index)
                newYTxt = y + (m * _chart2.big_gap * 2)
                newXTxt = _margin.right * 0.4;
              } else {
                // console.log(i, typeof item, item, m, index)
                textColor = "white"
                newYTxt = y + (m * _chart2.big_gap * 2)
                newXTxt = _margin.right
                textAnchor = "end"
              }
            }
            const bodyTitle = _createText(newXTxt, newYTxt, id = null, classes, textAnchor, dominantBaseline = null, textColor, textContexts)
                  bodyTGroup.appendChild(bodyTitle)
          })
        } else {
          textColor = typeof i == "object" ? _color.greyText : "white"
          newYTxt = y + (m * _chart2.big_gap * 2)
        }
        const bodyTitle = _createText(newXTxt, newYTxt, id = null, classes, textAnchor, dominantBaseline = null, textColor, textContexts)
        if (textAnchor != null) bodyTitle.setAttribute('text-anchor', textAnchor);
        bodyTGroup.appendChild(bodyTitle)
      }
    }
    return bodyTGroup
  }
  // create body title text wraping with max value within tspan
  function _createTitleNBodyTxt(target, bodyTitleContext, bodyContext, maxLength, textAnchor, classes, textColor) {
    const bodyTitleGroup = _createStackedText(_margin.left, _margin.top, bodyTitleContext, textAnchor, classes, textColor)
    // bodytext
    let count4wrap = 0;
    const bodyText = _createText(0, 0, id = null, 'xAxisLabel', textAnchor, dominantBaseline = null, textColor, textContent = null) 
          bodyText.setAttribute('x', 0)
          bodyText.setAttribute('y', 0)
    for (var i = 0; i < 11; i++) {
      const startY = (i == 0) ? _chart2.bigger_gap * 1.4 : _chart2.sm_gap
      const bodyTspan = _createTspan(_margin.left * 2.2, startY, 'bodyTspan' ,'small-body', 'start', textColor, '')
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
    const bodyTitleContext = typeFeature == 'tradingRange' ? ['White+Blue has', 'highest price.', 'White is next.'] : ['Black is sold', 'the most.', 'White is next.']
    const bodySubTitleContext = typeFeature == 'tradingRange' ? 'white + Blue, Tultledove (2015). White , Static (2018). Black, Core Black Red (2016)' : 'Sold'
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

  // call initial main map + below chart
  function _OnInitColorCluster(sec0Svg, typeFeature) {
    const sec0G = document.createElementNS(_svgNS, 'g');
          sec0G.setAttribute('transform', `translate(${_margin.left}, 0)`);
    const sec0Line = document.createElementNS(_svgNS, 'path');
          sec0Line.setAttribute('id', 'navigation');
          sec0Line.setAttribute('d', `M${_margin.left} ${_canvasHeight * 0.2 - _margin.top} L${_margin.left + _canvasWidth * _onGetRatio(120, _canvasWidth, null)} ${_canvasHeight * 0.2 - _margin.top} L${_canvasWidth - _margin.left} ${_canvasHeight * 0.2 + _margin.bottom} L${_margin.left} ${_canvasHeight * 0.2 + _margin.bottom} Z`);
          sec0Line.setAttribute('fill', _color.chartBG);
          sec0Line.setAttribute('fill-opacity', '0');
          sec0Svg.appendChild(sec0Line);
    const sec0Rect = _createRect(0, 0, 'mapBG', classes = null, _canvasWidth,  _canvasHeight * 0.2 - _margin.top, _color.cluster)
          sec0Svg.appendChild(sec0Rect);   
    // add body & title
    const bodyTitleContext = ['The Color Distance', 'By Euclidean distance']
    const bodyContext = 'As most definitions of color difference are distances within a color space, the standard means of determining distances is the Euclidean distance. If one presently has an RGB (Red, Green, Blue) tuple and wishes to find the color difference, computationally one of the easiest is to consider R, G, B linear dimensions defining the color space.'//'The Color Distance between surrounding sneakers'
    _createTitleNBodyTxt(sec0Svg, bodyTitleContext, bodyContext,_chart2.width/1.7, textAnchor = null, "bigger-body", _color.text)
    // legend
    const clusterLegendG = _createLegend('Standard Perception Ranges', LSubTitle = null, LPrimaryFeature = null, LSecondaryFeature = null, "rgba(51,51,51,0.9)")
          sec0Svg.appendChild(clusterLegendG)
    // create color cluster map
    _createColorChart(sec0Svg, typeFeature)
    return
  }
  function _OnInitMainMap(mainSVG, typeFeature, flag4cluster) {
    // create init map
    const sec0Rect1 = document.createElementNS(_svgNS, 'path');
          sec0Rect1.setAttribute('id', 'navigation');
          sec0Rect1.setAttribute('d', `M${_margin.left} ${_canvasHeight * 0.2 - _margin.top} L${_margin.left + _canvasWidth * _onGetRatio(120, _canvasWidth, null)} ${_canvasHeight * 0.2 - _margin.top} L${_canvasWidth - _margin.left} ${_canvasHeight * 0.2 + _margin.bottom} L${_margin.left} ${_canvasHeight * 0.2 + _margin.bottom} Z`);
          sec0Rect1.setAttribute('fill', _color.chartBG);
          sec0Rect1.setAttribute('fill-opacity', '0');
          mainSVG.appendChild(sec0Rect1);
    const sec0Rect2 = _createRect(0, 0, 'map-bg', classes = null, _canvasWidth,  _canvasHeight * 0.2 - _margin.top, _color.mapBG)
          mainSVG.appendChild(sec0Rect2);
    const sec0ClusterG = document.createElementNS(_svgNS, 'g');
          sec0ClusterG.setAttribute('id', 'color-cluster-bar');
          sec0ClusterG.setAttribute('transform', `translate(0, 0)`);
          mainSVG.appendChild(sec0ClusterG);
    // set color cluster sneakers map 
    _createColorChart(sec0ClusterG, typeFeature)
    const sec0G = document.createElementNS(_svgNS, 'g');
          sec0G.setAttribute('id', 'sneakersMap');
          sec0G.setAttribute('transform', `translate(${_margin.left}, 0)`);
    // set legend and body title by type
    _createBodyNLegend(mainSVG, typeFeature)
    //description - mouse hover
    const destGroup1 = document.createElementNS(_svgNS, 'g');
          destGroup1.setAttribute('id', 'mouse-hover');
          destGroup1.setAttribute('transform', `translate(${_margin.gap}, -${_chart2.smst_gap})`);
          destGroup1.setAttribute('width', _canvasWidth * _onGetRatio(20, _canvasWidth, null));
          destGroup1.setAttribute('height', _canvasHeight * 0.2/2);
    const imageTag1 = _createImage(_canvasWidth - (_margin.left * 1.66), _canvasHeight * 0.2/2.4, id = null, classes = null, 'img/mouse_hover.svg', _chart2.bigger_gap * 1.8, height = null)
          destGroup1.appendChild(imageTag1);
    for (var j = 0; j < 2; j++) {
      const text4desc1 = j == 0 ? 'Hover to see' : 'more details below.'
      const hovorText1 = _createText(_canvasWidth - (_margin.left * 1.44), _canvasHeight * 0.2 - (_margin.bottom * 1.9) + (j * _chart2.smer_gap), id = null, 'small-body', 'middle', dominantBaseline = null, _color.premiumPrice, text4desc1)
            destGroup1.appendChild(hovorText1);
    }
    mainSVG.appendChild(destGroup1)
    //description - mouse click
    const descGroup2 = document.createElementNS(_svgNS, 'g');
          descGroup2.setAttribute('id', 'mouse-click');
          descGroup2.setAttribute('transform', `translate(${_margin.gap}, -${_chart2.smst_gap})`);
          descGroup2.setAttribute('width', _canvasWidth * _onGetRatio(20, _canvasWidth, null));
          descGroup2.setAttribute('height', _canvasHeight * 0.2/2);
          descGroup2.setAttribute('display', 'none')
    const imageTag2 = _createImage(_canvasWidth - (_margin.left * 1.66), _canvasHeight * 0.2/2.4, id = null, classes = null, 'img/mouse_click.svg', _chart2.bigger_gap * 1.8, height = null)
          descGroup2.appendChild(imageTag2);
    for (var j = 0; j < 2; j++) {
      const text4desc2 = j == 0 ? 'Click to Pause' : ' the Map & Sneakers'
      const hovorText2 = _createText(_canvasWidth - (_margin.left * 1.44), _canvasHeight * 0.2 - (_margin.bottom * 1.9) + (j * _chart2.smer_gap), id = null, 'small-body', 'middle', dominantBaseline = null, _color.premiumPrice, text4desc2)
      descGroup2.appendChild(hovorText2)
    }
    mainSVG.appendChild(descGroup2)
    // major navigation
    const sec0Rect3 = _createRect(0, _canvasHeight * 0.2 - _canvasHeight * _onGetRatio(220, null, _canvasHeight), 'display-none', classes = null,_canvasWidth, _canvasHeight * _onGetRatio(270, null, _canvasHeight), 'rgba(255, 255, 10, 0)')
          mainSVG.appendChild(sec0G);
    // add sneakers images
    colorMapData.forEach((d,i) => {
    let centerX = _colorXScale * d.relative_primary / (maxPrimaryD) + (_canvasWidth * _onGetRatio(70, _canvasWidth, null) * 0.4)
    const sec0Group = document.createElementNS(_svgNS, 'g');
          sec0Group.setAttribute('id', `_${i}_${d.title}_g`);
    const sec0Path1 = _createLine(centerX, centerX, _canvasHeight * 0.2 - _margin.top, _canvasHeight * 0.2 - _margin.bottom, id = null, classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), '0')
          sec0Group.appendChild(sec0Path1);
    const sec0Path2 = _createLine(centerX, centerX, _canvasHeight * 0.2 - _margin.bottom, _canvasHeight * 0.2 - _margin.bottom, id = null, 'line-changable', _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), '0')
          sec0Group.appendChild(sec0Path2);
    const sec0Circle = _createCircle(centerX,  _canvasHeight * 0.2 - _margin.top, `_${i}_${d.title}_c`, classes = null, _canvasWidth * _onGetRatio(3, _canvasWidth, null), `rgb(${d.primary_color[0]}, ${d.primary_color[1]}, ${d.primary_color[2]})`, '0', 'white', _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), '0')
          sec0Group.appendChild(sec0Circle);
    const targetX = _colorXScale * d.relative_primary / maxPrimaryD
    const sec0Img = _createImage(targetX, _canvasHeight * 0.2 - _margin.bottom, `_${i}_${d.title}_img`, 'staggerImg', `img/${d.title}.png`, _canvasWidth * _onGetRatio(70, _canvasWidth, null), height = null)     
          sec0Group.appendChild(sec0Img);
          sec0G.appendChild(sec0Group);
          // call animate function //
          if (flag4cluster) gsap.from(sec0Img, {delay: 0.1, duration: 0.6, y: clusterYHolder[i], ease: "power1.inOut", stagger: {from: 0, amount: 0.1}});
          // if (!flag4cluster && i == colorMapData.length - 1) gsap.from(".staggerImg", { duration: 0.6, scale: 0, ease: "power1.inOut", stagger: {from: 0, amount: 0.1}});
    })
          mainSVG.appendChild(sec0Rect3);
    return sec0Rect3;
  }
  function _OnInitBelowChart(belowChart, typeFeature) {
    // bg
    const sec2RectBG = _createRect(_margin.left, 0, 'chartBG', classes = null, _chart2.width - _margin.left, _chart2.height, _color.chartBG)
          sec2RectBG.setAttribute('display', 'none')
          belowChart.appendChild(sec2RectBG);
    // create avg. price premium guideline in dash
    const avg_line1 = _createLine(_margin.left, _chart2.width, -10, -10, 'avg_guideline', classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
          avg_line1.setAttribute('stroke-dasharray', _margin.gap * 0.1)
          belowChart.appendChild(avg_line1);
    const avg_text1 = _createText(_chart2.width, _canvasHeight * 0.2 - (_margin.bottom * 2.6), id = null, 'small-body', 'end', dominantBaseline = null, _color.text, "") 
          belowChart.appendChild(avg_text1);
    // xAxis
    const sec2xAxis = _createLine(_margin.left, _chart2.width, _chart2.height, _chart2.height, 'xAxis', classes = null, _color.text, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
          belowChart.appendChild(sec2xAxis);
    // group tag
    const sec2Group1 = document.createElementNS(_svgNS, 'g');
          sec2Group1.setAttribute('id', 'below-chart-bar-group')
          belowChart.appendChild(sec2Group1)
    // yAxis
    const maxYscale = typeFeature == 'tradingRange' ? maxTradingHigh + 4 : maxSoldNum + 3131
    const maxYText = typeFeature == 'tradingRange' ? 60 : 4000
    const yScalText = typeFeature == 'tradingRange' ? _chart2.sm_gap * 1.13 : _chart2.bigger_gap * 1.214
    const sec2yAxis = _createYAxis(maxYscale, maxYText, yScalText)
          sec2yAxis.setAttribute('display', 'none')
          belowChart.appendChild(sec2yAxis)
          // create dummy bar chart
          _createBarChart(sec2Group1, 24, typeFeature);
          belowChart.appendChild(sec2Group1);
    return
  }
  function _onInitDetailInfos(target) {
    const bottomDetail = document.getElementsByTagName('detail-infos')
    const detailInfos = document.createElementNS(_svgNS, 'g')
          detailInfos.setAttribute('transform', `translate(${0}, ${_canvasHeight * 0.46})`);
    const sec1Rect = _createRect(_margin.left, 0, 'mapBG', classes = null, _canvasWidth - (_margin.left * 2),  _canvasHeight * 0.2 - _margin.bottom, _color.text)
          detailInfos.appendChild(sec1Rect);
    // add title, release date, cluster
    const widthby3 = (_canvasWidth - (_margin.left * 2))/4 - (_margin.gap * 1.8)
    const bodyTitleContext = '350 Turtledove'
    const bodyContext = ['Jun 27 2015', clusterNames['cluster9']]
    const arrowSymbol = 'arrow_up' // 'arrow_down'
    const detailTitle = _createText(_margin.left + (_margin.gap ), _margin.top * 1.2, id = null, "big-body", textAnchor = null, "hanging", "white", bodyTitleContext)
    const detailSubTitle = _createStackedText(_margin.left + widthby3 + (_margin.gap), _margin.top * 1.2, bodyContext, "end", "smaller-body", _color.greyText, i = null, widthby3)
    const detailThmnail = _createImage(_margin.left + (_margin.gap * 2), _margin.top * 1.6, id = null, "detail-info-thmnail", `img/${bodyTitleContext}.png`, widthby3 * 0.88,  _canvasHeight * _onGetRatio(160, null, _canvasHeight))
    for (var i = 0; i < 3; i++) {
      let textsContext; 
      if (i == 0) {
        textsContext = ['Color Difference', '128.55', 'Delta E', ['0','128.55','100']] // in Base & Highlight
      } else if (i == 1) {
        textsContext = [['Price Premium', 'MSRP: $220'], '722.5%', 'Avg. Resale Price', ['$200', '$1,390', '$1,645'], 'Trading Range', ['$800', '$1,444','$1,846']] //,'$1,645' ,'$1,846'
      } else {
        textsContext = ['Resale Volume', '204', 'Number of Asks', ['62', '5,649'], 'Number of Bids', ['81', '1,125']] 
      }
      const secRectGroup = document.createElementNS(_svgNS, 'g')
            secRectGroup.setAttribute('id', `info-bar-group_${i}`)
            secRectGroup.setAttribute('transform', `translate(${(widthby3 * 0.91 + (_margin.gap * 2)) * (1 + i)}, ${_margin.top})`);
      const secStackedText = _createStackedText(_margin.left + (_margin.gap * 2), 0, textsContext, "start", "smaller-body", "white", i, widthby3)
            secRectGroup.appendChild(secStackedText)
      const secBar1BGChart = _createRect(_margin.left + (_margin.gap * 2), (_canvasHeight * 0.2 - _margin.bottom) * 0.32, id = null, "detail-info-bar-chart", widthby3, _chart2.sm_gap, _color.chartBG)
            secRectGroup.appendChild(secBar1BGChart)
      const secBar1GreyRect = _createRect(_margin.left + (_margin.gap * 2), (_canvasHeight * 0.2 - _margin.bottom) * 0.32, id = null, "detail-info-bar-chart", _margin.right*0.4, _chart2.sm_gap, _color.msrp)
            secRectGroup.appendChild(secBar1GreyRect)
      const detailSymbol = _createImage(_margin.left + (_margin.gap * 2), _chart2.smer_gap, id = null, "detail-info-arrow", `img/${arrowSymbol}.svg`, _chart2.smst_gap, height = null)
            if (i == 1) secRectGroup.appendChild(detailSymbol)
      const secColorImgGroup = document.createElementNS(_svgNS, 'g')
            secColorImgGroup.setAttribute('transform', `translate(${(widthby3 * 0.91 + (_margin.gap * 2))}, ${(_canvasHeight * 0.197 - _margin.bottom) * 0.5})`);
      if (i == 0) {
        for (var n = 0; n < 2; n++) {
          const rectColor = n == 0 ? "#908F8A" : "#454442"
          const rectText = n == 0 ? "Base" : "Highlight"
          const secHighlightImg = _createImage(_margin.left + (_margin.gap * 2), _margin.top, id = null, 'detail-info-img-base-highlight-color', `img/color_shade/${bodyTitleContext}_code.png`, width = null,  _canvasHeight * _onGetRatio(61, null, _canvasHeight))
                secColorImgGroup.appendChild(secHighlightImg)
          const rectHighlightChart = _createRect(_margin.left + (_margin.gap * 3) + (widthby3/2), _margin.top + (_margin.top * n), id = null, "detail-info-color-rect", widthby3 * 0.42, _canvasHeight * _onGetRatio(30, null, _canvasHeight), rectColor)
                secColorImgGroup.appendChild(rectHighlightChart)
          const rectBarText = _createText(_margin.left + (_margin.gap * 3) + (widthby3 * 0.7), (_margin.top * 1.28) + (_margin.top * n), id = null, "smaller-body", "middle", "hanging", "white", rectText)
                secColorImgGroup.appendChild(rectBarText)
        } 
      } else {
        const secBar2BGChart = _createRect(_margin.left + (_margin.gap * 2), (_canvasHeight * 0.2 - _margin.bottom) * 0.62, id = null, "detail-info-bar-chart", widthby3, _chart2.sm_gap, _color.chartBG)
              secRectGroup.appendChild(secBar2BGChart)
        const secBar2GreyChart = _createRect(_margin.left + (_margin.gap * 2), (_canvasHeight * 0.2 - _margin.bottom) * 0.62, id = null, "detail-info-bar-chart", _margin.right, _chart2.sm_gap, _color.msrp)
              if (i == 2) secRectGroup.appendChild(secBar2GreyChart)
        if (i == 1){
          for (var m = 0; m < 2; m++) {
            const secPremiumChart = _createRect(_margin.left + (_margin.gap * 4), (_canvasHeight * 0.2 - _margin.bottom) * 0.32 + (m * 2.16 * _margin.top), id = null, "detail-info-bar-chart", _margin.right * 0.7, _chart2.sm_gap, _color.premiumPrice)
                  secRectGroup.appendChild(secPremiumChart)
          }
        }
      }
        detailInfos.appendChild(secColorImgGroup)
        detailInfos.appendChild(secRectGroup)
    }
        detailInfos.appendChild(detailTitle)
        detailInfos.appendChild(detailSubTitle)
        detailInfos.appendChild(detailThmnail)
    bottomDetail.appendChild(detailInfos)
  }
  // remove children nodes from parent
  function _removeAllChildNodes(parent) {
    while (parent.firstChild) parent.removeChild(parent.firstChild);
  } 

  // init main map + below chart
  function _onInit(colorMapData, typeFeature){
    // gsap.to(".toogleBG-default", {duration: 1.2, scaleX:0.8, scaleY:0.8, force3D:true, yoyo:true, repeat:-1, ease: "power1.inOut"});
    if (container) _removeAllChildNodes(container);
    if (typeFeature == 'colorCluster') {
      // create init map
      const sec0Svg = document.createElementNS(_svgNS, 'svg');
            sec0Svg.setAttribute('id', 'colorCluster');
            sec0Svg.setAttribute('width', _canvasWidth);
            sec0Svg.setAttribute('height', _canvasHeight * 0.8);
            container.appendChild(sec0Svg)
      _OnInitColorCluster(sec0Svg, typeFeature);
    } else {
      // create below chart wireframe
      const mainSVG = document.createElementNS(_svgNS, 'svg');
            mainSVG.setAttribute('id', 'main-map');
            mainSVG.setAttribute('width', _canvasWidth);
            mainSVG.setAttribute('height', _canvasHeight * 0.8)//2 + _margin.bottom);
            container.appendChild(mainSVG)
      const belowChart = document.createElementNS(_svgNS, 'g')
            belowChart.setAttribute('id', 'below-chart')
            belowChart.setAttribute('transform', `translate(0, ${_canvasHeight * 0.22})`);
            mainSVG.appendChild(belowChart)
            _OnInitMainMap(mainSVG, typeFeature, flag4cluster);
            _OnInitBelowChart(belowChart, typeFeature);
      const bottomDetail = document.createElementNS(_svgNS, 'svg')
            bottomDetail.setAttribute('id', 'detail-infos');
            mainSVG.appendChild(bottomDetail)
      // call animation on each sneakers
      let isHover = false;
      const hoverRect = document.getElementById('display-none')
      hoverRect.addEventListener("mouseover", (e)=> {
        if (!isHover) {isHover = true;}
      })
      hoverRect.addEventListener("mousemove", (e)=> {
        if (isHover) {
          console.log(`isHover ${isHover}`);
          document.getElementById('mouse-hover').setAttribute('display', 'none');
          document.getElementById('mouse-click').setAttribute('display', 'block');
          document.getElementById('chartBG').setAttribute('display', 'block');
          document.getElementById('legend').setAttribute('display', 'block');
          document.getElementById('yAxis').setAttribute('display', 'block');
          _updateMouseX(e, isHover, colorMapData, typeFeature);
        }
      })
      hoverRect.addEventListener("mouseout", (e)=> {
        if (isHover) {
          isHover = false; 
          document.getElementById('mouse-hover').setAttribute('display', 'block');
          document.getElementById('mouse-click').setAttribute('display', 'none');
          document.getElementById('chartBG').setAttribute('display', 'none');
          document.getElementById('legend').setAttribute('display', 'none');
          document.getElementById('yAxis').setAttribute('display', 'none');
          _updateMouseX(e, isHover, colorMapData, typeFeature); 
          }
      })
      hoverRect.addEventListener("click", (e)=> {
        isHover = false
        if (gsap.getById("imgRise")) gsap.getById("imgRise").pause(); //imgFall
        if (!isHover) gsap.getById("imgRise").paused( !gsap.getById("imgRise").paused());
        
        const sneakersGroup = document.querySelectorAll('.below-sneakers-img')
        sneakersGroup.forEach(item => {
          item.addEventListener("click", (e)=> {
            // _onInitDetailInfos(e.target)
          })
        })
      })
    }
  }
  // set button trigger and reset chart map
  const buttons = document.getElementById('buttons')
  buttons.addEventListener("click", (e)=> {
    e.target.parentNode.childNodes.forEach(item => {
      if (e.target.id == item.id) item.classList.toggle(item.id);
      else if (e.target.id != item.id && item.nodeType == 1) item.classList.remove(item.id);
    })
    toggleBtn.childNodes.forEach(item => {
      if (toggleBtn.classList.contains('selected')) {
        if (item.nodeType == 1 && item.id == 'circle-txt') item.classList.remove('toggleTxt') 
        else if (item.nodeType == 1 && item.id == 'circle-xs' || item.id == 'circle-xl' && item.nodeType == 1) item.classList.remove('toggleBG')
      }
    })
    toggleBtn.classList.remove('selected')
    const featureData = e.target.id == 'redBtn' ? 'tradingRange' : 'resaleVolume'
    _onInit(colorMapData, featureData)
    flag4cluster = false;
  })
  const toggleBtn = document.getElementById('toggleBtn')
  toggleBtn.addEventListener("click", (e)=> {
    e.target.parentNode.classList.add('selected')
    e.target.parentNode.childNodes.forEach(item => {
      if (item.id == 'circle-txt' && item.nodeType == 1) item.classList.toggle('toggleTxt') 
      else if (item.id == 'circle-xs' && item.nodeType == 1 || item.id == 'circle-xl' && item.nodeType == 1) item.classList.toggle('toggleBG')
    })
    buttons.childNodes.forEach(item => {
      if (item.nodeType == 1 && item.classList.contains('redBtn')) item.classList.remove('redBtn') 
      else if (item.nodeType == 1 && item.classList.contains('blueBtn')) item.classList.remove('blueBtn')
    })
    flag4cluster = true;
    _onInit(colorMapData, 'colorCluster')
  })
  
  // const _canvasWidth = Math.floor(window.innerWidth)
  // const _canvasHeight = Math.floor(window.innerHeight)

  const typeFeatures = ['tradingRange', 'resaleVolume', 'colorCluster']
  const idFeatures = {tradingRange:'redBtn', resaleVolume:'blueBtn', colorCluster: 'toggleBtn'}
  const initValue = typeFeatures[0]
  _onInit(colorMapData, initValue)
  if (initValue != 'colorCluster') {
    document.getElementById(idFeatures[initValue]).classList.add(idFeatures[initValue])
  } else {
    document.getElementById('circle-txt').classList.toggle('toggleTxt'); 
    document.getElementById('circle-xs').classList.toggle('toggleBG'); 
    document.getElementById('circle-xl').classList.toggle('toggleBG') 
  }
  console.log('colorMapData', colorMapData)
  })
  