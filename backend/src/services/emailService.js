const nodemailer = require('nodemailer');

let transporter;

const initializeEmailService = () => {
  if (process.env.SENDGRID_API_KEY) {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
    });
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587
    });
  }
};

class EmailService {
  static async initialize() {
    try {
      if (!transporter) initializeEmailService();
      console.log('✅ Email service initialized');
    } catch (error) {
      console.warn('⚠️  Email service not configured:', error.message);
    }
  }

  static async sendEmail(to, subject, html) {
    try {
      if (!transporter) initializeEmailService();
      const result = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@aieduassist.com',
        to,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error('Email error:', error.message);
      return false;
    }
  }

  static async sendWelcomeEmail(user) {
    const html = `<h2>Welcome to AIEduAssist!</h2><p>Hi ${user.name || user.email},<br/>Your account is ready. Start learning now!</p>`;
    return this.sendEmail(user.email, 'Welcome to AIEduAssist', html);
  }

  static async sendEnrollmentConfirmation(user, course) {
    const html = `<h2>Enrollment Confirmed ✓</h2><p>You've enrolled in: ${course.title}</p><p>Start learning: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard">Dashboard</a></p>`;
    return this.sendEmail(user.email, `Enrolled: ${course.title}`, html);
  }

  static async sendCourseCompletion(user, course) {
    const html = `<h2>🎉 Course Completed!</h2><p>Congratulations on completing ${course.title}!</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates">View Certificate</a></p>`;
    return this.sendEmail(user.email, `Completed: ${course.title}`, html);
  }

  static async sendQuizResults(user, quiz, score) {
    const passed = score >= (quiz.passingScore || 70);
    const html = `<h2>${passed ? '✓ Passed!' : 'Results'}</h2><p>Score: ${score.toFixed(1)}%</p><p>Status: ${passed ? 'PASSED' : 'Try Again'}</p>`;
    return this.sendEmail(user.email, `Quiz: ${quiz.title}`, html);
  }
}

module.exports = EmailService;
