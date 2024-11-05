import {CognitoUserAttribute} from "amazon-cognito-identity-js"
import {RequestHandler} from "express"
import cognitoUserPool from "../config/cognito"
import attribute from "../utils/attribute"

export const signup = (req: any, res: any) => {
	const {
		givenName,
		lastName,
		email,
		phoneNumber,
		birthdate,
		gender,
		password,
	} = req.body

	if (
		!givenName ||
		!lastName ||
		!email ||
		!phoneNumber ||
		!birthdate ||
		!gender
	) {
		res.status(400).json({message: "Insufficient data"})
	}

	const attributes = [
		attribute("given_name", givenName),
		attribute("family_name", lastName),
		attribute("email", email),
		attribute("phone_number", phoneNumber),
		attribute("gender", gender),
		attribute("birthdate", birthdate),
	]

	const cognitoAttributeList = attributes.map(
		(attribute) => new CognitoUserAttribute(attribute)
	)

	cognitoUserPool.signUp(
		email,
		password,
		cognitoAttributeList,
		[],
		(err, data) => {
			if (err) {
				console.log(err)
				res.status(500).json({message: "Something went wrong"})
			}

			if (data) {
				res.status(201).json({
					userConfirmed: data.userConfirmed,
				})
			}
		}
	)
}
