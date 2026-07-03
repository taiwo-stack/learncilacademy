import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const subjectsData = [
  // Math
  {
    id: 'math-elem',
    name: 'Elementary Math',
    category: 'Math',
    grades: ['K-5'],
    skills: ['Addition & Subtraction', 'Multiplication Tables', 'Fractions Intro', 'Word Problems'],
    description: 'Building strong number sense, core arithmetic, fractions, decimals, and basic geometric shapes.'
  },
  {
    id: 'math-prealg',
    name: 'Pre-Algebra',
    category: 'Math',
    grades: ['K-5', 'Middle School'],
    skills: ['Integers', 'Linear Equations', 'Ratios & Proportions', 'Exponents'],
    description: 'Transitioning from arithmetic to algebraic thinking with variables, proportions, and equations.'
  },
  {
    id: 'math-alg12',
    name: 'Algebra I & II',
    category: 'Math',
    grades: ['Middle School', 'High School'],
    skills: ['Polynomials', 'Quadratic Formulas', 'Factoring', 'Systems of Equations'],
    description: 'Solving complex equations, graphing functions, inequalities, logarithms, and quadratic relationships.'
  },
  {
    id: 'math-geom',
    name: 'Geometry',
    category: 'Math',
    grades: ['Middle School', 'High School'],
    skills: ['Coordinate Geometry', 'Congruence Proofs', 'Similarity', 'Trig Basics'],
    description: 'Exploring Euclidean geometry, shapes, similarity, proofs, and foundational trigonometry principles.'
  },
  {
    id: 'math-trig',
    name: 'Trigonometry',
    category: 'Math',
    grades: ['High School'],
    skills: ['Unit Circle', 'Trig Identities', 'Sine & Cosine Laws', 'Wave Graphs'],
    description: 'Comprehensive study of trigonometric functions, circular logic, laws of sines/cosines, and graphing waves.'
  },
  {
    id: 'math-calc',
    name: 'Calculus',
    category: 'Math',
    grades: ['High School'],
    skills: ['Limits', 'Derivatives', 'Integrals', 'AP Calculus prep'],
    description: 'Advanced math covering limits of functions, derivatives, integrals, and rate of change applications.'
  },

  // English & Reading
  {
    id: 'eng-phon',
    name: 'Phonics',
    category: 'English & Reading',
    grades: ['K-5'],
    skills: ['Letter Sounds', 'Vowel Blends', 'Sight Words', 'Early Reading'],
    description: 'Early childhood letter sounds, sight words recognition, and foundational reading confidence.'
  },
  {
    id: 'eng-comp',
    name: 'Reading Comprehension',
    category: 'English & Reading',
    grades: ['K-5', 'Middle School', 'High School'],
    skills: ['Text Analysis', 'Main Idea Finding', 'Inference Drawing', 'Vocabulary'],
    description: 'Decoding narratives, identifying themes, summaries, structural analysis, and vocabulary development.'
  },
  {
    id: 'eng-write',
    name: 'Creative Writing',
    category: 'English & Reading',
    grades: ['K-5', 'Middle School'],
    skills: ['Character Development', 'Plot Outlining', 'Dialogue Rules', 'Spelling'],
    description: 'Outlining short stories, narrative structuring, character planning, and vocabulary exploration.'
  },
  {
    id: 'eng-essay',
    name: 'Essay Writing',
    category: 'English & Reading',
    grades: ['Middle School', 'High School'],
    skills: ['Thesis Statements', 'MLA/APA Citation', 'Persuasive Structure', 'Editing'],
    description: 'Formulating thesis statements, outlining arguments, draft editing, and structuring essays.'
  },
  {
    id: 'eng-lit',
    name: 'Literature',
    category: 'English & Reading',
    grades: ['Middle School', 'High School'],
    skills: ['Classic Prose Analysis', 'Theme Tracking', 'Poetry Metrics', 'Motif Analysis'],
    description: 'Evaluating classic and modern literature, poetry interpretations, symbolic meanings, and character studies.'
  },

  // Science
  {
    id: 'sci-life',
    name: 'Life Science',
    category: 'Science',
    grades: ['K-5', 'Middle School'],
    skills: ['Cell Structures', 'Ecosystems', 'Food Chains', 'Plant Biology'],
    description: 'Basic introduction to life on earth, cell processes, classification of organisms, and ecosystems.'
  },
  {
    id: 'sci-bio',
    name: 'Biology',
    category: 'Science',
    grades: ['Middle School', 'High School'],
    skills: ['Genetics', 'Photosynthesis', 'Evolution', 'Human Anatomy'],
    description: 'Study of living organisms, DNA sequencing, genetic inheritance, ecology, and biological systems.'
  },
  {
    id: 'sci-chem',
    name: 'Chemistry',
    category: 'Science',
    grades: ['High School'],
    skills: ['Stoichiometry', 'Periodic Table', 'Chemical Bonding', 'Acid-Base Reactions'],
    description: 'Atomic structure, periodic table properties, stoichiometric balancing, chemical equations, and reactions.'
  },
  {
    id: 'sci-phys',
    name: 'Physics',
    category: 'Science',
    grades: ['High School'],
    skills: ['Mechanics & Forces', 'Electromagnetism', 'Wave Kinetics', 'Thermodynamics'],
    description: 'Study of matter, energy, kinematics, gravity forces, electric circuits, waves, and thermodynamics.'
  },
  {
    id: 'sci-earth',
    name: 'Earth Science',
    category: 'Science',
    grades: ['K-5', 'Middle School'],
    skills: ['Rock Cycle', 'Plate Tectonics', 'Weather & Climate', 'Solar Systems'],
    description: 'Discovering atmospheric changes, meteorological cycles, rock cycles, tectonic actions, and astronomy.'
  },

  // Test Prep
  {
    id: 'test-sat',
    name: 'SAT Prep',
    category: 'Test Prep',
    grades: ['High School'],
    skills: ['SAT Math Strategies', 'Reading Passages', 'Time Management', 'Practice Exams'],
    description: 'Mastering techniques for the SAT Math, Reading, and Writing sections with regular mock drills.'
  },
  {
    id: 'test-act',
    name: 'ACT Prep',
    category: 'Test Prep',
    grades: ['High School'],
    skills: ['ACT Science Reasoning', 'Time Drills', 'ACT English Grammar', 'Math Shortcodes'],
    description: 'Strategic preparation for the ACT English, Math, Reading, and Science reasoning sections.'
  },
  {
    id: 'test-state',
    name: 'State Assessments',
    category: 'Test Prep',
    grades: ['K-5', 'Middle School', 'High School'],
    skills: ['Curriculum Mapping', 'Test Anxiety Relief', 'Question Formats', 'Confidence'],
    description: 'Curriculum-aligned reinforcement to prepare students for standard state testing schedules.'
  },
  {
    id: 'test-jamb',
    name: 'JAMB Prep',
    category: 'Test Prep',
    grades: ['High School'],
    skills: ['Use of English', 'JAMB Past Questions', 'CBT Mock Drills', 'Subject Strategy'],
    description: 'Comprehensive Computer-Based Test (CBT) preparation for JAMB UTME candidates, covering key subjects and speed techniques.'
  },
  {
    id: 'test-waec',
    name: 'WAEC Prep',
    category: 'Test Prep',
    grades: ['High School'],
    skills: ['Practical Prep', 'Theory Explanations', 'WAEC Syllabi', 'Past Questions'],
    description: 'Targeted tutoring aligned with the West African Examinations Council syllabus, focusing on essay scoring and practical exams.'
  },
  {
    id: 'test-neco',
    name: 'NECO Prep',
    category: 'Test Prep',
    grades: ['High School'],
    skills: ['NECO Exam Pattern', 'Practical Guidelines', 'Mock Assessments', 'Confidence'],
    description: 'Structured study plans and drills to excel in National Examinations Council (NECO) Senior School Certificate exams.'
  },
  {
    id: 'test-postutme',
    name: 'Post-UTME Prep',
    category: 'Test Prep',
    grades: ['High School'],
    skills: ['University Past Questions', 'Aptitude Tests', 'Speed Math', 'General Paper'],
    description: 'Custom preparation for university screening tests, focusing on institutional specific past questions and aptitude skills.'
  },

  // Coding & Tech
  {
    id: 'tech-scratch',
    name: 'Intro to Coding',
    category: 'Coding & Tech',
    grades: ['K-5', 'Middle School'],
    skills: ['Scratch block logic', 'Sequencing', 'Loops intro', 'Conditionals'],
    description: 'Fundamental programming principles taught via game and animation builder tools.'
  },
  {
    id: 'tech-csfund',
    name: 'Computer Science Fundamentals',
    category: 'Coding & Tech',
    grades: ['Middle School', 'High School'],
    skills: ['Python / JS syntax', 'Algorithm Design', 'Data structures', 'Git basics'],
    description: 'Introduction to text-based coding in Python/JS, clean coding concepts, and early algorithms.'
  }
];

