'use strict'

import WebCrawler from '../../core/services/client/crawler/crawler'
import _ from 'underscore'
import Action from '../../core/services/client/crawler/crawler-action'
import moment from 'moment'
import cheerio from 'cheerio'
import request from 'request-promise'

export const OPTIONS = {
    id: "nguoiduatin_vn",
    platform: 'news',
    website: "http://www.nguoiduatin.vn",
    webSearch: "http://www.nguoiduatin.vn/search",
    searchSelector: '.gs-title',
    indexSelector: '.more-articles h3 a',
    idRegex: /\-([a-z\d]*)(?:\.html)/g,
    crawlComment: false,
    search: false,
    descriptionToMessage: true,
    crawlerManagerName: 'big7'
};

export default class Crawler extends WebCrawler {

    constructor(options) {
        super(_.extend({}, options, OPTIONS))
    }

    buildSearchOptions(keyword, page) {
        let uri = `${this.options.webSearch}`
        return {
            uri,
            qs: {
                q: keyword,
                p: page
            }
        }
    }

    getCategoryLinks($, category) {
        switch (category.group) {
            case 'xe':
                return this.getLinks($, '.box-related .box-news h3 a');
            default:
                return this.getLinks($, '.col h3 a');
        }
    }

    buildCategoryOptions(category, page) {
        switch (category.group) {
            case 'xe':
                return {
                    uri: `https://xe.nguoiduatin.vn/page/${page}`
                }
            default:
                return {
                    uri: `${this.options.website}/${category.slug}/page/${page}`
                }
        }
    }

    hasNextPage(links, pageNumber, $) {
        let curPage = $('.pagination li.active a').attr('href')
        let lastPage = $('.pagination li a').eq(-1).attr('href')
        return curPage != lastPage;
    }

    hasNextPageCategory(links, pageNumber, $) {
        return this.hasNextPage(links, pageNumber, $);
    }

    getMessage($) {
        return new Action({
            ctx:$,
            sel: '.article-content p',
            first: false,
            get: 'element',
            post: (res) => _.map(res, (v) => cheerio(v).text().trim()).join('\n')
        })
    }

    getCreatedTime($) {
        return new Action({
            ctx: $,
            sel: 'meta[name="pubdate"]',
            attr: 'content',
            post: (res) => moment(res, 'YYYY-MM-DD HH:mm:ss').toDate()
        })
    }

}