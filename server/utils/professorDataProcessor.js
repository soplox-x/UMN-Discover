import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFESSOR_MAP_PATH = path.join(__dirname, '../../data/professor_map.json');
const MAX_PROFESSOR_ID = 8000;

class ProfessorDataProcessor {
    constructor() {
        this.professorCache = new Map();
        this.professorIndex = [];
        this.isUpdating = false;
    }
    initializeFromFile() {
        try {
            if (fs.existsSync(PROFESSOR_MAP_PATH)) {
                console.log(`[ProfessorDataProcessor] Loading initial professor map from ${PROFESSOR_MAP_PATH}...`);
                const mapContent = fs.readFileSync(PROFESSOR_MAP_PATH, 'utf-8');
                this.professorIndex = JSON.parse(mapContent);
                console.log(`[ProfessorDataProcessor] Loaded ${this.professorIndex.length} professors into index.`);
            } else {
                console.warn('[ProfessorDataProcessor] professor_map.json not found. Search will be empty until the first refresh completes.');
            }
        } catch (error) {
            console.error('[ProfessorDataProcessor] Error loading professor_map.json:', error.message);
        }
    }

    async refreshProfessorList() {
        if (this.isUpdating) {
            console.log('[ProfessorDataProcessor] Update already in progress. Skipping.');
            return;
        }

        console.log('[ProfessorDataProcessor] Starting background refresh of professor list...');
        this.isUpdating = true;
        const newProfessorList = []; 
        try {
            const fetchProfessor = async (id) => {
                try {
                    const response = await axios.get(`https://umn.lol/api/prof/${id}`, { timeout: 5000 });
                    if (response.data?.success) {
                        const { name, id } = response.data.data;
                        if (name && id) newProfessorList.push({ name, id });
                    }
                } catch (error) {
                    if (error.response?.status !== 404) console.error(`Error fetching ID ${id}: ${error.message}`);
                }
            };

            const batchSize = 25;
            for (let i = 1; i <= MAX_PROFESSOR_ID; i += batchSize) {
                const promises = [];
                for (let j = 0; j < batchSize && (i + j) <= MAX_PROFESSOR_ID; j++) {
                    promises.push(fetchProfessor(i + j));
                }
                await Promise.all(promises);
            }
            fs.writeFileSync(PROFESSOR_MAP_PATH, JSON.stringify(newProfessorList, null, 2));
            this.professorIndex = newProfessorList;

            console.log(`[ProfessorDataProcessor] Background refresh complete. Found ${this.professorIndex.length} professors.`);

        } catch (error) {
            console.error('[ProfessorDataProcessor] A critical error occurred during the background refresh:', error);
        } finally {
            this.isUpdating = false;
        }
    }
    async searchProfessors(query) {
        const searchTerm = query.toLowerCase();
        return this.professorIndex
            .filter(prof => prof.name.toLowerCase().includes(searchTerm))
            .slice(0, 50)
            .map(prof => ({
                professorId: prof.id,
                name: prof.name,
                description: "Professor"
            }));
    }
    async getProfessor(professorId) {
        if (this.professorCache.has(professorId)) {
            return this.professorCache.get(professorId);
        }
        try {
            const response = await axios.get(`https://umn.lol/api/prof/${professorId}`);
            if (!response.data?.success) return null;
            const apiData = response.data.data;
            const overallGradeDistribution = {};
            let overallTotalStudents = 0;
            for (const dist of apiData.distributions) {
                for (const count of Object.values(dist.grades)) {
                    overallTotalStudents += count;
                }
                Object.entries(dist.grades).forEach(([grade, count]) => {
                    overallGradeDistribution[grade] = (overallGradeDistribution[grade] || 0) + count;
                });
            }
            const professorData = {
                professorId: apiData.id,
                name: apiData.name,
                rmpScore: apiData.RMP_score,
                rmpLink: apiData.RMP_link,
                totalStudents: overallTotalStudents,
                gradeDistribution: overallGradeDistribution,
                averageGPA: this.calculateGPA(overallGradeDistribution),
                courses: apiData.distributions.map(d => ({ courseId: `${d.dept_abbr} ${d.course_num}` }))
            };
            this.professorCache.set(professorId, professorData);
            return professorData;
        } catch (error) {
            return null;
        }
    }

    calculateGPA(gradeDistribution) {
        const gradePoints = { 'A': 4.0, 'A-': 3.67, 'B+': 3.33, 'B': 3.0, 'B-': 2.67, 'C+': 2.33, 'C': 2.0, 'C-': 1.67, 'D+': 1.33, 'D': 1.0, 'F': 0.0 };
        let totalPoints = 0;
        let countedStudents = 0;
        for (const [grade, count] of Object.entries(gradeDistribution)) {
            if (gradePoints[grade] !== undefined) {
                totalPoints += gradePoints[grade] * count;
                countedStudents += count;
            }
        }
        return countedStudents > 0 ? (totalPoints / countedStudents).toFixed(2) : null;
    }
}
const professorDataProcessor = new ProfessorDataProcessor();
export default professorDataProcessor;