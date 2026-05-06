#!/usr/bin/env node

const { v4: uuidv4 } = require('uuid');
const bcryptjs = require('bcryptjs');
const db = require('./config/sqlite');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Create sample users
    const users = [];
    const userIds = [];

    // Admin user
    const adminId = uuidv4();
    const adminPassword = await bcryptjs.hash('Admin123', 10);
    userIds.push(adminId);

    await db.run(
      `INSERT INTO users (id, name, email, password, role, isActive, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, 'Admin User', 'admin@aieduassist.com', adminPassword, 'admin', 1, new Date().toISOString(), new Date().toISOString()]
    );
    console.log('✓ Created admin user');

    // Instructor user
    const instructorId = uuidv4();
    const instructorPassword = await bcryptjs.hash('Instructor123', 10);
    userIds.push(instructorId);

    await db.run(
      `INSERT INTO users (id, name, email, password, role, isActive, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [instructorId, 'John Instructor', 'instructor@aieduassist.com', instructorPassword, 'instructor', 1, new Date().toISOString(), new Date().toISOString()]
    );
    console.log('✓ Created instructor user');

    // 3 Student users
    for (let i = 1; i <= 3; i++) {
      const studentId = uuidv4();
      const studentPassword = await bcryptjs.hash('Student123', 10);
      userIds.push(studentId);

      await db.run(
        `INSERT INTO users (id, name, email, password, role, isActive, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [studentId, `Student ${i}`, `student${i}@aieduassist.com`, studentPassword, 'student', 1, new Date().toISOString(), new Date().toISOString()]
      );
    }
    console.log('✓ Created 3 student users');

    // Create sample courses
    const courseCategories = ['Web Development', 'Data Science', 'AI/ML', 'Mobile Development', 'DevOps'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const courses = [];

    const courseDescriptions = {
      'Web Development': [
        'Learn HTML, CSS, and JavaScript fundamentals',
        'Master React and modern frontend development',
        'Build scalable Node.js applications',
        'Full-stack web development with MERN',
        'Advanced CSS and responsive design'
      ],
      'Data Science': [
        'Python for data analysis and visualization',
        'SQL and database design fundamentals',
        'Statistical analysis and hypothesis testing',
        'Data visualization with Python',
        'Machine learning with scikit-learn'
      ],
      'AI/ML': [
        'Deep learning fundamentals with PyTorch',
        'Natural language processing and transformers',
        'Computer vision and image processing',
        'Reinforcement learning basics',
        'LLMs and generative AI'
      ],
      'Mobile Development': [
        'React Native development fundamentals',
        'Flutter for cross-platform mobile apps',
        'iOS development with Swift',
        'Android development with Kotlin',
        'Mobile app deployment and optimization'
      ],
      'DevOps': [
        'Docker containerization basics',
        'Kubernetes orchestration',
        'CI/CD pipelines with Jenkins',
        'Infrastructure as code with Terraform',
        'Cloud deployment on AWS'
      ]
    };

    for (const category of courseCategories) {
      const descriptions = courseDescriptions[category];
      for (let i = 0; i < 5; i++) {
        const courseId = uuidv4();
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const price = Math.floor(Math.random() * 200) + 29;
        const duration = Math.floor(Math.random() * 40) + 10;

        await db.run(
          `INSERT INTO courses (id, title, description, category, difficulty, price, instructor_id, duration_hours, thumbnail_url, prerequisites, isPublished, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            courseId,
            `${category} - ${descriptions[i]}`,
            `Master ${descriptions[i].toLowerCase()}. This comprehensive course covers all essential topics for ${category.toLowerCase()} professionals.`,
            category,
            difficulty,
            price,
            instructorId,
            duration,
            `https://via.placeholder.com/300x200?text=${category}+${i+1}`,
            category === 'Web Development' ? 'Basic HTML knowledge' : 'Python basics',
            1,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );
        courses.push(courseId);
      }
    }
    console.log(`✓ Created ${courses.length} sample courses`);

    // Create enrollments for students
    const studentIds = userIds.slice(2); // Skip admin and instructor

    for (const studentId of studentIds) {
      const enrollmentsPerStudent = Math.floor(Math.random() * 5) + 2;
      const selectedCourses = courses.sort(() => Math.random() - 0.5).slice(0, enrollmentsPerStudent);

      for (const courseId of selectedCourses) {
        const enrollmentId = uuidv4();
        const status = ['active', 'completed', 'paused'][Math.floor(Math.random() * 3)];
        const progress = status === 'completed' ? 100 : Math.floor(Math.random() * 100);
        const rating = status === 'completed' ? Math.floor(Math.random() * 5) + 1 : null;

        await db.run(
          `INSERT INTO enrollments (id, user_id, course_id, status, progress, rating, review, enrolled_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            enrollmentId,
            studentId,
            courseId,
            status,
            progress,
            rating,
            rating ? `Great course! Highly recommend.` : null,
            new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            new Date().toISOString()
          ]
        );
      }
    }
    console.log('✓ Created student enrollments');

    // Create sample quizzes
    let quizCount = 0;
    for (let i = 0; i < 10; i++) {
      const courseId = courses[Math.floor(Math.random() * courses.length)];
      const quizId = uuidv4();

      await db.run(
        `INSERT INTO quizzes (id, course_id, title, description, questions, passing_score, duration_minutes, retake_allowed, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quizId,
          courseId,
          `Quiz ${i + 1}`,
          `Test your knowledge of the course material`,
          10,
          70,
          30,
          1,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
      quizCount++;
    }
    console.log(`✓ Created ${quizCount} sample quizzes`);

    // Create sample quiz results
    let resultCount = 0;
    for (let i = 0; i < 15; i++) {
      const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
      const quiz = await db.get('SELECT * FROM quizzes ORDER BY RANDOM() LIMIT 1');
      const resultId = uuidv4();
      const score = Math.floor(Math.random() * 100);
      const answers = Array(10).fill(0).map(() => Math.floor(Math.random() * 4));

      await db.run(
        `INSERT INTO quiz_results (id, user_id, quiz_id, answers, score, time_spent, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          resultId,
          studentId,
          quiz.id,
          JSON.stringify(answers),
          score,
          Math.floor(Math.random() * 30) + 5,
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        ]
      );
      resultCount++;
    }
    console.log(`✓ Created ${resultCount} sample quiz results`);

    // Create sample certificates
    let certCount = 0;
    for (const studentId of studentIds) {
      const completedEnrollments = await db.all(
        'SELECT course_id FROM enrollments WHERE user_id = ? AND status = ?',
        [studentId, 'completed']
      );

      for (const enrollment of completedEnrollments) {
        const certificateId = uuidv4();
        const issue_date = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString();
        const expiry_date = new Date(new Date(issue_date).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const verification_url = `https://aieduassist.com/verify/${uuidv4()}`;

        const course = await db.get('SELECT title FROM courses WHERE id = ?', [enrollment.course_id]);

        await db.run(
          `INSERT INTO certificates (id, user_id, course_id, title, issue_date, expiry_date, verification_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            certificateId,
            studentId,
            enrollment.course_id,
            `Certificate of Completion - ${course.title}`,
            issue_date,
            expiry_date,
            verification_url,
            new Date().toISOString()
          ]
        );
        certCount++;
      }
    }
    console.log(`✓ Created ${certCount} sample certificates`);

    // Create sample notifications
    let notifCount = 0;
    for (let i = 0; i < 20; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const notifId = uuidv4();
      const types = ['enrollment', 'completion', 'grade', 'certificate', 'discussion'];
      const type = types[Math.floor(Math.random() * types.length)];

      const messages = {
        enrollment: 'You have been enrolled in a new course',
        completion: 'Congratulations! You completed a course',
        grade: 'Your quiz results are ready',
        certificate: 'Your certificate is ready for download',
        discussion: 'New reply to your discussion'
      };

      await db.run(
        `INSERT INTO notifications (id, user_id, type, message, read, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          notifId,
          userId,
          type,
          messages[type],
          Math.random() > 0.5 ? 1 : 0,
          new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        ]
      );
      notifCount++;
    }
    console.log(`✓ Created ${notifCount} sample notifications`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${userIds.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Enrollments: ${studentIds.length * 5}`);
    console.log(`   - Quizzes: ${quizCount}`);
    console.log(`   - Quiz Results: ${resultCount}`);
    console.log(`   - Certificates: ${certCount}`);
    console.log(`   - Notifications: ${notifCount}`);
    console.log('\n💡 Test Credentials:');
    console.log('   Admin: admin@aieduassist.com / Admin123');
    console.log('   Instructor: instructor@aieduassist.com / Instructor123');
    console.log('   Student 1: student1@aieduassist.com / Student123');
    console.log('   Student 2: student2@aieduassist.com / Student123');
    console.log('   Student 3: student3@aieduassist.com / Student123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
