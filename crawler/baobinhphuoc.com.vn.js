'use strict'

import WebCrawler from '../../core/services/client/crawler/crawler'
import _ from 'underscore'
import Action from '../../core/services/client/crawler/crawler-action'
import moment from 'moment'
import cheerio from 'cheerio'
import request from 'request-promise'

export const OPTIONS = {
    id: "baobinhphuoc_com_vn",
    platform: 'news',
    website: "http://www.baobinhphuoc.com.vn",
    webSearch: "http://www.baobinhphuoc.com.vn/Search",
    searchSelector: '.row .col-md-12 a',
    indexSelector: ".row .col-md-12.sp-cate-sub-item a:first-child",
    crawlComment: false,
    crawlerManagerName: 'small1'
};

export default class Crawler extends WebCrawler {

    constructor(options) {
        super(_.extend({}, options, OPTIONS))
    }

    static get OPTIONS(){
        return OPTIONS;
    }


    buildSearchOptions(keyword, page) {
        let uri = `${this.options.webSearch}`
        return {
            uri,
            qs: {
                keyword,
                page:page
            }
        }
    }

    buildCategoryOptions(category, page) {
        return {
            uri: `${this.options.website}/List/${category.slug}`,
            qs: {
                page: page
            }
        }
    }

getMessage($) {
return new Action({
    ctx:$,
    sel: '.news_body',
    get: 'element',
    post: (res) => res.text().trim()
    })
}

getCreatedTime($) {
    return new Action({
        ctx:$,
        sel: '.toppn .time',
        get: 'text',
        post: (res) => {
            console.log(res)
            return moment(res, 'HH:mm A [-] DD/MM/YYYY').toDate()
        }
    })
}

}
