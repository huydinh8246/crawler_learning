'use strict'

import WebCrawler from '../../core/services/client/crawler/cse-search-crawler'
import _ from 'underscore'
import Action from '../../core/services/client/crawler/crawler-action'
import moment from 'moment'
import cheerio from 'cheerio'
import request from 'request-promise'

export const OPTIONS = {
    id: "ngoisao_vn",
    platform: 'news',
    website: "https://ngoisao.vn",
    webSearch: "https://ngoisao.vn",
    indexSelector: '.new-ngang-item h3 a',
    idRegex: /\-(\d+)(?:\.htm$)/g,
    crawlComment: false,
    cx: '004331176561478783738:vnx8hgyvr04',
    descriptionToMessage: true,
    crawlerManagerName: 'big7',
    search: true
}

export default class Crawler extends WebCrawler {

    constructor(options) {
        super(_.extend({}, options, OPTIONS))
    }

    static get OPTIONS() {
        return OPTIONS;
    }

    checkValidLink(link) {
        this.options.idRegex.lastIndex = 0;
        return this.options.idRegex.test(link);
    }


    buildCategoryOptions(category, page) {
        return {
            uri: `${this.options.website}/${category.slug}/trang-${page}/`
        }
    }

    getMessage($) {
        return new Action({
            ctx:$,
            sel: '.right-ct p[style="text-align: justify;"]',
            first: false,
            get: 'element',
            post: (res) => _.map(res, (v) => cheerio(v).text().trim()).join('\n')
        })
    }

    getCreatedTime($) {
        return new Action({
            ctx: $,
            sel: 'meta[property="article:published_time"]',
            attr: 'content',
            post: (res) => moment(res, 'YYYY-MM-DD HH:mm:ss').toDate()
        })
    }


}