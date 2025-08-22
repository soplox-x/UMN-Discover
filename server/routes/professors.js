import express from 'express';
import processor from '../utils/professorDataProcessor.js';

const router = express.Router();

router.get('/professors', async (req, res) => {
    res.json({ success: true, data: [], total: 0 });
});

router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.status(400).json({ success: false, error: 'Search query must be at least 2 characters' });
        }
        const results = await processor.searchProfessors(q);
        res.json({ success: true, data: results, total: results.length });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Search failed' });
    }
});

router.get('/professor/:professorId', async (req, res) => {
    try {
        const { professorId } = req.params;
        const professor = await processor.getProfessor(professorId);
        if (!professor) {
            return res.status(404).json({ success: false, error: 'Professor not found' });
        }
        res.json({ success: true, data: professor });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch professor details' });
    }
});

router.get('/distribution/:professorId', async (req, res) => {
    try {
        const { professorId } = req.params;
        const professor = await processor.getProfessor(professorId);
        
        if (!professor) {
            return res.status(404).json({ success: false, error: 'Professor not found' });
        }

        const { gradeDistribution, totalStudents, averageGPA } = professor;
        const percentages = {};
        Object.keys(gradeDistribution).forEach(grade => {
            const studentCountForGrade = gradeDistribution[grade] || 0;
            if (totalStudents > 0) {
                 percentages[grade] = ((studentCountForGrade / totalStudents) * 100).toFixed(1);
            } else {
                 percentages[grade] = '0.0';
            }
        });

        res.json({
            success: true,
            data: {
                professorId,
                distribution: gradeDistribution,
                percentages,
                totalStudents,
                averageGPA
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch grade distribution' });
    }
});

export default router;