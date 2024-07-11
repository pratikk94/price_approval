const nodemailer = require('nodemailer');
const Email = require('../models/emailModel');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendEmail = async (req, res) => {
  const { to, subject, text } = req.body;
  const email = new Email(to, subject, text);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email.to,
    subject: email.subject,
    text: email.text,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email');
  }
};
