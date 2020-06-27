"use strict"

module.exports.test = (event, context, callback) => {
	const response = {
	  statusCode: 200,
	  body: JSON.stringify({
		message: 'Greetings from AWS Lambda.',
	  }),
	};
  
	callback(null, response);
};

module.exports.submitForm = (event, context, callback) => {
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

		const accessToken = oauth2Client.getAccessToken();

		const smtpTransport = nodemailer.createTransport({
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
		
		smtpTransport.sendMail(mailOptions)

		smtpTransport.close();

		callback(null, {
			msgTitle: "Success",
			msgBody: "Your request was successfully sent. Please allow 24-48 hours to receive an invitation to join the Slack Workspace."
		});
		
	} catch (error) {

		callback(null, {
			error,
			msgTitle: "Error",
			msgBody: "Whoops. It looks like there was an issue. Please try again later."
		});

	};
};