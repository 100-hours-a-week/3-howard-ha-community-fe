import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
    const app = express()

    // 1. Vite 서버를 미들웨어 모드로 생성
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'mpa'
    })

    // 2. Express 앱에 Vite 미들웨어를 등록 - 모든 HTML/CSS/JS 요청은 Vite가 처리하여 HMR을 제공
    app.use(vite.middlewares)

    // 3. Express 서버를 실행
    const port = 5173 // 원하는 포트 사용
    const host = '0.0.0.0'
    app.listen(port, host, () => { })
}

createServer()