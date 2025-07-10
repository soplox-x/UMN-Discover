import express from 'express';
import ProfessorDataProcessor from '../utils/professorDataProcessor.js';

const router = express.Router();
const processor = new ProfessorDataProcessor();

let isProcessing = false;

const ensureDataLoaded = async () => {
    if (processor.needsRefresh() && !isProcessing) {
        isProcessing = true;
        try {
            await processor.processAllData();
        } catch (error) {
            console.error('Failed to process professor data:', error);
        } finally {
            isProcessing = false;
        }
    }
};

router.get('/professors', async (req, res) => {
    try {
        await ensureDataLoaded();
        const professors = processor.getAllProfessors();
        res.json({
            success: true,
            data: professors,
            total: professors.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch professors'
        });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { q, course } = req.query;
        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Search query must be at least 2 characters'
            });
        }

        await ensureDataLoaded();
        const results = processor.searchProfessors(q, { course });
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

router.get('/professor/:professorId', async (req, res) => {
    try {
        const { professorId } = req.params;
        await ensureDataLoaded();

        const professor = processor.getProfessor(professorId);
        if (!professor) {
            return res.status(404).json({
                success: false,
                error: 'Professor not found'
            });
        }

        res.json({
            success: true,
            data: professor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch professor details'
        });
    }
});

router.get('/distribution/:professorId', async (req, res) => {
    try {
        const { professorId } = req.params;

        await ensureDataLoaded();
        const professor = processor.getProfessor(professorId);

        if (!professor) {
            return res.status(404).json({
                success: false,
                error: 'Professor not found'
            });
        }

        const distribution = professor.gradeDistribution;
        const totalStudents = professor.totalStudents;

        const percentages = {};
        Object.keys(distribution).forEach(grade => {
            percentages[grade] = ((distribution[grade] / totalStudents) * 100).toFixed(1);
        });

        res.json({
            success: true,
            data: {
                professorId,
                distribution,
                percentages,
                totalStudents,
                averageGPA: professor.averageGPA
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