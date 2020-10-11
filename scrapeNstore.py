from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from fake_useragent import UserAgent

import requests
import csv
import time 
import json
import browser_cookie3

def onSelenium():
    options = Options()
    driver = webdriver.Chrome(executable_path=r'C:\\Users\\Songyup\\Hwang\\Out from Class\\chromedriver.exe')  
    searchResult = "https://stockx.com/search/adidas/yeezy/release-date?s=yeezy&page="

    totalList = {}
    for page in range(1, 6):
        driver.get(searchResult + str(page))
        time.sleep(20)
        getTitle = driver.find_elements(By.CSS_SELECTOR, '.css-1iephdx.e1inh05x0')
        getImage = driver.find_elements(By.CSS_SELECTOR, '.css-13o3lxt.e1jyvhgp0')
        getProductId = driver.find_elements(By.CSS_SELECTOR, '.tile.css-1bonzt1.e1yt6rrx0')
        getReleaseDate= driver.find_elements(By.CSS_SELECTOR, '.change.release_date.css-td8rut.ees1vvt0')
        exception = ['RNNR', '(Kids)', '(Kid)','(Infants)', '(Infant)','High', 'Powerphase', '750', '950', 'N/A']
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
                eachRow = {}
                productPageUrl = getProductId[i].find_element(By.TAG_NAME, 'a').get_attribute('href')
                eachRow['Title'] = getTitle[i].text
                eachRow['ProductUrl'] = productPageUrl
                eachRow['ReleaseDate'] = getReleaseDate[i].text
                eachRow['productId'] = productPageUrl.replace('https://stockx.com/', '')
                eachPage.append(eachRow)
        totalList[f'page_{page}'] = eachPage
    driver.refresh()
    driver.quit()
    print('driver quit!')
    return totalList

def onRequest(productIdList):
    print('Start viewing API')
    totalProduct = []
    ua = UserAgent()
    headers = {'User-Agent': ua.chrome, #'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36', # Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36 
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
                'Accept-Encoding': 'none',
                'Accept-Language': 'en-US,en;q=0.8',
                'Connection': 'keep-alive'}
    print(ua.chrome)
    cookies = browser_cookie3.chrome(domain_name='.stockx.com')
    for productId in productIdList:
        print('getAPI: ', productId)
        
        productObj = requests.get(f'https://stockx.com/api/products/{productId}?includes=market,360&currency=USD&country=US', headers=headers, cookies=cookies)     
        print(productObj.status_code)
  
        if productObj.status_code == 200:
            productDetail = productObj.json()
            title = productDetail["Product"]["title"]
            thumbUrl = productDetail["Product"]["media"]["thumbUrl"]
            retailPrice = productDetail["Product"]["retailPrice"]
            lowestAsk = productDetail["Product"]["market"]["lowestAsk"]
            highestBid = productDetail["Product"]["market"]["highestBid"]
            annualLow = productDetail["Product"]["market"]["annualLow"]
            annualHigh = productDetail["Product"]["market"]["annualHigh"]
            salesLast72Hours = productDetail["Product"]["market"]["salesLast72Hours"]
            numberOfAsks = productDetail["Product"]["market"]["numberOfAsks"]
            numberOfBids = productDetail["Product"]["market"]["numberOfBids"]
            pricePremium = productDetail["Product"]["market"]["pricePremium"]
            volatility = productDetail["Product"]["market"]["volatility"]
            description = productDetail["Product"]["description"]

            rowDict =  {'Title': title,
                        'thumbUrl': thumbUrl,
                        'Retail Price': retailPrice,
                        'Lowest Ask': lowestAsk,
                        'Highest Bid': highestBid,
                        'Annual Low': annualLow,
                        'Annual High': annualHigh,
                        'Number Of Asks': salesLast72Hours,
                        'Number Of Bids': numberOfAsks,
                        'salesLast72Hours': numberOfBids,
                        'pricePremium': pricePremium,
                        'volatility': volatility,
                        'description': description}
            totalProduct.append(rowDict)
            time.sleep(10)
    print('Data safely exported!')
    return totalProduct

def onStore(totalStockX):
    print('Start to store!')
    fields = ['Title', 'ProductUrl', 'ReleaseDate', 'productId', 'thumbUrl', 'Retail Price', 'Lowest Ask', 'Highest Bid', 'Annual Low', 'Annual High', 'Number Of Asks', 'Number Of Bids', 'salesLast72Hours', 'pricePremium', 'volatility', 'description']
    with open(f'Yeezy_sales_performace.csv', 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fields)
        writer.writeheader()
        for row in totalStockX:
            writer.writerow(row)
    print('Data safely stored!')
    return

