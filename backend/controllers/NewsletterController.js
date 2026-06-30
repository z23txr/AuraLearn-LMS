import Newsletter from "../models/Newsletter.js";
import nodemailer from "nodemailer";

export const subscribeEmail=async(req,res)=>{
    try{
        const { email: rawEmail } = req.body;
        if (!rawEmail) return res.status(400).json({ message: "Email is required" });
        
        const email = rawEmail.trim().toLowerCase();
        const existingSubscription = await Newsletter.findOne({ email });
        
        if(existingSubscription){
            return res.status(400).json({message:"Email is already subscribed to the newsletter"});
        }
        await Newsletter.create({email});

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER, 
                    pass: process.env.EMAIL_PASS  
                }
            });

            const mailOptions = {
                from: `"AuraLearn AI" <${process.env.EMAIL_USER || 'no-reply@auralearn.com'}>`,
                to: email,
                subject: "Welcome to the AuraLearn Revolution!",
                html: `
                    <div style="background: #05070a; color: #fff; padding: 40px; font-family: 'Poppins', sans-serif; border-radius: 20px; border: 1px solid #38bdf8;">
                        <h2 style="color: #38bdf8;">Welcome to AuraLearn!</h2>
                        <p>Thank you for subscribing. You're now part of an AI-driven learning ecosystem.</p>
                        <p>Stay tuned for updates on <b>AI Quiz Generators</b>, <b>Smart Analytics</b>, and new courses.</p>
                        <br />
                        <hr style="border: 0.5px solid #1e293b;" />
                        <p style="font-size: 0.8rem; color: #64748b;">Built  by  Zainab Sajid.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            res.status(201).json({ message: "Subscribed & Confirmation email sent! " });
        } catch (mailError) {
            console.warn("⚠️ SMTP / Nodemailer subscription email failed to send, but saved to database:", mailError.message);
            res.status(201).json({ message: "Welcome aboard! You have successfully subscribed to the newsletter." });
        }
    } catch (error) {
        console.error("Newsletter Subscription Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email is already subscribed to the newsletter" });
        }
        res.status(500).json({ message: "Server error: " + error.message });
    }
};