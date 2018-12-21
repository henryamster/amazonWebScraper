const fs = require('fs');

const puppeteer = require('puppeteer');

(async() => {

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try {
        const argv = process.argv;
        for (arg in argv) { console.log(argv[arg]) }
        let s = (argv[2] != undefined) ? argv[2] : 'pants';


        await page.goto('https://www.amazon.com/s/&field-keywords=' + s)


        const products = await page.evaluate(() =>
            Array.from(document.querySelectorAll(".s-item-container"))
            .map(singleItem => ({
                productName: (singleItem.querySelectorAll('h2.s-access-title')[0] != undefined) ? singleItem.querySelectorAll('h2.s-access-title')[0].innerText : 'undefined',
                image: (singleItem.querySelectorAll('.s-access-image')[0] != undefined) ? singleItem.querySelectorAll('.s-access-image')[0].src : 'undefined',
                price: (singleItem.querySelectorAll('.a-offscreen')[0] != undefined) ? singleItem.querySelectorAll('.a-offscreen')[0].innerText : 'undefined',
                link: (singleItem.querySelectorAll('.a-link-normal')[0]) ? singleItem.querySelectorAll('.a-link-normal')[0].href : 'undefined'
            }))
        )

        const filtered = products.filter(function(product) {

            return product.productName != 'undefined';

        });
        let outputFile = (argv[3] != undefined) ? argv[3] : 'example-output';
        fs.writeFile(outputFile + '.json', JSON.stringify(filtered), function(err) {
            if (err) throw err;
            console.log('File saved as ' + outputFile + '.json ');
        })

        console.log(JSON.stringify(filtered));
    } catch (error) {
        console.log(error);
    }
    await browser.close()


})()