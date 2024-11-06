import {createHmac} from "crypto"
import {
	AttributeType,
	CognitoIdentityProvider,
	SignUpCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider"
import jwt, {TokenExpiredError} from "jsonwebtoken"
import jwkToPem from "jwk-to-pem"
import axios from "axios"
require("dotenv").config()

interface TokenHeader {
	kid: string
	alg: string
}

interface Claim {
	token_use: string
	auth_time: number
	iss: string
	exp: number
	username: string
	client_id: string
}

export enum TokenErrors {
	TOKEN_EXPIRED = "Token expired",
	INVALID_TOKEN = "Invalid token",
	INVALID_ISSUER = "Invalid claim issuer",
	INVALID_CLAIM = "Invalid claim",
}

const COGNITO_JWKS_ISSUER = `https://cognito-idp.us-east-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`

const getPublicKeys = async () => {
	const url = `${COGNITO_JWKS_ISSUER}/.well-known/jwks.json`
	const publicKeys = await axios.get(url)
	const cacheKeys = publicKeys.data.keys.reduce((agg: any, current: any) => {
		const pem = jwkToPem(current)
		agg[current.kid] = {instance: current, pem}
		return agg
	}, {} as any)
	return cacheKeys
}

const cognitoISP = new CognitoIdentityProvider({
	region: "us-east-1",
})

export const secretHash = (username: string) =>
	createHmac("sha256", process.env.COGNITO_SECRET as string)
		.update(`${username}${process.env.COGNITO_CLIENT_ID}`)
		.digest("base64")

export const signUpMethod = (
	email: string,
	password: string,
	userAttributes: AttributeType[],
	callback: (err: any, data?: SignUpCommandOutput) => void
) =>
	cognitoISP.signUp(
		{
			Username: email,
			Password: password,
			UserAttributes: userAttributes,
			ClientId: process.env.COGNITO_CLIENT_ID,
			SecretHash: secretHash(email),
		},
		callback
	)

export const signInMethod = (email: string, password: string) => {
	return cognitoISP.initiateAuth({
		AuthFlow: "USER_PASSWORD_AUTH",
		AuthParameters: {
			USERNAME: email,
			PASSWORD: password,
			SECRET_HASH: secretHash(email),
		},
		ClientId: process.env.COGNITO_CLIENT_ID,
	})
}

export const refreshMethod = (userSub: string, refreshToken: string) => {
	return cognitoISP.initiateAuth({
		AuthFlow: "REFRESH_TOKEN_AUTH",
		AuthParameters: {
			REFRESH_TOKEN: refreshToken,
			SECRET_HASH: secretHash(userSub),
		},
		ClientId: process.env.COGNITO_CLIENT_ID,
	})
}

export const verifyToken = async (
	token: string,
	callback: (err: TokenErrors | null, data: any) => void
) => {
	const tokenSections = token.split(".")
	if (tokenSections.length < 2) {
		callback(TokenErrors.INVALID_TOKEN, null)
	}

	const headerJSON = Buffer.from(tokenSections[0], "base64").toString("utf8")
	const header = JSON.parse(headerJSON) as TokenHeader
	const keys = await getPublicKeys()
	const matchingKey = keys[header.kid]

	if (matchingKey === undefined) {
		callback(TokenErrors.INVALID_TOKEN, null)
	}

	try {
		const claim = jwt.verify(token, matchingKey.pem) as Claim
		const currentSeconds = Math.floor(new Date().valueOf() / 1000)
		if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
			callback(TokenErrors.INVALID_CLAIM, null)
		}
		if (claim.iss !== COGNITO_JWKS_ISSUER) {
			callback(TokenErrors.INVALID_ISSUER, null)
		}
		if (claim.token_use !== "access") {
			callback(TokenErrors.INVALID_TOKEN, null)
		}
		callback(null, claim)
	} catch (e: any) {
		if (e instanceof TokenExpiredError) {
			callback(TokenErrors.TOKEN_EXPIRED, null)
		}
	}
}
