import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class professorDataProcessor {
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
                file.includes('cleaned_data') && file.endsWith('.csv') && !file.includes('combined')
            );

            let allData = [];

            for (const file of cleanedFiles) {
                const filePath = path.join(this.dataPath, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const data = this.parseCSV(content);
                allData = allData.concat(data);
            }

            const professorData = this.groupByProfessor(allData);
            this.processedData = professorData;
            this.lastProcessed = new Date();
            return professorData;
        } catch (error) {
            throw error;
        }

    }

    groupByProfessor(data) {
        const professorMap = new Map();

        data.forEach(row => {
            const professorId = row.HR_NAME;
            const grade = row.CRSE_GRADE_OFF;
            const count = parseInt(row.GRADE_HDCNT) || 0;
            const course = row.FULL_NAME;
            const description = row.DESCR;

            if (!professorId || !grade || count === 0) return;

            if (!professorMap.has(professorId)) {
                professorMap.set(professorId, {
                    professorId,
                    subject: row.SUBJECT,
                    catalogNumber: row.CATALOG_NBR,
                    description,
                    totalStudents: 0,
                    gradeDistribution: {},
                    courses: new Set()
                });
            }

            const professor = professorMap.get(professorId);
            professor.totalStudents += count;
            professor.gradeDistribution[grade] = (professor.gradeDistribution[grade] || 0) + count;
            professor.courses.add(course);
        });

        professorMap.forEach(professor => {
            professor.courses = Array.from(professor.courses);

            professor.gradePercentages = {};
            Object.keys(professor.gradeDistribution).forEach(grade => {
                professor.gradePercentages[grade] =
                    ((professor.gradeDistribution[grade] / professor.totalStudents) * 100).toFixed(1);
            });

            professor.averageGPA = this.calculateGPA(professor.gradeDistribution, professor.totalStudents);
        });

        return professorMap;
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

    getProfessor(professorId) {
        if (this.processedData.has(professorId)) return this.processedData.get(professorId);

        const match = Array.from(this.processedData.entries()).find(([key]) =>
            key.toLowerCase() === professorId.toLowerCase()
        );
        return match?.[1] || null;
    }

    searchProfessors(query, filters = {}) {
        try {
            const results = [];
            const searchTerm = query.toLowerCase();
            const { course } = filters;

            this.processedData.forEach(professor => {
                const matchesSearch =
                    professor.professorId.toLowerCase().includes(searchTerm) ||
                    professor.subject.toLowerCase().includes(searchTerm) ||
                    professor.description.toLowerCase().includes(searchTerm);

                if (!matchesSearch) return;

                let matchesFilters = true;

                if (course && !professor.courses.some(inst =>
                    inst.toLowerCase().includes(course.toLowerCase())
                )) {
                    matchesFilters = false;
                }

                if (matchesFilters) {
                    results.push({
                        professorId: professor.professorId,
                        subject: professor.subject,
                        catalogNumber: professor.catalogNumber,
                        description: professor.description,
                        totalStudents: professor.totalStudents,
                        averageGPA: professor.averageGPA,
                        courses: professor.courses
                    });
                }
            });
            return results.slice(0, 50);
        } catch (err) {
            throw err;
        }
    }

    getAllProfessors() {
        const professors = [];
        this.processedData.forEach(professor => {
            professors.push({
                professorId: professor.professorId,
                subject: professor.subject,
                catalogNumber: professor.catalogNumber,
                description: professor.description,
                totalStudents: professor.totalStudents,
                averageGPA: professor.averageGPA
            });
        });
        return professors.sort((a, b) => a.professorId.localeCompare(b.professorId));
    }

    needsRefresh() {
        return !this.lastProcessed ||
            (Date.now() - this.lastProcessed.getTime()) > 24 * 60 * 60 * 1000;
    }
}

export default professorDataProcessor;