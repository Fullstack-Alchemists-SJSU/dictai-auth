import {NotAuthorizedException} from "@aws-sdk/client-cognito-identity-provider"
import {
	Attributes,
	logoutMethod,
	refreshMethod,
	signInMethod,
	TokenErrors,
	verifyToken,
} from "../config/cognito"
import {decodePasswordFromHeader} from "../utils/password"
import {decode} from "jsonwebtoken"

const login = async (req: any, res: any) => {
	const emailReq = req.body.email

	if (!emailReq || !req.headers || !req.headers.password) {
		res.status(400).json({message: "Insufficient data"})
	}

	try {
		const {password} = req.headers
		const decodedPassword = decodePasswordFromHeader(password)
		const authResult = await signInMethod(emailReq, decodedPassword)
		const {
			email,
			sub,
			birthdate,
			gender,
			given_name,
			family_name,
			phone_number,
		} = decode(authResult.AuthenticationResult?.IdToken ?? "") as Attributes

		const response = {
			$metadata: authResult.$metadata,
			AuthenticationResult: authResult.AuthenticationResult,
			Attributes: {
				email,
				sub,
				birthdate,
				gender,
				given_name,
				family_name,
				phone_number,
			},
		}
		res.status(200).json(response)
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
	const {sub} = req.body
	const refreshToken = req.headers.authorization
	if (!sub || !refreshToken) {
		res.status(400).json({message: "Insufficient data"})
	}

	try {
		const result = await refreshMethod(refreshToken)
		res.status(200).json(result)
	} catch (e: any) {
		console.log(e)
		if (e instanceof NotAuthorizedException) {
			res.status(401).json({message: "Invalid token or user sub"})
		}
		res.status(500).json({message: "Something went wrong"})
	}
}

export const logout = async (req: any, res: any) => {
    if (!req.headers.authorization) {
        return res.status(400).json({ message: "Access token is required" });
    }

    try {
        const accessToken = req.headers.authorization.split(" ")[1];
        
        logoutMethod(accessToken, (err: any, data?: any) => {
            if (err) {
                res.status(500).json(data)
            } else {
                res.status(200).json(data)
            }
        })
    } catch (e: any) {
        console.log("error: ", e)
        res.status(500).json({message: "Something went wrong"})
    }
}	


export default login
