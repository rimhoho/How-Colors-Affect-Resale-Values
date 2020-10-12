
// StockX Data = [{title: ..., productUrl: ...}, {}..., {columns: [title, productUrl, ...]}]
d3.csv('data/Yeezy_sales_performace.csv')
  .then(stockX => {
    stockX.forEach(function(d) {
        d.annual_high = +d.annual_high;
        d.annual_low = +d.annual_low;
        d.highest_bid = +d.highest_bid;
        d.lowest_ask = +d.lowest_ask;
        d.numberOf_bids = +d.numberOf_bids;
        d.number_of_asks = +d.number_of_asks;
        d.price_premium = +d.price_premium;
        d.retail_price = +d.retail_price;
        d.sales_last_72Hours = +d.sales_last_72Hours;
        d.volatility = +d.volatility;
      });
  })
  