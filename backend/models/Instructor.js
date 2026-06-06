import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: String,
     email: String, 
    phone: String,
     dob: String, 
    gender: String,
     address: String,
      city: String,
       country: String,
       bio: String,
    degree: String,
     university: String,
      passingYear: String, 
      cgpa: String,
    specialization: String,
     experience: String, 
     skills: String, 
    certificates: String,
     researchWork: String,
    myCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

export default mongoose.model('Instructor', instructorSchema);