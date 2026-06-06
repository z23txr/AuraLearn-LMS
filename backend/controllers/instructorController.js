import Instructor from '../models/Instructor.js';

// Get Profile
export const getMyProfile = async (req, res) => {
    try {
       
        const profile = await Instructor.findOne({ userId: req.user._id }).populate('myCourses') .populate('userId', 'email');;
        if (!profile) return res.status(404).json({ message: "Instructor profile not found" });
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { email, userId, ...safeData } = req.body; 
        
        const updatedProfile = await Instructor.findOneAndUpdate(
            { userId: req.user._id },
            { $set: req.body }, 
            { new: true, runValidators: true, upsert: true } 
        );
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: "Update Failed: " + error.message });
    }
};