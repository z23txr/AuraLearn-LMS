import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';


export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.query;

   
        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: "Valid User ID is required" });
        }

        let notificationsList = [];

        // --- STUDENT ROLE ---
        if (role === 'student') {
            const student = await User.findById(userId);
            if (!student) return res.status(404).json({ message: "Student not found" });
            
          
            notificationsList = student.notifications 
                ? student.notifications.filter(n => !n.isRead) 
                : [];
        }

        // --- INSTRUCTOR ROLE ---
        else if (role === 'instructor') {
           
            const pending = await Enrollment.find({ teacherId: userId, status: 'Pending' })
                .populate('studentId', 'name');
            
            const dynamicNotifs = pending.map(req => ({
                _id: req._id,
                type: 'request',
                text: `${req.studentId?.name || 'A student'} applied for ${req.courseTitle}.`,
                createdAt: req.createdAt,
                isDynamic: true 
            }));

           
            const instructorDoc = await User.findById(userId);
            const savedNotifs = instructorDoc?.notifications 
                ? instructorDoc.notifications.filter(n => !n.isRead) 
                : [];

            notificationsList = [...dynamicNotifs, ...savedNotifs];
        }

        res.status(200).json(notificationsList);
    } catch (error) { 
        console.error("Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch notifications" }); 
    }
};


export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params; 
        const { userId } = req.body; 

        if (!userId || !id) return res.status(400).json({ message: "Missing data" });

       
        await User.updateOne(
            { _id: userId, "notifications._id": id },
            { $set: { "notifications.$.isRead": true } }
        );
        
        res.status(200).json({ message: "Marked as read" });
    } catch (err) { 
        res.status(500).json({ message: "Update failed" }); 
    }
};


export const markAllRead = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const result = await User.updateOne(
            { _id: userId },
            { $set: { "notifications.$[].isRead": true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User document not found" });
        }

        res.status(200).json({ message: "All notifications cleared" });
    } catch (err) { 
        console.error("Critical MarkAllRead Error:", err);
        res.status(500).json({ message: "Internal Server Error during update" }); 
    }
};