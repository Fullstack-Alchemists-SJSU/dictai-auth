import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import router from "./router"
require("dotenv").config()

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.listen(3300, () => {
	console.log("Server listening on port 3300")
})

router(app)
