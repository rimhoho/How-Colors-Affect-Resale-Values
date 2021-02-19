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
const _clusterVolume = [17, 8, 10, 1, 11, 1, 2, 1, 1, 7, 7, 14, 2, 2]
const _margin = {gap: _canvasWidth * _onGetRatio(20, _canvasWidth, null), top: _canvasHeight * _onGetRatio(30, null, _canvasHeight), 
                 right: _canvasWidth * _onGetRatio(60, _canvasWidth, null), bottom: _canvasHeight * _onGetRatio(50, null, _canvasHeight), 
                 left: _canvasWidth * _onGetRatio(140, _canvasWidth, null), columnWidth: _canvasWidth * _onGetRatio(170, _canvasWidth, null)};
const _chart2 = {width: _canvasWidth - _margin.left, height: _canvasHeight * 0.2 * 0.8,
                 bigger_gap: _canvasHeight * _onGetRatio(22, null, _canvasHeight), big_gap: _canvasHeight * _onGetRatio(16, null, _canvasHeight),
                 sm_gap: _canvasHeight * _onGetRatio(12, null, _canvasHeight), smer_gap: _canvasHeight * _onGetRatio(10, null, _canvasHeight),
                 smst_gap: _canvasHeight * _onGetRatio(8, null, _canvasHeight)}