totalList = onSelenium()

productIdList = []
seleniumData = []
for page in range(1, 6):
    for item in totalList[f'page_{page}']:
        productIdList.append(item['productId'])
        seleniumData.append(item)
print('Length of idList', len(productIdList))
requestData = onRequest(productIdList)
print('Length of requestData', len(requestData))

totalStockX = []
for i in range(len(requestData)):
    if seleniumData[i]['Title'] == requestData[i]['Title']:
        seleniumData[i]['thumbUrl'] = requestData[i]['thumbUrl']
        seleniumData[i]['Retail Price'] = requestData[i]['Retail Price']
        seleniumData[i]['Lowest Ask'] = requestData[i]['Lowest Ask']
        seleniumData[i]['Highest Bid'] = requestData[i]['Highest Bid']
        seleniumData[i]['Annual Low'] = requestData[i]['Annual Low']
        seleniumData[i]['Annual High'] = requestData[i]['Annual High']
        seleniumData[i]['Number Of Asks'] = requestData[i]['Number Of Asks']
        seleniumData[i]['Number Of Bids'] = requestData[i]['Number Of Bids']
        seleniumData[i]['salesLast72Hours'] = requestData[i]['salesLast72Hours']
        seleniumData[i]['pricePremium'] = requestData[i]['pricePremium']
        seleniumData[i]['volatility'] = requestData[i]['volatility']
        seleniumData[i]['description'] = requestData[i]['description']
        totalStockX.append(seleniumData[i])
onStore(totalStockX)


