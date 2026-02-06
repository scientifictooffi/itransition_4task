const nodemailer = require("nodemailer");

async function createTransport() {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

async function sendVerificationEmail(to, link) {
  const transport = await createTransport();
  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || "no-reply@task4.local",
    to,
    subject: "Verify your account",
    html: `<p>Please verify your account:</p><p><a href="${link}">${link}</a></p>`,
  });

  if (nodemailer.getTestMessageUrl(info)) {
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  }
}

module.exports = { sendVerificationEmail };
