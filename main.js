const Koa = require('koa')
const Router = require('koa-router')
const multer = require('@koa/multer')
const cors = require('koa2-cors')
const { resolve } = require('path')
const fs = require('fs')
const glob = require('glob')

const app = new Koa()
const router = new Router()

// 定义变量
const rootImage = resolve(__dirname, 'uploads')
const config = {
  url: 'http://127.0.0.1:8888'
}

// 设置跨域
app.use(cors({
  origin: "*",  // 允许 所有的都可以跨域
  maxAge: 50000, // 预检的有效时间
  credentials: true, // 是否允许发送cookie
  allowMethods: ['GET', 'POST', 'DELETE'], // 设置服务器允许的方法
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'], // 设置服务器支持的字段
  exposeHeaders: [] // 设置获取自定义的字段
}))

// 获取图片接口
router.get('/api/img/:id', (ctx, next) => {
  const id = ctx.request.params.id
  const file = fs.readFileSync(rootImage + '/' + id)
  ctx.set("content-type", "image/jpeg")
  ctx.body = file
})
// 获取图片列表接口
router.get('/api/list', (ctx, next) => {
  const files = glob.sync(rootImage + '/*')
  const result = files.map(item => {
    return config.url + '/api/img/' + item.split('uploads/')[1]
  })
  ctx.response.body = result
})

// 设置保存文件的路径
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, rootImage)
  },
  filename: (req, file, cb) => {
    const [name, type] = (file.originalname).split('.')
    cb(null, Date.now().toString(16) + '.' + type)
  }
})
const upload = multer({
  storage: storage
})
// 上传图片接口
router.post('/api/upload', upload.single('image'), async (ctx, next) => {
  const { filename, path, size } = ctx.file
  ctx.response.body = {
    state: 200,
    filename,
    size,
    url: config.url + '/api/img/' + filename
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(8888, () => {
  console.log('LemonBed图床服务器启动成功~')
})
