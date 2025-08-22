import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaGraduationCap, FaChartBar, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/Professors.css';

const Stat = ({ icon, value, label }) => (
    <div className="stat-professors">
        {icon}
        {value !== undefined ? (
            <span>{label}{value}</span>
        ) : (
            <span className="stat-loading">...</span>
        )}
    </div>
);

const Professors = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.length >= 2) {
                searchProfessors();
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);
    useEffect(() => {
        if (searchResults.length === 0 || searchResults[0].totalStudents !== undefined) {
            return;
        }
        const fetchDetailsForResults = async () => {
            const detailPromises = searchResults.map(prof =>
                fetch(`/api/professors/professor/${prof.professorId}`).then(res => res.json())
            );
            const detailResults = await Promise.all(detailPromises);
            const updatedResults = searchResults.map(originalProf => {
                const detail = detailResults.find(d => d.success && d.data.professorId === originalProf.professorId);
                return detail ? { ...originalProf, ...detail.data } : originalProf;
            });

            setSearchResults(updatedResults);
        };
        fetchDetailsForResults();
    }, [searchResults]);

    const searchProfessors = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `/api/professors/search?q=${encodeURIComponent(searchQuery)}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setSearchResults(data.data);
            } else {
                setError(data.error);
                setSearchResults([]);
            }
        } catch (err) {
            setError('Failed to search professors');
        } finally {
            setLoading(false);
        }
    };

    const viewProfessorDetails = (professor) => {
        navigate(`/professor/${professor.professorId}`);
    };

    return (
        <div className="professors-search-page">
            <div className="search-hero-professors">
                <motion.div
                    className="hero-content-professors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1>Professor Explorer</h1>
                    <p>Want to know how other students rate your professor? You can find all information here.</p>
                </motion.div>
            </div>
            <div className="search-container-professors">
                <motion.div
                    className="search-input-container-professors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <FaSearch className="search-icon-professors" />
                    <input
                        type="text"
                        placeholder="Search professors (e.g., Nathan Taylor, Sungmin Park, Chris Dovolis...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input-professors"
                    />
                </motion.div>
                
                {loading && (
                    <motion.div className="loading-professors" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="loading-professors-spinner"></div>
                        <span>Searching...</span>
                    </motion.div>
                )}
                {error && (
                    <motion.div className="error-professors" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        {error}
                    </motion.div>
                )}
                {searchResults.length > 0 && (
                    <motion.div
                        className="search-results-professors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="results-header-professors">
                            <h3>Found {searchResults.length} professors</h3>
                        </div>
                        <div className="results-grid-professors">
                            {searchResults.map((professor, index) => (
                                <motion.div
                                    key={professor.professorId}
                                    className="professors-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    onClick={() => viewProfessorDetails(professor)}
                                >
                                    <div className="professors-header">
                                        <h4 className="professors-id">{professor.name}</h4>
                                        <FaArrowRight className="arrow-icon-professors" />
                                    </div>
                                    <div className="professors-stats">
                                        <Stat
                                            icon={<FaGraduationCap className="stat-icon-professors" />}
                                            value={professor.totalStudents?.toLocaleString()}
                                            label=""
                                        />
                                        <Stat
                                            icon={<FaChartBar className="stat-icon-professors" />}
                                            value={professor.averageGPA}
                                            label="Avg. GPA: "
                                        />
                                        <Stat
                                            icon={<FaStar className="stat-icon-professors" />}
                                            value={professor.rmpScore}
                                            label="RMP: "
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
                {searchQuery.length === 0 && (
                    <motion.div
                        className="search-suggestions-professors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <h3>Popular Searches</h3>
                        <div className="suggestion-tags-professors">
                            {['Nathan Taylor', 'Chris Dovolis','Jack Kolb', 'Bernardo Bianco'].map((suggestion, index) => (
                                <motion.button
                                    key={suggestion}
                                    className="suggestion-tag-professors"
                                    onClick={() => setSearchQuery(suggestion)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {suggestion}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Professors;