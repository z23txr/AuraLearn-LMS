import axios from 'axios';

const API = import.meta.env.VITE_API_URL + '/api';

/**
 * Uploads a file directly to Cloudinary using a secure signature from the backend.
 * @param {File} file The file to upload
 * @param {Function} onProgress Optional callback for upload progress (0-100)
 * @returns {Promise<string>} The secure URL of the uploaded file on Cloudinary
 */
export const uploadToCloudinary = async (file, onProgress) => {
    try {
        const token = localStorage.getItem('token')?.replace(/"/g, '');
        if (!token) throw new Error("No authentication token found");

        // 1. Get Signature from backend
        const sigRes = await axios.get(`${API}/upload/signature`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { timestamp, signature, cloudName, apiKey } = sigRes.data;

        // 2. Prepare FormData for Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', 'auralearn_uploads');

        // 3. Upload directly to Cloudinary bypassing Vercel limits
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
        
        const uploadRes = await axios.post(cloudinaryUrl, formData, {
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });

        // 4. Return the secure URL
        return uploadRes.data.secure_url;
    } catch (error) {
        console.error("Direct Cloudinary Upload Error:", error);
        throw error;
    }
};
