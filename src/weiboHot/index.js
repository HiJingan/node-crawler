const https = require('https')
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

const weiboHotHost = 'https://s.weibo.com/top/summary?cate=realtimehot'
const OUTPUT_FILE_PATH = path.join(__dirname, './result.json')

function main() {
  const hotList = []

  https
    .get(weiboHotHost, (res) => {
      let html = ''

      res.on('data', (trunk) => {
        html += trunk
      })

      res.on('end', () => {
        const $ = cheerio.load(html)
        $('#pl_top_realtimehot tbody tr').each(function () {
          const index = $('.td-01', this).text()
          const title = $('.td-02 a', this).text()
          const degree = $('.td-02 span', this).text()
          hotList.push({ index, title, degree })
        })

        fs.writeFile(
          OUTPUT_FILE_PATH,
          JSON.stringify(hotList, null, 2),
          (err) => {
            if (err) {
              console.error(err)
              return
            }
            console.log('文件写入成功')
          }
        )
      })
    })
    .on('error', (err) => {
      console.error(err)
    })
}

main()
