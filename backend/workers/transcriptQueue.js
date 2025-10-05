const Bull = require('bull');
const Lesson = require('../models/Lesson');

let transcriptQueue;

const initQueue = () => {
  try {
    transcriptQueue = new Bull('transcript-generation', process.env.REDIS_URL || 'redis://localhost:6379');
    console.log('Transcript queue initialized');
  } catch (error) {
    console.error('Failed to initialize transcript queue:', error.message);
    transcriptQueue = null;
  }
};

const addTranscriptJob = async (data) => {
  if (!transcriptQueue) {
    console.log('Transcript queue not available, skipping job');
    return null;
  }

  try {
    const job = await transcriptQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
    return job;
  } catch (error) {
    console.error('Failed to add transcript job:', error.message);
    return null;
  }
};

const processTranscriptJobs = () => {
  if (!transcriptQueue) {
    console.log('Transcript queue not available');
    return;
  }

  transcriptQueue.process(async (job) => {
    const { lessonId, videoUrl } = job.data;

    try {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }

      lesson.transcript.status = 'processing';
      await lesson.save();

      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockTranscript = `This is an auto-generated transcript for the lesson: ${lesson.title}. 
The video covers important concepts and provides detailed explanations. 
In this lesson, we explore the topic in depth with practical examples and real-world applications.`;

      lesson.transcript.text = mockTranscript;
      lesson.transcript.status = 'completed';
      await lesson.save();

      console.log(`Transcript generated for lesson ${lessonId}`);
    } catch (error) {
      console.error(`Transcript generation failed for lesson ${lessonId}:`, error);
      
      const lesson = await Lesson.findById(lessonId);
      if (lesson) {
        lesson.transcript.status = 'failed';
        await lesson.save();
      }
      
      throw error;
    }
  });

  console.log('Transcript worker is processing jobs');
};

module.exports = { initQueue, addTranscriptJob, processTranscriptJobs };