# totalList = {'page_5': [{'Title': 'adidas Yeezy Boost 700 Wave Runner Solid Grey', 'ProductUrl': 'https://stockx.com/adidas-yeezy-wave-runner-700-solid-grey', 'ReleaseDate': 'Release: 11/01/2017', 'productId': 'adidas-yeezy-wave-runner-700-solid-grey'}, {'Title': 'adidas Yeezy Boost 350 V2 Cream/Triple White', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-v2-cream-white', 'ReleaseDate': 'Release: 04/29/2017', 'productId': 'adidas-yeezy-boost-350-v2-cream-white'}, {'Title': 'adidas Yeezy Boost 350 V2 Zebra', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-v2-white-core-black-red', 'ReleaseDate': 'Release: 02/25/2017', 'productId': 'adidas-yeezy-boost-350-v2-white-core-black-red'}, {'Title': 'adidas Yeezy Boost 350 V2 Black Red', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-v2-core-black-red-2017', 'ReleaseDate': 'Release: 02/11/2017', 'productId': 'adidas-yeezy-boost-350-v2-core-black-red-2017'}, {'Title': 'adidas Yeezy Boost 350 V2 Core Black White', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-v2-core-black-white', 'ReleaseDate': 'Release: 12/17/2016', 'productId': 'adidas-yeezy-boost-350-v2-core-black-white'}, {'Title': 'adidas Yeezy Boost 350 V2 Core Black Red', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-v2-core-black-red', 'ReleaseDate': 'Release: 11/23/2016', 'productId': 'adidas-yeezy-boost-350-v2-core-black-red'}, {'Title': 'adidas Yeezy Boost 350 V2 Core Black Copper', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-v2-core-black-copper', 'ReleaseDate': 'Release: 11/23/2016', 'productId': 'adidas-yeezy-boost-350-v2-core-black-copper'}, {'Title': 'adidas Yeezy Boost 350 V2 Core Black Green', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-v2-core-black-green', 'ReleaseDate': 'Release: 11/23/2016', 'productId': 'adidas-yeezy-boost-350-v2-core-black-green'}, {'Title': 'adidas Yeezy Boost 350 V2 Beluga', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-v2-steeple-grey-beluga-solar-red', 'ReleaseDate': 'Release: 09/24/2016', 'productId': 'adidas-yeezy-boost-350-v2-steeple-grey-beluga-solar-red'}, {'Title': 'adidas Yeezy 350 Cleat Turtledove', 'ProductUrl': 'https://stockx.com/adidas-yeezy-350-cleat-turtledove', 'ReleaseDate': 'Release: 09/15/2016', 'productId': 'adidas-yeezy-350-cleat-turtledove'}, {'Title': 'adidas Yeezy Boost 350 Pirate Black (2016)', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-pirate-black-2016', 'ReleaseDate': 'Release: 02/19/2016', 'productId': 'adidas-yeezy-boost-350-pirate-black-2016'}, {'Title': 'adidas Yeezy Boost 350 Oxford Tan', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-oxford-tan',
# 'ReleaseDate': 'Release: 12/29/2015', 'productId': 'adidas-yeezy-boost-350-oxford-tan'}, {'Title': 'adidas Yeezy Boost 350 Moonrock', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-moonrock', 'ReleaseDate': 'Release: 11/14/2015', 'productId': 'adidas-yeezy-boost-350-moonrock'}, {'Title': 'adidas Yeezy Boost 350 Pirate Black (2015)', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-pirate-black-2015', 'ReleaseDate': 'Release: 08/22/2015', 'productId': 'adidas-yeezy-boost-350-pirate-black-2015'}, {'Title': 'adidas Yeezy Boost 350 Turtledove', 'ProductUrl': 'https://stockx.com/adidas-yeezy-boost-350-turtledove', 'ReleaseDate': 'Release: 06/27/2015', 'productId': 'adidas-yeezy-boost-350-turtledove'}]}

    # requestData = [{'Title': 'adidas Yeezy Boost 700 Wave Runner Solid Grey', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Wave-Runner-700-Solid-Grey-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1538080256', 'Retail Price': 300, 'Lowest Ask': 524, 'Highest Bid': 676, 'Annual Low': 340, 'Annual High': 900, 'Number Of Asks': 57, 'Number Of Bids': 733, 'salesLast72Hours': 556, 'pricePremium': 0.75, 'volatility': 0.081677, 'description': 'A new set of waves are rolling in as the adidas Yeezy Wave Runner 700s get ready for their first restock on March 10th, 2018. First releasing in November of 2017, the Yeezy Boost 700’s represented what was a significant shift in Kanye’s design aesthetic, moving from the minimalistic silhouettes of early Yeezy seasons to this chunky runnermodel. It once again showed how Kanye stays ahead of the curve, as chunkier sneakers became more en vogue in 2018. The shoe features an upper with grey and black suede overlays, premium leather with blue mesh underlays, neon green laces, and its signature chunky midsole with encapsulated Boost technology. Translation: these may look bold but are still comfy as hell. The Yeezy Wave Runners will stay at the same retail cost of $300 for the upcoming restock, but have averaged a sale price well above retail on StockX since their initial drop. So if you’re looking to add these to your Yeezy collection, remember that fortune favors the bold bidders.'}, 
    # {'Title': 'adidas Yeezy Boost 350 V2 Cream/Triple White', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-V2-Cream-White-1-1.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1539789713', 'Retail Price': 220, 'Lowest Ask': 320, 'Highest Bid': 615, 'Annual Low': 210, 'Annual High': 903, 'Number Of Asks': 87, 'Number Of Bids': 657, 'salesLast72Hours': 448, 'pricePremium': 0.636, 'volatility': 0.246363, 'description': 'Does cash rule everything around you? Ifso, then it would be wise to cop the adidas Yeezy Boost 350 Cream White. Returning for round two with a huge restock, the luminous colored Yeezy Boost 350 has a creamwhite upper, core white midsole, and a camouflaged “SPLY-350” branding across the stripe on the sides. These originally released in late April of 2017 with a retailprice of $220 and restocked in September of 2018. Place a Bid or Ask for these Adidas Yeezy Boost 350 Cream White on StockX today.'}, 
    # {'Title': 'adidas Yeezy Boost 350 V2 Zebra', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-V2-Zebra-Product-1.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1578503931', 'Retail Price': 220, 'Lowest Ask': 365, 'Highest Bid': 500, 'Annual Low': 225, 'Annual High': 750, 'Number Of Asks': 159, 'Number Of Bids':1703, 'salesLast72Hours': 596, 'pricePremium': 1.368, 'volatility': 0.093002, 'description': '<b>PLEASE NOTE: The color of sole may vary depending on restock release.<b><br><br> Adidas is back with their latest Yeezy Boost 350 V2. Fresh off the heels of NBA All-Star Weekend, these Yeezy\'s are nicknamed the "Zebras," and come in a classic white, black and red color scheme. Sporting a white-based Primeknit upper with black accents giving off a Zebra stripe vibe, “SPLY-350” displayed across the sides in red finished off by a translucent BOOST cushioned sole. To date they are the most limited adidas Yeezy release and have instantly become one of the most popular colorways. Their release date is set for February 25th, 2017. Retail is set at $220 and they will only be available in men’s sizing, no love for infants from Yeezus this time around. On June 24th, adidas will re-release the coveted “Zebras,” giving fans worldwide one more shot at obtaining one of 2017s most popular kicks. If you got lucky with the first release, already have a pair on lock from the re-release or don’t want to risk taking the “L,” check out the marketplace where you can buy and sell the “Zebra” adidas Yeezy 350 Boost V2 online now. Rock, stock or flip, the choice is yours and yours alone.'}, 
    # {'Title': 'adidas Yeezy Boost 350 V2 BlackRed', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-V2-Core-Black-Red-2017-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1538080256', 'Retail Price': 220, 'Lowest Ask': 799, 'Highest Bid': 875, 'Annual Low': 630, 'Annual High': 1900, 'Number Of Asks': 12, 'Number Of Bids': 143, 'salesLast72Hours': 194, 'pricePremium': 2.668, 'volatility': 0.124, 'description': 'Known for their iconic collabs, once again Kanye West and adidas had brewed up more sneaker collection heat with the adidas Yeezy Boost 350 Black Red. Showing "Pirate Black" flashes, these come with a core black upper and sole that has acore red "SPLY-350" branding on both sides. These released in November 2016 and retailed at $220. Place an Ask or Bid for these today on StockX.'}, 
    # {'Title': 'adidas Yeezy Boost 350 V2 Core Black White', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-V2-Core-Black-White-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1598377218', 'Retail Price': 220, 'Lowest Ask': 796, 'Highest Bid': 900, 'Annual Low': 586, 'Annual High': 1340, 'Number Of Asks': 8, 'Number Of Bids': 115, 'salesLast72Hours': 186, 'pricePremium': 2.636, 'volatility': 0.213842, 'description': 'Looking for a way to make your sneaker collection more hardcore? Well try copping the adidas Yeezy Boost 350 V2 Core White. Continuing to turn the shoe industry upside down with the Yeezy Boost 350 V2 silhouette, this colorway comes with a core black upper and sole. There’s also the core black "SPLY-350" branding across a core white stripe on both sides to finish off this iconic design. These dropped in December 2016 and retailed at $220. Place an Ask or Bid on StockX now. '}, 
    # {'Title': 'adidas Yeezy Boost 350 V2 Core Black Red', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-V2-Core-Black-Red-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1538080256', 'Retail Price': 220, 'Lowest Ask': 1000, 'Highest Bid': 1151, 'Annual Low': 517, 'Annual High': 2250, 'Number Of Asks': 8, 'Number Of Bids': 75, 'salesLast72Hours': 221, 'pricePremium': 2.573, 'volatility': 0.212119, 'description': 'If anyone is discussing what\'s hotter than the earth\'s core, then the adidas Yeezy Boost 350 V2 Core Red must be a part of the discussion. Bringing hot lava vibes, these come with a core black upper and sole. There\'s also a core black "SPLY-350" branding across a scorching hot core red stripe on both sides. These dropped in November 2016 and retailed at $220. Add more sauce to your sneaker collection and buy now on StockX.'}, 
    # {'Title': 'adidas Yeezy Boost 350 V2 Core Black Copper', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-V2-Core-Black-Copper-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1559088735', 'Retail Price': 220, 'Lowest Ask': 700, 'Highest Bid': 750, 'Annual Low': 462, 'Annual High': 1667, 'Number Of Asks': 3, 'Number Of Bids': 71, 'salesLast72Hours': 163, 'pricePremium': 2.614, 'volatility': 0.057422, 'description': 'Hope you\'re ready to smash open that piggy bank and spend some pennies on the adidas Yeezy Boost 350 V2 Copper. Displaying a rich look, these have a core black upper and sole. There\'s also core black "SPLY-350" branding across the core copper stripe on both sides. These dropped in November 2016 and retailed at $220, Add more sauce to your sneaker collection on StockX.'}, 
    # {'Title': 'adidas Yeezy Boost 350 V2 Core Black Green', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-V2-Core-Black-Green-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1559088766', 'Retail Price': 220, 'Lowest Ask': 658, 'Highest Bid': 869, 'Annual Low': 500, 'Annual High': 1468, 'Number Of Asks': 2, 'Number Of Bids': 76, 'salesLast72Hours': 180, 'pricePremium': 2.46, 'volatility': 0.103223, 'description': 'While soldiers rave about the seven core Army values, the sneaker community can go off about the adidas Yeezy Boost V2 350 Core Green. Setting a battlefield tone, this silhouette comes with a core black upper and sole. They also feature core black "SPLY-350" branding across a core green stripe on both sides. These dropped in November 2016 and retailed at $220. Dont be afraid to break rank and place a Bid on StockX.'}, 
    # {'Title': 'adidas Yeezy Boost 350 V2 Beluga', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-Low-V2-Beluga-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1598646006', 'Retail Price': 220, 'Lowest Ask': 800, 'Highest Bid': 901, 'Annual Low': 490, 'Annual High': 1605, 'Number Of Asks': 6, 'Number Of Bids': 159, 'salesLast72Hours': 227, 'pricePremium': 3.168, 'volatility': 0.128757, 'description': 'The <a href="https://stockx.com/sneaker-blog/adidas-yeezy-boost-350-v2-steel-grey-beluga-solar-red/">adidas Yeezy 350 Boost V2</a> takes the silhouette that Kanye West made famous for adidas Originals and gives it new life. The Yeezy Boost releases have been some of the most notable driving forces in the resurgence of adidas\' popularity around the world. The low top Yeezy Boost 350 features a full length Boost cushioning system and ahigh end feel that has made it the go-to sneaker for everyone from celebrities like Kim Kardashian-West, Jay-Z, 2 Chainz and Future, as well as for athletes like Nick"Swaggy P" Young, Andrew Wiggins, Lewis Hamilton and anyone else who can get their feet in a pair. The Yeezy Boost 350 V2 adds a bold twist to Kanye\'s design with a bright orange (officially Solar Red) stripe across the Steel Grey/Beluga zebra-striped upper with the text YZY SPLY. The Steeple Gray/Beluga/Solar Red adidas Yeezy Boost 350 V2 is the first of the 2nd version colorways that release in 2016.'}, 
    # {'Title': 'adidas Yeezy 350 Cleat Turtledove', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-350-Cleat-Turtledove-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1598377218', 'Retail Price': 250, 'Lowest Ask': 300, 'Highest Bid': 300, 'Annual Low': 55, 'Annual High': 487, 'Number Of Asks': 1, 'Number Of Bids': 13, 'salesLast72Hours': 20, 'pricePremium': 0.183, 'volatility': 0.295656, 'description': ''}, 
    # {'Title': 'adidas Yeezy Boost 350 Pirate Black (2016)', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-Low-Pirate-Black-2016-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1538080256', 'Retail Price': 200, 'Lowest Ask': 799, 'Highest Bid': 1050, 'Annual Low': 620, 'Annual High': 1475, 'Number Of Asks': 2, 'Number Of Bids': 86, 'salesLast72Hours': 105, 'pricePremium': 4.585, 'volatility': 0.108703,'description': ''}, 
    # {'Title': 'adidas Yeezy Boost 350 Oxford Tan', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-Low-Oxford-Tan-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1538080256', 'Retail Price': 200, 'Lowest Ask': 750, 'Highest Bid': 966, 'Annual Low': 500, 'Annual High': 1599, 'Number Of Asks': 1, 'Number Of Bids': 72, 'salesLast72Hours': 114, 'pricePremium': 3, 'volatility': 0.206986, 'description': ''}, 
    # {'Title': 'adidas Yeezy Boost 350 Moonrock', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-Low-Moonrock-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1559088668', 'Retail Price': 200, 'Lowest Ask': 855, 'Highest Bid': 911, 'Annual Low': 591, 'Annual High': 1450, 'Number Of Asks': 2, 'Number Of Bids': 68, 'salesLast72Hours': 111, 'pricePremium': 2.755, 'volatility': 0.231456, 'description': ''}, 
    # {'Title': 'adidas Yeezy Boost 350 Pirate Black (2015)', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-Low-Pirate-Black-2015.png?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1538080256', 'Retail Price': 200, 'Lowest Ask': 785, 'Highest Bid': 900, 'Annual Low': 560, 'Annual High': 1380, 'Number Of Asks': 0, 'Number Of Bids': 71, 'salesLast72Hours': 115, 'pricePremium': 2.55, 'volatility': 0.282114, 'description': ''}, 
    # {'Title': 'adidas Yeezy Boost 350 Turtledove', 'thumbUrl': 'https://stockx.imgix.net/Adidas-Yeezy-Boost-350-Low-Turtledove-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1538080256', 'Retail Price': 200, 'Lowest Ask': 1698, 'Highest Bid': 1608, 'Annual Low': 900, 'Annual High': 2000, 'Number Of Asks': 0, 'Number Of Bids': 60, 'salesLast72Hours': 76, 'pricePremium': 6, 'volatility': 0.124871, 'description': ''}]
 