import {
	AttributeType,
	CognitoIdentityProvider,
	GlobalSignOutCommand,
	SignUpCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider"
import {TokenExpiredError} from "jsonwebtoken"
import { CognitoJwtVerifier } from "aws-jwt-verify"
require("dotenv").config()

export enum TokenErrors {
	TOKEN_EXPIRED = "Token expired",
	INVALID_TOKEN = "Invalid token",
	INVALID_ISSUER = "Invalid claim issuer",
	INVALID_CLAIM = "Invalid claim",
}

export interface Attributes {
	sub: string
	birthdate: string
	gender: string
	given_name: string
	phone_number: string
	family_name: string
	email: string
}

const COGNITO_JWKS_ISSUER = `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_wg8GO6epi/.well-known/jwks.json`

const cognitoISP = new CognitoIdentityProvider({
	region: "us-east-1",
})

const jwtVerifier = CognitoJwtVerifier.create({
	userPoolId: process.env.COGNITO_USER_POOL_ID as string,
	tokenUse: "access",
	issuer: COGNITO_JWKS_ISSUER,
})

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
		},
		callback
	)

export const signInMethod = (email: string, password: string) => {
	return cognitoISP.initiateAuth({
		AuthFlow: "USER_PASSWORD_AUTH",
		AuthParameters: {
			USERNAME: email,
			PASSWORD: password,
		},
		ClientId: process.env.COGNITO_CLIENT_ID,
	})
}

export const refreshMethod = (refreshToken: string) => {
	return cognitoISP.initiateAuth({
		AuthFlow: "REFRESH_TOKEN_AUTH",
		AuthParameters: {
			REFRESH_TOKEN: refreshToken,
		},
		ClientId: process.env.COGNITO_CLIENT_ID,
	})
}

export const verifyToken = async (
	token: string,
	callback: (err: TokenErrors | null, data: any) => void
) => {
	
	if(!token){
		callback(TokenErrors.INVALID_TOKEN, null)
	}else{
		try{
			const result = await jwtVerifier.verify(token, {
				clientId: process.env.COGNITO_CLIENT_ID as string,
			})
			callback(null, result)
		}catch(e: any){
			if(e instanceof TokenExpiredError){
				callback(TokenErrors.TOKEN_EXPIRED, null)
			}else{
				callback(TokenErrors.INVALID_TOKEN, null)
			}	
		}
	}
}

export const logoutMethod = async (accessToken: string, callback: (err: any, data?: any) => void) => {
    if (!accessToken) {
        callback(new Error("Access token is required"), null);
        return;
    }

    try {
        const signOutResult = await cognitoISP.globalSignOut({
            AccessToken: accessToken
        })
        callback(null, { message: 'User was already logged out', statusCode: 200 });
    } catch(e: any) {
        if (e.name === 'NotAuthorizedException' && e.message.includes('Access Token has been revoked')) {
            callback(null, { message: 'User was already logged out', statusCode: 200 });
        } else {
            callback(e, null);
        }
    }
}
