export const decodePasswordFromHeader = (passwordFromHeader: string) => {
	return Buffer.from(passwordFromHeader, "base64").toString()
}
