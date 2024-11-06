import {Express, Router} from "express"
import {signup} from "./controller/registration"
import login, {refresh, verify} from "./controller/login"
const router = (app: Express) => {
	const authRouter = Router()

	authRouter.post("/register", signup)
	authRouter.post("/login", login)

	authRouter.post("/verify", verify)
	authRouter.post("/refresh", refresh)

	app.use("/auth", authRouter)
}

export default router
