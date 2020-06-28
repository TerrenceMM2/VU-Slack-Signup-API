"use strict"

module.exports.submitForm = async (event, context) => {
	try {
		// Source: https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1
		const nodemailer = require("nodemailer");
		const { google } = require("googleapis");
		const OAuth2 = google.auth.OAuth2;

		// Start Gmail Integration
		const oauth2Client = new OAuth2(
			process.env.GOOGLE_OAUTH_CLIENT_ID, // ClientID
			process.env.GOOGLE_OAUTH_CLIENT_SECRET, // Client Secret
			"https://developers.google.com/oauthplayground" // Redirect URL
		);

		oauth2Client.setCredentials({
			refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
		});

		const accessToken = await oauth2Client.getAccessToken();

		const smtpTransport = await nodemailer.createTransport({
			service: "gmail",
			auth: {
				type: "OAuth2",
				user: "terrencemm2@gmail.com",
				clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
				clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
				refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
				accessToken: accessToken,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});

		const mailOptions = {
			from: `VU Signup - Nodemailer <${event.email}>`,
			to: "Terrence Mahnken <terrencemm2@gmail.com>",
			subject: "VU Alumni Slack Signup Request",
			generateTextFromHTML: true,
			html: `<b>Requestor Name:</b><span> ${event.name}</span><br /><br /><b>Requestor Email:</b><span> ${event.email}</span><br /><br /><b>Requestor Message:</b><span> ${event.msg}</span>`
		};
		
		const response = await smtpTransport.sendMail(mailOptions);

		smtpTransport.close();

		return {
			response,
			status: 200,
			msgTitle: "Success",
			msgBody: "Your request was successfully sent. Please allow 24-48 hours to receive an invitation to join the Slack Workspace."
		};
		
	} catch (error) {

		return {
			error,
			status: 500,
			msgTitle: "Error",
			msgBody: "Whoops. It looks like there was an issue. Please try again later."
		};

	};
};