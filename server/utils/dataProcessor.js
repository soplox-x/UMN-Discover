import axios from 'axios';
import pool from '../config/database.js';

const DEPARTMENTS_TO_FETCH = ['CSCI', 'MATH', 'EE', 'STAT', 'CHEM', 'PHYS', 'BIOL'];

class GradeDataProcessor {
  constructor() {
    this.processedData = new Map();
    this.lastProcessed = null;
  }
  async processAllData() {
    console.log('Refreshing course data from umn.lol API...');
    const courseMap = new Map();

    const fetchDepartmentData = async (deptAbbr) => {
      try {
        const response = await axios.get(`https://umn.lol/api/dept/${deptAbbr}`);
        if (response.data?.success) {
          const { distributions } = response.data.data;
          distributions.forEach(course => {
            const courseId = `${course.dept_abbr} ${course.course_num}`;
            if (!courseId || !course.total_grades) return;

            const courseData = {
              courseId,
              subject: course.dept_abbr,
              catalogNumber: course.course_num,
              description: course.class_desc,
              totalStudents: course.total_students,
              gradeDistribution: course.total_grades,
              instructors: [],
            };
            courseData.csvAverageGPA = this.calculateGPA(courseData.gradeDistribution, courseData.totalStudents);
            courseData.averageGPA = courseData.csvAverageGPA;

            courseMap.set(courseId, courseData);
          });
          console.log(`Successfully fetched ${distributions.length} courses for ${deptAbbr}.`);
        }
      } catch (error) {
        console.error(`Failed to fetch data for department ${deptAbbr}: ${error.message}`);
      }
    };

    await Promise.all(DEPARTMENTS_TO_FETCH.map(fetchDepartmentData));

    this.processedData = courseMap;
    this.lastProcessed = new Date();
    console.log(`API refresh complete. Total courses loaded: ${this.processedData.size}`);
    return this.processedData;
  }

  calculateGPA(gradeDistribution, totalStudents) {
    const gradePoints = {
      'A': 4.0, 'A-': 3.67, 'B+': 3.33, 'B': 3.0, 'B-': 2.67,
      'C+': 2.33, 'C': 2.0, 'C-': 1.67, 'D+': 1.33, 'D': 1.0, 'F': 0.0
    };

    let totalPoints = 0;
    let countedStudents = 0;

    Object.keys(gradeDistribution).forEach(grade => {
      if (gradePoints.hasOwnProperty(grade)) {
        const count = gradeDistribution[grade];
        totalPoints += gradePoints[grade] * count;
        countedStudents += count;
      }
    });

    return countedStudents > 0 ? (totalPoints / countedStudents).toFixed(2) : null;
  }

  async getCombinedRating(courseId) {
    try {
      const reviewsResult = await pool.query(`
        SELECT AVG(rating)::NUMERIC(3,2) as user_rating, COUNT(*) as review_count
        FROM reviews 
        WHERE review_type = 'course' AND target_id = $1
      `, [courseId]);

      const userRating = reviewsResult.rows[0]?.user_rating;
      const reviewCount = parseInt(reviewsResult.rows[0]?.review_count) || 0;
      const course = this.getCourse(courseId);
      const csvGPA = course?.csvAverageGPA;

      if (!userRating && !csvGPA) return null;
      if (!userRating) return csvGPA;
      if (!csvGPA) return parseFloat(userRating).toFixed(2);
      
      const normalizedUserRating = ((parseFloat(userRating) - 1) / 4) * 4;
      const csvWeight = Math.max(0.3, 1 / (1 + reviewCount * 0.1));
      const userWeight = 1 - csvWeight;

      const combinedRating = (parseFloat(csvGPA) * csvWeight) + (normalizedUserRating * userWeight);
      return combinedRating.toFixed(2);
    } catch (error) {
      console.error('Error calculating combined rating:', error);
      return null;
    }
  }

  async enrichWithUserReviews(courses) {
    try {
      for (const course of courses) {
        const combinedRating = await this.getCombinedRating(course.courseId);
        if (combinedRating) {
          course.averageGPA = combinedRating;
        }
      }
      return courses;
    } catch (error) {
      console.error('Error enriching with user reviews:', error);
      return courses;
    }
  }

  getCourse(courseId) {
    return this.processedData.get(courseId);
  }

  async searchCourses(query, filters = {}) {
    const results = [];
    const searchTerm = query.toLowerCase();
    this.processedData.forEach(course => {
      const matchesSearch =
        course.courseId.toLowerCase().includes(searchTerm) ||
        (course.description && course.description.toLowerCase().includes(searchTerm));

      if (matchesSearch) {
        results.push({
          courseId: course.courseId,
          subject: course.subject,
          catalogNumber: course.catalogNumber,
          description: course.description,
          totalStudents: course.totalStudents,
          averageGPA: course.averageGPA,
          instructors: course.instructors
        });
      }
    });
    const enrichedResults = await this.enrichWithUserReviews(results.slice(0, 50));
    return enrichedResults;
  }

  async getAllCourses() {
    const courses = Array.from(this.processedData.values()).map(course => ({
      courseId: course.courseId,
      subject: course.subject,
      catalogNumber: course.catalogNumber,
      description: course.description,
      totalStudents: course.totalStudents,
      averageGPA: course.averageGPA
    }));
    const enrichedCourses = await this.enrichWithUserReviews(courses);
    return enrichedCourses.sort((a, b) => a.courseId.localeCompare(b.courseId));
  }

  needsRefresh() {
    return !this.lastProcessed ||
      (Date.now() - this.lastProcessed.getTime()) > 24 * 60 * 60 * 1000;
  }
}

export default GradeDataProcessor;