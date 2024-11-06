import {secretHash, signUpMethod} from "../config/cognito"
import {
	SignUpCommandOutput,
	AttributeType,
	UsernameExistsException,
} from "@aws-sdk/client-cognito-identity-provider"
import {decodePasswordFromHeader} from "../utils/password"

export const signup = (req: any, res: any) => {
	const {givenName, lastName, email, phoneNumber, birthdate, gender} =
		req.body

	if (
		!givenName ||
		!lastName ||
		!email ||
		!phoneNumber ||
		!birthdate ||
		!gender ||
		!req.headers ||
		!req.headers.password
	) {
		res.status(400).json({message: "Insufficient data"})
	}

	const {password} = req.headers
	const decodedPassword = decodePasswordFromHeader(password)

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
		decodedPassword,
		attributes,
		(err: any, data?: SignUpCommandOutput) => {
			if (err) {
				console.log(err)
				if (err instanceof UsernameExistsException) {
					res.status(400).json({
						message: "User with this email already exists",
					})
				}
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