export default function SubjectsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);

  // Check if search query was passed via navigation state (e.g. from header dropdown filter)
  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.state) {
      if (location.state.initialCategory) {
        setSelectedCategories([location.state.initialCategory]);
      }
      if (location.state.initialGrade) {
        setSelectedGrades([location.state.initialGrade]);
      }
    }
  }, [location.state]);

  // Handle category checkbox selection
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // Handle grade checkbox selection
  const handleGradeChange = (grade) => {
    setSelectedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade) 
        : [...prev, grade]
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedGrades([]);
  };

  // Filtered list computed dynamically
  const filteredSubjects = subjectsData.filter(subject => {
    const matchesSearch = 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategories.length === 0 || 
      selectedCategories.includes(subject.category);

    const matchesGrade = 
      selectedGrades.length === 0 || 
      subject.grades.some(g => selectedGrades.includes(g));

    return matchesSearch && matchesCategory && matchesGrade;
  });

  // Handle CTA redirection to LandingPage Booking Form
  const handleRequestTutor = (subjectName) => {
    navigate('/', { 
      state: { 
        openBooking: true, 
        selectedSubject: subjectName 
      } 
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#081730',
      color: 'white',
      paddingTop: '8rem',
      paddingBottom: '5rem',
      position: 'relative'
    }}>
      {/* Background Swoop overlays matching LandingPage */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '400px',
        background: 'linear-gradient(180deg, rgba(242, 122, 36, 0.05) 0%, rgba(8, 23, 48, 0) 100%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{
            background: 'rgba(242, 122, 36, 0.15)',
            color: 'var(--accent-color)',
            padding: '0.4rem 1.1rem',
            borderRadius: '50px',
            fontSize: '0.82rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            display: 'inline-block',
            marginBottom: '1rem',
            border: '1.5px solid rgba(242, 122, 36, 0.25)'
          }}>
            Explore Study Paths
          </span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3rem',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '1.25rem'
          }}>
            Our Academic Subjects
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '1.15rem',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Filter, search, and discover learning map details across all K–12 grade levels and STEM categories.
          </p>
        </div>

        {/* Filter & Listing Layout Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '3rem',
          alignItems: 'start'
        }} className="subjects-grid-layout">
          
          {/* Advanced Filter Panel (Sidebar) */}
          <div style={{
            background: 'rgba(11, 22, 44, 0.8)',
            border: '1.5px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '2rem 1.75rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            position: 'sticky',
            top: '7.5rem'
          }} className="filter-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'white' }}>Filters</h3>
              <button 
                onClick={handleResetFilters}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-color)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                Clear All
              </button>
            </div>

            {/* Filter Section: Search */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.75rem' }}>Search Subjects</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="e.g. Algebra, Scratch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 2.2rem 0.8rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Filter Section: Categories */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.8rem' }}>Categories</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {['Math', 'English & Reading', 'Science', 'Test Prep', 'Coding & Tech'].map(category => {
                  const isChecked = selectedCategories.includes(category);
                  return (
                    <label key={category} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.92rem', color: isChecked ? 'white' : 'rgba(255, 255, 255, 0.8)' }}>
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryChange(category)}
                        style={{
                          accentColor: 'var(--accent-color)',
                          cursor: 'pointer',
                          width: '16px',
                          height: '16px'
                        }}
                      />
                      {category}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter Section: Grades */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.8rem' }}>Grade Level</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {['K-5', 'Middle School', 'High School'].map(grade => {
                  const isChecked = selectedGrades.includes(grade);
                  return (
                    <label key={grade} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.92rem', color: isChecked ? 'white' : 'rgba(255, 255, 255, 0.8)' }}>
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleGradeChange(grade)}
                        style={{
                          accentColor: 'var(--accent-color)',
                          cursor: 'pointer',
                          width: '16px',
                          height: '16px'
                        }}
                      />
                      {grade === 'K-5' ? 'Early Learners (K-5)' : grade}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subject Cards Results List */}
          <div style={{ width: '100%' }}>
            {/* Results Count Banner */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              <div>Showing {filteredSubjects.length} subjects found</div>
              {(selectedCategories.length > 0 || selectedGrades.length > 0 || searchQuery) && (
                <div style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.5)' }}>Active filters apply</div>
              )}
            </div>

            {/* Grid display */}
            {filteredSubjects.length === 0 ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1.5px dashed rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '4rem 2rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ color: 'white', fontSize: '1.3rem', margin: '0 0 0.5rem 0' }}>No Matching Subjects</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
                  We couldn't find any subjects matching your search filters. Try adjusting your checkboxes or query.
                </p>
                <button 
                  onClick={handleResetFilters}
                  style={{
                    padding: '0.6rem 1.8rem',
                    background: 'var(--accent-color)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2rem'
              }} className="subjects-grid">
                {filteredSubjects.map(subj => (
                  <div 
                    key={subj.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1.5px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '24px',
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    className="subject-detail-card"
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.borderColor = 'rgba(242, 122, 36, 0.4)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    }}
                  >
                    <div>
                      {/* Badge bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <span style={{
                          background: 'rgba(242, 122, 36, 0.15)',
                          color: 'var(--accent-color)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '50px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {subj.category}
                        </span>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {subj.grades.map(g => (
                            <span 
                              key={g} 
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: 'rgba(255, 255, 255, 0.8)',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '600'
                              }}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 style={{
                        color: 'white',
                        fontSize: '1.3rem',
                        fontWeight: '800',
                        margin: '0 0 0.8rem 0',
                        fontFamily: 'var(--font-heading)'
                      }}>
                        {subj.name}
                      </h3>

                      {/* Description */}
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.88rem',
                        lineHeight: '1.6',
                        margin: '0 0 1.5rem 0',
                        minHeight: '4.8rem'
                      }}>
                        {subj.description}
                      </p>

                      {/* Skills Tags */}
                      <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255, 255, 255, 0.45)', marginBottom: '0.6rem' }}>Key Topics:</div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {subj.skills.map(s => (
                            <span 
                              key={s} 
                              style={{
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                color: 'rgba(255, 255, 255, 0.72)',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleRequestTutor(subj.name)}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        background: 'transparent',
                        border: '2.5px solid var(--accent-color)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--accent-color)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(242, 122, 36, 0.2)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Request a Tutor
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
