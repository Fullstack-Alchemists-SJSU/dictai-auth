import {Express} from "express"
import {signup} from "./controller/registration"
const router = (app: Express) => {
	app.post("/auth/register", signup)
}

export default router
