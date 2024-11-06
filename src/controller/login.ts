import {NotAuthorizedException} from "@aws-sdk/client-cognito-identity-provider"
import {
	refreshMethod,
	signInMethod,
	TokenErrors,
	verifyToken,
} from "../config/cognito"

const login = async (req: any, res: any) => {
	const {email, password} = req.body

	if (!email || !password) {
		res.status(400).json({message: "Insufficient data"})
	}

	try {
		const result = await signInMethod(email, password)
		res.status(200).json(result)
	} catch (e: any) {
		console.log("error: ", e)
		res.status(500).json({message: "Something went wrong"})
	}
}

export const verify = (req: any, res: any) => {
	verifyToken(
		req.headers.authorization.split(" ")[1],
		(err: TokenErrors | null, data: any) => {
			if (err) {
				if (err == TokenErrors.TOKEN_EXPIRED) {
					res.status(401).json({message: err})
				} else {
					res.status(403).json({message: err})
				}
			} else {
				res.status(200).json({message: "Token verified"})
			}
		}
	)
}

export const refresh = async (req: any, res: any) => {
	const {userSub} = req.body
	const refreshToken = req.headers.authorization
	if (!userSub || !refreshToken) {
		res.status(400).json({message: "Insufficient data"})
	}

	try {
		const result = await refreshMethod(userSub, refreshToken)
		res.status(200).json(result)
	} catch (e: any) {
		console.log(e)
		if (e instanceof NotAuthorizedException) {
			res.status(401).json({message: "Invalid token or user sub"})
		}
		res.status(500).json({message: "Something went wrong"})
	}
}

export default login
