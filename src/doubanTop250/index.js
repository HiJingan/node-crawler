const fs = require('fs')
const path = require('path')
const https = require('https')
const cheerio = require('cheerio')

const doubanTop250 = 'https://movie.douban.com/top250'

/**
 * 获取页面内容
 *
 * @param {Number} 起始序号，用户获取分页数据
 * @returns {Promise}
 */
function feachPageData(startNum = 0) {
  return new Promise((resolve, reject) => {
    const doubanTop250Host = `${doubanTop250}?start=${startNum}`

    https
      .get(doubanTop250Host, (res) => {
        let html = ''
        res.on('data', (trunk) => {
          html += trunk
        })
        res.on('end', () => {
          const films = analizeFilmData(html)
          resolve(films)
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

/**
 * 提取出页面的有效信息
 *
 * @param {String} html 整个页面的html
 * @returns {Array} 单页电影信息列表
 */
function analizeFilmData(html) {
  const films = []
  const $ = cheerio.load(html)

  $('li .item').each(function () {
    // 此处this如果是箭头函数，会指向异常
    const index = $('.pic em', this).text()
    const title = $('.title', this).first().text()
    const score = $('.rating_num', this).text()
    const quote = $('.quote .inq', this).text()

    films.push({ index, title, score, quote })
  })

  return films
}

/**
 * 写入结果到文件
 *
 * @param {Object} data 获取的所有电影数据对象
 */
function writeToFile(data) {
  const OUTPUT_FILE_PATH = path.join(__dirname, './result.json')

  fs.writeFile(OUTPUT_FILE_PATH, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('文件写入成功')
  })
}

/**
 * 函数主入口
 */
async function main() {
  let startNum = 0
  let allFilms = []

  // 循环10页，每页25条数据
  for (let pageNum = 1; pageNum <= 10; pageNum++) {
    startNum = (pageNum - 1) * 25
    const items = await feachPageData(startNum)
    allFilms = allFilms.concat(items)
  }

  writeToFile(allFilms)
}

main()
