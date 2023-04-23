const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const EMAIL_CLIENT_ID =
  "229478837756-rquo6srapkja34ffar6kan5r3fncr9ta.apps.googleusercontent.com";
const EMAIL_CLIENT_SECRET = "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";
const EMAIL_REDIREACT_URL = "https://developers.google.com/oauthplayground";
const EMAIL_REFRESH_TOKEN =
  "1//04tVuTHfcb8r_CgYIARAAGAQSNwF-L9IrBpfBajJ6uRKKSUmTa98pxkIgzIQcyXMx23ihUxW1K1gIfwI5Itey1ii33B7sDA6eAnM";
const EMAIL = "mevadajinil@gmail.com";

const sendmail = async ({
  email,
  subject = "OTP verification",
  textMessage = "",
}) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      EMAIL_CLIENT_ID,
      EMAIL_CLIENT_SECRET,
      EMAIL_REDIREACT_URL
    );

    oauth2Client.setCredentials({
      refresh_token: EMAIL_REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.log(`Failed to create access token ${err}`);
          reject(err);
        }
        resolve(token);
      });
    });

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL,
        accessToken,
        clientId: EMAIL_CLIENT_ID,
        clinetSecret: EMAIL_CLIENT_SECRET,
        refreshToken: EMAIL_REFRESH_TOKEN,
      },
    });

    const messageData = {
      from: EMAIL,
      to: email,
      subject: subject,
      text: textMessage,
    };
    return new Promise((resolve, reject) => {
      transport.sendMail(messageData, (err, info) => {
        if (err) {
          reject(err);
        }
        resolve(info);
      });
    });
  } catch (err) {
    console.log({ err });
  }
};

module.exports = { sendmail };
