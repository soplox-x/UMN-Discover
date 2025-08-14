import express from 'express';
import GradeDataProcessor from '../utils/dataProcessor.js';

const router = express.Router();
const processor = new GradeDataProcessor();

let isProcessing = false;

const ensureDataLoaded = async () => {
  if (processor.needsRefresh() && !isProcessing) {
    isProcessing = true;
    try {
      await processor.processAllData();
    } catch (error) {
      console.error('Failed to process grade data:', error);
    } finally {
      isProcessing = false;
    }
  }
};

router.get('/courses', async (req, res) => {
  try {
    await ensureDataLoaded();
    const courses = await processor.getAllCourses();
    res.json({
      success: true,
      data: courses,
      total: courses.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, instructor } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    await ensureDataLoaded();
    const results = await processor.searchCourses(q, { instructor });
    res.json({
      success: true,
      data: results,
      total: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    await ensureDataLoaded();
    
    const course = processor.getCourse(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course details'
    });
  }
});

router.get('/distribution/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    await ensureDataLoaded();
    const course = processor.getCourse(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const distribution = course.gradeDistribution;
    const totalStudents = course.totalStudents;

    const percentages = {};
    Object.keys(distribution).forEach(grade => {
      percentages[grade] = ((distribution[grade] / totalStudents) * 100).toFixed(1);
    });

    res.json({
      success: true,
      data: {
        courseId,
        distribution,
        percentages,
        totalStudents,
        averageGPA: course.averageGPA
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch grade distribution'
    });
  }
});

export default router;