import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartBar, FaGraduationCap, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ReviewSection from './ReviewSection';
import '../styles/ProfessorDetail.css';
import '../styles/ReviewSection.css';

const ProfessorDetail = ({ user }) => {
    const { professorId } = useParams();
    const navigate = useNavigate();
    const [professorData, setProfessorData] = useState(null);
    const [gradeDistribution, setGradeDistribution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfessorData();
    },
        [professorId]);

    const fetchProfessorData = async () => {
        setLoading(true);
        setError(null);
        try {
            
            const [professorResponse, distributionResponse] = await Promise.all([
                fetch(`/api/professors/professor/${encodeURIComponent(professorId)}`),
                fetch(`/api/professors/distribution/${encodeURIComponent(professorId)}`)
            ]);
            const professorData = await professorResponse.json();
            const distributionData = await distributionResponse.json();
            if (professorData.success && distributionData.success) {
                setProfessorData(professorData.data);
                setGradeDistribution(distributionData.data);
                console.log("🧠 Fetching professor:", professorId);
                console.log("📦 professorResponse:", professorData);
                console.log("📊 distributionResponse:", distributionData);
            } else {
                setError('Course not found');
            }
        } catch (err) {
            setError('Failed to load course data');
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade) => {
        const colors = {
            'A': '#10b981',
            'A-': '#34d399',
            'B+': '#60a5fa',
            'B': '#3b82f6',
            'B-': '#6366f1',
            'C+': '#f59e0b',
            'C': '#f97316',
            'C-': '#ef4444',
            'D+': '#dc2626',
            'D': '#b91c1c',
            'F': '#7f1d1d'
        };
        return colors[grade] || '#6b7280';
    };

    const getGradeDescription = (grade) => {
        const descriptions = {
            'A': 'Excellent',
            'A-': 'Excellent',
            'B+': 'Good',
            'B': 'Good',
            'B-': 'Good',
            'C+': 'Satisfactory',
            'C': 'Satisfactory',
            'C-': 'Satisfactory',
            'D+': 'Poor',
            'D': 'Poor',
            'F': 'Failing'
        };
        return descriptions[grade] || '';
    };

    if (loading) {
        return (
            <div className="professor-detail-loading">
                <div className="loading-spinner"></div>
                <p>Loading professor data...</p>
            </div>
        );
    }
    if (!loading && !professorData) {
        return (
            <div className="professor-detail-error">
                <h2>Professor Not Found</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/professors')} className="back-button">
                    <FaArrowLeft /> Back to Search
                </button>
            </div>
        );
    }

    const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
    const maxPercentage = Math.max(...Object.values(gradeDistribution.percentages));

    return (
        <div className="professor-detail-page">
            <motion.div
                className="professor-detail "
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <button onClick={() => navigate('/professors')} className="back-button">
                    <FaArrowLeft /> Back to Search
                </button>
                <div className="professor-title-section">
                    <h1 className="professor-title">{professorData.professorId}</h1>
                    <p className="professor-description">{professorData.description}</p>
                </div>
            </motion.div>
            <div className="professor-content">
                <motion.div
                    className="professor-stats-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaGraduationCap />
                        </div>
                        <div className="stat-content">
                            <h3>{professorData.totalStudents.toLocaleString()}</h3>
                            <p>Total Students</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaChartBar />
                        </div>
                        <div className="stat-content">
                            <h3>{professorData.averageGPA || 'N/A'}</h3>
                            <p>Average GPA</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaUsers />
                        </div>
                        <div className="stat-content">
                            <h3>{professorData.courses.length}</h3>
                            <p>Courses</p>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    className="grade-distribution-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2>Grade Distribution</h2>
                    <p>Historical grade breakdown across all terms</p>
                    <div className="grade-chart-container">
                        <div className="grade-chart">
                            {grades.map((grade, index) => {
                                const percentage = parseFloat(gradeDistribution.percentages[grade] || 0);
                                const count = gradeDistribution.distribution[grade] || 0;
                                if (count === 0) return null;
                                return (
                                    <motion.div
                                        key={grade}
                                        className="grade-bar-container"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                                    >
                                        <div className="grade-bar-wrapper">
                                            <motion.div
                                                className="grade-bar"
                                                style={{
                                                    backgroundColor: getGradeColor(grade),
                                                    height: `${(percentage / maxPercentage) * 100}%`
                                                }}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(percentage / maxPercentage) * 100}%` }}
                                                transition={{ duration: 0.8, delay: 0.8 + (index * 0.1) }}
                                            />
                                            <div className="grade-info">
                                                <span className="grade-letter">{grade}</span>
                                                <span className="grade-percentage">{percentage}%</span>
                                                <span className="grade-count">({count})</span>
                                                <span className="grade-description">{getGradeDescription(grade)}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    className="additional-info"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <div className="info-grid">
                        <div className="info-card">
                            <h3>Courses</h3>
                            <div className="course-list">
                                {professorData.courses.slice(0, 10).map((course, index) => (
                                    <span key={course} className="course-name">{course}</span>
                                ))}
                                {professorData.courses.length > 10 && (
                                    <span className="course-more">+{professorData.courses.length - 10} more</span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            
            <ReviewSection 
                reviewType="professor"
                targetId={professorData.professorId}
                targetName={professorData.professorId}
                user={user}
            />
        </div>
    );
};

export default ProfessorDetail;