const _color = {mapLine: "#c6c6c6", mapBG: "#f0f0f0", mainMap: "#e6e6e6", premiumPrice: "#F65E5D", resaleVolume: "#0382ed", yellow: "#ffd62c", msrp: "#808080", blueGrey: "#484f59", chartBG: "#FDFDFD", text: "#333333", greyText: '#999999', greyBlue: "#7e8996"}
const _colorXScale = _canvasWidth - (_margin.left * 2) - _margin.right;
const _colorYScale = _canvasHeight - _chart2.height - _margin.left; 
let colorMapData = [], avgSumOfSold = 0;
let flag4cluster = true, clusterYHolder = [];;

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
  let minAvgResalePrice = 200
  let maxAvgResalePrice = 1000
  let maxNumOfAsks = 200
  let maxNumOfBids = 1000

  colorDistance.filter((obj, index) => {
    sumPrimaryDistance += obj.distance_primary;
    avgOfSold = Math.round(avgSumOfSold/stockX.length);
    stockX.forEach((d, i) => {
      if (obj.target == d.title) {
        if (maxPrimaryD < Math.round(sumPrimaryDistance)) {maxPrimaryD = Math.round(sumPrimaryDistance)}
        maxTradingHigh = maxTradingHigh < d.trade_range_high ? d.trade_range_high : maxTradingHigh;
        maxSoldNum = maxSoldNum < d.number_of_sales ? d.number_of_sales : maxSoldNum
        maxAvgResalePrice = d.trade_range_high > maxAvgResalePrice ? d.trade_range_high : maxAvgResalePrice
        minAvgResalePrice = d.trade_range_low < minAvgResalePrice ? d.trade_range_low : minAvgResalePrice
        maxNumOfAsks = d.number_of_Asks > maxNumOfAsks ? d.number_of_Asks : maxNumOfAsks
        maxNumOfBids = d.number_of_Bids > maxNumOfBids ? d.number_of_Bids : maxNumOfBids
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
                           'avg_price_premium': (d.trade_range_high - d.trade_range_low) / 2 + d.trade_range_low
                          //  'range_price_premium': d.price_premium_range,
                          //  'total_dollars': d.total_dollars,
                          //  'volatility': d.volatility
                          })

        const comparisonC = (index != 0) ? colorDistance[index - 1].cluster : "cluster0";
        const widthRatio = _canvasWidth * _onGetRatio(70, _canvasWidth, null)
        if (comparisonC != obj.cluster) {
          const gapValue = (index != 0) ? obj.distance_primary : 0
          clusterWidths[comparisonC] = {'count': clusterCount, 'width': widthRatio, 'relativePrimary': Math.round(sumPrimaryDistance), 'sumUpWidth': sumUpWidth, 'gap': gapValue, 'sumUpGap': sumUpGap}
          sumUpGap += gapValue
          sumUpWidth += widthRatio
          clusterCount = 1;
        } else {
          clusterCount++
        }
        if (index == colorDistance.length - 1) {
          clusterWidths[obj.cluster] = {'count': clusterCount, 'width': widthRatio, 'relativePrimary': Math.round(sumPrimaryDistance), 'sumUpWidth': sumUpWidth, 'gap': obj.distance_primary, 'sumUpGap': sumUpGap}
        }
      }
    })
  })
  const parseDate = d3.timeParse("%m/%d/%Y");
  const _colorMapByCluster = d3.nest()
                               .key(function(d) { return d.range_cluster; })
                              //  .sortValues(function(a,b) { return a.release_MY - b.release_MY})
                               .entries(colorMapData);
  const _colorMapBySeries = d3.nest()
                              .key(function(d) { return d.range_category; })
                              .sortValues(function(a,b) { return a.release_MY - b.release_MY})
                              .entries(colorMapData);
  const _colorMapByavgPricePremium = d3.nest()
                                       .key(function(d) { return d.avg_price_premium; })
                                       .sortKeys((a, b) => d3.descending(+a, +b))
                                       .entries(colorMapData);
  const _colorMapByReleaseYear = d3.nest()
                                   .key(function(d) { return d.release_year; })
                                   .sortKeys((a, b) => d3.ascending(+a, +b))
                                   .sortValues(function(a,b) { return parseDate(a.release_date) - parseDate(b.release_date)})
                                   .entries(colorMapData);
  console.log(_colorMapByavgPricePremium)
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
          if (dominantBaseline != null) text.setAttribute('dominant-baseline', dominantBaseline)
          if (color != null) text.setAttribute('fill', color);
          if (textContent != null) text.textContent = textContent;
    return text
  }
  // function _createTextByWidth(parent, x, y, id, classes, textAnchor, dominantBaseline, color, maxWidth, bodyContext){
  //   let words = bodyContext.split(' ');                        
  //   let text_element = _createText(x, y, id, classes, textAnchor, dominantBaseline, color, textContent = null);
  //   let tspan_element = document.createElementNS(_svgNS, "tspan");
  //   let text_node = document.createTextNode(words[0]);        
  //       tspan_element.appendChild(text_node);                        
  //       text_element.appendChild(tspan_element);
  //       parent.appendChild(text_element);
  //       console.log(text_element.lastElementChild.getComputedTextLength())
  //   for (let i = 1; i < words.length; i++) {
  //       let len = tspan_element.firstChild.data.length;          
  //       tspan_element.firstChild.data += " " + words[i];         
  //       // console.log(tspan_element.getComputedTextLength(), maxWidth, tspan_element.firstChild.data)
  //       if (tspan_element.getComputedTextLength() > maxWidth) {
  //           tspan_element.firstChild.data = tspan_element.firstChild.data.slice(0, len); 
  //           let new_tspan = _createTspan(x, y * i, id, classes, textAnchor, color, words[i])
  //           text_element.appendChild(new_tspan);
  //       }
  //   }
  // } 
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
  function _setAttributes(el, attrs){
    Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
  }
  // create bar charts and the inner elements (legend, yAxis)
  function _createYAxis(maxValue, interval, yScalText) {
    // yAxis bar
    const yAxisGroup = document.createElementNS(_svgNS, 'g');
          yAxisGroup.setAttribute('id', 'yAxis');
    // yAxis text
    const yAxisTextEl = _createText(0, 0, id = null, 'yAxisText', textAnchor = null, dominantBaseline = null, color = null, textContent = null)
    const yAxisDesc = _createText(_margin.left * 0.97, _chart2.height, id = null, 'smaller-body', 'end', 'hanging', color = null, 'Trading Range ($)')
    let flag = 0;
    for (var i = maxValue; i >= 0; i -= interval) {
      flag ++;
      const newDy = flag == 2 ? _chart2.smer_gap * 0.8 : yScalText
      const colorLine = flag % 2 != 0 ?  _color.mapBG : _color.mapBG
      const yAxisBar = _createLine(_margin.left, _margin.left * 1.04, _chart2.height * i / maxValue, _chart2.height * i / maxValue, id = null, 'yAxis',  colorLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
      const yAxisTspan = _createTspan(_margin.left * 0.97, newDy, id = null, 'smaller-body', 'end', _color.text, i.toLocaleString())
              yAxisGroup.appendChild(yAxisBar)
              if (flag % 2 == 0) yAxisTextEl.appendChild(yAxisTspan)
    }
    yAxisGroup.appendChild(yAxisDesc)
    yAxisGroup.appendChild(yAxisTextEl)
    return yAxisGroup;
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
              textClass = "thin-bigger-body"
              textX = x
              textY = _margin.top * 0.88
              if (typeof context[m] != 'number' && context[m].includes('%')) textX = _margin.gap * 0.6
          } else if (m == 0) {
              if (classes == "big-body") textClass = "big-body"
              else if (classes == "legend-body") textClass = "legend-body"
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
              textColor = _color.mapLine
          } else {
              textClass = "legend-body"
              textX = x
              if (context[m] == 0 || context[m] == 100) textY = m * _margin.top * 1
              else textY = m * _margin.top * 0.8
              
          }
          const bodyTitle = _createText(textX, textY, id = null, textClass, textAnchor, dominantBaseline = null, textColor, context[m])
                bodyTGroup.appendChild(bodyTitle)
        }
      return bodyTGroup
    }

  function _createXAxis(maxValue, interval, contentWidth) {
      const xAxisGroup = document.createElementNS(_svgNS, 'g');
            xAxisGroup.setAttribute('id', 'popup-xaXis-group');
            xAxisGroup.setAttribute('transform', `translate(${_margin.right * 2.4}, ${_margin.bottom * 1.4 + _margin.top * 0.6})`)
      // yAxis horizontal line
      const xAxisLine = _createLine(0, contentWidth, _margin.top * 0.6, _margin.top * 0.6, 'xAxis-line', classes = null, _color.greyText, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
            xAxisGroup.appendChild(xAxisLine)
      // yAxis texts with vertical lines
      const xAxisDesc = _createText(-_margin.gap, _chart2.smer_gap, id = null, 'legend-body', 'end', 'hanging', _color.greyText, '( StockX.com, 12 Mos. )')
            xAxisGroup.appendChild(xAxisDesc)
      let flag = 0;
      for (var i = maxValue; i >= 0; i -= interval) {
        flag ++;
        const startLine = flag % 2 != 0 ? _chart2.sm_gap : _chart2.sm_gap * 1.16
        const endLine = flag % 2 != 0 ? _chart2.big_gap * 1.1 : _chart2.big_gap * 1.1
        const yAxisBar = _createLine(contentWidth * i / maxValue, contentWidth * i / maxValue, startLine, endLine, id = null, 'yAxis',  _color.greyText , _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
        const yAxisText = _createText(contentWidth * i / maxValue, _chart2.smst_gap * 0.5, id = null, 'smaller-body', 'middle', dominantBaseline = null, _color.greyText, `$${i.toLocaleString()}`)
                xAxisGroup.appendChild(yAxisBar)
                if (flag % 2 != 0) xAxisGroup.appendChild(yAxisText)
      }
      return xAxisGroup;
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
      const barTextEl2 = _createText(0, 0, id = null, 'barText small-body', 'middle', 'hanging', _color.premiumPrice, '') 
            barG.appendChild(barTextEl2)
      const barTextEl3 = _createText(0, 0, id = null, 'barText small-body', 'middle', 'hanging','white', '')
            barG.appendChild(barTextEl3)
      // sneakers name
      const xAxisTextEl = _createText(0, 0, id = null, 'xAxisLabel', textAnchor = null, dominantBaseline = null, color = null, textContent = null) 
      newShortentitle.forEach((item, i) => {
        const xAxisTspan1 = _createTspan(0, 0, id = null, 'small-body bold', 'start', _color.text, item)
              xAxisTextEl.appendChild(xAxisTspan1)
      })
      const xAxisTspan2 = _createTspan(0, 0, id = null, 'smaller-body', 'start', _color.mapBG, "")
            xAxisTextEl.appendChild(xAxisTspan2)
      const xAxisTspan3 = _createTspan(0, 0, id = null, 'smaller-body', 'start', _color.mapBG, "")
            xAxisTextEl.appendChild(xAxisTspan3)
      const barImg = _createImage(0, 0, id = null, classes = null,'', 0, height = null)
            barG.appendChild(xAxisTextEl)
            barG.appendChild(barImg)
            target.appendChild(barG);
    }
  }
  // set attribute bar charts
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
    sneakersGroup.lastChild.previousSibling.setAttribute('y', y2 + _chart2.big_gap) // xAxis label

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
//     console.log(c, sneakersGroup)
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
  function _onTweenChart(c, target, arrData) {
    const getIdx = target.id.split('_')[1];
    const targetChart = target.parentNode.parentNode.firstChild.lastChild.childNodes;
    let sumUp4avg;
    arrData.forEach((d, index) => {
      if (getIdx == index) {
          const newX = _chart2.bigger_gap * 1.3
          const mstpH = _chart2.height * d.retail_price / maxTradingHigh
          const premiumH = _chart2.height * d.range_trade_high / maxTradingHigh
          const baseH = _chart2.height * d.range_trade_low / maxTradingHigh 
          const barW = _canvasWidth * _onGetRatio(26, _canvasWidth, null)
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
          if (targetChart[c] != undefined) _setAttributeTrading(c, targetChart[c], newX, mstpH, premiumH, baseH, barW, x1, y1, y2, y3, newShortentitle, newShortenMonth, newShortenYear, range_trade_high, range_trade_low, retail_price, title);
          // set default sneakers
          document.getElementById('empty-detail-BG').setAttribute('display', 'none')
          if (c == 1) _onInitDetailInfos(targetChart[1].lastChild)
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
    item.parentNode.parentNode.firstChild.nextElementSibling.setAttribute('fill-opacity', 1);
    item.parentNode.parentNode.firstChild.nextElementSibling.setAttribute("d", `M${startX} ${_canvasHeight * 0.2} L${endX} ${_canvasHeight * 0.2} L${_canvasWidth - _margin.left} ${_canvasHeight * 0.243} L${_margin.left} ${_canvasHeight * 0.243} Z`)
    return item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value - mouseX
  }

  // check mouseXY for animation
  const detectArea = _canvasWidth * _onGetRatio(40, _canvasWidth, null);
  const radius = _canvasWidth * _onGetRatio(140, _canvasWidth, null);
  function _updateMouseX(e, isHover, sneakersData) {
    let mouseX, targetX;
    let radians, newX, newY;
    let startX, endX;
    let avg_value;
    let sumUp4avg = 0;
    let c = 0; //detected sneakersCount on every mouse hover
    const maxValue4avg = maxTradingHigh
    if (isHover) {
      e.target.parentNode.firstChild.lastChild.childNodes.forEach((value, index) => {
        if (index != 0) _setAttributeTrading(c, value, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", "", "", "", "", "", title = null)
      })
      e.target.previousSibling.childNodes.forEach(item => {
        mouseX = e.pageX - (Math.floor(window.innerWidth) - _canvasWidth) / 2 - _margin.left;
        targetX = item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value;
        if (Math.abs(item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value - mouseX) <= detectArea && item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.getAttribute('transform')) {
          c += 1;
          _onTweenMap(item, mouseX, radians, newX, newY, startX, endX)
          avg_value = _onTweenChart(c, item, sneakersData)
          sumUp4avg += avg_value
          item.parentNode.parentNode.firstChild.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('y1', _chart2.height - (_chart2.height * (sumUp4avg / c) / maxValue4avg))
          item.parentNode.parentNode.firstChild.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('y2', _chart2.height - (_chart2.height * (sumUp4avg / c) / maxValue4avg))
          item.parentNode.parentNode.firstChild.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('y', _chart2.height - (_chart2.height * (sumUp4avg / c) / maxValue4avg) - (_chart2.smer_gap * 0.5))
          item.parentNode.parentNode.firstChild.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.textContent = "Avg. Resale Price $" + parseInt(sumUp4avg / c).toLocaleString()
        } else {
          item.firstChild.setAttribute("stroke-opacity", 0);
          item.firstChild.nextElementSibling.setAttribute("x2", targetX)
          item.firstChild.nextElementSibling.setAttribute("y2", _canvasHeight * 0.2 - _margin.top)
          item.firstChild.nextElementSibling.setAttribute("stroke-opacity", 0);
          item.firstChild.nextElementSibling.nextElementSibling.setAttribute("fill-opacity", 0);
          item.firstChild.nextElementSibling.nextElementSibling.setAttribute("stroke-opacity", 0);
          gsap.to(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling, {id: "imgFall", duration: 0.75, rotation: 0, x: 0 , y:0, ease: "elastic.out(1, 0.5)"})
        }
        item.parentNode.parentNode.firstChild.setAttribute('fill-opacity', 1);
      })
    } else {
      e.target.parentNode.firstChild.lastChild.childNodes.forEach((value, index) => {   
        if (index != 0) _setAttributeTrading(c, value, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", "", "", "", "", "", title = null)
      })
      e.target.previousSibling.childNodes.forEach(item => {
        if (gsap.getById("imgRise")) {gsap.getById("imgRise").reverse();}
        item.firstChild.setAttribute("stroke-opacity", 0);
        item.firstChild.nextElementSibling.setAttribute("stroke-opacity", 0);
        item.parentNode.parentNode.firstChild.setAttribute('fill-opacity', 0);
        item.parentNode.parentNode.firstChild.nextElementSibling.setAttribute('fill-opacity', 0);
        gsap.to(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling, {id: "letFall", duration: 0.75,  rotation: 0, x: 0 , y:0, ease: "elastic.out(1, 0.5)"})
      })
      e.target.parentNode.firstChild.firstChild.nextElementSibling.setAttribute('y1', -10)
      e.target.parentNode.firstChild.firstChild.nextElementSibling.setAttribute('y2', -10)
      e.target.parentNode.firstChild.firstChild.nextElementSibling.nextElementSibling.setAttribute('y', -10)
    }
  }
  function _Tween4DisplayDetails() {
    const sneakersGroup = document.querySelectorAll('.below-sneakers-img')
    sneakersGroup.forEach(item => {
      item.style.cursor = "pointer"
      item.addEventListener("click", (e)=> {
        document.getElementById('empty-detail-BG').setAttribute('display', 'none')
        _removeAllChildNodes(document.getElementById('detail-infos'))
        _onInitDetailInfos(e.target)
      })
    })
  }
  function _OnInitMainMap(mainSVG, flag4cluster) {
    // create init map
    const sec0Rect1 = document.createElementNS(_svgNS, 'path');
          sec0Rect1.setAttribute('id', 'navigation');
          sec0Rect1.setAttribute('d', `M${_margin.left} ${_canvasHeight * 0.14} L${_margin.left + _canvasWidth * _onGetRatio(120, _canvasWidth, null)} ${_canvasHeight * 0.14} L${_canvasWidth - _margin.left} ${_canvasHeight * 0.14} L${_margin.left} ${_canvasHeight * 0.14} Z`);
          sec0Rect1.setAttribute('fill', _color.mainMap);
          sec0Rect1.setAttribute('fill-opacity', 1);
          mainSVG.appendChild(sec0Rect1);
//     const sec0ClusterG = document.createElementNS(_svgNS, 'g');
//           sec0ClusterG.setAttribute('id', 'color-cluster-bar');
//           sec0ClusterG.setAttribute('transform', `translate(0, 0)`);
//           mainSVG.appendChild(sec0ClusterG);
    const sec0G = document.createElementNS(_svgNS, 'g');
          sec0G.setAttribute('id', 'sneakersMap');
          sec0G.setAttribute('transform', `translate(${_margin.left}, ${_margin.top})`);
    //description - mouse hover
    const destGroup1 = document.createElementNS(_svgNS, 'g');
          destGroup1.setAttribute('id', 'mouse-hover');
          destGroup1.setAttribute('transform', `translate(${_margin.gap}, -${_chart2.smst_gap})`);
          destGroup1.setAttribute('width', _canvasWidth * _onGetRatio(20, _canvasWidth, null));
          destGroup1.setAttribute('height', _canvasHeight * 0.2/2);
    const imageTag1 = _createImage(_canvasWidth - _margin.left, _canvasHeight * 0.1, id = null, classes = null, 'img/mouse_hover.svg', _chart2.bigger_gap * 1.8, height = null)
          destGroup1.appendChild(imageTag1);
          gsap.to(imageTag1, {duration: 1, scaleX:0.92, scaleY:0.92, force3D:true, yoyo:true, repeat:-1, ease: "power1.inOut"});
    for (var j = 0; j < 2; j++) {
      const text4desc1 = j == 0 ? 'Hover To Show' : 'Price Premium Charts'
      const hovorText1 = _createText(_canvasWidth - (_margin.left * 0.84), _canvasHeight * 0.144 + (j * _chart2.sm_gap), id = null, 'small-body', 'middle', dominantBaseline = null, _color.premiumPrice, text4desc1)
            destGroup1.appendChild(hovorText1);
    }
    mainSVG.appendChild(destGroup1)
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
  function _OnInitBelowChart(belowChart) {
    // bg
    const sec2RectBG = _createRect(_margin.left, 0, 'chartBG', classes = null, _chart2.width - _margin.left, _chart2.height, _color.mainMap)
          sec2RectBG.setAttribute('display', 'none')
          belowChart.appendChild(sec2RectBG);
    // create avg. price premium guideline in dash
    const avg_line1 = _createLine(_margin.left, _chart2.width, -10, -10, 'avg_guideline', classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
          avg_line1.setAttribute('stroke-dasharray', _margin.gap * 0.1)
          belowChart.appendChild(avg_line1);
    const avg_text1 = _createText(_chart2.width * 1.01, _canvasHeight * 0.2 - (_margin.bottom * 2.6), id = null, 'small-body', 'start', dominantBaseline = null, _color.text, "") 
          belowChart.appendChild(avg_text1);
    // xAxis
    const sec2xAxis = _createLine(_margin.left, _chart2.width, _chart2.height, _chart2.height, 'xAxis', classes = null, _color.text, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
          belowChart.appendChild(sec2xAxis);
    // group tag
    const sec2Group1 = document.createElementNS(_svgNS, 'g');
          sec2Group1.setAttribute('id', 'below-chart-bar-group')
          belowChart.appendChild(sec2Group1)
    // yAxis
    const sec2yAxis = _createYAxis(maxTradingHigh + 115, 100, _chart2.bigger_gap * 1.18)
          sec2yAxis.setAttribute('display', 'none')
          belowChart.appendChild(sec2yAxis)
          // create dummy bar chart
          _createBarChart(sec2Group1, Math.round(document.getElementById('chartBG').width.animVal.value / 52));
          belowChart.appendChild(sec2Group1);
    return
  }
  function _onInitDetailInfos(target) {
    const titleId = target.id.split('_')[1]
    const detailMapWidth = _canvasWidth - (_margin.left * 2)
    const detailMapHeight = _margin.bottom * 4.3
    const innerColumnWidth = (detailMapWidth / 4) - (_margin.gap * 0.5)// _canvasWidth * _onGetRatio(176, _canvasWidth, null)
    const innerColumnWidthEnd = innerColumnWidth - _margin.gap
    const bottomDetail = document.getElementById('detail-infos')
    const detailInfos = document.createElementNS(_svgNS, 'g')
          detailInfos.setAttribute('id', 'detail-horizontal-chart')
          detailInfos.setAttribute('transform', `translate(${_margin.left}, ${_canvasHeight * 0.48})`);
          bottomDetail.appendChild(detailInfos)
    const sec1Rect = _createRect(0, 0, id = null, 'detail-horizontal-BG', detailMapWidth, detailMapHeight, _color.blueGrey)
          sec1Rect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
          sec1Rect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
          detailInfos.appendChild(sec1Rect);
    for (var i = 0; i < 4; i++) {
      // grouping four columns
      const secRectGroup = document.createElementNS(_svgNS, 'g')
            secRectGroup.setAttribute('id', `detail_group_${i+1}`)
            secRectGroup.setAttribute('transform', `translate(${(_margin.gap * 1.6) + (i * innerColumnWidth)}, ${_margin.top * 1.24})`);
            detailInfos.appendChild(secRectGroup)
    }
    let txtX, txtY, barWidth;

    colorMapData.forEach((sneakersData, i) => {
      if (titleId == sneakersData.title) {
        // first column 
        const firstGroup = document.getElementById('detail_group_1') 
        const txt1Left = [sneakersData.range_category, sneakersData.shorten_title]
        for (var i = 0; i < 3; i++) {
              const firstClass = i == 1 ? "thin-bigger-body" : "big-body"
              const stackedTxtLeft = _createText(0, _chart2.bigger_gap * i, id = null, firstClass,"start", dominantBaseline=null, _color.mapBG, txt1Left[i])  
                    firstGroup.appendChild(stackedTxtLeft)    
        }
        const stackedTxtRight = _createText(innerColumnWidthEnd, 0, id = null, "legend-body", "end", dominantBaseline=null, _color.greyText, sneakersData.release_MY)
              firstGroup.appendChild(stackedTxtRight) 
        const detailThmnail = _createImage(0, _chart2.sm_gap, id = null, "detail-info-thmnail", `img/${sneakersData.title}.png`, innerColumnWidth - _margin.gap,  _canvasHeight * _onGetRatio(160, null, _canvasHeight))
              firstGroup.appendChild(detailThmnail)
        // second column 
        const secondGroup = document.getElementById('detail_group_2') 
        const txt2Left = ['Color Difference', sneakersData.absolute_highlight, 'Delta E', '0']
        const txt2Right = ['Base & Highlight', '', '', '100']
        barWidth = innerColumnWidth * sneakersData.absolute_highlight / 100;

        for (var i = 0; i < 4; i++) {
              let secClass;
              if (i == 1) secClass = "thin-bigger-body" 
              else if (i == 3) secClass = "legend-body"
              else secClass = "small-body"
              txtY = i == 1 ? _chart2.bigger_gap * i : _margin.top * 0.94 * i
              const secLetfText = _createText(0, txtY, id = null, secClass, "start", dominatBaseline=null, _color.mapLine, txt2Left[i])
              const secRightText = _createText(innerColumnWidthEnd, txtY, id = null, "legend-body", "end", dominatBaseline=null, _color.greyText, txt2Right[i])
              secondGroup.appendChild(secLetfText)
              secondGroup.appendChild(secRightText)
        }
        const secBar1BGChart = _createRect(0, _margin.bottom * 1.24, id = null, "detail-info-bar-bg", innerColumnWidth - _margin.gap, _chart2.big_gap * 0.76, _color.mapLine)
              secBar1BGChart.setAttribute('opacity', 0.4) 
        const secBar1Rect = _createRect(0, _margin.bottom * 1.24, id = null, "detail-info-bar-grey", barWidth, _chart2.big_gap * 0.76, _color.mapLine)
        const secMddText = _createText(barWidth, _margin.bottom + (_margin.top * 1.2), id = null, "small-body", "start", dominatBaseline=null, _color.mapLine, sneakersData.absolute_highlight)
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
              const rectBarText = _createText(innerColumnWidth/2 + (_margin.gap * 0.5) + (innerColumnWidth/2 - (_margin.gap * 1.5))/2, (_margin.top * 0.8 * n) + _chart2.smst_gap, id = null, "legend-body", "middle", "hanging", "white", rectText)
                    secImgGroup.appendChild(rectBarText)
        }
        document.getElementById('color-bg').setAttribute('fill', `rgb(${sneakersData.fullRGB[0].replaceAll(' ', ', ')})`)
        document.getElementById('color-bg').setAttribute('fill-opacity', 0.5)
        // third column 
        const thirdGroup = document.getElementById('detail_group_3')
        const txt3Left = ['Price Premium', `${(sneakersData.price_premium * 100).toFixed(0).toLocaleString()}%`, 'Avg. Resale Price', `$${(minAvgResalePrice).toLocaleString()}`, 'Trading Range', `$${("" + sneakersData.range_trade_low).toLocaleString()}`]
        const txt3Right = [`MSRP: $${sneakersData.retail_price}`, '', '', `$${(maxAvgResalePrice).toLocaleString()}`, '', `$${(maxAvgResalePrice).toLocaleString()}`]
        const txt3Middle = ['', '', '', `$${(sneakersData.retail_price + (sneakersData.retail_price * sneakersData.price_premium)).toFixed(0).toLocaleString()}`, '', `$${("" + sneakersData.range_trade_high).toLocaleString()}`]
        const arrowSymbol = (sneakersData.price_premium > 0.01) ? 'arrow_up' : 'arrow_down'
        for (var i = 0; i < 6; i++) {
              let thirdClass;
              if (i == 1) thirdClass = "thin-bigger-body" 
              else if (i == 3 || i == 5) thirdClass = "legend-body"
              else thirdClass = "small-body"
              txtX = i == 1 && txt3Left[i].includes('%') ? _margin.gap * 0.58 : 0
              if (i == 1) txtY = _chart2.bigger_gap * i 
              else if (i == 3) txtY = _chart2.bigger_gap * 1.3 * i
              else if (i == 5) txtY = _chart2.bigger_gap * 1.24 * i
              else txtY = _margin.top * 0.9 * i
              const thirdLetfText = _createText(txtX, txtY, id = null, thirdClass, "start", dominatBaseline=null, _color.mapLine, txt3Left[i])
              const thirdRightText = _createText(innerColumnWidthEnd, txtY, id = null, "legend-body", "end", dominatBaseline=null, _color.greyText, txt3Right[i])
              thirdGroup.appendChild(thirdLetfText)
              thirdGroup.appendChild(thirdRightText)
        }
        const detailSymbol = _createImage(0, _chart2.smst_gap * 0.8, id = null, "detail-info-arrow", `img/${arrowSymbol}.svg`, _margin.gap * 0.38, height = null)
              thirdGroup.appendChild(detailSymbol)
        for (var m = 0; m < 2; m++) {
              const thirdBarBGChart = _createRect(0, _margin.bottom + (m * _margin.bottom + (_margin.top * 0.42)), id = null, "detail-info-bar-bg", innerColumnWidth - _margin.gap, _chart2.big_gap * 0.76, _color.mapLine)
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
        const txt4left = ['Total Resale Volume', `${(sneakersData.number_of_sales).toLocaleString()}`, 'Number of Asks',  '', 'Number of Bids', '']
        const txt4right = ['' , '', '', `${(maxNumOfAsks).toLocaleString()}`, '', `${(maxNumOfBids).toLocaleString()}`]
        const txt4middle = ['' , '', '', `${(sneakersData.number_of_Asks).toLocaleString()}`, '', `${(sneakersData.number_of_Bids).toLocaleString()}`]
        for (var i = 0; i < 6; i++) {
              if (i == 1) txtY = _chart2.bigger_gap * i 
              else if (i == 3) txtY = _chart2.bigger_gap * 1.3 * i
              else if (i == 5) txtY = _chart2.bigger_gap * 1.24 * i
              else txtY = _margin.top * 0.9 * i
              const fourthClass = i == 1 ? "thin-bigger-body" : "small-body"
              const fourthLetfText = _createText(0, txtY, id = null, fourthClass, "start", dominatBaseline=null, _color.mapLine, txt4left[i])
              const fourthRightText = _createText(innerColumnWidthEnd, txtY, id = null, "legend-body", "end", dominatBaseline=null, _color.greyText, txt4right[i])
                    fourthGroup.appendChild(fourthLetfText)
                    fourthGroup.appendChild(fourthRightText)
        }
        for (var m = 0; m < 2; m++) { 
              bar2Width = m == 0 ? innerColumnWidth * sneakersData.number_of_Asks / maxNumOfAsks : innerColumnWidth * sneakersData.number_of_Bids / maxNumOfBids
              collectText =  m == 0 ? txt4middle[3] : txt4middle[5]
              const fourthBarBGChart = _createRect(0, _margin.bottom + (m * _margin.bottom + (_margin.top * 0.4)), id = null, "detail-info-bar-bg", innerColumnWidth - _margin.gap, _chart2.big_gap * 0.76, _color.mapLine)
                    fourthBarBGChart.setAttribute('opacity', 0.4)      
                    fourthGroup.appendChild(fourthBarBGChart)
              const fourthMddText = _createText(bar2Width, _margin.bottom + (m * _margin.bottom + (_margin.top * 1.34)), id = null, "small-body", "start", dominatBaseline=null, _color.resaleVolume, collectText)
                    fourthGroup.appendChild(fourthMddText)
              const fourthresaleChart = _createRect(0, _margin.bottom + (m * _margin.bottom + (_margin.top * 0.4)), id = null, "detail-info-bar-primary", bar2Width, _chart2.big_gap * 0.76, _color.resaleVolume)
                    fourthGroup.appendChild(fourthresaleChart)
        }
      }
    })
  }
  function _onInitPopUpChart(mapData, popupWidth) {
      const sortOption = mapData.length == 17 ? 'By Delta E' : 'By Release Date'
      const popupMainSvg = document.getElementById('popup-main-svg')
      // title
      const titleTxt = _createText(_margin.gap * 1.4, _margin.top * 0.4, id = null, 'bigger-body title-txt', "start", "hanging", "white", 'Trading Range')
            popupMainSvg.appendChild(titleTxt)
      const captionTxt = _createText(_margin.gap * 1.46, _margin.top * 1.12, 'popup-sort-option', 'legend-body title-txt', "start", "hanging", _color.mapLine, sortOption)
            popupMainSvg.appendChild(captionTxt)
      // icon legend
      const IconTxt = ['Retail Price (MSRP)', 'First Release of the Series']
      const createSymbol = [_createImage(0, 0, 'dollar-symbol', "pointer", `img/dollar-symbol-legend.svg`, _canvasWidth * _onGetRatio(13, _canvasWidth, null), height = null), _createImage(0, _chart2.smst_gap * 0.4, 'first-released', "pointer", `img/first-released-legend.svg`, _canvasWidth * _onGetRatio(13, _canvasWidth, null), height = null)]
      // bar legend
      const barTxt = ['Trades Lower than MSRP', 'Trades Higher than MSRP']
      const createBarBG = [_createRect(0, 0, id = null, classes = null, _margin.gap * 2.8, _chart2.smst_gap * 0.68, _color.mapLine), _createRect(0, _chart2.smst_gap, id = null, classes = null, _margin.gap * 2.8, _chart2.smst_gap * 0.68, _color.mapLine)]
      const createBarIndicator = [_createRect(_margin.gap * 2.8, 0, id = null, classes = null, _margin.gap * 2, _chart2.smst_gap * 0.68, _color.greyText), _createRect(_margin.gap * 2.8, _chart2.smst_gap, id = null, classes = null, _margin.gap * 2, _chart2.smst_gap * 0.68, _color.premiumPrice)]
      // text legend
      const TxtTxt = ['Lowest Price', 'Highest Price']
      const createTxtRect = [_createRect(0, 0, id = null, classes = null, _margin.gap * 0.3, _chart2.smst_gap * 0.86,  _color.resaleVolume), _createRect(0, 0, id = null, classes = null, _margin.gap * 0.3, _chart2.smst_gap * 0.86,  _color.premiumPrice)]
      const legendTitle = ['LINE', 'ICON', 'COLOR', 'TEXT']
      let groupX;
      for (var t = 0; t < legendTitle.length; t++) {
            if (t == 2) groupX = popupWidth - (_margin.left)
            else groupX = (popupWidth - (_margin.left * 2.4)) + (t * _margin.right * 1.1)
            const legendGroup = document.createElementNS(_svgNS, 'g');
                  legendGroup.setAttribute('id', `popup-legend-group-${t}`)
                  legendGroup.setAttribute('transform', `translate(${groupX}, ${_margin.top * 0.78})`)
                  popupMainSvg.appendChild(legendGroup)
            for (var b = 0; b < 2; b++) {
                  const legendInnerGroup = document.createElementNS(_svgNS, 'g');
                        legendInnerGroup.setAttribute('id', `popup-legend-inner-group-${b}`)
                        legendInnerGroup.setAttribute('transform', `translate(${_margin.gap * 1.4}, ${b * _chart2.big_gap})`)
                        if (t != 0) legendGroup.appendChild(legendInnerGroup)
                  if (legendTitle[t] == 'ICON') {
                        legendInnerGroup.appendChild(createSymbol[b])
                        const createSymbolTxt = _createText(_margin.gap * 0.9, _margin.top * 0.04 + (_margin.top * 0.14 * b), id = null, 'legend-body legend-title-txt', "start", "hanging", _color.mapLine, IconTxt[b])
                              legendInnerGroup.appendChild(createSymbolTxt)
                  } else if (legendTitle[t] == 'COLOR') {
                        const barLegendTxt = _createText(0, _margin.top * 0.28 + (_margin.top * 0.25 * b), id = null, 'legend-body legend-title-txt', "start", "hanging", _color.mapLine, barTxt[b])
                              legendInnerGroup.appendChild(createBarBG[b])
                              legendInnerGroup.appendChild(createBarIndicator[b])
                              legendInnerGroup.appendChild(barLegendTxt)
                  }
            }
      }
      const lineGroup = document.getElementById('popup-legend-group-0')
      // line bar
      const lineRect = _createLine(0, _margin.gap * 0.8, _margin.top * 0.2, _margin.top * 0.2, id = null, classes = null, _color.yellow, _chart2.smst_gap * 0.2, 1)
            lineRect.setAttribute('stroke-dasharray', _chart2.smst_gap * 0.4)      
            lineGroup.appendChild(lineRect)
      const lineHighlight = _createCircle(_margin.gap * 0.2, _margin.top * 1.34, id=null, classes=null, _chart2.smst_gap * 0.3, _color.yellow, 1, 'none', strokeWidth=null, strokeOpacity=null)
            lineGroup.appendChild(lineHighlight)
      // line text
      const lineTxt = ['Avg. Price', 'Premium', 'Trend Line']
      for (let p = 0; p < 3; p++) {
            const createLineTxt = _createText(_margin.gap * 1.18, p * _margin.top * 0.34, id = null, 'legend-body legend-title-txt', "start", "hanging", _color.mapLine, lineTxt[p])
            lineGroup.appendChild(createLineTxt)
      }
      const lineTxt2 = _createText(_margin.gap * 0.6, _margin.top * 1.18, id = null, 'legend-body legend-title-txt', "start", "hanging", _color.yellow, 'Top Price Premium')
            lineGroup.appendChild(lineTxt2)
      // create bar chart
      _onTweenBarChart(mapData)
    }
  function _onTweenBarChart(mapData) {
      const svgHeight = mapData.length <= 7 ? _canvasHeight * 0.4 - (_margin.bottom * 2) - (_margin.top * 1.2) : mapData.length * (_canvasHeight * _onGetRatio(50, null, _canvasHeight))
      const popupMainSvg = document.getElementById('popup-main-svg')
      const popupWidth = _canvasWidth - (_margin.left * 3.6)
      const contentWidth = popupWidth - _margin.gap
      const detailWidth  = contentWidth - (_margin.gap * 1.2) - _margin.left
    
      const foreignObject = document.createElementNS(_svgNS, 'foreignObject')
            foreignObject.setAttribute('id', 'foreignObject')
            foreignObject.setAttribute('x', _margin.gap * 0.8)
            foreignObject.setAttribute('y', _margin.bottom * 2.16)
            foreignObject.setAttribute('width', contentWidth)
            foreignObject.setAttribute('height', _canvasHeight * 0.4 - (_margin.bottom * 0.4))
            popupMainSvg.appendChild(foreignObject)
      const divContent = document.createElement('div')
            divContent.style.cssText +=';'+ `max-height:${_canvasHeight * 0.4 - (_margin.bottom * 2)}px; overflow:scroll;`
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
      const popUpBarGroup = document.createElementNS(_svgNS, 'g');
            popUpBarGroup.setAttribute('id', 'popup-bar-group')
            popUpBarGroup.setAttribute('transform', `translate(${_margin.right * 2.1}, ${_margin.top * 0.7})`)
            popupContentSvg.appendChild(popUpBarGroup)
      // group
      const premiumTrendLineGroup = document.createElementNS(_svgNS, 'g');
            premiumTrendLineGroup.setAttribute('id', 'popup-premiumTrendLine-group')
            premiumTrendLineGroup.setAttribute('transform', `translate(${_margin.gap}, ${_margin.top * -1.7})`)
      // group
      const premiumTrendCircleGroup = document.createElementNS(_svgNS, 'g');
            premiumTrendCircleGroup.setAttribute('id', 'popup-premiumTrendCircle-group')
            premiumTrendCircleGroup.setAttribute('transform', `translate(${_margin.gap}, ${_margin.top * -1.7})`)
      let avgTradingValues = [];
      // bar chart content
      mapData.forEach((sneakersData, i) => {
            const tradingBarWidth = detailWidth * sneakersData.range_trade_high / maxAvgResalePrice
            const imageStartX = (sneakersData.shorten_title == 'Turtledove') ? (detailWidth * sneakersData.range_trade_high / maxAvgResalePrice) * 0.93 : (detailWidth * sneakersData.range_trade_high / maxAvgResalePrice) * 0.966
            const tradingBarContent = [`$${(sneakersData.retail_price).toLocaleString()}`, `$${(sneakersData.range_trade_low).toLocaleString()}`, `$${(sneakersData.range_trade_high).toLocaleString()}`]
            const barColor = sneakersData.range_trade_high < sneakersData.retail_price ? _color.greyText : _color.premiumPrice
            // add Bar chart
            const popUpPremiumChart = _createRect(0, _margin.top * i * 1.42, id = null, "detail-info-bar-primary", tradingBarWidth, _chart2.big_gap, _color.mainMap)
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
                        textColor = _color.resaleVolume
                        textY = (_margin.top * 0.6) + (_margin.top * i * 1.42)
                  } else {
                        textX = detailWidth * sneakersData.range_trade_high / maxAvgResalePrice
                        textColor = _color.premiumPrice
                  }
                  if (t == 0 && sneakersData.range_trade_high < sneakersData.retail_price || t == 0 && sneakersData.range_trade_low < sneakersData.retail_price) textAnchorNew = 'start'
                  else if (t == 0 || sneakersData.shorten_title == 'Turtledove') textAnchorNew ='end'
                  else if (t != 0 && sneakersData.range_trade_high < sneakersData.retail_price) textAnchorNew = 'end'
                  else if (t == 1 && sneakersData.range_trade_low < sneakersData.retail_price) textAnchorNew = 'end'
                  else if (t == 1 || t == 2 && sneakersData.range_trade_high - sneakersData.range_trade_low < _margin.gap) textAnchorNew = 'middle'
                  else textAnchorNew = 'start'
                  const tradingBarTxt = _createText(textX, (_margin.top * 0.6) + (_margin.top * i * 1.42), id = null, "legend-body", textAnchorNew, 'hanging', textColor, tradingBarContent[t])
                        popUpBarGroup.appendChild(tradingBarTxt)
            }
            const txtStartX = (sneakersData.shorten_title == 'Turtledove') ? imageStartX - (_margin.right * 0.8) : imageStartX + (_margin.right * 1.1)          
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
                        yaXisClass = 'small-body yaXisTxt'
                        yaXisColor = "white"
                  } else {
                        yaXisText = sneakersData.release_MY
                        yaXisClass = 'legend-body yaXisTxt'
                        yaXisColor =_color.greyText
                  }
                  const yaXisTxtY = (j == 2) ? (_chart2.sm_gap * j) - _chart2.sm_gap : _chart2.sm_gap * j
                  const yaXisTxt = _createTspan(0, yaXisTxtY, id = null, yaXisClass, 'end', yaXisColor, yaXisText)
                        yaXisTxtGroup.appendChild(yaXisTxt)
            }
            // add icon - the first released one of the series
            _colorMapBySeries.forEach(obj => {
                  if (sneakersData.shorten_title == obj.values[0].shorten_title) {
                        const firstReleasedIcon = _createImage(_margin.right * 1.84, _margin.top * 0.74 + (_margin.top * 1.421 * i), id=null, "pointer", `img/first-released-legend.svg`, _canvasWidth * _onGetRatio(13, _canvasWidth, null), height = null)
                        popupContentSvg.appendChild(firstReleasedIcon)
                  }
            })
            avgTradingValues.push(sneakersData.avg_price_premium)
      })
      popUpBarGroup.appendChild(premiumTrendLineGroup)
      popUpBarGroup.appendChild(premiumTrendCircleGroup)
      // create avg. price premium guideline in dash
      let pathData = '', higherPremium = [], indexArr = [];
      avgTradingValues.map((item, i) => {
            const avgTradingLineX = (detailWidth*0.93) * item / maxAvgResalePrice
            const avgTradingLineY = (i == 0) ? _margin.bottom * 1.18 : _margin.bottom * 1.18 + (_margin.top * i * 1.42)
            pathData += pathData === "" ? "M " : " L ";
            pathData += `${Math.round(avgTradingLineX)} ${avgTradingLineY}`;
      })
      const findIdx = avgTradingValues.indexOf(Math.max(...avgTradingValues))
            indexArr.push(findIdx)
            higherPremium.push(avgTradingValues[findIdx])
      const newAvgTradingValues = [...avgTradingValues]
            newAvgTradingValues.splice(findIdx, 1)
            if (Math.max(...newAvgTradingValues) != -Infinity) {
                  higherPremium.push(Math.max(...newAvgTradingValues))
                  indexArr.push(avgTradingValues.indexOf(Math.max(...newAvgTradingValues)))
            }
      const filanlPathD = avgTradingValues.length == 1 ? `${pathData} Z` : `${pathData}`
      const premiumLine = document.createElementNS(_svgNS, 'path');
            premiumLine.setAttribute('id', 'avg-premium-line');
            premiumLine.setAttribute('d', filanlPathD);
            premiumLine.setAttribute('stroke', _color.yellow);
            premiumLine.setAttribute('stroke-opacity', 0.8);
            premiumLine.setAttribute('fill', "none");
            premiumLine.setAttribute('stroke-width', _chart2.smst_gap * 0.2);
            premiumLine.setAttribute('stroke-dasharray', _chart2.smst_gap * 0.4);
            premiumTrendLineGroup.appendChild(premiumLine);
      higherPremium.forEach((item, i) => {
            const circleX = (detailWidth*0.93) * item / maxAvgResalePrice
            const circleY = (indexArr[i] == 0) ? _margin.bottom * 1.18 : _margin.bottom * 1.18 + (_margin.top * indexArr[i] * 1.42)
            const premiumHigher = _createCircle(circleX, circleY, id=null, classes=null, _chart2.smst_gap * 0.4, _color.yellow, 1, 'none', strokeWidth=null, strokeOpacity=null)
            if (mapData.length != 1) premiumTrendCircleGroup.appendChild(premiumHigher);
      })
      // xAxis
      const sec2xAxisTxt = _createXAxis(maxTradingHigh + 15, 100, detailWidth)
            popupMainSvg.appendChild(sec2xAxisTxt)
      // default sneakers detail info
      _onInitDetailVertical(mapData[findIdx])
      const arrowDesc = _createImage(_margin.right * 0.6, _margin.top * 1.44, 'arrow_desc', "pointer", `img/arrow_desc.svg`, _canvasWidth * _onGetRatio(13, _canvasWidth, null), height = null)
      const arrowDescTxt = _createText(_margin.right * 0.88, _margin.top * 1.4, id = null, "legend-body", "start", dominantBaseline = null, _color.yellow, 'A Shoes with the highest price premium')
            document.getElementById('detail-vertical-chart').appendChild(arrowDesc)
            document.getElementById('detail-vertical-chart').appendChild(arrowDescTxt)
      // Check sneakers has been clicked - if yes, show detail infos
      const sneakersFromPopup = document.querySelectorAll('.pop-up-thumnail')
      sneakersFromPopup.forEach(item => {
            item.addEventListener("click", (e)=> {
                  const horizontalSVG = document.getElementById('detail-vertical-chart')
                  _removeAllChildNodes(horizontalSVG)
                  mapData.forEach(dict => {
                        if (dict.title == e.target.id.split('_')[1]) _onInitDetailVertical(dict)
                  })
            })
      })
  }
  function _onInitDetailVertical(sneakersData) {
      const detailInfos = document.getElementById('detail-vertical-chart')
      const sec0RectBg = _createRect(0, 0, 'outside-detail-vertical-BG', classes = null, _canvasWidth, _canvasHeight * 1.4, _color.blueGrey)
            sec0RectBg.setAttribute('fill-opacity', 0.4)
      const sec0RectBG2 = _createRect(_margin.gap, _margin.bottom , 'detail-vertical-BG2', classes = null, _canvasWidth * _onGetRatio(224, _canvasWidth, null), _canvasHeight * _onGetRatio(516, null, _canvasHeight), "white")
            sec0RectBG2.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            sec0RectBG2.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            detailInfos.appendChild(sec0RectBG2);
      const sec0XSVG = document.createElementNS(_svgNS, 'g');
            sec0XSVG.setAttribute('class', 'top');
            sec0XSVG.setAttribute('transform', `translate(${_canvasWidth * _onGetRatio(226, _canvasWidth, null)}, ${-_margin.bottom})`);
            detailInfos.appendChild(sec0XSVG);
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
      const stackedTxtRight = _createStackedText(detailWidth, 0, sec1rightYTxt, "end", "smaller-body", _color.mapLine)
      const detailThmnail = _createImage(detailWidth * 0.1, _chart2.smst_gap, id = null, "detail-vertical-info-thmnail", `img/${sneakersData.title}.png`, detailWidth * 0.84,  _canvasHeight * _onGetRatio(120, null, _canvasHeight))
            secRect1Group.appendChild(stackedTxtLeft)
            secRect1Group.appendChild(stackedTxtRight)
            secRect1Group.appendChild(detailThmnail)
      const sec1Rect = _createLine(0,detailWidth, _margin.top, _margin.top, id = null, classes = null,_color.legend, _canvasWidth * _onGetRatio(1, _canvasWidth, null), strokeOpacity = null)
            secRect1Group.appendChild(sec1Rect)
      const sec2leftYTxt = ['Price Premium', `${(sneakersData.price_premium * 100).toFixed(0).toLocaleString()}%`, 'Trading Range (12 Mos.)','']
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
      if (sneakersData.absolute_highlight >= 22) wordContrast = 'High Contrast'
      else if (sneakersData.absolute_highlight <= 11) wordContrast = 'Low Contrast'
      else wordContrast = 'Mid Contrast'
      if (sneakersData.absolute_highlight.toString().length == 5) textXcase = _margin.gap * 2.54
      else if (sneakersData.absolute_highlight.toString().length <= 2) textXcase = _margin.gap * 1.3
      else textXcase = _margin.gap * 2
      const sec4leftYTxt = ['Color Difference', sneakersData.absolute_highlight, '0'] // 
      const sec4rightYTxt = ['Base & Highlight', '', '100']
      const bar1Width = detailWidth * sneakersData.absolute_highlight / 100
      const sec4LetfText = _createStackedText(0, 0, sec4leftYTxt, "start", "smaller-body", _color.text)
            secRect4Group.appendChild(sec4LetfText)
      const sec4RightText = _createStackedText(detailWidth, 0, sec4rightYTxt, "end", "legend-body", _color.mapLine)
            secRect4Group.appendChild(sec4RightText)
      const sec2MddText1 = _createText(textXcase, _margin.top * 0.74, id = null, "smaller-body bold", "start", dominantBaseline = null, _color.text, wordContrast)
            secRect4Group.appendChild(sec2MddText1)
      const colorTextWhite = _clusterNames[sneakersData.range_cluster] != "White" ? `rgb(${sneakersData.fullRGB[0].replaceAll(' ', ', ')})` : _color.mapLine
      const sec2MddText2 = _createText(bar1Width, _margin.top * 2, id = null, "smaller-body bold", "middle", dominantBaseline = null, colorTextWhite, sneakersData.absolute_highlight)
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
  }
  // remove children nodes from parent
  function _removeAllChildNodes(parent) {
    while (parent.firstChild) parent.removeChild(parent.firstChild);
  } 

  // init main map + below chart
  function _onInitColorCluster(_canvasWidth){
      if (container) _removeAllChildNodes(container);
      // create below chart wireframe
      const mainSVG = document.createElementNS(_svgNS, 'svg');
            mainSVG.setAttribute('id', 'main-map');
            mainSVG.setAttribute('class', 'top');
            mainSVG.setAttribute('width', _canvasWidth);
            mainSVG.setAttribute('height', _canvasHeight * 0.8)//2 + _margin.bottom);
            container.appendChild(mainSVG)
      const belowChart = document.createElementNS(_svgNS, 'g')
            belowChart.setAttribute('id', 'below-chart')
            belowChart.setAttribute('transform', `translate(0, ${_canvasHeight * 0.22 + _margin.top})`);
            mainSVG.appendChild(belowChart)
      const adjustableBG = _createRect(0, -_margin.top * 1.1, 'color-bg', classes=null, _canvasWidth, _canvasHeight * 0.46, _color.mainMap)
            belowChart.appendChild(adjustableBG)
      const blackBG = _createRect(0, -_margin.top * 1.1, 'black-bg', classes=null, _canvasWidth, _canvasHeight * 0.46, "black")
            blackBG.setAttribute('fill-opacity', 0.14)
            belowChart.appendChild(blackBG)
            _OnInitMainMap(mainSVG, flag4cluster);
            _OnInitBelowChart(belowChart);
            
      const bottomDetail = document.createElementNS(_svgNS, 'svg')
            bottomDetail.setAttribute('id', 'detail-infos');
            mainSVG.appendChild(bottomDetail)
      const detailInfos = document.createElementNS(_svgNS, 'g')
            detailInfos.setAttribute('id', 'detail-horizontal-chart')
            detailInfos.setAttribute('transform', `translate(${_margin.left}, ${_canvasHeight * 0.48})`);
            bottomDetail.appendChild(detailInfos)
      const sec1Rect = _createRect(_margin.left, _canvasHeight * 0.48, 'empty-detail-BG', 'detail-BG', _canvasWidth - (_margin.left * 2), _margin.bottom * 4.3, _color.blueGrey)
            sec1Rect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            sec1Rect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
            mainSVG.appendChild(sec1Rect);
      // call animation on each sneakers
      let isHover = false;
      const mainDiv = document.createElement('main')
            _setAttributes(mainDiv, {style: `padding: ${_margin.top}px ${_margin.left}px;`})
            container.appendChild(mainDiv)
      const mainTitle = document.createElement('h5')
            _setAttributes(mainTitle, {class: 'title', style: `color: ${_color.blueGrey}; padding: ${_chart2.smst_gap}px 0;`})
            mainTitle.textContent = 'Color Cluster Map'
            mainDiv.appendChild(mainTitle)
      const mainCopy = document.createElement('p')
              _setAttributes(mainCopy, {class: 'mideum-body', style: `color: ${_color.greyText};`})
              mainCopy.textContent = 'This map tracks the primary color of Yeezy sneakers (84 pairs) that begins with RGB(0, 0, 0). The distance of each sneakers takes their color difference based on Delta E Algorithm, so the longer gap means two primary colors of sneakers aren\'t closer than others that have a narrower gap.'
              mainDiv.appendChild(mainCopy)
      const hoverRect = document.getElementById('display-none')
      hoverRect.addEventListener("mouseover", (e)=> {
        if (!isHover) {
          isHover = true;
          document.getElementById('empty-detail-BG').setAttribute('display', 'block')
        }
      })
      hoverRect.addEventListener("mousemove", (e)=> {
        if (isHover) {
          document.getElementById('mouse-hover').setAttribute('display', 'none');
          document.getElementById('chartBG').setAttribute('display', 'block');
          document.getElementById('yAxis').setAttribute('display', 'block');          
          _removeAllChildNodes(document.getElementById('detail-infos'));
          _updateMouseX(e, isHover, colorMapData);
        }
      })
      hoverRect.addEventListener("mouseout", (e)=> {
        if (isHover) {
          isHover = false;
          document.getElementById('mouse-hover').setAttribute('display', 'block');
          document.getElementById('chartBG').setAttribute('display', 'none');
          document.getElementById('yAxis').setAttribute('display', 'none');
          _updateMouseX(e, isHover, colorMapData);
          document.getElementById('empty-detail-BG').setAttribute('display', 'block')
          }
      })
      hoverRect.addEventListener("click", (e)=> {
        isHover = false
        if (gsap.getById("imgRise")) gsap.getById("imgRise").pause(); //imgFall
        if (!isHover && gsap.getById("imgRise")) gsap.getById("imgRise").paused( !gsap.getById("imgRise").paused());
        _Tween4DisplayDetails()
      })
  }
  // init main map + below chart
  function _onInitStory(_canvasWidth){
    if (container) _removeAllChildNodes(container);
    const mainDiv = document.createElement('main')
          _setAttributes(mainDiv, {style: `padding: ${_margin.top}px ${_margin.left}px;`})
          container.appendChild(mainDiv)
    const mainTitle = document.createElement('h5')
          _setAttributes(mainTitle, {class: 'title', style: `color: ${_color.blueGrey}; padding: ${_chart2.smst_gap}px 0;`})
          mainTitle.textContent = 'How Colors Affect Resale Values'
          mainDiv.appendChild(mainTitle)
    const mainCopy = document.createElement('p')
          _setAttributes(mainCopy, {class: 'mideum-body', style: `color: ${_color.greyText};`})
          mainCopy.textContent = 'The research aimed to find any evidence that the colorways of Yeezy sneakers are becoming similar to previous released ones. Color Clustering by Delta E allows to collect 11 clusters where you can see below filter options. Combining these Yeezy seneakers\' colorways and the price premium ( extracting data by Selenium in StockX.com ), there\'re few interesting findings you can check from the below chart.'
          mainDiv.appendChild(mainCopy)
    const tagContext = ['- Color combinations:  Adobe color was selected to extract color combinations automatically, and three colors in RGB are saved as a color palette such as base, highlight, and shade', '- Resales data Criteria: StockX: The volume of each series\' sneakers, ranges of resale price, and the price premium', '- The cluster algorithm: Take "350 V2 Core Black Red" as a centroid since it has a primary color that relatively closes to RGB(0, 0, 0)', '- The color distance by Delta E metric: calculate the color difference between two neighbors by Euclidean Distance formula']
    const popupWidth = _canvasWidth - (_margin.left * 3.6)
    const storyMap = document.createElementNS(_svgNS, 'svg');
          storyMap.setAttribute('id', 'story-map')
          storyMap.setAttribute('width', _canvasWidth);
          storyMap.setAttribute('height', _canvasHeight * 0.6 - _margin.top);
          container.appendChild(storyMap)
    const filterRect1 = _createRect(0, 0, 'filter-bg', classes = null, _canvasWidth,  _canvasHeight * 0.565, _color.mainMap)
          storyMap.appendChild(filterRect1);
    const filterMainGroup = document.createElementNS(_svgNS, 'g');
          filterMainGroup.setAttribute('id', 'filter-group');
          storyMap.appendChild(filterMainGroup)
    // three types of filter buttons
    const filterByClusterGroup = document.createElementNS(_svgNS, 'g');
          filterByClusterGroup.setAttribute('id', 'filter-cluster-group')
          filterByClusterGroup.setAttribute('class', 'pointer')
          filterMainGroup.appendChild(filterByClusterGroup)
    const clusterBGRect = _createRect(_margin.left, _margin.top * 0.8, id=null, classes = null, _margin.left * 1.22,_canvasHeight * _onGetRatio(46, null, _canvasHeight), "white")
          clusterBGRect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
          clusterBGRect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
          filterByClusterGroup.appendChild(clusterBGRect)
    const filterBySeriesGroup = document.createElementNS(_svgNS, 'g')
          filterBySeriesGroup.setAttribute('id', 'filter-series-group')
          filterBySeriesGroup.setAttribute('class', 'pointer')
          filterMainGroup.appendChild(filterBySeriesGroup)
    const seriesBGRect = _createRect(_margin.left * 2.3, _margin.top * 0.8, id=null, classes = null, _margin.left * 0.79, _canvasHeight * _onGetRatio(46, null, _canvasHeight), "#d8d8d8")
          seriesBGRect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
          seriesBGRect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
          filterBySeriesGroup.appendChild(seriesBGRect)
    const filterByYearGroup = document.createElementNS(_svgNS, 'g')
          filterByYearGroup.setAttribute('id', 'filter-year-group')
          filterByYearGroup.setAttribute('class', 'pointer')
          filterMainGroup.appendChild(filterByYearGroup)
    const yearBGRect = _createRect(_margin.left * 3.16, _margin.top * 0.8, id=null, classes = null, _margin.left * 0.71, _canvasHeight * _onGetRatio(46, null, _canvasHeight), "#d8d8d8")
          yearBGRect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
          yearBGRect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
          filterByYearGroup.appendChild(yearBGRect)
    // filter-bg
    const filterSubBG = _createRect(_margin.left, _margin.bottom * 1.28, 'filter-sub-BG', classes = null, popupWidth + (_margin.left * 1.8), _margin.bottom * 2, "white")
          filterMainGroup.appendChild(filterSubBG)
    const filterSubGroup = document.createElementNS(_svgNS, 'g')
          filterSubGroup.setAttribute('id', 'filter-sub-group')
          filterSubGroup.setAttribute('transform', `translate(${_margin.gap * 0.8}, ${_margin.top * 0.26})`)
          filterMainGroup.appendChild(filterSubGroup)
    const filterMainChartGroup = document.createElementNS(_svgNS, 'g');
          filterMainChartGroup.setAttribute('id', 'filter-main-chart')
          storyMap.appendChild(filterMainChartGroup)
    const storyMainMapGroup = document.createElementNS(_svgNS, 'g');
          storyMainMapGroup.setAttribute('id', 'popup-chart')
          filterMainChartGroup.appendChild(storyMainMapGroup)
    const sec1Rect = _createRect(0, -_chart2.smer_gap, 'popup-BG', classes = null, popupWidth + (_margin.left * 1.8),_canvasHeight * _onGetRatio(560, null, _canvasHeight), _color.blueGrey)
          sec1Rect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
          sec1Rect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
          storyMainMapGroup.appendChild(sec1Rect);
    //filter-button text
    const clusterCaption = _createText(_margin.left * 1.12, _margin.top * 1.6, id=null, 'smaller-body', textAnchor = null, dominantBaseline = null, _color.blueGrey, 'Filter By')
          filterByClusterGroup.appendChild(clusterCaption)
    const clusterTitle = _createText(_margin.left * 1.42, _margin.top * 1.74, id=null, 'bigger-body', textAnchor = null, dominantBaseline = null, _color.blueGrey, 'Color Cluster')
          filterByClusterGroup.appendChild(clusterTitle)
    const seriesCaption = _createText(_margin.left * 2.4, _margin.top * 1.6, id=null, 'smaller-body', textAnchor = null, dominantBaseline = null, _color.greyText, 'Filter By')
          filterBySeriesGroup.appendChild(seriesCaption)
    const seriesTitle = _createText(_margin.left * 2.7, _margin.top * 1.74, id=null, 'bigger-body pointer', "start", dominantBaseline = null, _color.greyText, 'Series')
          filterBySeriesGroup.appendChild(seriesTitle)
    const yearCaption = _createText(_margin.left * 3.25, _margin.top * 1.6, id=null, 'smaller-body', textAnchor = null, dominantBaseline = null, _color.greyText, 'Filter By')
          filterByYearGroup.appendChild(yearCaption)
    const yearTitle = _createText(_margin.left * 3.54, _margin.top * 1.74, id=null, 'bigger-body pointer', "start", dominantBaseline = null, _color.greyText, 'Year')
          filterByYearGroup.appendChild(yearTitle)
    // right side detailed popup
    const detailInfos = document.createElementNS(_svgNS, 'g')
          detailInfos.setAttribute('id', 'detail-vertical-chart')
          filterMainChartGroup.appendChild(detailInfos)
    const popupMainSvg = document.createElementNS(_svgNS, 'svg');
          popupMainSvg.setAttribute('id', 'popup-main-svg')
          popupMainSvg.setAttribute('width', popupWidth)
          popupMainSvg.setAttribute('height', _canvasHeight * 0.4)
          storyMainMapGroup.appendChild(popupMainSvg)
//     const higherPPSvg = document.createElementNS(_svgNS, 'svg')
//           higherPPSvg.setAttribute('id', 'higher-premium-svg')
//           higherPPSvg.setAttribute('width', _canvasWidth)
//           higherPPSvg.setAttribute('height', _canvasHeight * 0.524)
//           container.appendChild(higherPPSvg)
//     const topPremiumGroup = document.createElementNS(_svgNS, 'g')
//           topPremiumGroup.setAttribute('id', 'top-premium-group')
//           topPremiumGroup.setAttribute('transform', `translate(${_margin.left}, ${_margin.top * 1.2})`)
//           higherPPSvg.appendChild(topPremiumGroup)
//     const topPremiumRect = _createRect(0, _margin.bottom * 0.8, 'top-premium-BG', classes = null, popupWidth + (_margin.left * 1.8),_canvasHeight * _onGetRatio(560, null, _canvasHeight), _color.yellow)
//           topPremiumRect.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
//           topPremiumRect.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
//           topPremiumGroup.appendChild(topPremiumRect);
//     const titleTxt = _createText(0, 0, id = null, 'thin-bigger-body title-txt', "start", "hanging", _color.blueGrey, 'Top 12 Shoes by Price Premium')
//           topPremiumGroup.appendChild(titleTxt)
      filterByClusterGroup.addEventListener('click', function(e) {filterTilteHandling(e, popupWidth)})
      filterBySeriesGroup.addEventListener('click', function(e) {filterTilteHandling(e, popupWidth)})
      filterByYearGroup.addEventListener('click', function(e) {filterTilteHandling(e, popupWidth)})
      // default value
      _filterByData(_colorMapByCluster, popupWidth)
  }

  function filterTilteHandling(e, popupWidth){
      _removeAllChildNodes(document.getElementById('popup-main-svg'))
      _removeAllChildNodes(document.getElementById('detail-vertical-chart'))
      _removeAllChildNodes(document.getElementById('filter-sub-group'))
      e.target.parentNode.parentNode.childNodes.forEach((group, index) => {
            if (index < 3) {
                  group.firstChild.setAttribute('fill', "#d8d8d8")
                  group.firstChild.nextElementSibling.setAttribute('fill', _color.greyText)
                  group.lastChild.setAttribute('fill', _color.greyText)
            }
      })
      if (e.target.parentNode.id.includes('series')) {
            e.target.parentNode.firstChild.setAttribute('fill', "white")
            e.target.parentNode.firstChild.nextElementSibling.setAttribute('fill', _color.blueGrey)
            e.target.parentNode.lastChild.setAttribute('fill', _color.blueGrey)
            _filterByData(_colorMapBySeries, popupWidth)
      } else if (e.target.parentNode.id.includes('cluster')) {
            e.target.parentNode.firstChild.setAttribute('fill', "white")
            e.target.parentNode.firstChild.nextElementSibling.setAttribute('fill', _color.blueGrey)
            e.target.parentNode.lastChild.setAttribute('fill', _color.blueGrey)
            _filterByData(_colorMapByCluster, popupWidth)
      } else {
            e.target.parentNode.firstChild.setAttribute('fill', "white")
            e.target.parentNode.firstChild.nextElementSibling.setAttribute('fill', _color.blueGrey)
            e.target.parentNode.lastChild.setAttribute('fill', _color.blueGrey)
            _filterByData(_colorMapByReleaseYear, popupWidth)
      }
}
  function _filterByData(mapData, popupWidth) {
      const filterSubGroup = document.getElementById('filter-sub-group')
      const filterMainChartGroup = document.getElementById('filter-main-chart')
      let keyNames, keyCounts, widthArr = [], totalWidth, newWidth = 0, newWidthCount = 0;
      
      for (let j = 0; j < mapData.length; j++) {
            if (mapData[0].key.includes('cluster')) {
                  keyNames = _clusterNames['cluster'+ j]
                  keyCounts = _clusterVolume[j]
            } else {
                  keyNames = mapData[j].key
                  keyCounts = mapData[j].values.length
            }
            const filterGroup = document.createElementNS(_svgNS, 'g');
                  filterGroup.setAttribute('id', `filterGroup-${j}`);
                  filterSubGroup.appendChild(filterGroup)
            const placeholdTxt = _createText(_margin.right * 0.2, _chart2.big_gap * 1.4, id=null, "big-body pointer", "start", dominantBaseline= null, _color.blueGrey, keyNames)
                  placeholdTxt.style.opacity = 0  
                  filterGroup.appendChild(placeholdTxt)
                  widthArr.push(placeholdTxt.getBBox().width + _margin.right * 0.3)
                  totalWidth = j == 0 ? 0 : totalWidth + widthArr[j - 1] + _margin.right * 0.3
                  _removeAllChildNodes(filterGroup)
                  const btnWidth = widthArr[j] + (_margin.right * 0.44)
                  let groupX = j == 0 ? _margin.left : _margin.left + totalWidth + (j * _margin.gap)
                  let groupY = _margin.bottom * 1.4
                  if (groupX + btnWidth + _margin.gap > _canvasWidth - _margin.left) {
                        newWidth = newWidthCount == 0 ? _margin.left - (j * _margin.gap) : newWidth + widthArr[j - 1] + _margin.right * 0.3
                        newWidthCount++;
                        groupX = newWidth + (j * _margin.gap)// + _margin.gap
                        groupY = _margin.bottom * 2.17
                        filterMainChartGroup.setAttribute('transform', `translate(${_margin.left}, ${_margin.bottom * 2.3 + (_margin.bottom * 1.1)})`)
                  } else {
                        filterMainChartGroup.setAttribute('transform', `translate(${_margin.left}, ${_margin.bottom * 2.7})`)
                  }
                  filterGroup.setAttribute('transform', `translate(${groupX}, ${groupY})`);
                  
            const filterBtn = _createRect(0, 0, mapData[j].key,  "filterBtn pointer", btnWidth, _canvasHeight * _onGetRatio(30, null, _canvasHeight), _color.mapBG)
                  filterBtn.setAttribute('rx', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
                  filterBtn.setAttribute('ry', _canvasWidth * _onGetRatio(8, _canvasWidth, null))
                  filterGroup.appendChild(filterBtn)
            // add detailed chart on the right side
            const detailInfos = document.getElementById('detail-vertical-chart')
                  detailInfos.setAttribute('transform', `translate(${popupWidth * 0.98}, ${-_margin.top})`)
            filterGroup.addEventListener('click', function(e){
                  _removeAllChildNodes(document.getElementById('popup-main-svg'))
                  if (document.querySelector(".clicked")) {
                        document.querySelector(".clicked").setAttribute('fill', _color.mapBG);
                        document.querySelector(".clicked").nextElementSibling.setAttribute('fill',_color.blueGrey);
                        document.querySelector(".clicked").nextElementSibling.nextElementSibling.setAttribute('fill', _color.blueGrey);
                        document.querySelector(".clicked").classList.remove("clicked");
                  }
                  document.getElementById(mapData[j].key).setAttribute('fill', _color.blueGrey);
                  document.getElementById(mapData[j].key).classList.add("clicked");
                  document.getElementById(mapData[j].key).nextElementSibling.setAttribute('fill', "white");
                  document.getElementById(mapData[j].key).nextElementSibling.nextElementSibling.setAttribute('fill', "white");
                  _onInitPopUpChart(mapData.filter(obj => obj.key == mapData[j].key)[0].values, popupWidth)
            })
            const clusterName = _createText(_margin.right * 0.2, _chart2.big_gap * 1.24, id=null, "big-body pointer", "start", dominantBaseline= null, _color.blueGrey, keyNames)    
                  filterGroup.appendChild(clusterName)
            const clusterCount = _createText(btnWidth - (_margin.gap * 1.48), _chart2.big_gap * 1.24, id=null, "legend-body pointer", "start", dominantBaseline= null, _color.blueGrey, `( ${keyCounts} )`)
                  filterGroup.appendChild(clusterCount)
      }
      //default popupchart
      _onInitPopUpChart(mapData[0].values, popupWidth)
      document.getElementById('filterGroup-0').firstChild.setAttribute('fill', _color.blueGrey);
      document.getElementById('filterGroup-0').firstChild.classList.add("clicked");
      document.getElementById('filterGroup-0').firstChild.nextElementSibling.setAttribute('fill', "white");
      document.getElementById('filterGroup-0').firstChild.nextElementSibling.nextElementSibling.setAttribute('fill', "white");
  }
  // set button trigger and reset chart map
  let hovorOn;
  hovorOn = hovorOn || "story"
  document.getElementById('story').addEventListener('click', storyOn)
  document.getElementById('colorCluster').addEventListener('click', clusterOn)
  function storyOn(){
    hovorOn = 'story'
    document.getElementById('story').lastChild.className = 'lined'
    document.getElementById('colorCluster').lastChild.className = 'none'
    _onInitStory(_canvasWidth)
  }
  function clusterOn(){
      hovorOn = 'colorCluster'
      document.getElementById('colorCluster').lastChild.className = 'lined'
      document.getElementById('story').lastChild.className = 'none'
      _onInitColorCluster(_canvasWidth)
  }

  hovorOn == "story" ? storyOn() : clusterOn()

  // ON WINDOW RESIZE
  window.addEventListener('resize', () => {
    const _canvasWidth = Math.floor(window.innerWidth) > 1366 ? 1366 : Math.floor(window.innerWidth)
    hovorOn == "story" ? storyOn() : clusterOn()
  });
})
  