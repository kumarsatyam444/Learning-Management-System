require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const CreatorApplication = require('../models/CreatorApplication');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await CreatorApplication.deleteMany({});

    console.log('Cleared existing data');

    const admin = new User({
      email: 'admin@example.com',
      password: 'Admin123!',
      name: 'Admin User',
      role: 'admin'
    });
    await admin.save();
    console.log('Created admin user');

    const creator = new User({
      email: 'creator@example.com',
      password: 'Creator123!',
      name: 'Creator User',
      role: 'creator'
    });
    await creator.save();
    console.log('Created creator user');

    const creatorApp = new CreatorApplication({
      userId: creator._id,
      reason: 'I want to share my knowledge with others',
      status: 'approved',
      reviewedBy: admin._id,
      reviewedAt: new Date()
    });
    await creatorApp.save();
    console.log('Created approved creator application');

    const learner = new User({
      email: 'learner@example.com',
      password: 'Learner123!',
      name: 'Learner User',
      role: 'learner'
    });
    await learner.save();
    console.log('Created learner user');

    const course = new Course({
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript to build modern web applications.',
      creatorId: creator._id,
      status: 'published',
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      reviewedBy: admin._id,
      reviewedAt: new Date()
    });
    await course.save();
    console.log('Created published course');

    const lesson1 = new Lesson({
      courseId: course._id,
      title: 'Getting Started with HTML',
      videoUrl: 'https://youtu.be/HcOc7P5BMi4?si=yylDwaPPmxIrXqSk',
      order: 1,
      duration: 600,
      transcript: {
        text: 'Welcome to the first lesson on HTML. In this lesson, we will cover the basics of HTML structure, including elements, tags, and attributes. HTML is the foundation of web development, and understanding it is crucial for building web pages. We will explore common HTML elements like headings, paragraphs, links, images, and lists. By the end of this lesson, you will be able to create a simple HTML page.',
        status: 'completed'
      }
    });
    await lesson1.save();
    console.log('Created lesson 1');

    const lesson2 = new Lesson({
      courseId: course._id,
      title: 'Styling with CSS',
      videoUrl: 'https://youtu.be/ESnrn1kAD4E?si=GN2bZgENmT6l8JI8',
      order: 2,
      duration: 720,
      transcript: {
        text: 'In this lesson, we dive into CSS (Cascading Style Sheets), which is used to style HTML elements. You will learn about selectors, properties, and values. We will cover how to change colors, fonts, spacing, and layout. CSS makes your web pages visually appealing and responsive. We will also introduce the box model and flexbox for creating modern layouts.',
        status: 'completed'
      }
    });
    await lesson2.save();
    console.log('Created lesson 2');

    const lesson3 = new Lesson({
      courseId: course._id,
      title: 'JavaScript Fundamentals',
      videoUrl: 'https://youtu.be/VoKFyB1q4fc?si=hQjjXCXZyGGjiZ5y',
      order: 3,
      duration: 900,
      transcript: {
        text: 'JavaScript is the programming language of the web. In this lesson, we will cover the fundamentals of JavaScript, including variables, data types, operators, and control structures. You will learn how to make your web pages interactive by manipulating the DOM (Document Object Model). We will also explore functions, events, and basic debugging techniques. By the end of this lesson, you will be able to add dynamic behavior to your web pages.',
        status: 'completed'
      }
    });
    await lesson3.save();
    console.log('Created lesson 3');

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log('\nUsers:');
    console.log('Admin - admin@example.com / Admin123!');
    console.log('Creator - creator@example.com / Creator123!');
    console.log('Learner - learner@example.com / Learner123!');
    console.log('\nCourse: Introduction to Web Development (Published)');
    console.log('Lessons: 3 lessons with transcripts');
    console.log('\n========================\n');

    await mongoose.connection.close();
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
