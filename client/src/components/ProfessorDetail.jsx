import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartBar, FaGraduationCap, FaUsers, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ReviewSection from './ReviewSection';
import '../styles/ProfessorDetail.css';
import '../styles/ReviewSection.css';

const ProfessorDetail = ({ user }) => {
    const { professorId } = useParams();
    const navigate = useNavigate();
    const [professorData, setProfessorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfessorData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/professors/professor/${encodeURIComponent(professorId)}`);
                const result = await response.json();

                if (result.success) {
                    setProfessorData(result.data);
                } else {
                    setError(result.error || 'Professor not found');
                }
            } catch (err) {
                setError('Failed to load professor data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfessorData();
    }, [professorId]);

    const getGradeColor = (grade) => {
        const colors = { 'A': '#10b981', 'A-': '#34d399', 'B+': '#60a5fa', 'B': '#3b82f6', 'B-': '#6366f1', 'C+': '#f59e0b', 'C': '#f97316', 'C-': '#ef4444', 'D+': '#dc2626', 'D': '#b91c1c', 'F': '#7f1d1d' };
        return colors[grade] || '#6b7280';
    };

    if (loading) {
        return (
            <div className="professor-detail-loading">
                <div className="loading-spinner"></div>
                <p>Loading professor data...</p>
            </div>
        );
    }

    if (error || !professorData) {
        return (
            <div className="professor-detail-error">
                <h2>Professor Not Found</h2>
                <p>{error || 'The requested professor could not be found.'}</p>
                <button onClick={() => navigate('/professors')} className="back-button">
                    <FaArrowLeft /> Back to Search
                </button>
            </div>
        );
    }
    
    const { gradeDistribution, totalStudents } = professorData;
    const percentages = {};
    Object.keys(gradeDistribution).forEach(grade => {
        percentages[grade] = totalStudents > 0 ? ((gradeDistribution[grade] / totalStudents) * 100).toFixed(1) : '0.0';
    });
    const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
    const maxPercentage = Math.max(...Object.values(percentages).map(p => parseFloat(p)), 0);

    return (
        <div className="professor-detail-page">
            <motion.div
                className="professor-detail"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <button onClick={() => navigate('/professors')} className="back-button">
                    <FaArrowLeft /> Back to Search
                </button>
                <div className="professor-title-section">
                    <h1 className="professor-title">{professorData.name}</h1>
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
                        <div className="stat-icon"><FaGraduationCap /></div>
                        <div className="stat-content">
                            <h3>{professorData.totalStudents?.toLocaleString() || 'N/A'}</h3>
                            <p>Total Students Taught</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><FaChartBar /></div>
                        <div className="stat-content">
                            <h3>{professorData.averageGPA || 'N/A'}</h3>
                            <p>Average GPA</p>
                        </div>
                    </div>
                    <a href={professorData.rmpLink} target="_blank" rel="noopener noreferrer" className="stat-card rmp-link">
                        <div className="stat-icon"><FaStar /></div>
                        <div className="stat-content">
                            <h3>{professorData.rmpScore || 'N/A'}</h3>
                            <p>Rate My Professors</p>
                        </div>
                    </a>
                    <div className="stat-card">
                        <div className="stat-icon"><FaUsers /></div>
                        <div className="stat-content">
                            <h3>{professorData.courses?.length || 0}</h3>
                            <p>Courses Taught</p>
                        </div>
                    </div>
                </motion.div>
                
                {totalStudents > 0 && (
                    <motion.div
                        className="grade-distribution-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <h2>Grade Distribution</h2>
                        <p>Historical grade breakdown across all courses taught</p>
                        <div className="grade-chart-container">
                            <div className="grade-chart">
                                {grades.map((grade) => {
                                    const percentage = parseFloat(percentages[grade] || 0);
                                    const count = gradeDistribution[grade] || 0;
                                    if (count === 0) return null;
                                    return (
                                        <div key={grade} className="grade-bar-container">
                                            <div className="grade-bar-wrapper">
                                                <div className="grade-bar" style={{
                                                        backgroundColor: getGradeColor(grade),
                                                        height: `${maxPercentage > 0 ? (percentage / maxPercentage) * 100 : 0}%`
                                                    }}
                                                />
                                                <div className="grade-info">
                                                    <span className="grade-letter">{grade}</span>
                                                    <span className="grade-percentage">{percentage}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    className="additional-info"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <div className="info-grid">
                        <div className="info-card">
                            <h3>Courses Taught</h3>
                            <div className="course-list">
                                {professorData.courses?.slice(0, 10).map((course, index) => (
                                    <span key={`${course.courseId}-${index}`} className="course-name">
                                        {course.courseId}
                                    </span>
                                ))}
                                {professorData.courses?.length > 10 && (
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
                targetName={professorData.name}
                user={user}
            />
        </div>
    );
};

export default ProfessorDetail;