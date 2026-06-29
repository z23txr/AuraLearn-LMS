import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: `AuraLearn <${process.env.EMAIL_USER || 'no-reply@auralearn.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions); 
  } catch (error) {
    console.error("⚠️ SMTP Error in sendEmail:", error.message);
    throw new Error(error.message);
  }
};

export default sendEmail;