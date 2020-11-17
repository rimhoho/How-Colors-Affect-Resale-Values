let colorMapData = [];
let avgSumOfSold = 0;
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

  let sumPrimaryDistance = 0;
  let maxPrimaryD = 0;
  let maxTradingHigh = 0;
  let maxAsksNum = 0;
  let maxBidsNum = 0;
  let maxSoldNum = 0;
  // let avgOfSold;
  colorDistance.filter(obj => {
    sumPrimaryDistance += obj.distance_primary;
    avgOfSold = Math.round(avgSumOfSold/stockX.length);
    stockX.forEach((d, i) => {
      if (obj.target == d.title) {
        // d.daysFromPriviousCluster = i < clusterSort.length - 1 ? _differenceInDays(d.release_date, cluster.values[i + 1].release_date) : 0//'Very first pair';
        // d.daysClusterRange = d.daysFromPriviousRelease <= 8 ? 'Released new within one week' : d.daysFromPriviousCluster <= 24 ? 'Released new within three weeks' : 'Released new after Avg. difference in days'
        // if (d.number_of_sales > 50000) {
        //   d.sold_range = 'Sold over 50,000' 
        // } else if (d.number_of_sales > 30000) {
        //   d.sold_range = 'Sold over 30,000'
        // } else if (d.number_of_sales > avgOfSold) {
        //   d.sold_range = 'Sold over Avg.Resale' 
        // } else {
        //   d.sold_range = 'Sold under Avg.Resale'
        // }
        
        if (maxPrimaryD < Math.round(sumPrimaryDistance)) {maxPrimaryD = Math.round(sumPrimaryDistance)}
        maxTradingHigh = maxTradingHigh < d.trade_range_high ? d.trade_range_high : maxTradingHigh;
        maxBidsNum = maxBidsNum < d.number_of_Bids ? d.number_of_Bids : maxBidsNum
        maxAsksNum = maxAsksNum < d.number_of_Asks ? d.number_of_Asks : maxAsksNum
        maxSoldNum = maxSoldNum < d.number_of_sales ? d.number_of_sales : maxSoldNum

        colorMapData.push({'title': obj.target,
                           'relative_primary': Math.round(sumPrimaryDistance),
                           'absolute_primary': obj.distance_primary,
                           'absolute_highlight': obj.distance_highlight,
                           'range_cluster': obj.cluster,
                           'fullRGB': obj.fullRGB,
                           'primary_color': obj.fullRGB[0].split(' ').map(d => parseInt(d)),
                           'range_category': d.category,
                           'shorten_title': d.shorten_title,
                           'thumb_url': d.thumb_url,
                           'product_url': d.product_url,
                           'description': d.description,
                           'release_date': d.release_date,
                           'release_MY': d.release_MY,
                           'release_year': d.release_year,
                           'number_of_sales': d.number_of_sales,
                           'retail_price': d.retail_price,
                           'average_sale_price': d.average_sale_price,
                           'range_trade_high': d.trade_range_high,
                           'range_trade_low': d.trade_range_low,
                           'number_of_Asks': d.number_of_Asks,
                           'number_of_Bids': d.number_of_Bids,
                           'price_premium': d.price_premium,
                           'range_price_premium': d.price_premium_range,
                           'total_dollars': d.total_dollars,
                           'volatility': d.volatility
                           // 'range_sold': d.sold_range,
                           // 'daysFromPriviousRelease': d.daysFromPriviousRelease,
                           // 'daysReleasRange': d.daysReleasRange,
                           // 'daysFromPriviousCluster': d.daysFromPriviousCluster,
                           // 'daysClusterRange': d.daysClusterRange,
                          })
      }
    })
  })
  
  // SET RESPONSIVE FIGURE
  const _svgNS = "http://www.w3.org/2000/svg";
  const _canvasWidth = Math.floor(window.innerWidth)
  const _canvasHeight = Math.floor(window.innerHeight)
  const _chart1W = _canvasWidth
  const _chart1H = _canvasHeight * 0.2
  const _margin = {gap: _canvasWidth * _onGetRatio(20, _canvasWidth, null), top: _canvasHeight * _onGetRatio(30, null, _canvasHeight), 
                   right: _canvasWidth * _onGetRatio(60, _canvasWidth, null), bottom: _canvasHeight * _onGetRatio(50, null, _canvasHeight), 
                   left: _canvasWidth * _onGetRatio(140, _canvasWidth, null), columnWidth: _canvasWidth * _onGetRatio(170, _canvasWidth, null)};
  const _chart2 = {width: _chart1W - _margin.left, height: _chart1H * 0.8,
                   bigger_gap: _canvasHeight * _onGetRatio(22, null, _canvasHeight), big_gap: _canvasHeight * _onGetRatio(16, null, _canvasHeight),
                   sm_gap: _canvasHeight * _onGetRatio(12, null, _canvasHeight), smer_gap: _canvasHeight * _onGetRatio(10, null, _canvasHeight)}
  const _color = {mapLine: "#CCCCCC", mapBG: "#F5F5F5", premiumPrice: "#F65E5D", resaleBid:"#B3B3B3", resaleSold : "#ffd62c", resaleSoldTxt: "#f4ad0f", resaleAsk: "#0382ed", msrp: "#808080", chartBG: "#FDFDFD", text: "#333333", greyText: '#B2B2B2'}
  const _colorXScale = _chart1W - (_margin.left * 2) - _margin.right;

  function _onGetRatio(val, width, height){
    if (width) {
      return val / width;
    } else {
      return val / height;
    }
  }
  function _createImage(x, y, id, href, width) {
    const image = document.createElementNS(_svgNS, 'image');
          image.setAttribute('x', x);
          image.setAttribute('y',y);
          image.setAttribute('id', id);
          image.setAttribute('href', href);
          image.setAttribute('width', width);
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
          circle.setAttribute('stroke', stroke);
          circle.setAttribute('stroke-width', strokeWidth);
          circle.setAttribute('stroke-opacity', strokeOpacity);
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
  function _createTspan(x, dy, classes, textAnchor, color, tspan_text) {
    const tspan = document.createElementNS(_svgNS, 'tspan');
          tspan.setAttribute('x', x);
          tspan.setAttribute('dy', dy);
          if (classes != null) tspan.setAttribute('class', classes);
          if (textAnchor != null) tspan.setAttribute('text-anchor', textAnchor);
          tspan.setAttribute('fill', color);
          tspan.textContent = tspan_text;
    return tspan;
  }
  function _setAttributeSoldChart(c, sneakersGroup, newX, soldCy, bidsH, newAsksH, barW, x1, y1, y2, val4line, newShortentitle, newShortenMonth, newShortenYear, number_of_Asks, number_of_sales, number_of_Bids, title) {
    const groupX = _margin.left + (barW * c) + (newX * (c - 1))
    sneakersGroup.setAttribute('transform', `translate(${groupX}, ${0})`)
    sneakersGroup.firstChild.setAttribute('y', y1) //bids_bar
    sneakersGroup.firstChild.setAttribute('width', barW)
    sneakersGroup.firstChild.setAttribute('height', bidsH)
    sneakersGroup.firstChild.setAttribute('fill', _color.resaleBid)
    sneakersGroup.firstChild.nextElementSibling.setAttribute('y', y2) //asks_bar
    sneakersGroup.firstChild.nextElementSibling.setAttribute('width', barW)
    sneakersGroup.firstChild.nextElementSibling.setAttribute('height', newAsksH)
    sneakersGroup.firstChild.nextElementSibling.setAttribute('fill', _color.resaleAsk)
    sneakersGroup.firstChild.nextElementSibling.nextElementSibling.setAttribute('cx', _margin.gap* 0.6 ) //circle
    sneakersGroup.firstChild.nextElementSibling.nextElementSibling.setAttribute('cy', soldCy ) 
    sneakersGroup.firstChild.nextElementSibling.nextElementSibling.setAttribute('r', _chart2.smer_gap * 0.25) //_canvasWidth * _onGetRatio(6, _canvasWidth, null)
    sneakersGroup.firstChild.nextElementSibling.nextElementSibling.setAttribute("fill-opacity","1")
    if (c > 1) { // line
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('x1', _margin.gap * 0.6) 
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('y1', val4line[c-1])
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('x2', ((_margin.gap * 0.8) + barW)* -1)
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('y2', val4line[c-2])
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('stroke-width', _chart2.smer_gap * 0.25)
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('stroke-opacity', "1")
    } else if (val4line == null){
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('x1', 0)
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('y1', 0)
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('x2', 0)
      sneakersGroup.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.setAttribute('y2', 0)
    }
    const newx1 = ((_chart2.height - bidsH) - (_chart2.height - newAsksH) < _chart2.bigger_gap) ? _canvasWidth * _onGetRatio(40, _canvasWidth, null) : x1
    const newColor1 = ((_chart2.height - bidsH) - (_chart2.height - newAsksH) < _chart2.bigger_gap) ? _color.greyText : "white"
    const newColor2 = ((_chart2.height - bidsH) - (_chart2.height - newAsksH) < _chart2.bigger_gap) ? _color.resaleAsk : "white"
    const spaceY = ((_chart2.height - bidsH) - (_chart2.height - newAsksH) > _chart2.bigger_gap) ? _chart2.smer_gap * -0.3 : _chart2.smer_gap * 0.6
    // const startLine = _createLine(0, _canvasWidth * _onGetRatio(10, _canvasWidth, null) * -1, newAsksH - totalSoldH, newAsksH - totalSoldH, id = null, classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
    // const secLine =  _createLine(_canvasWidth * _onGetRatio(10, _canvasWidth, null) * -1, _canvasWidth * _onGetRatio(10, _canvasWidth, null) * -1, newAsksH - baseH, -baseH, id = null, classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
    sneakersGroup.lastChild.previousSibling.previousSibling.setAttribute('x', newx1) //bids_text
    sneakersGroup.lastChild.previousSibling.previousSibling.setAttribute('y', y1) 
    sneakersGroup.lastChild.previousSibling.previousSibling.setAttribute('fill', newColor1)
    sneakersGroup.lastChild.previousSibling.previousSibling.textContent = number_of_Bids
    sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.setAttribute('x', newx1) //asks_text
    sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.setAttribute('y', y2 - spaceY) 
    sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.setAttribute('fill', newColor2)
    sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.textContent = number_of_Asks
    sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.previousSibling.setAttribute('x', x1 - _chart2.smer_gap * 0.2) //sold_text
    sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.previousSibling.setAttribute('y', soldCy + _chart2.smer_gap * 0.2)
    sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.previousSibling.setAttribute('fill', _color.resaleSoldTxt)
    sneakersGroup.lastChild.previousSibling.previousSibling.previousSibling.previousSibling.textContent = number_of_sales
    sneakersGroup.lastChild.previousSibling.setAttribute('y', _chart2.height + _chart2.bigger_gap) //xAxis label

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
    sneakersGroup.lastChild.setAttribute('y', _chart2.height - (_chart2.smer_gap * 0.4))
    if (title != null) sneakersGroup.lastChild.setAttribute('href', `img/${title}.png`)
    sneakersGroup.lastChild.setAttribute('width', barW * 2)
  }
  function _setAttributePremiumChart(c, sneakersGroup, newX, mstpH, premiumH, baseH, barW, x1, y1, y2, y3, newShortentitle, newShortenMonth, newShortenYear, range_trade_high, range_trade_low, retail_price, title) {
    sneakersGroup.setAttribute('transform', `translate(${_margin.left + (barW * c) + (newX * (c - 1))}, ${_chart2.height - premiumH})`)
    sneakersGroup.firstChild.setAttribute('y', premiumH - baseH) // base_bar
    sneakersGroup.firstChild.setAttribute('width', barW)
    sneakersGroup.firstChild.setAttribute('height', baseH)
    sneakersGroup.firstChild.nextElementSibling.setAttribute('y', y1) // msrp_bar
    sneakersGroup.firstChild.nextElementSibling.setAttribute('width', barW)
    sneakersGroup.firstChild.nextElementSibling.setAttribute('height', mstpH)
    sneakersGroup.firstChild.nextElementSibling.nextElementSibling.setAttribute('y', y2) // premium_bar
    sneakersGroup.firstChild.nextElementSibling.nextElementSibling.setAttribute('width', barW)
    sneakersGroup.firstChild.nextElementSibling.nextElementSibling.setAttribute('height', premiumH - baseH)

    const newx1 =   (premiumH - baseH < _chart2.bigger_gap) ? _canvasWidth * _onGetRatio(40, _canvasWidth, null) : x1
    const newy2 =   (premiumH - baseH < _chart2.bigger_gap) ? _chart2.sm_gap * -0.55 : y2
    const newy3 =   (premiumH - baseH < _chart2.bigger_gap) ? (premiumH - baseH) * 0.45 : y3
    const newColor1 = (premiumH - baseH < _chart2.bigger_gap) ? _color.premiumPrice : "white"
    // const startLine = _createLine(0, _canvasWidth * _onGetRatio(10, _canvasWidth, null) * -1, premiumH - baseH, premiumH - baseH, id = null, classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
    // const secLine =  _createLine(_canvasWidth * _onGetRatio(10, _canvasWidth, null) * -1, _canvasWidth * _onGetRatio(10, _canvasWidth, null) * -1, premiumH - baseH, -baseH, id = null, classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
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
    sneakersGroup.lastChild.setAttribute('y', premiumH - _chart2.bigger_gap)
    if (title != null) sneakersGroup.lastChild.setAttribute('href', `img/${title}.png`)
    sneakersGroup.lastChild.setAttribute('width', barW * 2)
  }
  function _createYAxis(maxValue, interval, yScalText, idNum) {
    const idText = (idNum == null) ? 'yAxis' : `yAxis_${idNum}`
    const yAxisX1 = (idNum == 2) ? _chart2.width : _margin.left
    const yAxisX2 = (idNum == 2) ? _chart2.width + (_margin.gap * 0.2) : _margin.left * 1.04
    const newX = (idNum == 2) ? _chart2.width + (_margin.gap * 0.4) : _margin.left * 0.97
    const textAnchor = (idNum == 2) ? 'start' : 'end'
    let yAxisColor, startText, description;
    if (idNum == null) {
      yAxisColor = _color.greyText;
      startText = _chart2.smer_gap * 0.8
      description = 'Trading Range ($)'
    } else if (idNum == 1) {
      yAxisColor = _color.resaleAsk
      startText = _chart2.smer_gap * 0.8
      description = 'Bids & Asks (Volume)'
    } else {
      yAxisColor = _color.resaleSoldTxt
      startText = _chart2.sm_gap * 1.1
      description = 'Total Sale (Volume)'
    }
    // yAxis bar
    const yAxisGroup = document.createElementNS(_svgNS, 'g');
          yAxisGroup.setAttribute('id', idText);
    // yAxis text
    const yAxisTextEl = document.createElementNS(_svgNS, 'text');
          yAxisTextEl.setAttribute('x', 0);
          yAxisTextEl.setAttribute('y', 0);
          yAxisTextEl.setAttribute('class', 'yAxisText');
    const yAxisDesc = document.createElementNS(_svgNS, 'text');
          yAxisDesc.setAttribute('x', newX);
          yAxisDesc.setAttribute('y', _chart2.height);
          yAxisDesc.setAttribute('text-anchor', textAnchor);
          yAxisDesc.setAttribute('y', _chart2.height);
          yAxisDesc.setAttribute('dominant-baseline', 'hanging')
          yAxisDesc.setAttribute('class', 'smaller-body');
          yAxisDesc.textContent = description; 
    let flag = 0;
    for (var i = maxValue; i >= 0; i -= interval) {

      flag ++;
      const newDy = flag == 2 ? startText : yScalText
      let colorLine;
      if (idNum != 2) {
        colorLine = flag % 2 == 0 ?  _color.mapBG : _color.mapLine
      } else if (idNum == 1) {
        colorLine = flag % 2 == 0 ?  _color.mapBG : _color.mapLine  
      } else {
        colorLine = flag % 2 != 0 ?  _color.mapBG : _color.mapLine
      }
      const yAxisBar = _createLine(yAxisX1, yAxisX2, _chart2.height * i / maxValue, _chart2.height * i / maxValue, id = null, 'yAxis',  colorLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
      const yAxisTspan = _createTspan(newX, newDy, 'smaller-body', textAnchor, yAxisColor, i.toLocaleString())
              yAxisGroup.appendChild(yAxisBar)
              if (flag % 2 == 0) yAxisTextEl.appendChild(yAxisTspan)
    }
    yAxisGroup.appendChild(yAxisDesc)
    yAxisGroup.appendChild(yAxisTextEl)
    return yAxisGroup;
  }
  function _createLegend(title, subTitle, firstLegend, secondLegend, firstLColor, secondLColor) {
    // legend
    const legendG = document.createElementNS(_svgNS, 'g');
          legendG.setAttribute('id', 'legend')
          legendG.setAttribute('transform', `translate(${_chart1W - _margin.left - _margin.columnWidth}, ${_chart2.sm_gap})`);
          // legendG.setAttribute('display', 'none')
    const legendBG = _createRect(0, 0, id = null, classes = null, _margin.columnWidth, _margin.bottom * 1.56, "rgba(255, 255, 255, 0.8)")
          legendG.appendChild(legendBG)
    const textEl = document.createElementNS(_svgNS, 'text');
          textEl.setAttribute('x', 0);
          textEl.setAttribute('y', 0);
    const tspan1El1 = _createTspan(_margin.columnWidth - _margin.gap/2, _chart2.bigger_gap, 'bigger-body', 'end', _color.text, title)
          textEl.appendChild(tspan1El1)
    const tspan2El1 = _createTspan(_margin.columnWidth - _margin.gap/2, _chart2.sm_gap, 'smaller-body', 'end', _color.text, subTitle)
          textEl.appendChild(tspan2El1) 
    const legendRext1 = _createRect(_margin.columnWidth - _margin.gap, _chart2.bigger_gap * 1.9, id = null, classes = null, _margin.gap/2, _margin.gap/2, firstLColor)
          legendG.appendChild(legendRext1)
    const tspan3El1 = _createTspan(_margin.columnWidth - (_margin.gap * 1.1), _chart2.big_gap, 'smaller-body', 'end', _color.text, firstLegend)
          textEl.appendChild(tspan3El1)
    const legendRext2 = _createRect(_margin.columnWidth - _margin.gap, _chart2.bigger_gap * 2.5, id = null, classes = null, _margin.gap/2, _margin.gap/2, secondLColor)
          legendG.appendChild(legendRext2)
    const tspan4El1 = _createTspan(_margin.columnWidth - (_margin.gap * 1.1), _chart2.sm_gap , 'smaller-body', 'end', _color.text, secondLegend)
          textEl.appendChild(tspan4El1)
          legendG.appendChild(textEl)
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
      const barMsrp = _createRect(0, 0, id = null, 'second_bar', 0, 0, _color.msrp)
            barG.appendChild(barMsrp)
      if (typeFeature == "pricePremium") {
        const barPremium = _createRect(0, 0, id = null, 'first_bar', 0, 0, _color.premiumPrice)
              barG.appendChild(barPremium)
      } else {
        const circle4line = _createCircle(-10, -10, id = null, 'circle', 0, _color.resaleSold, "0", "", 0, "0")
              barG.appendChild(circle4line)
        if (i > 1) {
          const line4circle = _createLine(0, 0, 0, 0, id = null, 'line', _color.resaleSold, 0, "0")
                barG.appendChild(line4circle)
        }
      }
      // bar text
      const barTextEl1 = document.createElementNS(_svgNS, 'text');
            barTextEl1.setAttribute('x', 0);
            barTextEl1.setAttribute('y', 0);
            barTextEl1.setAttribute('class', 'barText small-body ');
            barTextEl1.setAttribute('fill', 'white');
            barTextEl1.setAttribute('text-anchor', 'middle');
            barTextEl1.setAttribute('dominant-baseline', 'hanging');
            barTextEl1.textContent = ''
            barG.appendChild(barTextEl1)
      const barTextEl2 = document.createElementNS(_svgNS, 'text');
            barTextEl2.setAttribute('x', 0);
            barTextEl2.setAttribute('y', 0);
            barTextEl2.setAttribute('class', 'barText small-body '); 
            barTextEl2.setAttribute('fill', _color.premiumPrice);
            barTextEl2.textContent = ''
            barTextEl2.setAttribute('text-anchor', 'middle')
            barTextEl2.setAttribute('dominant-baseline', 'hanging');
            barG.appendChild(barTextEl2)
      const barTextEl3 = document.createElementNS(_svgNS, 'text');
            barTextEl3.setAttribute('x', 0);
            barTextEl3.setAttribute('y', 0);
            barTextEl3.setAttribute('class', 'barText small-body'); 
            barTextEl3.setAttribute('fill', 'white');
            barTextEl3.textContent = ''
            barTextEl3.setAttribute('text-anchor', 'middle');
            barTextEl3.setAttribute('dominant-baseline', 'hanging');
            barG.appendChild(barTextEl3)
      // sneakers name
      const xAxisTextEl = document.createElementNS(_svgNS, 'text');
            xAxisTextEl.setAttribute('x', 0);
            xAxisTextEl.setAttribute('y', 0);
            xAxisTextEl.setAttribute('class', 'xAxisLabel');
      newShortentitle.forEach((item, i) => {
      const xAxisTspan1 = _createTspan(0, 0, 'big-body', 'start', _color.text, item)
            xAxisTextEl.appendChild(xAxisTspan1)
      })
      const xAxisTspan2 = _createTspan(0, 0, 'smaller-body', 'start', _color.greyText, "")
            xAxisTextEl.appendChild(xAxisTspan2)
      const xAxisTspan3 = _createTspan(0, 0, 'smaller-body', 'start', _color.greyText, "")
            xAxisTextEl.appendChild(xAxisTspan3)
      const barImg = _createImage(0, 0, id = null, '', 0)
            barG.appendChild(xAxisTextEl)
            barG.appendChild(barImg)
            target.appendChild(barG);
    }
  }
  function _onTweenCharts(c, target, arrData, typeFeature, arr4line) {
    const getIdx = target.id.split('_')[1];
    const premiumChart = target.parentNode.parentNode.nextElementSibling.lastChild.previousSibling.childNodes;
    const soldChart = target.parentNode.parentNode.nextElementSibling.lastChild.childNodes;
    let sumUp4avg;
    
    arrData.forEach((d, index) => {
      if (getIdx == index) {
        if (typeFeature == 'pricePremium') {
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
          _setAttributePremiumChart(c, premiumChart[c], newX, mstpH, premiumH, baseH, barW, x1, y1, y2, y3, newShortentitle, newShortenMonth, newShortenYear, range_trade_high, range_trade_low, retail_price, title);
        } else if (typeFeature == 'resaleSold') {
          const newX = _chart2.bigger_gap * 1.3
          const bidsH = _chart2.height * d.number_of_Bids / maxAsksNum
          const asksH = _chart2.height * d.number_of_Asks / maxAsksNum
          const soldCy = _chart2.height - (_chart2.height * d.number_of_sales / maxSoldNum)
                arr4line.push(soldCy)
          const y1 = _chart2.height - bidsH
          const y2 = _chart2.height - asksH 
          const maxValue = bidsH > asksH ? bidsH : asksH 
          const newAsksH= maxValue == bidsH ? asksH : asksH - bidsH;
          const barW = _canvasWidth * _onGetRatio(26, _canvasWidth, null) //(_chart2.width / targetChart.length) * _margin.gap ? _canvasWidth * _onGetRatio(20, _canvasWidth, null) : _canvasWidth * _onGetRatio(20, _canvasWidth, null)
          const x1 = barW / 2;
          const shortentitle = d.shorten_title;
          const newShortentitle = shortentitle.split(' ').length != 1 ? shortentitle.split(' ') : [shortentitle];
          const newShortenMonth = d.release_MY.split(' ').splice(0,2).join(' ');
          const newShortenYear = d.release_MY.split(' ').pop();
          const number_of_Asks =  d.number_of_Asks.toLocaleString()
          const number_of_sales = d.number_of_sales.toLocaleString()
          const number_of_Bids =  d.number_of_Bids.toLocaleString()
          const title = d.title
          sumUp4avg = d.number_of_sales
          _setAttributeSoldChart(c, soldChart[c], newX, soldCy, bidsH, newAsksH, barW, x1, y1, y2, arr4line, newShortentitle, newShortenMonth, newShortenYear, number_of_Asks, number_of_sales, number_of_Bids, title);
        }
      }
    })
    return sumUp4avg
  }
  function _onTweenSneakers(item, mouseX, radians, newX, newY, startX, endX) {
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
      item.firstChild.nextElementSibling.setAttribute("y2", _chart1H - _margin.top + parseFloat(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.getAttribute('transform').split(' ',1)[0].split(',')[5]))
    }
    startX = mouseX + _canvasWidth * _onGetRatio(100, _canvasWidth, null) <= _margin.left ? _margin.left : mouseX + _canvasWidth * _onGetRatio(100, _canvasWidth, null)
    endX = mouseX + _canvasWidth * _onGetRatio(180, _canvasWidth, null) >= _chart1W - _margin.left ? _chart1W - _margin.left : mouseX + _canvasWidth * _onGetRatio(180, _canvasWidth, null)
    item.parentNode.parentNode.firstChild.setAttribute('fill-opacity', '1');
    item.parentNode.parentNode.firstChild.setAttribute("d", `M${startX} ${_chart1H - _margin.top} L${endX} ${_chart1H - _margin.top} L${_chart1W - _margin.left} ${_chart1H + _margin.bottom} L${_margin.left} ${_chart1H + _margin.bottom} Z`)
    return item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value - mouseX
  }
  
  const detectArea = _canvasWidth * _onGetRatio(50, _canvasWidth, null);
  const radius = _canvasWidth * _onGetRatio(240, _canvasWidth, null);
  function _updateMouseX(e, isHover, sneakersData, typeFeature) {
    let mouseX, targetX;
    let radians, newX, newY;
    let startX, endX;
    let avg_value;
    let sumUp4avg = 0;
    let c = 0; //detected sneakersCount on every mouse hover
    const typeText = typeFeature == "pricePremium" ? "Avg. Resale Price " : "Avg. Resale Volume "
    const maxValue4avg = typeFeature == "pricePremium" ? maxTradingHigh : maxSoldNum
    if (isHover) {
      let arr4line = [];
      console.log('display agian')
      if (typeFeature == "pricePremium") {
        e.target.parentNode.nextElementSibling.lastChild.previousSibling.childNodes.forEach((value, index) => {
          if (index != 0) _setAttributePremiumChart(c, value, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", "", "", "", "", "", title = null)
        })
      } else if (typeFeature == 'resaleSold') {
        e.target.parentNode.nextElementSibling.lastChild.childNodes.forEach((value, index) => {
          if (index != 0) _setAttributeSoldChart(c, value, 0, -10, 0, 0, 0, 0, 0, 0, val4line = null, "", "", "", "", "", "", title = null)
        })
      }
      e.target.previousSibling.childNodes.forEach((item, index) => {
        mouseX = e.pageX - _margin.left;
        targetX = item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value;
        if (Math.abs(item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value - mouseX) <= detectArea && item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.getAttribute('transform')) {
          c += 1;
          _onTweenSneakers(item, mouseX, radians, newX, newY, startX, endX)
          avg_value = _onTweenCharts(c, item, sneakersData, typeFeature, arr4line)
          sumUp4avg += avg_value
          item.parentNode.parentNode.nextElementSibling.firstChild.nextElementSibling.setAttribute('y1', _chart2.height - (_chart2.height * (sumUp4avg / c) / maxValue4avg))
          item.parentNode.parentNode.nextElementSibling.firstChild.nextElementSibling.setAttribute('y2', _chart2.height - (_chart2.height * (sumUp4avg / c) / maxValue4avg))
          item.parentNode.parentNode.nextElementSibling.firstChild.nextElementSibling.nextElementSibling.setAttribute('y', _chart2.height - (_chart2.height * (sumUp4avg / c) / maxValue4avg) - (_chart2.smer_gap * 0.5))
          item.parentNode.parentNode.nextElementSibling.firstChild.nextElementSibling.nextElementSibling.textContent = typeText + parseInt(sumUp4avg / c).toLocaleString()
        } else {
          item.firstChild.setAttribute("stroke-opacity","0");
          item.firstChild.nextElementSibling.setAttribute("x2", targetX)
          item.firstChild.nextElementSibling.setAttribute("y2", _chart1H - _margin.top)
          item.firstChild.nextElementSibling.setAttribute("stroke-opacity","0");
          item.firstChild.nextElementSibling.nextElementSibling.setAttribute("fill-opacity","0");
          item.firstChild.nextElementSibling.nextElementSibling.setAttribute("stroke-opacity","0");
          gsap.to(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling, {id: "imgFall", duration: 0.75, rotation: 0, x: 0 , y:0, ease: "elastic.out(1, 0.5)"})
        }
      })
    } else {
      e.target.parentNode.nextElementSibling.lastChild.childNodes.forEach((value, index) => {   
        if (index != 0) {
          if (typeFeature == 'pricePremium') _setAttributePremiumChart(c, value, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", "", "", "", "", "", title = null)
          if (typeFeature == 'resaleSold') _setAttributeSoldChart(c, value, 0, -10, 0, 0, 0, 0, 0, 0, val4line = null, "", "", "", "", "", "", title = null)
        }
      })
      e.target.previousSibling.childNodes.forEach(item => {
        if (gsap.getById("imgRise")) {gsap.getById("imgRise").reverse();}
        item.firstChild.setAttribute("stroke-opacity","0");
        item.firstChild.nextElementSibling.setAttribute("stroke-opacity","0");
        item.parentNode.parentNode.firstChild.setAttribute('fill-opacity', '0');
        gsap.to(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling, {id: "letFall", duration: 0.75,  rotation: 0, x: 0 , y:0, ease: "elastic.out(1, 0.5)"})
      })
      e.target.parentNode.nextElementSibling.firstChild.nextElementSibling.setAttribute('y1', -10)
      e.target.parentNode.nextElementSibling.firstChild.nextElementSibling.setAttribute('y2', -10)
      e.target.parentNode.nextElementSibling.firstChild.nextElementSibling.nextElementSibling.setAttribute('y', -10)
    }
  }
  function _onInit(colorMapData, typeFeature){
    console.log('colorMapData', colorMapData)
    // create map
    const sec1Svg = document.getElementById('map');
          sec1Svg.setAttribute('width', _chart1W);
          sec1Svg.setAttribute('height', _chart1H + _margin.bottom);
    const sec1G = document.createElementNS(_svgNS, 'g');
          sec1G.setAttribute('id', 'sneakers');
          sec1G.setAttribute('transform', `translate(${_margin.left}, 0)`);
    const sec1Rect1 = document.createElementNS(_svgNS, 'path');
          sec1Rect1.setAttribute('id', 'navigation');
          sec1Rect1.setAttribute('d', `M${_margin.left} ${_chart1H - _margin.top} L${_margin.left + _canvasWidth * _onGetRatio(120, _canvasWidth, null)} ${_chart1H - _margin.top} L${_chart1W - _margin.left} ${_chart1H + _margin.bottom} L${_margin.left} ${_chart1H + _margin.bottom} Z`);
          sec1Rect1.setAttribute('fill', _color.chartBG);
          sec1Rect1.setAttribute('fill-opacity', '0');
          sec1Svg.appendChild(sec1Rect1);
    const sec1Rect2 = _createRect(0, 0, 'mapBG', classes = null, _chart1W,  _chart1H - _margin.top, _color.mapBG)
          sec1Svg.appendChild(sec1Rect2);
    // legend
    const legendG = _createLegend('Trading Range', '(12 Mos.)', 'Price Premium', 'Manufacturer Suggested Retail Price', _color.premiumPrice, _color.msrp)
          legendG.setAttribute('display', 'none')
          sec1Svg.appendChild(legendG)
    //discription
    const distGroup = document.createElementNS(_svgNS, 'g');
          distGroup.setAttribute('id', 'description');
          distGroup.setAttribute('width', _chart1W);
          distGroup.setAttribute('height', _chart1H/2);
    const imageTag = _createImage(_chart1W/2 -_chart2.bigger_gap * 0.6, _chart1H/4, id = null, 'img/mouse_hover.svg', _chart2.bigger_gap * 1.8)
          distGroup.appendChild(imageTag);
    const hovorText = document.createElementNS(_svgNS, 'text');
          hovorText.setAttribute('x', _chart1W/2);
          hovorText.setAttribute('y', _chart1H - (_margin.bottom * 2.6));
          hovorText.setAttribute('text-anchor', 'middle');
          hovorText.setAttribute('class', 'bigger-body');
          hovorText.textContent = 'Mouse Hover the sneakers, you’ll get details below.'
          distGroup.appendChild(hovorText);
          sec1Svg.appendChild(distGroup);
    const sec1Rect3 = _createRect(0, _chart1H - _canvasHeight * _onGetRatio(220, null, _canvasHeight), 'display-none', classes = null,_chart1W, _canvasHeight * _onGetRatio(270, null, _canvasHeight), 'rgba(255, 255, 10, 0)')
          sec1Svg.appendChild(sec1G);
    // add sneakers images
    colorMapData.forEach((d,i) => {
      let centerX = _colorXScale * d.relative_primary / (maxPrimaryD) + (_canvasWidth * _onGetRatio(70, _canvasWidth, null) * 0.4)
      const sec1Group = document.createElementNS(_svgNS, 'g');
            sec1Group.setAttribute('id', `_${i}_${d.title}_g`);
      const sec1Path1 = _createLine(centerX, centerX, _chart1H - _margin.top, _chart1H - _margin.bottom, id = null, classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), '0')
            sec1Group.appendChild(sec1Path1);
      const sec1Path2 = _createLine(centerX, centerX, _chart1H - _margin.bottom, _chart1H - _margin.bottom, id = null, 'line-changable', _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), '0')
            sec1Group.appendChild(sec1Path2);
      const sec1Circle = _createCircle(centerX,  _chart1H - _margin.top, `_${i}_${d.title}_c`, classes = null, _canvasWidth * _onGetRatio(3, _canvasWidth, null), `rgb(${d.primary_color[0]}, ${d.primary_color[1]}, ${d.primary_color[2]})`, '0', 'white', _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), '0')
            sec1Group.appendChild(sec1Circle);
      const sec1Img = _createImage(_colorXScale * d.relative_primary / maxPrimaryD, _chart1H - _margin.bottom, `_${i}_${d.title}_img`, `img/${d.title}.png`, _canvasWidth * _onGetRatio(70, _canvasWidth, null))
            sec1Group.appendChild(sec1Img);
            sec1G.appendChild(sec1Group);
    })
            sec1Svg.appendChild(sec1Rect3);
    // create chart wireframe
    const sec2Svg = document.getElementById('chart')
          sec2Svg.setAttribute('width', _chart1W);
          sec2Svg.setAttribute('height', _chart2.height + (_margin.bottom * 2));
    // bg
    const sec2RectBG = _createRect(_margin.left, 0, 'chartBG', classes = null, _chart2.width - _margin.left, _chart2.height, _color.chartBG)
          sec2Svg.appendChild(sec2RectBG);
    // create avg. price premium guideline in dash
    const avg_line1 = _createLine(_margin.left, _chart2.width, -10, -10, 'avg_guideline1', classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
          avg_line1.setAttribute('stroke-dasharray', _margin.gap * 0.1)
          sec2Svg.appendChild(avg_line1);
    const avg_text1 = document.createElementNS(_svgNS, 'text');
          avg_text1.setAttribute('x', _chart2.width);
          avg_text1.setAttribute('y', _chart1H - (_margin.bottom * 2.6));
          avg_text1.setAttribute('class', 'small-body');
          avg_text1.setAttribute('text-anchor', 'end');
          avg_text1.setAttribute('fill', _color.text);
          avg_text1.textContent = ''
          sec2Svg.appendChild(avg_text1);
    // create avg. price premium guideline in dash
    const avg_line2 = _createLine(_margin.left, _chart2.width, -10, -10, 'avg_guidline2', classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
          avg_line2.setAttribute('stroke-dasharray', _margin.gap * 0.1)
          sec2Svg.appendChild(avg_line2);
    const avg_text2 = document.createElementNS(_svgNS, 'text');
          avg_text2.setAttribute('x', _chart2.width);
          avg_text2.setAttribute('y', _chart1H - (_margin.bottom * 2.6));
          avg_text2.setAttribute('class', 'small-body');
          avg_text2.setAttribute('text-anchor', 'end');
          avg_text2.setAttribute('fill', _color.text);
          avg_text2.textContent = ''
          sec2Svg.appendChild(avg_text2);
    // xAxis
    const sec2xAxis = _createLine(_margin.left, _chart2.width, _chart2.height, _chart2.height, 'xAxis', classes = null, _color.text, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), "1")
          sec2Svg.appendChild(sec2xAxis);
    // group tag
    const sec2Group1 = document.createElementNS(_svgNS, 'g');
          sec2Group1.setAttribute('id', typeFeature);
    // yAxis
    if (typeFeature == 'pricePremium') {
      const maxYscale = maxTradingHigh + 4
      const maxYText = 60
      const yScalText = _chart2.sm_gap * 1.13
      const sec2yAxis = _createYAxis(maxYscale, maxYText, yScalText)
            sec2yAxis.setAttribute('display', 'none')
            sec2Svg.appendChild(sec2yAxis)
    } else {
      const maxYscale2 = [maxAsksNum + 1, maxSoldNum + 3131]
      const maxYText2 = [250, 4000]
      const yScalText2 = [_chart2.big_gap * 1.172, _chart2.bigger_gap * 1.214]
      const sec2yAxis1 = _createYAxis(maxYscale2[0], maxYText2[0], yScalText2[0], 1)
      const sec2yAxis2 = _createYAxis(maxYscale2[1], maxYText2[1], yScalText2[1], 2)
            // sec2yAxis1.setAttribute('display', 'none')
            // sec2yAxis2.setAttribute('display', 'none')
            sec2Svg.appendChild(sec2yAxis1)
            sec2Svg.appendChild(sec2yAxis2)
    }
    // create dummy bar chart
    _createBarChart(sec2Group1, 24, typeFeature);
          sec2Svg.appendChild(sec2Group1);
    // call animation on each sneakers
    let isHover = false;
    sec1Rect3.addEventListener("mouseover", (e)=> {
      if (isHover != true) {isHover = true;}
    })
    sec1Rect3.addEventListener("mousemove", (e)=> {
      if (isHover) {
        document.getElementById('description').setAttribute('display', 'none');
        document.getElementById('chartBG').setAttribute('display', 'block');
        document.getElementById('legend').setAttribute('display', 'block');
        _updateMouseX(e, isHover, colorMapData, typeFeature);
      }
    })
    sec1Rect3.addEventListener("mouseout", (e)=> {
      if (isHover) {
        isHover = false; 
        // console.log(isHover);
        document.getElementById('description').setAttribute('display', 'block');
        document.getElementById('chartBG').setAttribute('display', 'none');
        document.getElementById('legend').setAttribute('display', 'none');
        _updateMouseX(e, isHover, colorMapData, typeFeature); 
        }
    })  
  }
  const typeFeatures = ['pricePremium', 'resaleSold']
  //init call
  _onInit(colorMapData, typeFeatures[1])
  })
  