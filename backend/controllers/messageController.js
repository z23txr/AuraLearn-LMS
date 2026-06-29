import Message from '../models/Message.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        const senderId = req.user.id || req.user._id;

        if (!receiverId || !text) {
            return res.status(400).json({ message: "Receiver ID and text are required." });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getConversation = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const currentUserId = req.user.id || req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first for chat UI

        // Mark as read if receiver is current user
        await Message.updateMany(
            { senderId: otherUserId, receiverId: currentUserId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getContacts = async (req, res) => {
    try {
        const currentUserId = req.user.id || req.user._id;
        const currentUser = await User.findById(currentUserId);
        
        let contacts = [];

        if (currentUser.role === 'student') {
            // Find all enrollments for this student
            const enrollments = await Enrollment.find({ studentId: currentUserId }).populate('teacherId', 'name email role');
            
            // Extract unique teachers
            const uniqueTeachersMap = {};
            enrollments.forEach(enroll => {
                if (enroll.teacherId && !uniqueTeachersMap[enroll.teacherId._id]) {
                    uniqueTeachersMap[enroll.teacherId._id] = enroll.teacherId;
                }
            });
            contacts = Object.values(uniqueTeachersMap);

        } else if (currentUser.role === 'instructor') {
            // Find all enrollments for this instructor
            const enrollments = await Enrollment.find({ teacherId: currentUserId }).populate('studentId', 'name email role');
            
            // Extract unique students
            const uniqueStudentsMap = {};
            enrollments.forEach(enroll => {
                if (enroll.studentId && !uniqueStudentsMap[enroll.studentId._id]) {
                    uniqueStudentsMap[enroll.studentId._id] = enroll.studentId;
                }
            });
            contacts = Object.values(uniqueStudentsMap);
        } else {
            return res.status(403).json({ message: "Only students and instructors can use messaging." });
        }

        // Fetch unread message counts for these contacts
        const contactsWithUnread = await Promise.all(contacts.map(async (contact) => {
            const unreadCount = await Message.countDocuments({
                senderId: contact._id,
                receiverId: currentUserId,
                isRead: false
            });
            
            return {
                _id: contact._id,
                name: contact.name,
                email: contact.email,
                role: contact.role,
                unreadCount
            };
        }));

        res.status(200).json(contactsWithUnread);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
