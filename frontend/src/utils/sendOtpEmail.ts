import nodemailer from 'nodemailer';

export async function sendOtpEmail(email: string, otpCode: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Таны нэг удаагийн баталгаажуулах код (OTP)',
    text: `Таны баталгаажуулах код: ${otpCode}\n\n5 минутын дотор ашиглана уу.`,
  };

  await transporter.sendMail(mailOptions);
}
