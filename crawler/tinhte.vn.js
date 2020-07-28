const cheerio = require('cheerio');
const axios = require('axios').default
var fs = require('fs');

let url = `https://tuoitre.vn/timeline/3/trang-1.htm`
const website = 'https://tuoitre.vn'
const outputFile = 'data.json'
let limit = 4

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
    url = `https://tuoitre.vn/timeline/3/trang-${page}.htm`
    let data = await pushData(url)
    console.log(data)
    let jsonString = JSON.stringify(data)
    fs.writeFile(outputFile,jsonString, 'utf-8', (err) => {
        if (err) throw err;
        console.log(`Saved page ${page+1} to file ${outputFile}`);
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
      let insertResponse = await getFeedData(link) 
      console.log(link) 
      generatedResponse.push(insertResponse)
    } catch (error) {
      console.log('error'+ error);
    }
  }
  console.log('complete all')
  // console.log(generatedResponse)
  return generatedResponse
}

// pushData()

async function getData(url) {
    // url = `https://tuoitre.vn/timeline/3/trang-1.htm`
    let $ = await getHTML(url);
    let blockResult = $('.news-item');
    let metaData = blockResult
        .map((idx,el) => {
            let elementSelector = $(el);
            return linkSelector(elementSelector);
    }).get()
    return(metaData)
}

async function getFeedData(url) {
    // url = 'https://tuoitre.vn/lai-dong-dat-manh-4-0-do-o-moc-chau-20200728092005559.htm'
    let $ = await getHTML(url);
    let blockResult = $('#content');
    return(feedSelector(blockResult))
}

// getFeedData()

const linkSelector = selector => {
    const title = selector
      .find("h3")
      .text()
      .trim();
    const link = selector
      .find("a")
      .attr('href');
    const releaseDate = selector
      .find(".date-time")
      .text()
      .trim();
    const content = selector
      .find(".sapo.need-trimline")
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
      .find(".article-title")
      .text()
      .trim();
    const releaseDate = selector
      .find(".date-time")
      .text()
      .trim();
    const content = selector
      .find("#main-detail-body p")
      .text()
      .trim();
    return {
      title,
      releaseDate,
      content,
    };
  };