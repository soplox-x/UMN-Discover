import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaChartBar, FaGraduationCap, FaArrowRight, FaFilter, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/GradeSearch.css';

const GradeSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [availableInstructors, setAvailableInstructors] = useState([]);
  const navigate = useNavigate();
  const filterEnabled = false; // i will disable filter for now

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchCourses();
      } else {
        setSearchResults([]);
        setAvailableInstructors([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedInstructor]);

  const searchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/grades/search?q=${encodeURIComponent(searchQuery)}`;
      if (selectedInstructor) url += `&instructor=${encodeURIComponent(selectedInstructor)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        
        const instructors = new Set();
        
        data.data.forEach(course => {
          if (course.instructors) course.instructors.forEach(instructor => instructors.add(instructor));
        });
        
        setAvailableInstructors(Array.from(instructors).sort());
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to search courses');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedInstructor('');
    setShowFilters(false);
  };

  const viewCourseDetails = (course) => {
    navigate(`/course/${encodeURIComponent(course.courseId)}`);
  };

  const hasActiveFilters = selectedInstructor;

  return (
    <div className="grade-search-page">
      <div className="search-hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Course Grade Explorer</h1>
          <p>Discover historical grade distributions for University of Minnesota courses</p>
        </motion.div>
      </div>
      <div className="search-container">
        <motion.div 
          className="search-input-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search courses (e.g., CSCI 1133, Computer Science, Calculus...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
            {filterEnabled && (
            <button 
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
            >
                <FaFilter />
                {hasActiveFilters && <span className="filter-indicator"></span>}
            </button>
            )}
        </motion.div>
        {filterEnabled && showFilters && (
            <motion.div 
                className="filters-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="filters-content">
                <div className="filter-group">
                    <label htmlFor="instructor-filter">Instructor</label>
                    <select
                    id="instructor-filter"
                    value={selectedInstructor}
                    onChange={(e) => setSelectedInstructor(e.target.value)}
                    className="filter-select"
                    >
                    <option value="">All Instructors</option>
                    {availableInstructors.slice(0, 50).map(instructor => (
                        <option key={instructor} value={instructor}>{instructor}</option>
                    ))}
                    </select>
                </div>
                {hasActiveFilters && (
                    <button className="clear-filters" onClick={clearFilters}>
                    <FaTimes /> Clear Filters
                    </button>
                )}
                </div>
            </motion.div>
        )}
        {loading && (
          <motion.div 
            className="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="loading-spinner"></div>
            <span>Searching courses...</span>
          </motion.div>
        )}
        {error && (
          <motion.div 
            className="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}
        {searchResults.length > 0 && (
          <motion.div
            className="search-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="results-header">
              <h3>Found {searchResults.length} courses</h3>
              <p>Click on any course to view detailed grade distribution</p>
              {hasActiveFilters && (
                <div className="active-filters">
                  {selectedInstructor && <span className="filter-tag">Instructor: {selectedInstructor}</span>}
                </div>
              )}
            </div>
            <div className="results-grid">
              {searchResults.map((course, index) => (
                <motion.div
                  key={course.courseId}
                  className="course-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => viewCourseDetails(course)}
                >
                  <div className="course-header">
                    <h4 className="course-id">{course.courseId}</h4>
                    <FaArrowRight className="arrow-icon" />
                  </div>
                  <p className="course-description">{course.description}</p>
                  <div className="course-stats">
                    <div className="stat">
                      <FaGraduationCap className="stat-icon" />
                      <span>{course.totalStudents.toLocaleString()} students</span>
                    </div>
                    {course.averageGPA && (
                      <div className="stat gpa">
                        <span className="gpa-label">Avg GPA:</span>
                        <span className="gpa-value">{course.averageGPA}</span>
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
            className="search-suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3>Popular Searches</h3>
            <div className="suggestion-tags">
              {['CSCI 1133', 'MATH 1271', 'CHEM 1015', 'PHYS 1301', 'BIOL 1009', 'ECON 1101'].map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  className="suggestion-tag"
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

export default GradeSearch;