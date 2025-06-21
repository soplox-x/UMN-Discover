import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GradeDataProcessor {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data/class_data');
    this.processedData = new Map();
    this.lastProcessed = null;
  }

  parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }

    return data;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  async processAllData() {
    try {
      const files = fs.readdirSync(this.dataPath);
      const cleanedFiles = files.filter(file => 
        file.includes('cleaned_data.csv') && !file.includes('combined')
      );

      let allData = [];

      for (const file of cleanedFiles) {
        const filePath = path.join(this.dataPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = this.parseCSV(content);
        allData = allData.concat(data);
      }

      const courseData = this.groupByCourse(allData);
      this.processedData = courseData;
      this.lastProcessed = new Date();
      return courseData;
    } catch (error) {
      console.error('Error processing grade data:', error);
      throw error;
    }
  }

  groupByCourse(data) {
    const courseMap = new Map();

    data.forEach(row => {
      const courseId = row.FULL_NAME || `${row.SUBJECT} ${row.CATALOG_NBR}`;
      const grade = row.CRSE_GRADE_OFF;
      const count = parseInt(row.GRADE_HDCNT) || 0;
      const instructor = row.HR_NAME;
      const description = row.DESCR;

      if (!courseId || !grade || count === 0) return;

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseId,
          subject: row.SUBJECT,
          catalogNumber: row.CATALOG_NBR,
          description,
          totalStudents: 0,
          gradeDistribution: {},
          instructors: new Set()
        });
      }

      const course = courseMap.get(courseId);
      course.totalStudents += count;
      course.gradeDistribution[grade] = (course.gradeDistribution[grade] || 0) + count;
      course.instructors.add(instructor);
    });

    courseMap.forEach(course => {
      course.instructors = Array.from(course.instructors);
      
      course.gradePercentages = {};
      Object.keys(course.gradeDistribution).forEach(grade => {
        course.gradePercentages[grade] = 
          ((course.gradeDistribution[grade] / course.totalStudents) * 100).toFixed(1);
      });

      course.averageGPA = this.calculateGPA(course.gradeDistribution, course.totalStudents);
    });

    return courseMap;
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

  getCourse(courseId) {
    return this.processedData.get(courseId);
  }

  searchCourses(query, filters = {}) {
    const results = [];
    const searchTerm = query.toLowerCase();
    const { instructor } = filters;

    this.processedData.forEach(course => {
      const matchesSearch = 
        course.courseId.toLowerCase().includes(searchTerm) ||
        course.subject.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm);

      if (!matchesSearch) return;

      let matchesFilters = true;

      if (instructor && !course.instructors.some(inst => 
        inst.toLowerCase().includes(instructor.toLowerCase())
      )) {
        matchesFilters = false;
      }

      if (matchesFilters) {
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

    return results.slice(0, 50);
  }

  getAllCourses() {
    const courses = [];
    this.processedData.forEach(course => {
      courses.push({
        courseId: course.courseId,
        subject: course.subject,
        catalogNumber: course.catalogNumber,
        description: course.description,
        totalStudents: course.totalStudents,
        averageGPA: course.averageGPA
      });
    });
    return courses.sort((a, b) => a.courseId.localeCompare(b.courseId));
  }

  needsRefresh() {
    return !this.lastProcessed || 
           (Date.now() - this.lastProcessed.getTime()) > 24 * 60 * 60 * 1000;
  }
}

export default GradeDataProcessor;