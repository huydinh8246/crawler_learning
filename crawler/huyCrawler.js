const cheerio = require('cheerio');
const axios = require('axios').default
var fs = require('fs');

// let url = 'https://zingnews.vn/thoi-su/trang1.html'
let url = `https://zingnews.vn/thoi-su/trang1.html`
let website = 'https://zingnews.vn'
const outputFile = 'data.json'
let limit = 3

const getHTML = async (url) => {
  try {
    const {data} = await axios.get(url)
    return cheerio.load(data)
  } catch {
    console.error('ops, error !!')
  }
}

//get link
const main = async () => {
  for (let page = 0; page < limit; page++) {
    url = `https://zingnews.vn/thoi-su/trang${page}.html`
    let data = await pushData(url)
    console.log(data)
    let jsonString = JSON.stringify(data)
    fs.writeFile(outputFile,jsonString, 'utf-8', (err) => {
        if (err) throw err;
        console.log(`Saved page ${page} to file ${outputFile}`);
    });
  }
}

main()

async function pushData (url) {
  let generatedResponse = []
  const listTemp = await getData(url)
  for(let elem of listTemp) {
    try {
      let link = `${website}${elem.link}`
      // here candidate data is inserted into  
      let insertResponse = await getFeedData(link)  
      // and response need to be added into final response array 
      generatedResponse.push(insertResponse)
    } catch (error) {
      console.log('error'+ error);
    }
  }
  console.log('complete all') // gets loged first
  // console.log(generatedResponse)
  return generatedResponse // return without waiting for process of 
}

// pushData()

async function getData(url) {
    let $ = await getHTML(url);
    let blockResult = $('#news-latest .article-item');
    let metaData = blockResult
        .map((idx,el) => {
            let elementSelector = $(el);
            return linkSelector(elementSelector);
    }).get()
    return(metaData)
}

async function getFeedData(url) {
    let $ = await getHTML(url);
    let blockResult = $('.page-wrapper');
    return(feedSelector(blockResult))
}

const linkSelector = selector => {
    const title = selector
      .find(".article-title")
      .text()
      .trim();
    const link = selector
      .find(".article-title a")
      .attr('href');
    const releaseDate = selector
      .find(".article-publish span")
      .text()
      .trim();
    const content = selector
      .find(".article-summary")
      .text()
      .trim();
    return {
      title,
      releaseDate,
      link,
      content,
    };
  };

const feedSelector = selector => {
    const title = selector
      .find("h1.the-article-title")
      .text()
      .trim();
    const releaseDate = selector
      .find(".the-article-publish")
      .text()
      .trim();
    const content = selector
      .find(".the-article-body")
      .text()
      .trim();
    return {
      title,
      releaseDate,
      content,
    };
  };