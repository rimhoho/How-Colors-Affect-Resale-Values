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
    if (d.number_of_sales > 50000) {
      d.sold_range = 'Sold over 50,000' 
    } else if (d.number_of_sales > 30000) {
      d.sold_range = 'Sold over 30,000'
    } else if (d.number_of_sales > 9755) {
      d.sold_range = 'Sold over Avg.Resale' 
    } else if (d.number_of_sales < 300) {
      d.sold_range = 'Sold under 300'
    } else {
      d.sold_range = 'Sold under Avg.Resale'
    }
  })

  let sumPrimaryDistance = 0;
  let objRelative_primary = {};
  colorDistance.filter(obj => {
    sumPrimaryDistance += obj.distance_primary;
    objRelative_primary[Math.round(sumPrimaryDistance)] = obj.target
    stockX.forEach((d, i) => {
      if (obj.target == d.title) {
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
  const _margin = {gap: _canvasWidth * _onGetRatio(4, _canvasWidth, null), top: _canvasHeight * _onGetRatio(44, null, _canvasHeight), 
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
  
function update(e) {
  let sneakersList = e.target.parentNode.firstChild.childNodes;
    let objRelative_primary = {}
    sneakersList.forEach((item, index) => {
      let sneakers =  item.firstChild;
      objRelative_primary[sneakers.x.animVal.value] = sneakers.id
    })
    
    let mouseX = e.pageX - _margin.right;
    let imgWidth = sneakersList[0].firstChild.width.animVal.value;
    let closest = Object.keys(objRelative_primary).reduce((a, b) => Math.abs(b - mouseX) < Math.abs(a - mouseX) ? b : a)
    let getId = Object.values(objRelative_primary)[Object.keys(objRelative_primary).indexOf(closest)];
    let getIdx = Object.values(objRelative_primary)[Object.keys(objRelative_primary).indexOf(closest)].split('_')[1];
    let currentTarget = Array.from(sneakersList)[getIdx];
    console.log(mouseX, parseInt(closest), getId, imgWidth, _margin.rect)

    let tl = gsap.timeline();
    tl.to(currentTarget, {duration: 1, scale: 2, y: _margin.rect * -2, ease: "elastic.out(1, 0.5)", stagger: 0.25})
   // tl.to(currentTarget, {duration: 1, scale: 1, y: -40, ease: "elastic.out(1, 0.5)", stagger: 0.25})
    const sec1Circle = document.createElementNS(_svgNS, 'circle');
          sec1Circle.setAttributeNS(null, 'class', `circle`);
          sec1Circle.setAttributeNS(null, 'cx', );
          sec1Circle.setAttributeNS(null, 'cy', _chartH);
          sec1Circle.setAttributeNS(null, 'r', _margin.gap);
          sec1Circle.setAttributeNS(null, 'fill', `rgb(${d.primary_color[0]}, ${d.primary_color[1]}, ${d.primary_color[2]}`);
          document.getElementById('svg').appendChild(sec1Circle);
}

function _appendImg(d, i){
  const sec1Group = document.createElementNS(_svgNS, 'g');
        sec1Group.setAttributeNS(null, 'id', `_${i}_${d.title}_g`);
        sec1Group.setAttributeNS(null, 'transform', `translate(${_margin.right}, -${_margin.bottom})`);
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
  const sec1Path = document.createElementNS(_svgNS, 'line');
        sec1Path.setAttributeNS(null, 'x1', _margin.right);
        sec1Path.setAttributeNS(null, 'x2', _chartW - _margin.right + _margin.gap);
        sec1Path.setAttributeNS(null, 'y1', _chartH - _margin.bottom);
        sec1Path.setAttributeNS(null, 'y2', _chartH - _margin.bottom);
        sec1Path.setAttributeNS(null, "stroke", "black");
        sec1Path.setAttributeNS(null, 'stroke-width', _canvasWidth * _onGetRatio(1, _canvasWidth, null));
  const sec1Rect = document.createElementNS(_svgNS, 'rect');
        sec1Rect.setAttributeNS(null, 'class', 'display-none');
        sec1Rect.setAttributeNS(null, 'x', _margin.right);
        sec1Rect.setAttributeNS(null, 'y', _chartH - _margin.rect);
        sec1Rect.setAttributeNS(null, 'width', _chartW - _margin.left + _margin.gap);
        sec1Rect.setAttributeNS(null, 'height', _margin.top);
        sec1Rect.setAttributeNS(null, 'fill', 'rgba(255, 255, 10, 0.6)');
  
  for (var i = 0; i < colorMapData.length; i++) { 
    sec1G.appendChild(_appendImg(colorMapData[i], i));
  }
  sec1Svg.appendChild(sec1G);
  sec1Svg.appendChild(sec1Rect);
  sec1Svg.appendChild(sec1Path);
  colorMap.appendChild(sec1Svg);

  sec1Rect.addEventListener("mousemove", (e)=> {
    update()
  })    
}
_onColorDistanceMap(colorMapData)
})