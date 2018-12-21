//Require FS for writing files
//Require puppeteer for web scraping
//Require image-downloader for image downloading
const fs = require('fs');
const puppeteer = require('puppeteer');
const download = require('image-downloader');

(async() => {

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    try {
        //check for query arguement, if no arguement default to pants
        const argv = process.argv;
        let s = (argv[2] != undefined) ? argv[2] : 'pants';
        //perform scrape
        await page.goto('https://www.amazon.com/s/&field-keywords=' + s)
            //return array of products with productName, image, price, and link
        const products = await page.evaluate(() =>
                Array.from(document.querySelectorAll(".s-item-container"))
                .map(singleItem => ({
                    productName: (singleItem.querySelectorAll('h2.s-access-title')[0] != undefined) ? singleItem.querySelectorAll('h2.s-access-title')[0].innerText : 'undefined',
                    image: (singleItem.querySelectorAll('.s-access-image')[0] != undefined) ? singleItem.querySelectorAll('.s-access-image')[0].src : 'undefined',
                    price: (singleItem.querySelectorAll('.a-offscreen')[0] != undefined) ? singleItem.querySelectorAll('.a-offscreen')[0].innerText : 'undefined',
                    link: (singleItem.querySelectorAll('.a-link-normal')[0]) ? singleItem.querySelectorAll('.a-link-normal')[0].href : 'undefined'
                }))
            )
            //filter any undefined products from array
        const filtered = products.filter(function(product) {
            return product.productName != 'undefined';
        });
        //if no output filename is specified, output to example-output.json
        let outputFile = (argv[3] != undefined) ? argv[3] : 'example-output';
        fs.writeFile(outputFile + '.json', JSON.stringify(filtered), function(err) {
            if (err) throw err;
            console.log('File saved as ' + outputFile + '.json ');
        });
        !fs.existsSync('downloads/' + s) && fs.mkdirSync('downloads/' + s);
        for (product in filtered) {
            const options = {
                url: filtered[product].image,
                dest: 'downloads/' + s
            }
            download.image(options)
                .then(({ filename, image }) => {
                    console.log('File saved to', filename)
                })
                .catch((err) => {
                    console.error(err)
                })
        }

    } catch (error) {
        console.log(error);
    }
    await browser.close()
})()