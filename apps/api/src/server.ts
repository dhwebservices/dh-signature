import cors from 'cors'
import express from 'express'
import { signaturesRouter } from './routes/signatures'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', signaturesRouter)

const port = Number(process.env.PORT || 4188)
app.listen(port, () => {
  console.log(`DH Signature API running on http://localhost:${port}`)
})
