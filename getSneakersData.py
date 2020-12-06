from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from fake_useragent import UserAgent

import requests
import csv
import time 
import json
import browser_cookie3
import re

def onSelenium():
    driver = webdriver.Chrome(executable_path=r'C:\\Users\\Hyerim Hwang\\Desktop\\chromedriver.exe')  
    searchResult = "https://stockx.com/search/adidas/yeezy/release-date?size_types=men&s=yeezy&page="
    print('Driver Begins')
    totalList = {}
    for page in range(1, 5):
        driver.get(searchResult + str(page))
        time.sleep(30)
        getTitle = driver.find_elements(By.CSS_SELECTOR, '.css-1iephdx.e1inh05x0')
        getImage = driver.find_elements(By.CSS_SELECTOR, '.css-13o3lxt.e1jyvhgp0')
        getProductId = driver.find_elements(By.CSS_SELECTOR, '.tile.css-1bonzt1.e1yt6rrx0')
        getReleaseDate= driver.find_elements(By.CSS_SELECTOR, '.change.release_date.css-td8rut.ees1vvt0')
        exception = ['RNNR', 'High', 'Powerphase', '750', '950', 'N/A', '(Reflective)', '(Friends & Family)', 'Cleat Turtledove', 'Desert Boot', 'Static Reflective', 'Carbon Reflective', 'Pepper Reflective', 'Oat Reflective', 'Cinder Reflective', 'Mist Reflective']
        deleteIndex = []
        for i in range(len(getTitle)):
            if len([stopword for stopword in exception if(stopword in getTitle[i].text)]) != 0 or len([stopword for stopword in exception if(stopword in getReleaseDate[i].text)]) != 0:
                deleteIndex.append(i)
        for index in sorted(deleteIndex, reverse=True):
            del getTitle[index]
            del getImage[index]
            del getProductId[index]
            del getReleaseDate[index]

        if len(getTitle) == len(getImage) == len(getProductId) == len(getReleaseDate):
            eachPage = []
            for i in range(len(getTitle)):
                sneakersName = re.sub(r"(adidas Yeezy |Boost )*\(*(Non-Reflective)*\)*(\s$)*","", getTitle[i].text)
                print('-----', sneakersName)
                eachRow = {}
                productPageUrl = getProductId[i].find_element(By.TAG_NAME, 'a').get_attribute('href')
                eachRow['title'] = sneakersName
                eachRow['product_url'] = productPageUrl
                eachRow['release_date'] = getReleaseDate[i].text
                eachRow['product_id'] = productPageUrl.replace('https://stockx.com/', '')
                eachPage.append(eachRow)
        totalList[f'page_{page}'] = eachPage
    driver.refresh()
    driver.quit()
    print('Page Check: ', totalList.keys())
    return totalList

