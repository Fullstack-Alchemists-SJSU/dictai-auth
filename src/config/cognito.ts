import {CognitoUserPool, ICognitoUserPoolData} from "amazon-cognito-identity-js"
require("dotenv").config()

const poolData: ICognitoUserPoolData = {
	UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
	ClientId: process.env.COGNITO_CLIENT_ID as string,
}

const cognitoUserPool = new CognitoUserPool(poolData)

export default cognitoUserPool
