import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const getUploadSignature = (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        
        // Generate signature
        const signature = cloudinary.utils.api_sign_request(
            { 
                timestamp, 
                folder: 'auralearn_uploads' 
            },
            process.env.CLOUDINARY_API_SECRET
        );

        res.status(200).json({
            timestamp,
            signature,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });
    } catch (error) {
        console.error("Cloudinary Signature Error:", error);
        res.status(500).json({ message: "Failed to generate upload signature" });
    }
};