def onRequest(productIdList):
    print('Start viewing API')
    totalProduct = []
    # ua = UserAgent()
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36', # Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36 
               'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
               'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
               'Accept-Encoding': 'none',
               'Accept-Language': 'en-US,en;q=0.8',
               'Connection': 'keep-alive'}
    cookies = browser_cookie3.chrome(domain_name='.stockx.com')
    for productId in productIdList:
        productObj = requests.get(f'https://stockx.com/api/products/{productId}?includes=market,360&currency=USD&country=US', headers=headers, cookies=cookies)     
        print(productObj.status_code)
  
        if productObj.status_code == 200:
            productDetail = productObj.json()
            title = re.sub(r"(adidas Yeezy |Boost )*\(*(Non-Reflective)*\)*(\s$)*","", productDetail["Product"]["title"])
            thumb_url = productDetail["Product"]["media"]["thumbUrl"]
            retail_price = productDetail["Product"]["retailPrice"]
            average_sale_price = productDetail["Product"]["market"]["averageDeadstockPrice"]
            price_premium = productDetail["Product"]["market"]["pricePremium"]
            price_premium_rank = productDetail["Product"]["market"]["pricePremiumRank"]
            number_of_sales = productDetail["Product"]["market"]["deadstockSold"]
            total_dollars = productDetail["Product"]["market"]["totalDollars"]
            annual_high = productDetail["Product"]["market"]["annualHigh"]
            annual_low = productDetail["Product"]["market"]["annualLow"]
            trade_range_low = productDetail["Product"]["market"]["deadstockRangeLow"]
            trade_range_high = productDetail["Product"]["market"]["deadstockRangeHigh"]
            number_of_Asks = productDetail["Product"]["market"]["numberOfAsks"]
            number_of_Bids = productDetail["Product"]["market"]["numberOfBids"]         
            volatility = productDetail["Product"]["market"]["volatility"]
            description = productDetail["Product"]["description"]

            rowDict =  {'title': title,
                        'thumb_url': thumb_url,
                        'retail_price': retail_price,
                        'average_sale_price': average_sale_price,
                        'price_premium': price_premium,
                        'price_premium_rank': price_premium_rank,
                        'number_of_sales': number_of_sales,
                        'total_dollars': total_dollars,
                        'annual_high': annual_high,
                        'annual_low': annual_low,
                        'trade_range_low': trade_range_low,
                        'trade_range_high': trade_range_high,
                        'number_of_Asks': number_of_Asks,
                        'number_of_Bids': number_of_Bids,
                        'volatility' : volatility,
                        'description': re.sub(r'[^A-Za-z0-9 ]+', '', description)}
            totalProduct.append(rowDict)
            time.sleep(10)
    print('Data Safely Exported!')
    return totalProduct

def onStore(totalStockX):
    fields = ['title', 'product_url', 'release_date', 'product_id', 'thumb_url', 'retail_price', 'average_sale_price', 
              'price_premium', 'price_premium_rank', 'number_of_sales', 'total_dollars', 'annual_high', 'annual_low', 
              'trade_range_low', 'trade_range_high', 'number_of_Asks', 'number_of_Bids', 'volatility','description']
    with open('public\\data\\Yeezy_sales_performace.csv', 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fields)
        writer.writeheader()
        for row in totalStockX:
            writer.writerow(row)
    print('Data safely stored!')
    return

def onInit():
    totalList = onSelenium()
    productIdList = []
    seleniumData = [] 

    for page in range(1, 5):
        for item in totalList[f'page_{page}']:
            productIdList.append(item['product_id'])
            seleniumData.append(item)
    requestData = onRequest(productIdList)
    print('# of shose: ', len(requestData), len(seleniumData))

    if len(requestData) == len(seleniumData):  
        totalStockX = []
        for i in range(len(requestData)):
            if seleniumData[i]['title'] != requestData[i]['title']:
                print(i, seleniumData[i]['title'] + '  +  ' + requestData[i]['title'])
            if seleniumData[i]['title'] == requestData[i]['title']:
                seleniumData[i]['title'] = seleniumData[i]['title']
                seleniumData[i]['thumb_url'] = requestData[i]['thumb_url']
                seleniumData[i]['retail_price'] = requestData[i]['retail_price']
                seleniumData[i]['average_sale_price'] = requestData[i]['average_sale_price']
                seleniumData[i]['price_premium'] = requestData[i]['price_premium']
                seleniumData[i]['price_premium_rank'] = requestData[i]['price_premium_rank']
                seleniumData[i]['number_of_sales'] = requestData[i]['number_of_sales']
                seleniumData[i]['total_dollars'] = requestData[i]['total_dollars']
                seleniumData[i]['annual_high'] = requestData[i]['annual_high']
                seleniumData[i]['annual_low'] = requestData[i]['annual_low']
                seleniumData[i]['trade_range_low'] = requestData[i]['trade_range_low']
                seleniumData[i]['trade_range_high'] = requestData[i]['trade_range_high']
                seleniumData[i]['number_of_Asks'] = requestData[i]['number_of_Asks']
                seleniumData[i]['number_of_Bids'] = requestData[i]['number_of_Bids']
                seleniumData[i]['volatility'] = requestData[i]['volatility']
                seleniumData[i]['description'] = requestData[i]['description']
                totalStockX.append(seleniumData[i])
        onStore(totalStockX)
onInit()


























