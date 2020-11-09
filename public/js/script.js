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
  let objRelative_primary = {};
  colorDistance.filter(obj => {
    sumPrimaryDistance += obj.distance_primary;
    objRelative_primary[Math.round(sumPrimaryDistance)] = obj.target
    stockX.forEach((d, i) => {
      let avgOfSold = Math.round(avgSumOfSold/stockX.length)
      if (obj.target == d.title) {
        if (d.number_of_sales > 50000) {
          d.sold_range = 'Sold over 50,000' 
        } else if (d.number_of_sales > 30000) {
          d.sold_range = 'Sold over 30,000'
        } else if (d.number_of_sales > avgOfSold) {
          d.sold_range = 'Sold over Avg.Resale' 
        } else {
          d.sold_range = 'Sold under Avg.Resale'
        }
        // d.daysFromPriviousCluster = i < clusterSort.length - 1 ? _differenceInDays(d.release_date, cluster.values[i + 1].release_date) : 0//'Very first pair';
        // d.daysClusterRange = d.daysFromPriviousRelease <= 8 ? 'Released new within one week' : d.daysFromPriviousCluster <= 24 ? 'Released new within three weeks' : 'Released new after Avg. difference in days'
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
  const _canvasHeight = Math.floor(window.innerWidth)
  const _margin = {gap: _canvasWidth * _onGetRatio(6, _canvasWidth, null), top: _canvasHeight * _onGetRatio(44, null, _canvasHeight), 
                   right: _canvasWidth * _onGetRatio(60, _canvasWidth, null), bottom: _canvasHeight * _onGetRatio(40, null, _canvasHeight), 
                   left: _canvasWidth * _onGetRatio(120, _canvasWidth, null), rect: _canvasHeight * _onGetRatio(80, null, _canvasHeight)};
  const _chartW = _canvasWidth
  const _chartH = _canvasHeight/3
  const _svgNS = "http://www.w3.org/2000/svg";
  const _colorXScale = _chartW - _margin.right - _margin.left;
  const maxPrimaryD = 1359;

  function _onGetRatio(val, width, height){
    if (width) {
      return val / width;
    } else {
      return val / height;
    }
  }

  // function _hovorTooltip(target, arrData) {
  //   let getIdx = target.id.split('_')[1];
  //   let centerX = target.parentNode.firstChild.nextElementSibling.childNodes[2].x.
  //   arrData.forEach((item, index) => {
  //     if (getIdx == index) {
  //       sec1Rect = document.createElementNS(_svgNS, 'rect');
  //         sec1Rect.setAttributeNS(null, 'class', 'display-none');
  //         sec1Rect.setAttributeNS(null, 'x', _margin.right);
  //         sec1Rect.setAttributeNS(null, 'y', _chartH - _margin.rect);
  //         sec1Rect.setAttributeNS(null, 'width', _chartW - _margin.left + _margin.gap);
  //         sec1Rect.setAttributeNS(null, 'height', _margin.bottom);
  //         sec1Rect.setAttributeNS(null, 'fill', 'rgba(255, 255, 10, 0)');
  //       target.parentNode.appendChild()
  //     }
  //   })
  //   return
  // }

  // function _change2Arc(arrDistance, lineEl, mouseX) {
  //   let arr = []
  //   arrDistance.forEach(item => {
  //     arr.push(item);
  //   })
  //   let points.sort(function(a, b){return a-b})

  //   let centerX = mouseX;
  //   let x = lineEl.x1.animVal.value;
  //   let y = lineEl.y1.animVal.value;
  //   let title = lineEl.id
  //   if (x > centerX) {

  //   } else {

  //   }
  //   console.log(centerX, title, x, y)
  // }
  const radius = 180;
  function _updateMouseX(e, isHover, sneakersData) {
    let targetX;
    let mouseX;
    let radians, newX, newY;
    if (isHover) {
      e.target.parentNode.firstChild.nextElementSibling.childNodes.forEach((item, index) => {
        targetX = item.firstChild.cx.animVal.value
        mouseX = e.pageX - _margin.right
        if (Math.abs(targetX - mouseX) <= radius) {
          radians = ((radius - (targetX - mouseX)) * (90/radius)) * (Math.PI/180)
          newX = mouseX + (Math.cos(radians) * radius);
          newY = (Math.sin(-radians) * radius);
          gsap.to(item.firstChild.nextElementSibling, {id: "letRise", duration: 0.75, x: newX - targetX , y:   newY  , ease: "elastic.out(1, 0.5)"})
          item.firstChild.setAttribute("fill-opacity","1");
          item.firstChild.setAttribute("stroke-opacity","1");

          // const sec1Path = document.createElementNS(_svgNS, 'line');
          //       sec1Path.setAttributeNS(null, 'id', `_${i}_${d.title}_line`);
          //       sec1Path.setAttributeNS(null, 'x1', (_colorXScale * d.relative_primary / maxPrimaryD) + _canvasWidth * _onGetRatio(46, _canvasWidth, null));
          //       sec1Path.setAttributeNS(null, 'x2', (_colorXScale * d.relative_primary / maxPrimaryD) + _canvasWidth * _onGetRatio(46, _canvasWidth, null));
          //       sec1Path.setAttributeNS(null, 'y1', _chartH);
          //       sec1Path.setAttributeNS(null, 'y2', _chartH - _margin.rect * 1.5);
          //       sec1Path.setAttributeNS(null, "stroke", "#606060");
          //       sec1Path.setAttributeNS(null, 'stroke-width', _canvasWidth * _onGetRatio(0.4, _canvasWidth, null));
          //       sec1Path.setAttributeNS(null, 'stroke-opacity', '0');
          // call tooltip
          // _hovorTooltip(item, sneakersData)
          // gsap.to(item.firstChild, {duration: 0.8, delay: 0.1, scale: 1.2, y: _margin.rect * -1.1, ease: "elastic.out(1, 0.5)", stagger: 0.25}) 
        } else {
          console.log(isHover)
          gsap.to(item.firstChild.nextElementSibling, {id: "letRise", duration: 0.75, x: 0 , y:0, ease: "elastic.out(1, 0.5)"})
          //gsap.getById("letRise").reverse();
          // gsap.to(item.firstChild, {duration: 0.75, scale: 1, y: _margin.bottom * -0.04, ease: "elastic.out(1, 0.5)", stagger: 0.25})
          // item.firstChild.nextElementSibling.setAttribute("fill-opacity","0");
          // item.firstChild.nextElementSibling.setAttribute("stroke-opacity","0");
          // item.firstChild.setAttribute("stroke-opacity","0");
        }
      })
    } else {
      e.target.parentNode.firstChild.nextElementSibling.childNodes.forEach((item, index) => {
        gsap.getById("letRise").reverse();
        gsap.to(item.firstChild.nextElementSibling, {id: "letFall", duration: 0.75, x: 0 , y:0, ease: "elastic.out(1, 0.5)", stagger: 0.25})
        item.firstChild.setAttribute("fill-opacity","0");
        item.firstChild.setAttribute("stroke-opacity","0");
      })
    }
  }

  function _appendImg(d, i){
    const sec1Group = document.createElementNS(_svgNS, 'g');
          sec1Group.setAttributeNS(null, 'id', `_${i}_${d.title}_g`);
          sec1Group.setAttributeNS(null, 'transform', `translate(${_margin.right}, -${_margin.bottom})`);
    const sec1Circle = document.createElementNS(_svgNS, 'circle');
          sec1Circle.setAttributeNS(null, 'class', `circle`);
          sec1Circle.setAttributeNS(null, 'cx',  (_colorXScale * d.relative_primary / maxPrimaryD) + (_margin.right / 2));
          sec1Circle.setAttributeNS(null, 'cy', _chartH);
          sec1Circle.setAttributeNS(null, 'r', _canvasWidth * _onGetRatio(4, _canvasWidth, null));
          sec1Circle.setAttributeNS(null, 'fill', `rgb(${d.primary_color[0]}, ${d.primary_color[1]}, ${d.primary_color[2]})`);
          sec1Circle.setAttributeNS(null, 'fill-opacity', '0');
          sec1Circle.setAttributeNS(null, 'stroke', 'white');
          sec1Circle.setAttributeNS(null, 'stroke-width', _canvasWidth * _onGetRatio(0.8, _canvasWidth, null));
          sec1Circle.setAttributeNS(null, 'stroke-opacity', '0');
          sec1Group.appendChild(sec1Circle);
    const sec1Img = document.createElementNS(_svgNS, 'image');
          sec1Img.setAttributeNS(null, 'id', `_${i}_${d.title}_img`);
          sec1Img.setAttributeNS(null, 'href', `img/${d.title}.png`);
          sec1Img.setAttributeNS(null, 'x', _colorXScale * d.relative_primary / maxPrimaryD);
          sec1Img.setAttributeNS(null, 'y', _chartH - _margin.top);
          sec1Img.setAttributeNS(null, 'width', _canvasWidth * _onGetRatio(70, _canvasWidth, null));
          sec1Group.appendChild(sec1Img);
    return sec1Group;
  } 

  function _onColorDistanceMap(colorMapData){
    console.log('colorMapData', colorMapData)
    const colorMap = document.getElementById('colorMap');
    const sec1Svg = document.createElementNS(_svgNS, 'svg');
          sec1Svg.setAttributeNS(null, 'id', 'svg');
          sec1Svg.setAttributeNS(null, 'width', _chartW);
          sec1Svg.setAttributeNS(null, 'height', _chartH);
    const sec1G = document.createElementNS(_svgNS, 'g');
          sec1G.setAttributeNS(null, 'id', 'sneakers_imgs');
    const sec1Xaxis = document.createElementNS(_svgNS, 'line');
          sec1Xaxis.setAttributeNS(null, 'x1', _margin.right);
          sec1Xaxis.setAttributeNS(null, 'x2', _chartW - _margin.right + _margin.gap);
          sec1Xaxis.setAttributeNS(null, 'y1', _chartH - _margin.bottom);
          sec1Xaxis.setAttributeNS(null, 'y2', _chartH - _margin.bottom);
          sec1Xaxis.setAttributeNS(null, "stroke", "#606060");
          sec1Xaxis.setAttributeNS(null, 'stroke-width', _canvasWidth * _onGetRatio(0.4, _canvasWidth, null));
          sec1Svg.appendChild(sec1Xaxis);
    const sec1Rect = document.createElementNS(_svgNS, 'rect');
          sec1Rect.setAttributeNS(null, 'class', 'display-none');
          sec1Rect.setAttributeNS(null, 'x', _margin.right);
          sec1Rect.setAttributeNS(null, 'y', _chartH - _margin.rect);
          sec1Rect.setAttributeNS(null, 'width', _chartW - _margin.left + _margin.gap);
          sec1Rect.setAttributeNS(null, 'height', _margin.bottom);
          sec1Rect.setAttributeNS(null, 'fill', 'rgba(255, 255, 10, 0)');
    // add sneakers images
    for (var i = 0; i < colorMapData.length; i++) { 
      sec1G.appendChild(_appendImg(colorMapData[i], i));
    }
    sec1Svg.appendChild(sec1G);
    sec1Svg.appendChild(sec1Rect);
    colorMap.appendChild(sec1Svg);

    // call animation on each sneakers
    let isHover = false;
    sec1Rect.addEventListener("mouseover", (e)=> {
      if (isHover != true) {isHover = true;}
    })   
    sec1Rect.addEventListener("mousemove", (e)=> {
      if (isHover) {_updateMouseX(e, isHover, colorMapData);}
    })
    sec1Rect.addEventListener("mouseout", (e)=> {
      if (isHover) {isHover = false; console.log(isHover); _updateMouseX(e, isHover, colorMapData);}
    })  
  }
  //init call
  _onColorDistanceMap(colorMapData)
  })