const approveStudent = async (req, res) => {
    try {
        const { enrollmentId } = req.params;

        //  Last Reg Number dhoondna
        const lastApproved = await Student.findOne({ regNumber: /^AU-/ }).sort({ createdAt: -1 });
        
        let nextID = 1;
        if (lastApproved && lastApproved.regNumber !== "Pending") {
            const lastNum = parseInt(lastApproved.regNumber.split('-')[1]);
            nextID = lastNum + 1;
        }
        const generatedRegID = `AU-${nextID.toString().padStart(3, '0')}`; // AU-006

        //  Enrollment Status Update karna
        const enrollment = await Enrollment.findByIdAndUpdate(enrollmentId, { status: 'Approved' });

        //  Student Profile update aur Notification
        await Student.findOneAndUpdate(
            { userId: enrollment.studentId },
            { 
                regNumber: generatedRegID,
                $push: { 
                    notifications: {
                        teacherId: enrollment.teacherId,
                        message: `Congratulations! Your enrollment for ${enrollment.courseTitle} is approved. Your ID is ${generatedRegID}`,
                        courseId: enrollment.courseId
                    }
                }
            }
        );

        res.status(200).json({ message: "Student Approved", regID: generatedRegID });
    } catch (err) {
        res.status(500).json(err);
    }
};