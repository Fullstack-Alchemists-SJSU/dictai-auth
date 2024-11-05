import {secretHash, signUpMethod} from "../config/cognito"
import {
	SignUpCommandOutput,
	AttributeType,
} from "@aws-sdk/client-cognito-identity-provider"

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

	const attributes: AttributeType[] = [
		{Name: "given_name", Value: givenName},
		{Name: "family_name", Value: lastName},
		{Name: "email", Value: email},
		{Name: "phone_number", Value: phoneNumber},
		{Name: "gender", Value: gender},
		{Name: "birthdate", Value: birthdate},
	]

	signUpMethod(
		email,
		password,
		attributes,
		(err: any, data?: SignUpCommandOutput) => {
			if (err) {
				console.log(err)
				res.status(500).json({message: "Something went wrong"})
			}

			if (data) {
				res.status(201).json({
					userSub: data.UserSub,
				})
			}
		}
	)
}
