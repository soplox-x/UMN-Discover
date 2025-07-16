import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaChartBar, FaGraduationCap, FaArrowRight, FaFilter, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/Professors.css'

const Professors = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCourse, setSelectedCourses] = useState('');
    const [availableCourses, setAvailableCourses] = useState([]);
    const navigate = useNavigate();
    const filterEnabled = true; // i will disable filter for now

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.length >= 2) {
                searchProfessors();
            } else {
                setSearchResults([]);
                setAvailableCourses([]);

            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedCourse]);
    const searchProfessors = async () => {
        setLoading(true);
        setError(null);

        try {
            let url = `http://localhost:3001/api/professors/search?q=${encodeURIComponent(searchQuery)}`;
            if (selectedCourse) url += `&course=${encodeURIComponent(selectedCourse)}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setSearchResults(data.data);

                const courses = new Set();

                data.data.forEach(professor => {
                    if (professor.courses) professor.courses.forEach(course => courses.add(course));
                });

                setAvailableCourses(Array.from(courses).sort());
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to search professor');
        } finally {
            setLoading(false);
        }
    };
    const clearFilters = () => {
        setSelectedCourses('');
        setShowFilters(false);
    };

    const viewProfessorDetails = (professor) => {
        navigate(`/professor/${encodeURIComponent(professor.professorId)}`);
    };

    const hasActiveFilters = selectedCourse;
    return (
        <div className="professors-search-page">
            <div className="search-hero-professors">
                <motion.div
                    className="hero-content-professors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1>Professors Explorer</h1>
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
                    {filterEnabled && (
                        <button
                            className={`filter-toggle-professors ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FaFilter />
                            {hasActiveFilters && <span className="filter-indicator-professors"></span>}
                        </button>
                    )}
                </motion.div>
                {filterEnabled && showFilters && (
                    <motion.div
                        className="filters-panel-professors"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="filters-content-professors">
                            <div className="filter-group-professors">
                                <label htmlFor="class-filter-professors">Class</label>
                                <select
                                    id="class-filter-professors"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourses(e.target.value)}
                                    className="filter-select-professors"
                                >
                                    <option value="">All Classes</option>
                                    {availableCourses.slice(0, 50).map(course => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>
                            </div>
                            {hasActiveFilters && (
                                <button className="clear-filters-professors" onClick={clearFilters}>
                                    <FaTimes /> Clear Filters
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
                {loading && (
                    <motion.div
                        className="loading-professors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="loading-professors-spinner"></div>
                        <span>Searching professors</span>
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        className="error-professors"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
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
                        <div className="results-header=professors">
                            <h3>Found {searchResults.length} professors</h3>
                            <p>Click on any professor to view detailed rate distribution</p>
                            {hasActiveFilters && (
                                <div className="active-filters-professors">
                                    {selectedCourse && <span className="filter-tag-professors">Class: {selectedCourse}</span>}
                                </div>
                            )}
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
                                        <h4 className="professors-id">{professor.professorId}</h4>
                                        <FaArrowRight className="arrow-icon-professors" />
                                    </div>
                                    <p className="proffessors-description">{professor.description}</p>
                                    <div className="professors-stats">
                                        <div className="stat-professors">
                                            <FaGraduationCap className="stat-icon-professors" />
                                            <span>{professor.totalStudents.toLocaleString()} students</span>
                                        </div>
                                        {professor.averageGPA && (
                                            <div className="stat.rating">
                                                <span className="rating-label">Rating:</span>
                                                <span className="rating-value">{professor.averageGPA}</span>
                                            </div>
                                        )}
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
                            {['Nathan Taylor', 'Sungmin Park', 'Chris Dovolis', 'Dan Orban', 'Jack Kolb', 'Bernardo Bianco'].map((suggestion, index) => (
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
}

export default Professors;