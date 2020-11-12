let colorMapData = [];
let avgSumOfSold = 0;
// READ DATA
Promise.all([
  d3.csv('data/Yeezy_sales_performace.csv'),
  d3.json('data/deltaE.json')
]).then(function([stockX, colorDistance]) {
  stockX.forEach((d, i) => {
    d.title = d.title
    d.category = [...d.title.matchAll(/(QNTM\s|\d{3}\sMNVN\s|\d{3}\s)+(\w{1}\d{1})*/gm)][0][0].replaceAll(/\s$/gm,'')
    d.shorten_title = d.title.replaceAll(/(adidas\sYeezy\s|Boost|QNTM\s|\d{3}\s)+(\w{1}\d{1})*/gm, '').replaceAll(/^\s{1,2}|^\s\w*\s$/gm,'')
    d.thumb_url = d.thumb_url
    d.description = d.description
    d.release_date = d.release_date.replaceAll(/(Release:\s)+/gm, '')
    d.release_year = d.release_date.split('/')[2]
    // d.daysFromPriviousRelease = i < stockX.length - 1 ? _differenceInDays(d.release_date, _lookupReleaseDates[i + 1]) : 0//'Very first pair';
    // d.daysReleasRange = d.daysFromPriviousRelease <= 8 ? 'Released new within one week' : d.daysFromPriviousRelease <= 24 ? 'Released new within three weeks' : 'Released new after Avg. difference in days'
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
    avgSumOfSold += d.number_of_sales
  })

  let sumPrimaryDistance = 0;
  let avgOfSold;
  let maxPrimaryD = 0;//1370;

  colorDistance.filter(obj => {
    sumPrimaryDistance += obj.distance_primary;
    avgOfSold = Math.round(avgSumOfSold/stockX.length);
    stockX.forEach((d, i) => {
      if (obj.target == d.title) {
        // d.daysFromPriviousCluster = i < clusterSort.length - 1 ? _differenceInDays(d.release_date, cluster.values[i + 1].release_date) : 0//'Very first pair';
        // d.daysClusterRange = d.daysFromPriviousRelease <= 8 ? 'Released new within one week' : d.daysFromPriviousCluster <= 24 ? 'Released new within three weeks' : 'Released new after Avg. difference in days'
        if (d.number_of_sales > 50000) {
          d.sold_range = 'Sold over 50,000' 
        } else if (d.number_of_sales > 30000) {
          d.sold_range = 'Sold over 30,000'
        } else if (d.number_of_sales > avgOfSold) {
          d.sold_range = 'Sold over Avg.Resale' 
        } else {
          d.sold_range = 'Sold under Avg.Resale'
        }
        
        if (maxPrimaryD < Math.round(sumPrimaryDistance)) {maxPrimaryD = Math.round(sumPrimaryDistance)}

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
                           'release_year': d.release_year,
                           'number_of_sales': d.number_of_sales,
                           'range_sold': d.sold_range,
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
                           // 'daysFromPriviousRelease': d.daysFromPriviousRelease,
                           // 'daysReleasRange': d.daysReleasRange,
                           // 'daysFromPriviousCluster': d.daysFromPriviousCluster,
                           // 'daysClusterRange': d.daysClusterRange,
                          })
      }
    })
  })
  
  // SET RESPONSIVE FIGURE
  const _canvasWidth = Math.floor(window.innerWidth)
  const _canvasHeight = Math.floor(window.innerHeight)
  const _margin = {gap: _canvasWidth * _onGetRatio(20, _canvasWidth, null), top: _canvasHeight * _onGetRatio(30, null, _canvasHeight), 
                   right: _canvasWidth * _onGetRatio(60, _canvasWidth, null), bottom: _canvasHeight * _onGetRatio(50, null, _canvasHeight), 
                   left: _canvasWidth * _onGetRatio(160, _canvasWidth, null), columnWidth: _canvasWidth * _onGetRatio(164, _canvasWidth, null)};
  const _table = {top: _canvasHeight * _onGetRatio(22, null, _canvasHeight), bottom: _canvasHeight * _onGetRatio(22, null, _canvasHeight),
                  big_gap: _canvasHeight * _onGetRatio(18, null, _canvasHeight), sm_gap: _canvasHeight * _onGetRatio(10, null, _canvasHeight)}
  const _chartW = _canvasWidth
  const _chartH = _canvasHeight * 0.2
  const _svgNS = "http://www.w3.org/2000/svg";
  const _colorXScale = _chartW - (_margin.left * 2) - _margin.right;
  const _sneakersWidth = _canvasWidth * _onGetRatio(70, _canvasWidth, null);
  const _color = {mapLine: "#CCCCCC", mapBG: "#F5F5F5", premiumPrice: "#F65E5D", resaleSold:"#0382ED", tableBG: "#FDFDFD"}

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
  function _createCircle(cx, cy, id, r, color, fillOpacity, stroke, strokeWidth, strokeOpacity) {
    const circle = document.createElementNS(_svgNS, 'circle');
          circle.setAttribute('cx', cx)
          circle.setAttribute('cy', cy);
          circle.setAttribute('id', id);
          circle.setAttribute('r', r);
          circle.setAttribute('fill', color);
          circle.setAttribute('fill-opacity', fillOpacity);
          circle.setAttribute('stroke', stroke);
          circle.setAttribute('stroke-width', strokeWidth);
          circle.setAttribute('stroke-opacity', strokeOpacity);
    return circle;
  }
  function _createLine(x1, x2, y1, y2, classes, stroke, strokeWidth, strokeOpacity) {
    const line = document.createElementNS(_svgNS, 'line');
          line.setAttribute('x1', x1);
          line.setAttribute('x2', x2);
          line.setAttribute('y1', y1);
          line.setAttribute('y2', y2);
          if (classes != null) line.setAttribute('class', classes);
          line.setAttribute("stroke",stroke);
          line.setAttribute('stroke-width', strokeWidth);
          line.setAttribute('stroke-opacity', strokeOpacity);
    return line
  }
  function _createRect(x, y, id, width, height, color) {
    const rect = document.createElementNS(_svgNS, 'rect');
          rect.setAttribute('x', x);
          rect.setAttribute('y', y);
          if (id != null) rect.setAttribute('id', id);
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

  // function _onDetialView(c, target, arrData) {
  //   const getIdx = typeof target == 'string' ? target.split('_')[1] : target.id.split('_')[1];   
  //   arrData.forEach((item, index) => {
  //     if (getIdx == index) {
  //       const selectData = [arrData[index-2], arrData[index-1], arrData[index], arrData[index+1], arrData[index+2]]
  //       (c < 6) ? _onSetAttribute(item, c) : selectData.forEach((d, i) => {_onSetAttribute(d, i + 1)})
  //     }
  //   })
  // }

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
      item.firstChild.nextElementSibling.setAttribute("y2", _chartH - _margin.top + parseFloat(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.getAttribute('transform').split(' ',1)[0].split(',')[5]))
    }
    startX = mouseX + _canvasWidth * _onGetRatio(100, _canvasWidth, null) <= _margin.left ? _margin.left : mouseX + _canvasWidth * _onGetRatio(100, _canvasWidth, null)
    endX = mouseX + _canvasWidth * _onGetRatio(180, _canvasWidth, null) >= _chartW - _margin.left ? _chartW - _margin.left : mouseX + _canvasWidth * _onGetRatio(180, _canvasWidth, null)
    item.parentNode.parentNode.firstChild.setAttribute('fill-opacity', '1');
    item.parentNode.parentNode.firstChild.setAttribute("d", `M${startX} ${_chartH - _margin.top} L${endX} ${_chartH - _margin.top} L${_chartW - _margin.left} ${_chartH + _margin.bottom} L${_margin.left} ${_chartH + _margin.bottom} Z`)
    return item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value - mouseX
  }

  const detectArea = _canvasWidth * _onGetRatio(80, _canvasWidth, null);
  const radius = _canvasWidth * _onGetRatio(240, _canvasWidth, null);
  function _updateMouseX(e, isHover, sneakersData) {
    let mouseX, targetX;
    let radians, newX, newY;
    let startX, endX;
    let c = 0; //sneakersCount

    if (isHover) {
      console.log('display agian')
      for (var t = 1; t < 6; t++) { 
        document.getElementById(`coulmn_${t}`).style.display = "none"
      }
      e.target.previousSibling.childNodes.forEach(item => {
        mouseX = e.pageX - _margin.left;
        targetX = item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value;
        
        if (Math.abs(item.firstChild.nextElementSibling.nextElementSibling.cx.animVal.value - mouseX) <= detectArea && item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling.getAttribute('transform')) {
          c += 1;
          _onTweenSneakers(item, mouseX, radians, newX, newY, startX, endX)
          // _onDetialView(c, item, sneakersData)
        } else {
          item.firstChild.setAttribute("stroke-opacity","0");
          item.firstChild.nextElementSibling.setAttribute("x2", targetX)
          item.firstChild.nextElementSibling.setAttribute("y2", _chartH - _margin.top)
          item.firstChild.nextElementSibling.setAttribute("stroke-opacity","0");
          item.firstChild.nextElementSibling.nextElementSibling.setAttribute("fill-opacity","0");
          item.firstChild.nextElementSibling.nextElementSibling.setAttribute("stroke-opacity","0");
          gsap.to(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling, {id: "imgFall", duration: 0.75, rotation: 0, x: 0 , y:0, ease: "elastic.out(1, 0.5)"})
        }
      })
    } else {
      e.target.previousSibling.childNodes.forEach(item => {
        if (gsap.getById("imgRise")) {gsap.getById("imgRise").reverse();}
        item.firstChild.setAttribute("stroke-opacity","0");
        item.firstChild.nextElementSibling.setAttribute("stroke-opacity","0");
        item.parentNode.parentNode.firstChild.setAttribute('fill-opacity', '0');
        gsap.to(item.firstChild.nextElementSibling.nextElementSibling.nextElementSibling, {id: "letFall", duration: 0.75,  rotation: 0, x: 0 , y:0, ease: "elastic.out(1, 0.5)", stagger: 0.25})
      })
    }
  }

  function _onInit(colorMapData){
    console.log('colorMapData', colorMapData)

    // create map
    const sec1Svg = document.getElementById('svg');
          sec1Svg.setAttribute('id', 'map');
          sec1Svg.setAttribute('width', _chartW);
          sec1Svg.setAttribute('height', _chartH + _margin.bottom);
    const sec1G = document.createElementNS(_svgNS, 'g');
          sec1G.setAttribute('id', 'sneakers');
          sec1G.setAttribute('transform', `translate(${_margin.left}, 0)`);
    const sec1Rect1 = document.createElementNS(_svgNS, 'path');
          sec1Rect1.setAttribute('id', 'navigation');
          sec1Rect1.setAttribute('d', `M${_margin.left} ${_chartH - _margin.top} L${_margin.left + _canvasWidth * _onGetRatio(120, _canvasWidth, null)} ${_chartH - _margin.top} L${_chartW - _margin.left} ${_chartH + _margin.bottom} L${_margin.left} ${_chartH + _margin.bottom} Z`);
          sec1Rect1.setAttribute('fill', _color.tableBG);
          sec1Rect1.setAttribute('fill-opacity', '0');
          sec1Svg.appendChild(sec1Rect1);
    const sec1Rect2 = _createRect(0, 0, 'mapBG', _chartW,  _chartH - _margin.top, _color.mapBG)
          sec1Svg.appendChild(sec1Rect2);
    const sec1Rect3 = _createRect(0, _chartH - _canvasHeight * _onGetRatio(220, null, _canvasHeight), 'display-none', _chartW, _canvasHeight * _onGetRatio(270, null, _canvasHeight), 'rgba(255, 255, 10, 0)')
          sec1Svg.appendChild(sec1G);
    // add sneakers images
    colorMapData.forEach((d,i) => {
      let centerX = _colorXScale * d.relative_primary / (maxPrimaryD) + (_sneakersWidth * 0.4)
      const sec1Group = document.createElementNS(_svgNS, 'g');
            sec1Group.setAttribute('id', `_${i}_${d.title}_g`);
      const sec1Path1 = _createLine(centerX, centerX, _chartH - _margin.top, _chartH - _margin.bottom, classes = null, _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), '0')
            sec1Group.appendChild(sec1Path1);
      const sec1Path2 = _createLine(centerX, centerX, _chartH - _margin.bottom, _chartH - _margin.bottom, 'line-changable', _color.mapLine, _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), '0')
            sec1Group.appendChild(sec1Path2);
      const sec1Circle = _createCircle(centerX,  _chartH - _margin.top, `_${i}_${d.title}_c`, _canvasWidth * _onGetRatio(3, _canvasWidth, null), `rgb(${d.primary_color[0]}, ${d.primary_color[1]}, ${d.primary_color[2]})`, '0', 'white', _canvasWidth * _onGetRatio(0.6, _canvasWidth, null), '0')
            sec1Group.appendChild(sec1Circle);
      const sec1Img = _createImage(_colorXScale * d.relative_primary / maxPrimaryD, _chartH - _margin.bottom, `_${i}_${d.title}_img`, `img/${d.title}.png`, _sneakersWidth)
            sec1Group.appendChild(sec1Img);
            sec1G.appendChild(sec1Group);
    })
            sec1Svg.appendChild(sec1Rect3);
            
    // create table
    const sec2Svg = document.getElementById('detail')
          sec2Svg.setAttribute('width', _chartW);
          sec2Svg.setAttribute('height', _chartH * 2.6);
    const sec2Rect1 = _createRect(_margin.left, 0, 'tableBG', _chartW - (_margin.left * 2), _chartH * 1.4, _color.tableBG)
          sec2Svg.appendChild(sec2Rect1);
    const sec2tableGroup = document.createElementNS(_svgNS, 'g');
          sec2tableGroup.setAttribute('id', 'sneakersInfos');
          sec2Svg.appendChild(sec2tableGroup);
    // add columns of sneakers infos into table
    for (var s = 1; s < 6; s++) {
      const tableG = document.createElementNS(_svgNS, 'g');
            tableG.setAttribute('id', `coulmn_${s}`);
            tableG.setAttribute('transform', `translate(${_margin.left + _margin.gap + (_margin.gap * (s)) + (_margin.columnWidth * [s - 1])}, ${_margin.top})`);
            // tableG.setAttribute('display', 'none');
      const text1El = document.createElementNS(_svgNS, 'text');
            text1El.setAttribute('x', 0);
            text1El.setAttribute('y', 0);
      const tspan1El1 = _createTspan(0, 0, 'big-body', textAnchor = null, "white", '350 V2 Earth')
            text1El.appendChild(tspan1El1)
      const tspan2El1 = _createTspan(_margin.columnWidth, 0, 'small-body', 'end', "white", '02/22/2020')
            text1El.appendChild(tspan2El1)
      const tspan3El1 = _createTspan(_margin.columnWidth, _table.sm_gap, 'small-body', 'end', "white", 'MSRP: $220')
            text1El.appendChild(tspan3El1)
            tableG.appendChild(text1El)
            sec2tableGroup.appendChild(tableG)
    }
    // call animation on each sneakers
    let isHover = false;
    sec1Rect3.addEventListener("mouseover", (e)=> {
      if (isHover != true) {isHover = true;}
    })   
    sec1Rect3.addEventListener("mousemove", (e)=> {
      if (isHover) {_updateMouseX(e, isHover, colorMapData);}
    })
    sec1Rect3.addEventListener("mouseout", (e)=> {
      if (isHover) {isHover = false; console.log(isHover); _updateMouseX(e, isHover, colorMapData);}
    })  
  }
  //init call
  _onInit(colorMapData)
  })

  
  // let tspan1_text, tspan2_text, tspan3_text, tspan4_text, tspan5_text, tspan6_text, tspan7_text, tspan8_text, tspan9_text, tspan10_text;
  // for(var t = 0; t < 3; t++) {
  //   if (t == 0) {
  //     tspan1_text = 'Price Premium'
  //     tspan2_text = '85.9%'
  //     tspan3_text = 'Avg. Resale Price'
  //     tspan4_text = '$302'
  //     tspan5_text = '$1,450'
  //     tspan6_text = 'Trading Range'
  //     tspan7_text = '$452'
  //     tspan8_text = '$1,664'
  //     tspan9_text = '$220' //(white)
  //     tspan10_text = '$366' //(pink)
  //   } else if (t == 1) {
  //     tspan1_text = 'Resale Volume'
  //     tspan2_text = '26,920'
  //     tspan3_text = 'Number of Asks'
  //     tspan4_text = '$802'
  //     tspan5_text = '$6,722'
  //     tspan6_text = 'Number of Bids'
  //     tspan7_text = '$408'
  //     tspan8_text = '$1,296'
  //   } else {
  //     tspan1_text = 'Color Distance'
  //     tspan2_text = '133.12'
  //     tspan3_text = 'Difference in RGB (Delta E)'
  //     tspan4_text = '7.68'
  //     tspan5_text = 'Medium Contrast'
  //     tspan6_text = '361.78'
  //     tspan7_text = 'Base Color'
  //     tspan8_text = 'Highlight Color'
  //   }
  //   const textEl = document.createElementNS(_svgNS, 'text');
  //         textEl.setAttribute('x', 0);
  //         textEl.setAttribute('y', 0);
  //   // tspan
  //   const tspan1 = _createTspan(0, _table.top, 'tspan1 big-body', textAnchor = null, "white", tspan1_text_text)
  //   const tspan2 = _createTspan(_margin.gap, _table.sm_gap, 'tspan2 bigger-body', textAnchor = null, "white", tspan2_text)
  //   const tspan3 = _createTspan(0, _table.big_gap, 'tspan3 small-body', textAnchor = null, "white", tspan3_text)
  //   const barBG = _createRect(0, y, id = null, _margin.columnWidth, _table.sm_gap, color)
  //   const barGreyBG = _createRect(0, y, id = null, _margin.columnWidth/2, _table.sm_gap, color)
  //   const barHighlightBG = _createRect(_margin.columnWidth/5, y, id = null, _margin.columnWidth/3, _table.sm_gap, color)
  // }