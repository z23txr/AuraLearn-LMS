import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text:   { type: String, required: true },
}, { timestamps: true });

const ChatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'New Chat'
    },
    messages: [ChatMessageSchema]
}, { timestamps: true });

export default mongoose.model('ChatSession', ChatSessionSchema);
