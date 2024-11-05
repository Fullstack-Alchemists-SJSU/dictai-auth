import {createHmac, hash} from "crypto"
import {
	AttributeType,
	CognitoIdentityProvider,
	SignUpCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider"
require("dotenv").config()

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
