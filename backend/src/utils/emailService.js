const nodemailer = require('nodemailer');

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const emailService = {
  // Send verification email
  sendVerificationEmail: async (email, verificationLink) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your AIEduAssist Account',
        html: `
          <h2>Welcome to AIEduAssist!</h2>
          <p>Click the link below to verify your email address:</p>
          <a href="${verificationLink}">Verify Email</a>
          <p>Link expires in 24 hours.</p>
        `,
      });
      return { success: true };
    } catch (error) {
      console.error('Verification email error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (email, resetLink) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Your AIEduAssist Password',
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>Link expires in 1 hour. If you didn't request this, ignore this email.</p>
        `,
      });
      return { success: true };
    } catch (error) {
      console.error('Password reset email error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send notification email
  sendNotificationEmail: async (email, title, message, actionUrl) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `AIEduAssist: ${title}`,
        html: `
          <h3>${title}</h3>
          <p>${message}</p>
          ${actionUrl ? `<a href="${process.env.FRONTEND_URL}${actionUrl}">View Details</a>` : ''}
          <hr>
          <p><small>Manage your notification preferences in your account settings</small></p>
        `,
      });
      return { success: true };
    } catch (error) {
      console.error('Notification email error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send certificate email
  sendCertificateEmail: async (email, certificateName, courseName, certificateLink) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Your Certificate for ${courseName}`,
        html: `
          <h2>🎉 Congratulations!</h2>
          <p>You have successfully completed "${courseName}"</p>
          <p>Your certificate is now available:</p>
          <a href="${certificateLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Download Certificate
          </a>
          <p style="margin-top: 20px;">Certificate Name: ${certificateName}</p>
        `,
      });
      return { success: true };
    } catch (error) {
      console.error('Certificate email error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send course update email
  sendCourseUpdateEmail: async (email, courseName, updateTitle, updateMessage) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Course Update: ${courseName}`,
        html: `
          <h3>Course Update: ${courseName}</h3>
          <h4>${updateTitle}</h4>
          <p>${updateMessage}</p>
          <a href="${process.env.FRONTEND_URL}/courses/${courseName}">View Course</a>
        `,
      });
      return { success: true };
    } catch (error) {
      console.error('Course update email error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send bulk email
  sendBulkEmail: async (recipients, subject, htmlContent) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipients.join(','),
        subject,
        html: htmlContent,
      });
      return { success: true, recipientCount: recipients.length };
    } catch (error) {
      console.error('Bulk email error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send quiz reminder
  sendQuizReminderEmail: async (email, courseName, quizName, dueDate) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Quiz Reminder: ${quizName}`,
        html: `
          <h3>Quiz Reminder</h3>
          <p>You have a quiz pending in <strong>${courseName}</strong></p>
          <p><strong>Quiz:</strong> ${quizName}</p>
          <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
          <a href="${process.env.FRONTEND_URL}/courses/${courseName}/quizzes">Take Quiz</a>
        `,
      });
      return { success: true };
    } catch (error) {
      console.error('Quiz reminder email error:', error);
      return { success: false, error: error.message };
    }
  },
};

module.exports = emailService;
