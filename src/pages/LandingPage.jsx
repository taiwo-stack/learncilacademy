import React, { useState, useEffect, useRef } from 'react';
import {
  getTutors,
  getCourses,
  registerStudent,
  createBooking,
  createContactMessage
} from '../services/dataService';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  BookOpen,
  Calendar,
  GraduationCap,
  User,
  Sparkles,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import '../styles/LandingPage.css';

const getSpecialClassImage = (title, index) => {
  const lowercaseTitle = title.toLowerCase();
  if (lowercaseTitle.includes('programming') || lowercaseTitle.includes('code') || lowercaseTitle.includes('python') || lowercaseTitle.includes('java')) {
    return '/images/book4.jpg';
  }
  if (lowercaseTitle.includes('ai') || lowercaseTitle.includes('intelligence') || lowercaseTitle.includes('artificial')) {
    return '/images/ai.jpg';
  }
  if (lowercaseTitle.includes('science') || lowercaseTitle.includes('data')) {
    return '/images/student5.jpg';
  }
  if (lowercaseTitle.includes('excel') || lowercaseTitle.includes('word') || lowercaseTitle.includes('microsoft') || lowercaseTitle.includes('office')) {
    return '/images/student6.jpg';
  }
  if (lowercaseTitle.includes('web') || lowercaseTitle.includes('design') || lowercaseTitle.includes('html')) {
    return '/images/student10.jpg';
  }
  if (lowercaseTitle.includes('writing') || lowercaseTitle.includes('creative') || lowercaseTitle.includes('essay')) {
    return '/images/student3.jpg';
  }

  const images = [
    '/images/book4.jpg',
    '/images/ai.jpg',
    '/images/student5.jpg',
    '/images/student6.jpg',
    '/images/student10.jpg',
    '/images/student3.jpg'
  ];
  return images[index % images.length];
};

const allTimeZones = (() => {
  try {
    if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
      return Intl.supportedValuesOf('timeZone');
    }
  } catch (e) {
    console.warn('Intl.supportedValuesOf not supported in this environment');
  }
  return [
    'Africa/Lagos',
    'Africa/Cairo',
    'Africa/Johannesburg',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Europe/London',
    'Europe/Paris',
    'Europe/Moscow',
    'UTC'
  ];
})();

const tzOptions = allTimeZones.map(tz => {
  try {
    const date = new Date();
    // Offset format: "GMT+1"
    const offsetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });
    const offsetParts = offsetFormatter.formatToParts(date);
    const offsetVal = offsetParts.find(p => p.type === 'timeZoneName')?.value || '';

    // Abbreviation format: "WAT"
    const abbrFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    });
    const abbrParts = abbrFormatter.formatToParts(date);
    const abbrVal = abbrParts.find(p => p.type === 'timeZoneName')?.value || '';

    let label = tz.replace(/_/g, ' ');
    if (abbrVal && offsetVal) {
      if (abbrVal !== offsetVal) {
        label = `${label} (${abbrVal}, ${offsetVal})`;
      } else {
        label = `${label} (${offsetVal})`;
      }
    } else if (offsetVal) {
      label = `${label} (${offsetVal})`;
    }
    return { value: tz, label };
  } catch (e) {
    return { value: tz, label: tz.replace(/_/g, ' ') };
  }
});

export default function LandingPage() {
  const [tutors, setTutors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingTutors, setLoadingTutors] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Forms success states
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Tab State: 'registration' | 'booking' | 'calendar'
  const [activeTab, setActiveTab] = useState('registration');
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  // Audit UI & UX state additions
  const [selectedTutorBio, setSelectedTutorBio] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({
    grade: '',
    struggleSubject: '',
    goal: '',
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  });
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [showStickyBtn, setShowStickyBtn] = useState(false);

  // Dynamic Scroll Monitor & SEO JSON-LD injection
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBtn(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);

    // Schema injection
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does 1-on-1 tutoring work at FoundaXia?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Each student is matched with a dedicated tutor based on their grade level, subject needs, and learning style. Sessions are conducted online via live video and your child gets undivided personal attention."
          }
        },
        {
          "@type": "Question",
          "name": "What age groups and grades do you cover?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We support students from Primary 1 through Secondary 6 (SS3), covering core subjects like Mathematics, English, Sciences, and specialized programs like coding and creative writing."
          }
        },
        {
          "@type": "Question",
          "name": "How do I enroll my child?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Simply fill in the Quick Register form at the top of this page. After your registration, our admin team will review your information, assign your child to a suitable tutor, and set up their learning account within 24 hours."
          }
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(script);
    };
  }, []);

  // Multi-step form state
  const [regStep, setRegStep] = useState(1);
  const [studentForm, setStudentForm] = useState({
    studentName: '',
    dateOfBirth: '',
    gender: '',
    gradeLevel: '',
    previousSchool: '',
    specialNeeds: '',
    parentName: '',
    relationship: '',
    primaryPhone: '',
    email: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    program: '',
    schedule: '',
    startDate: '',
    comments: ''
  });

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    bookingStudentName: '',
    bookingParentName: '',
    bookingPhone: '',
    bookingEmail: '',
    meetingType: 'virtual', // Default to virtual
    bookingDate: '',
    bookingTime: '',
    bookingMessage: '',
    bookingTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos'
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactSubject: '',
    contactMessage: ''
  });

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [selectedCalendarTime, setSelectedCalendarTime] = useState('');
  const [bookedDates, setBookedDates] = useState({}); // Date-string -> boolean

  // Timezone searchable dropdown state
  const [tzSearch, setTzSearch] = useState('');
  const [tzOpen, setTzOpen] = useState(false);
  const tzDropdownRef = useRef(null);

  // Close timezone dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (tzDropdownRef.current && !tzDropdownRef.current.contains(e.target)) {
        setTzOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll wrappers
  const teachersScrollRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [tutorData, courseData] = await Promise.all([
          getTutors(),
          getCourses()
        ]);
        setTutors(tutorData);
        setCourses(courseData);

        // Randomly pre-fill some booked days for the calendar demo
        const tempBooked = {};
        const today = new Date();
        for (let i = 1; i <= 30; i++) {
          const checkDate = new Date(today.getFullYear(), today.getMonth(), i);
          if (Math.random() > 0.75) {
            tempBooked[checkDate.toDateString()] = true;
          }
        }
        setBookedDates(tempBooked);
      } catch (err) {
        console.error('Failed to load public page data:', err);
      } finally {
        setLoadingTutors(false);
        setLoadingCourses(false);
      }
    }
    loadData();
  }, []);

  // Scroll teachers grid
  const scrollTeachers = (direction) => {
    if (teachersScrollRef.current) {
      const scrollAmount = 300;
      teachersScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Student Registration Form Handlers
  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setStudentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    // Basic validation for step 1 & 2
    let requiredFields = [];
    if (regStep === 1) {
      requiredFields = ['studentName', 'dateOfBirth', 'gender', 'gradeLevel'];
    } else if (regStep === 2) {
      requiredFields = ['parentName', 'relationship', 'primaryPhone', 'email', 'address', 'emergencyName', 'emergencyPhone'];
    }

    const missing = requiredFields.filter(f => !studentForm[f].trim());
    if (missing.length > 0) {
      alert('Please fill in all required fields before proceeding.');
      return;
    }
    setRegStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setRegStep(prev => Math.max(prev - 1, 1));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        full_name: studentForm.studentName,
        date_of_birth: studentForm.dateOfBirth,
        gender: studentForm.gender,
        grade_level: studentForm.gradeLevel,
        previous_school: studentForm.previousSchool,
        special_needs: studentForm.specialNeeds,
        program: studentForm.program,
        schedule: studentForm.schedule,
        start_date: studentForm.startDate,
        additional_comments: studentForm.comments,
        // parent info will map to profiles / metadata
        parentName: studentForm.parentName,
        relationship: studentForm.relationship,
        email: studentForm.email,
        phone: studentForm.primaryPhone
      };
      await registerStudent(dataToSave);
      setRegisterSuccess(true);
      setStudentForm({
        studentName: '', dateOfBirth: '', gender: '', gradeLevel: '', previousSchool: '', specialNeeds: '',
        parentName: '', relationship: '', primaryPhone: '', email: '', address: '', emergencyName: '', emergencyPhone: '',
        program: '', schedule: '', startDate: '', comments: ''
      });
      setRegStep(1);
      setTimeout(() => setRegisterSuccess(false), 5000);
    } catch (err) {
      alert('Error during registration: ' + err.message);
    }
  };

  // Assessment Quiz Handlers
  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizAnswers(prev => ({ ...prev, [name]: value }));
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        full_name: quizAnswers.parentName + "'s Child",
        date_of_birth: new Date().toISOString().split('T')[0],
        gender: 'other',
        grade_level: quizAnswers.grade,
        previous_school: 'None',
        special_needs: quizAnswers.struggleSubject,
        program: quizAnswers.goal,
        schedule: 'Flexible (Discuss with tutor)',
        start_date: new Date().toISOString().split('T')[0],
        additional_comments: `[Submitted via 1-Min Learning Assessment]\nPrimary Struggle: ${quizAnswers.struggleSubject}\nGoal: ${quizAnswers.goal}`,
        parentName: quizAnswers.parentName,
        relationship: 'guardian',
        email: quizAnswers.parentEmail,
        phone: quizAnswers.parentPhone
      };
      await registerStudent(dataToSave);
      setQuizSuccess(true);
    } catch (err) {
      console.error('Quiz submission error:', err);
      alert('Error submitting assessment. Please try again.');
    }
  };

  // Booking Form Handlers
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        tutor_id: null,
        tutor_name: 'Unassigned',
        student_name: bookingForm.bookingStudentName,
        parent_name: bookingForm.bookingParentName,
        phone: bookingForm.bookingPhone,
        email: bookingForm.bookingEmail,
        meeting_type: bookingForm.meetingType,
        booking_date: bookingForm.bookingDate,
        booking_time: bookingForm.bookingTime,
        timezone: bookingForm.bookingTimezone,
        message: bookingForm.bookingMessage
      };
      await createBooking(bookingData);
      setBookingSuccess(true);
      setBookingForm({
        bookingStudentName: '',
        bookingParentName: '',
        bookingPhone: '',
        bookingEmail: '',
        meetingType: 'virtual',
        bookingDate: '',
        bookingTime: '',
        bookingMessage: '',
        bookingTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos'
      });
      setTimeout(() => setBookingSuccess(false), 5000);
    } catch (err) {
      alert('Error scheduling booking: ' + err.message);
    }
  };

  // Contact Form Handlers
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await createContactMessage({
        name: contactForm.contactName,
        email: contactForm.contactEmail,
        phone: contactForm.contactPhone,
        subject: contactForm.contactSubject,
        message: contactForm.contactMessage
      });
      setContactSuccess(true);
      setContactForm({
        contactName: '', contactEmail: '', contactPhone: '', contactSubject: '', contactMessage: ''
      });
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err) {
      alert('Error sending message: ' + err.message);
    }
  };

  // Calendar Helper Functions
  const changeMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
      return newDate;
    });
    setSelectedCalendarDate(null);
    setSelectedCalendarTime('');
  };

  const selectCalendarDate = (day) => {
    const newSel = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedCalendarDate(newSel);
    setSelectedCalendarTime('');
  };

  const confirmCalendarSelection = () => {
    if (!selectedCalendarDate || !selectedCalendarTime) return;
    // Format date as YYYY-MM-DD
    const yyyy = selectedCalendarDate.getFullYear();
    const mm = String(selectedCalendarDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedCalendarDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Switch to booking form and prefill
    setBookingForm(prev => ({
      ...prev,
      bookingDate: dateStr,
      bookingTime: selectedCalendarTime
    }));
    setActiveTab('booking');

    // Scroll to the registration/booking block
    const registerSection = document.getElementById('register');
    if (registerSection) {
      registerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate calendar days
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const today = new Date();

    const calendarCells = [];

    // Day Headers
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Blank padding before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      calendarCells.push(
        <div key={`empty-${i}`} className="calendar-day other-month"></div>
      );
    }

    // Add month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      const isToday = cellDate.toDateString() === today.toDateString();
      const isBooked = bookedDates[cellDate.toDateString()] === true;
      const isSelected = selectedCalendarDate && cellDate.toDateString() === selectedCalendarDate.toDateString();

      let dayClass = 'calendar-day';
      if (isSelected) dayClass += ' selected';
      else if (isToday) dayClass += ' current-day';
      else if (isBooked) dayClass += ' booked';
      else dayClass += ' available';

      calendarCells.push(
        <div
          key={`day-${d}`}
          className={dayClass}
          onClick={() => !isBooked && selectCalendarDate(d)}
        >
          {d}
        </div>
      );
    }

    return { daysOfWeek, calendarCells };
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarData = renderCalendar();

  const mockTimeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM'
  ];

  return (
    <>
      {/* ── Sticky Floating CTA (outside .fade-in to avoid transform stacking context breaking position:fixed) ── */}
      {showStickyBtn && (
        <div
          id="sticky-cta-panel"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            animation: 'fadeInUp 0.35s ease'
          }}
        >
          <button
            id="sticky-enroll-btn"
            onClick={() => {
              setActiveTab('registration');
              const el = document.getElementById('register');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              background: 'var(--accent-color)', color: 'white', border: 'none',
              borderRadius: '50px', padding: '0.7rem 1.4rem', fontWeight: '700',
              fontSize: '0.88rem', cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.28)',
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.28)'; }}
          >
            🎓 Enroll Your Child
          </button>
          <button
            id="sticky-register-btn"
            onClick={() => {
              setActiveTab('registration');
              const el = document.getElementById('register');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              background: 'var(--primary-color)', color: 'white', border: 'none',
              borderRadius: '50px', padding: '0.7rem 1.4rem', fontWeight: '700',
              fontSize: '0.88rem', cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.22)'; }}
          >
            ✏️ Quick Register
          </button>
        </div>
      )}

      {/* ── Tutor Bio Modal (outside .fade-in to avoid transform stacking context) ── */}
      {selectedTutorBio && (
        <div
          id="tutor-bio-overlay"
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(10, 30, 60, 0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}
          onClick={e => { if (e.target.id === 'tutor-bio-overlay') setSelectedTutorBio(null); }}
        >
          <div style={{
            background: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px',
            padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative'
          }}>
            <button
              onClick={() => setSelectedTutorBio(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: '#edf2f7', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem',
                color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              aria-label="Close"
            >✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <img
                src={selectedTutorBio.avatar_url || '/images/student3.jpg'}
                alt={selectedTutorBio.full_name}
                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }}
                onError={e => { e.target.src = '/images/student3.jpg'; }}
              />
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.1rem' }}>{selectedTutorBio.full_name}</h3>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--accent-color)', fontWeight: '600', fontSize: '0.85rem' }}>{selectedTutorBio.subject} Specialist</p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  background: '#e6f4ea', color: '#1e7e34', borderRadius: '50px',
                  padding: '0.15rem 0.6rem', fontSize: '0.7rem', fontWeight: '700', marginTop: '0.3rem'
                }}>✓ Verified Tutor</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {selectedTutorBio.experience && (
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem', color: '#4a5568' }}>
                  <span>📅</span><span><strong>Experience:</strong> {selectedTutorBio.experience}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem', color: '#4a5568' }}>
                <span>🎓</span><span><strong>Speciality:</strong> {selectedTutorBio.subject}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.88rem', color: '#4a5568' }}>
                <span>✅</span><span>Background-checked &amp; certified by FoundaXia</span>
              </div>
              {selectedTutorBio.bio && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: '#4a5568', lineHeight: 1.7, borderTop: '1px solid #edf2f7', paddingTop: '0.75rem' }}>
                  {selectedTutorBio.bio}
                </p>
              )}
            </div>
            {/* Informational badge showing tutor is not booked directly */}
            <div style={{
              marginTop: '1.25rem',
              padding: '0.8rem 1rem',
              background: '#f7fafc',
              border: '1px dashed #cbd5e0',
              borderRadius: '12px',
              fontSize: '0.78rem',
              color: '#4a5568',
              textAlign: 'center',
              lineHeight: '1.4',
              fontWeight: '500'
            }}>
              💡 Tutors are assigned automatically by administrators based on your child's specific academic goals and grade level.
            </div>

            {/* Back button */}
            <button
              onClick={() => setSelectedTutorBio(null)}
              style={{
                width: '100%', marginTop: '1rem', background: 'var(--primary-color)', color: 'white',
                border: 'none', borderRadius: '10px', padding: '0.8rem', fontWeight: '700',
                cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#13366b'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-color)'}
            >Close Profile</button>
          </div>
        </div>
      )}

      <div className="fade-in">
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1>One-on-One Tutoring That Helps Students Grow and Thrive</h1>
                <p>
                  We provide personalized learning experiences and innovative educational programs
                  that nurture every student's potential, helping them learn, grow, and succeed.
                </p>
                <div className="hero-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                  <button
                    className="btn-primary"
                    style={{
                      display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '0.8rem 1.6rem', borderRadius: '12px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)', border: 'none',
                      cursor: 'pointer', transition: 'background 0.2s', textAlign: 'left',
                      background: 'var(--accent-color)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-color)'}
                    onClick={() => {
                      setActiveTab('registration');
                      const el = document.getElementById('register');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                      ✨ Give Your Child an Edge
                    </span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 'normal', marginTop: '2px', color: 'white' }}>
                      Start 1-on-1 Personalized Tutoring
                    </span>
                  </button>

                  <button
                    className="btn-next"
                    style={{
                      display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
                      padding: '0.8rem 1.6rem', borderRadius: '12px',
                      border: '2px solid rgba(255, 255, 255, 0.4)', background: 'transparent',
                      color: 'white', cursor: 'pointer',
                      transition: 'background 0.2s, border-color 0.2s', textAlign: 'left',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.borderColor = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'; }}
                    onClick={() => {
                      const el = document.getElementById('courses');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      📚 Explore Study Programs
                    </span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8, fontWeight: 'normal', marginTop: '2px' }}>
                      See our standard &amp; custom courses
                    </span>
                  </button>
                </div>
              </div>
              <div className="hero-form-card" id="register">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('registration')}
                    style={{
                      flex: 1, padding: '0.5rem 0.25rem',
                      background: activeTab === 'registration' ? 'var(--accent-color)' : 'transparent',
                      border: 'none', color: 'white', borderRadius: '6px',
                      fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >Quick Register</button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('booking')}
                    style={{
                      flex: 1, padding: '0.5rem 0.25rem',
                      background: activeTab === 'booking' ? 'var(--accent-color)' : 'transparent',
                      border: 'none', color: 'white', borderRadius: '6px',
                      fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >Book Meeting</button>
                </div>

                {activeTab === 'registration' && (
                  <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)', margin: '0 0 0.4rem 0', lineHeight: '1.4' }}>
                      Enroll your child in our courses to setup their study account and choose grade programs.
                    </p>
                    {registerSuccess && (
                      <div style={{ padding: '0.5rem', background: 'rgba(40, 167, 69, 0.2)', border: '1px solid #28a745', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center', color: '#28a745', fontWeight: 'bold' }}>
                        Registration completed successfully!
                      </div>
                    )}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Student's Full Name *</label>
                      <input type="text" name="studentName" value={studentForm.studentName} onChange={handleRegChange} placeholder="e.g. John Doe" required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Parent Email *</label>
                        <input type="email" name="email" value={studentForm.email} onChange={handleRegChange} placeholder="parent@example.com" required />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Contact Phone *</label>
                        <input type="tel" name="primaryPhone" value={studentForm.primaryPhone} onChange={handleRegChange} placeholder="080..." required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Grade Level *</label>
                        <select name="gradeLevel" value={studentForm.gradeLevel} onChange={handleRegChange} required>
                          <option value="">Select Grade</option>
                          {['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Preferred Program *</label>
                        <select name="program" value={studentForm.program} onChange={handleRegChange} required>
                          <option value="">Select Program</option>
                          <option value="regular">Regular Classes</option>
                          <option value="tutoring">One-on-One Tutoring</option>
                          <option value="group">Group Sessions</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '0.65rem', fontSize: '0.85rem', width: '100%', marginTop: '0.5rem', boxShadow: 'none' }}>
                      Submit Registration
                    </button>
                  </form>
                )}

                {activeTab === 'booking' && (

                  <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)', margin: '0 0 0.4rem 0', lineHeight: '1.4' }}>
                      Schedule a 1-on-1 counseling call or academic consultation session with a tutor.
                    </p>
                    {bookingSuccess && (
                      <div style={{ padding: '0.5rem', background: 'rgba(40, 167, 69, 0.2)', border: '1px solid #28a745', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center', color: '#28a745', fontWeight: 'bold' }}>
                        Meeting scheduled successfully!
                      </div>
                    )}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Parent Name *</label>
                      <input
                        type="text"
                        name="bookingParentName"
                        value={bookingForm.bookingParentName}
                        onChange={handleBookingChange}
                        placeholder="e.g. David Doe"
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Contact Phone *</label>
                        <input
                          type="tel"
                          name="bookingPhone"
                          value={bookingForm.bookingPhone}
                          onChange={handleBookingChange}
                          placeholder="080..."
                          required
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Student Name *</label>
                        <input
                          type="text"
                          name="bookingStudentName"
                          value={bookingForm.bookingStudentName}
                          onChange={handleBookingChange}
                          placeholder="Child's Name"
                          required
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Preferred Date *</label>
                        <input
                          type="date"
                          name="bookingDate"
                          value={bookingForm.bookingDate}
                          onChange={handleBookingChange}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Preferred Time *</label>
                        <select name="bookingTime" value={bookingForm.bookingTime} onChange={handleBookingChange} required>
                          <option value="">Select Time</option>
                          {mockTimeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Time Zone *</label>
                      {/* Custom searchable timezone dropdown */}
                      <div ref={tzDropdownRef} style={{ position: 'relative' }}>
                        <div
                          onClick={() => setTzOpen(o => !o)}
                          style={{
                            padding: '0.65rem', borderRadius: '8px',
                            border: `1.5px solid ${tzOpen ? 'var(--primary-color)' : '#cbd5e0'}`,
                            background: 'white', cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            fontSize: '0.85rem', color: bookingForm.bookingTimezone ? 'var(--primary-color)' : '#a0aec0',
                            userSelect: 'none'
                          }}
                        >
                          {bookingForm.bookingTimezone || 'Select Timezone'}
                          <span>{tzOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

      {/* Features/Learning Approach Section */}
      <section 
        className="features" 
        style={{ 
          background: 'rgba(248, 250, 252, 0.95)', 
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid #edf2f7', 
          borderBottom: '1px solid #edf2f7' 
        }}
      >
        <div className="container">
          <div className="section-title" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: 'var(--primary-color)', fontWeight: '800', marginBottom: '0.75rem' }}>
              Our Learning Approach
            </h2>
            <p style={{ color: 'var(--text-light)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
              We orchestrate a comprehensive, student-centered learning model built around custom-fit pathways and continuous progress monitoring.
            </p>
          </div>
          
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            
            {/* Blueprint Card */}
            <div 
              className="feature-card"
              style={{
                background: 'white',
                padding: '2.5rem 2rem',
                borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(15, 44, 89, 0.04)',
                border: '1.5px solid #edf2f7',
                borderTop: '4px solid var(--primary-color)',
                transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(242, 122, 36, 0.25)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(15, 44, 89, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#edf2f7';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 44, 89, 0.04)';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(15, 44, 89, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                marginBottom: '1.5rem',
                color: 'var(--primary-color)'
              }}>
                🎯
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--primary-color)', fontWeight: '800', marginBottom: '0.8rem' }}>
                Custom Learning Blueprints
              </h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', lineHeight: '1.65', margin: 0 }}>
                Every child receives a tailored study roadmap engineered from a detailed diagnostic assessment of their specific academic strengths and gaps.
              </p>
            </div>

            {/* Scheduling Card */}
            <div 
              className="feature-card"
              style={{
                background: 'white',
                padding: '2.5rem 2rem',
                borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(15, 44, 89, 0.04)',
                border: '1.5px solid #edf2f7',
                borderTop: '4px solid var(--accent-color)',
                transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(15, 44, 89, 0.25)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(15, 44, 89, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#edf2f7';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 44, 89, 0.04)';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(242, 122, 36, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                marginBottom: '1.5rem',
                color: 'var(--accent-color)'
              }}>
                ⏰
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--primary-color)', fontWeight: '800', marginBottom: '0.8rem' }}>
                Adaptive Session Schedules
              </h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', lineHeight: '1.65', margin: 0 }}>
                We provide consistent, structured classes configured around your family's weekly calendar to prevent learning burnout and fit busy lifestyles.
              </p>
            </div>

            {/* Development Card */}
            <div 
              className="feature-card"
              style={{
                background: 'white',
                padding: '2.5rem 2rem',
                borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(15, 44, 89, 0.04)',
                border: '1.5px solid #edf2f7',
                borderTop: '4px solid var(--primary-color)',
                transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(242, 122, 36, 0.25)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(15, 44, 89, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#edf2f7';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 44, 89, 0.04)';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(15, 44, 89, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                marginBottom: '1.5rem',
                color: 'var(--primary-color)'
              }}>
                🎨
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--primary-color)', fontWeight: '800', marginBottom: '0.8rem' }}>
                Multi-Dimensional Development
              </h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', lineHeight: '1.65', margin: 0 }}>
                We combine core logic math, literacy writing, STEM focus assignments, and academic challenges to build creative, independent learners.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Courses Section — loaded from DB */}
      <section className="courses" id="courses">
        <div className="container">
          <div className="section-title">
            <h2>Our Regular Courses</h2>
            <p>Comprehensive educational programs designed for different age groups</p>
          </div>
          <div className="courses-grid">
            {loadingCourses ? (
              <div style={{ color: '#718096', padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>Loading courses...</div>
            ) : courses.filter(c => c.course_type !== 'special').length === 0 ? (
              <div style={{ color: '#a0aec0', padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                No courses available yet. Check back soon!
              </div>
            ) : (
              courses.filter(c => c.course_type !== 'special').map((c) => {
                let icon = '📖';
                let badge = 'Core Program';
                let highlights = ['Personalized 1-on-1 pace', 'Regular progress testing', 'Expert tutor assignment'];
                
                const titleLower = c.title.toLowerCase();
                if (titleLower.includes('primary') || titleLower.includes('foundation')) {
                  icon = '🧸';
                  badge = 'Primary School';
                  highlights = ['Basic literacy & numeracy', 'Interactive lessons', 'Building study habits'];
                } else if (titleLower.includes('secondary') || titleLower.includes('exam')) {
                  icon = '📝';
                  badge = 'Exam Prep & Success';
                  highlights = ['WAEC / JAMB prep focus', 'Past question review', 'Time management drills'];
                } else if (titleLower.includes('math') || titleLower.includes('science')) {
                  icon = '🔢';
                  badge = 'STEM Focus';
                  highlights = ['Problem-solving focus', 'Step-by-step guidance', 'Practical lab reviews'];
                }

                return (
                  <div 
                    className="course-card" 
                    key={c.id}
                    style={{
                      background: 'white',
                      borderRadius: '24px',
                      padding: '2.5rem 2rem',
                      boxShadow: '0 10px 30px rgba(15, 44, 89, 0.05)',
                      border: '1.5px solid #edf2f7',
                      transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      overflow: 'hidden',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.borderColor = 'rgba(242, 122, 36, 0.3)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(15, 44, 89, 0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#edf2f7';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 44, 89, 0.05)';
                    }}
                  >
                    <span style={{
                      background: 'rgba(15, 44, 89, 0.05)',
                      color: 'var(--primary-color)',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '50px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '1.25rem',
                      display: 'inline-block'
                    }}>
                      {badge}
                    </span>

                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(242, 122, 36, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem'
                      }}>
                        {icon}
                      </span>
                      <h3 style={{
                        margin: 0,
                        color: 'var(--primary-color)',
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        fontFamily: 'var(--font-heading)'
                      }}>
                        {c.title}
                      </h3>
                    </div>

                    <p style={{
                      color: 'var(--text-light)',
                      fontSize: '0.88rem',
                      lineHeight: '1.6',
                      marginBottom: '1.5rem',
                      flexGrow: 1
                    }}>
                      {c.description}
                    </p>

                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 2rem 0',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      {highlights.map((hl, i) => (
                        <li key={i} style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontWeight: '500'
                        }}>
                          <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>✓</span>
                          {hl}
                        </li>
                      ))}
                    </ul>

                    <button
                      className="learn-more"
                      onClick={() => {
                        setActiveTab('registration');
                        const el = document.getElementById('register');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1.5px solid var(--primary-color)',
                        background: 'transparent',
                        color: 'var(--primary-color)',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-body)',
                        textAlign: 'center'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--primary-color)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--primary-color)';
                      }}
                    >
                      Learn More &amp; Register
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section 
        className="why-choose" 
        id="about" 
        style={{ 
          background: 'rgba(11, 22, 44, 0.68)', 
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)' 
        }}
      >
        <div className="container">
          <div className="why-choose-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'center' }}>
            
            {/* Left Column: Vision, Mission & Testimonial Proof */}
            <div className="why-choose-left" style={{ color: 'white', textAlign: 'left' }}>
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
                Why Families Choose Us
              </span>
              
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem',
                fontWeight: '800',
                lineHeight: '1.2',
                marginBottom: '1.25rem',
                color: 'white'
              }}>
                A Trusted Partner in Your Child's Success
              </h2>
              
              <p style={{
                fontSize: '1.08rem',
                lineHeight: '1.75',
                marginBottom: '2rem',
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: '300'
              }}>
                At FoundaXia Academy, we don't believe in generic templates or standard, crowded lessons. We align expert tutoring with structured, individualized attention to ensure every child learns to study correctly, build confidence, and achieve their goals.
              </p>

              {/* Glassmorphism Metric Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '4px solid var(--accent-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 12px 35px rgba(0,0,0,0.18)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>⭐⭐⭐⭐⭐</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Top-Rated Educational Care
                  </span>
                </div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: '700', color: 'white' }}>
                  98% Academic Progress Rate
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.72)', lineHeight: '1.55' }}>
                  98% of parents report measurable grade improvements, higher test scores, and significantly elevated study confidence in their children within 90 days of starting.
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => {
                  setActiveTab('registration');
                  const el = document.getElementById('register');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-primary"
                style={{
                  background: 'var(--accent-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.9rem 2.2rem',
                  fontWeight: '700',
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(242, 122, 36, 0.25)',
                  transition: 'background 0.2s, transform 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--accent-dark)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--accent-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Enroll Your Child Today
              </button>
            </div>

            {/* Right Column: 2x2 Feature Grid */}
            <div className="why-choose-right" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              alignItems: 'stretch'
            }}>
              {[
                {
                  icon: '🎓',
                  title: 'Expert Vetted Educators',
                  text: 'Only top-tier subject specialists pass our rigorous vetting process. All tutors hold advanced degrees, background checks, and certifications.'
                },
                {
                  icon: '🎯',
                  title: 'Personalized Study Plans',
                  text: 'We target and resolve specific academic weaknesses with custom-tailored curriculums built uniquely around your child\'s schedule.'
                },
                {
                  icon: '📊',
                  title: 'Real-time Progress Portals',
                  text: 'Never feel left in the dark. Easily track homework completion, lesson grades, scheduled sessions, and tutor feedback directly.'
                },
                {
                  icon: '🛡️',
                  title: 'Secure Online Portal',
                  text: 'Complete security compliance. Encrypted virtual classrooms, parent alerts, and structured supervision checkups in every class.'
                }
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(15, 32, 67, 0.65)',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '1.75rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    cursor: 'default',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'rgba(242, 122, 36, 0.4)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                  }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    marginBottom: '1.25rem'
                  }}>
                    {card.icon}
                  </div>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.12rem',
                    fontWeight: '700',
                    marginBottom: '0.6rem',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {card.title}
                  </h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.72)',
                    fontSize: '0.88rem',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </section>

      {/* Special Classes Section */}
      <section className="special-classes">
        <div className="container">
          <div className="section-title">
            <h2>Our Special Classes</h2>
            <p>Specialized programs designed to enhance specific skills and talents</p>
          </div>
          <div className="classes-grid">
            {loadingCourses ? (
              <div style={{ color: '#a0aec0', padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>Loading special classes...</div>
            ) : courses.filter(c => c.course_type === 'special').length === 0 ? (
              <div style={{ color: '#a0aec0', padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                No special classes available yet.
              </div>
            ) : (
              courses.filter(c => c.course_type === 'special').map((c, idx) => (
                <div className="class-card" key={c.id}>
                  <div className="class-card-content" style={{ background: `url(${getSpecialClassImage(c.title, idx)}) center center`, backgroundSize: 'cover' }}></div>
                  <div className="class-overlay">
                    <h3>{c.title}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="teachers" id="teachers">
        <div className="container">
          <div className="section-title">
            <h2>Honorable Teachers</h2>
            <p>Meet our dedicated and experienced teaching staff committed to your child's success</p>
          </div>
          <div className="teachers-container">
            <button className="teachers-nav prev" onClick={() => scrollTeachers('left')} aria-label="Scroll left">‹</button>
            <button className="teachers-nav next" onClick={() => scrollTeachers('right')} aria-label="Scroll right">›</button>
            <div className="teachers-scroll-wrapper" ref={teachersScrollRef}>
              <div className="teachers-grid">
                {loadingTutors ? (
                  <div style={{ color: 'white', padding: '2rem' }}>Loading teachers...</div>
                ) : (
                  tutors.map((t) => (
                    <div 
                      className="teacher-card" 
                      key={t.id}
                      style={{
                        flex: '0 0 290px',
                        background: 'white',
                        borderRadius: '24px',
                        padding: '2.2rem 1.5rem',
                        textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(15, 44, 89, 0.04)',
                        border: '1.5px solid #edf2f7',
                        transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.borderColor = 'rgba(242, 122, 36, 0.3)';
                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(15, 44, 89, 0.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = '#edf2f7';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 44, 89, 0.04)';
                      }}
                    >
                      {/* Verified Badge */}
                      <span style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: '#e6f4ea',
                        color: '#1e7e34',
                        borderRadius: '50px',
                        padding: '0.2rem 0.65rem',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        border: '1px solid rgba(30, 126, 52, 0.15)'
                      }}>
                        ✓ Verified
                      </span>

                      {/* Avatar Wrapper with Status dot */}
                      <div style={{ position: 'relative', margin: '0.5rem auto 1.25rem' }}>
                        <img
                          src={t.avatar_url || '/images/student3.jpg'}
                          alt={t.full_name}
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid white',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                          }}
                          onError={e => { e.target.src = '/images/student3.jpg'; }}
                        />
                        {/* Active Availability Dot */}
                        <span style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#28a745',
                          border: '2px solid white',
                          boxShadow: '0 0 0 2px rgba(40,167,69,0.2)'
                        }} title="Available for Matching" />
                      </div>

                      {/* Info */}
                      <h3 style={{
                        margin: '0 0 0.25rem 0',
                        color: 'var(--primary-color)',
                        fontSize: '1.15rem',
                        fontWeight: '800',
                        fontFamily: 'var(--font-heading)'
                      }}>
                        {t.full_name}
                      </h3>
                      
                      <span style={{
                        background: 'rgba(242, 122, 36, 0.08)',
                        color: 'var(--accent-color)',
                        padding: '0.15rem 0.6rem',
                        borderRadius: '50px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        marginBottom: '0.75rem',
                        display: 'inline-block'
                      }}>
                        {t.subject} Tutor
                      </span>

                      {/* Rating/Reviews */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#718096', marginBottom: '1.25rem' }}>
                        <span>⭐⭐⭐⭐⭐</span>
                        <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>5.0</span>
                        <span>•</span>
                        <span>{t.experience || 'Experienced'}</span>
                      </div>

                      {/* Bio modal trigger */}
                      <button
                        onClick={() => setSelectedTutorBio(t)}
                        style={{
                          marginTop: 'auto',
                          width: '100%',
                          padding: '0.65rem',
                          background: 'var(--primary-color)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(15,44,89,0.08)',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#1a3c70';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'var(--primary-color)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        View Profile &amp; Bio
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ─────────────── FAQ SECTION ─────────────── */}
      <section
        style={{
          background: "linear-gradient(rgba(15, 44, 89, 0.92), rgba(15, 44, 89, 0.92)), url('/images/book1.jpg') no-repeat center center",
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          padding: '5rem 0',
          position: 'relative'
        }}
        id="faq"
      >
        <div className="container">
          <div className="section-title" style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <h2 style={{ color: 'white' }}>Frequently Asked Questions</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Everything parents need to know before enrolling their child</p>
          </div>

          <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                q: 'How does 1-on-1 tutoring work at FoundaXia?',
                a: 'Each student is matched with a dedicated tutor based on their grade level, subject needs, and learning style. Sessions are conducted online via live video and your child gets undivided personal attention — no distractions, no large classrooms.'
              },
              {
                q: 'What age groups and grades do you cover?',
                a: 'We support students from Primary 1 through Secondary 6 (SS3), covering core subjects like Mathematics, English, Sciences, and more. We also offer specialised programs for exam prep including WAEC, NECO, and JAMB.'
              },
              {
                q: 'How do I enroll my child?',
                a: 'Simply fill in the Quick Register form at the top of this page. After your registration, our admin team will review your information, assign your child to a suitable tutor, and set up their learning account within 24 hours.'
              },
              {
                q: 'Can I choose a specific tutor for my child?',
                a: 'Yes! You can browse our tutors and request a preferred one during booking. Our admin team does the final pairing to ensure the best learning fit, but we always consider your preference.'
              },
              {
                q: 'How are classes scheduled?',
                a: 'Once enrolled, your child\'s assigned tutor schedules live class sessions and sends a meeting link directly. All scheduled classes appear in your child\'s Student Dashboard with date, time, and the meeting link.'
              },
              {
                q: 'What happens if my child misses a class?',
                a: 'You can contact your tutor to reschedule missed sessions. Tutors mark attendance, and the admin team monitors session consistency to make sure every child stays on track.'
              },
              {
                q: 'Is there homework and assignments?',
                a: 'Yes. Tutors create assignments and quizzes through the platform and students can submit directly from their dashboard. Tutors then review and provide personalised feedback and grades.'
              },
              {
                q: 'How do I track my child\'s progress?',
                a: 'Your child has a dedicated Student Dashboard showing all enrolled courses, scheduled classes, assignments, grades, and class materials — everything in one place so you can stay informed at all times.'
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: `1px solid ${faqOpenIndex === i ? 'var(--primary-color)' : '#e2e8f0'}`,
                  overflow: 'hidden',
                  boxShadow: faqOpenIndex === i ? '0 2px 8px rgba(15,44,89,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s, border-color 0.2s'
                }}
              >
                <button
                  onClick={() => setFaqOpenIndex(faqOpenIndex === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1.1rem 1.4rem', background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', gap: '1rem'
                  }}
                >
                  <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--primary-color)', lineHeight: 1.4 }}>
                    {item.q}
                  </span>
                  <span style={{
                    flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%',
                    background: faqOpenIndex === i ? 'var(--primary-color)' : '#edf2f7',
                    color: faqOpenIndex === i ? 'white' : 'var(--primary-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 'bold', transition: 'all 0.2s'
                  }}>
                    {faqOpenIndex === i ? '−' : '+'}
                  </span>
                </button>
                {faqOpenIndex === i && (
                  <div style={{ padding: '0 1.4rem 1.2rem 1.4rem', color: '#4a5568', fontSize: '0.9rem', lineHeight: '1.7', borderTop: '1px solid #edf2f7' }}>
                    <p style={{ marginTop: '0.9rem' }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA strip under FAQ */}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem', marginBottom: '1rem' }}>
              Still have questions? Our team is happy to help.
            </p>
            <button
              className="btn-primary"
              style={{ padding: '0.8rem 2.2rem', borderRadius: '10px', fontSize: '0.95rem', boxShadow: '0 2px 4px rgba(0,0,0,0.12)' }}
              onClick={() => {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              💬 Contact Us
            </button>
          </div>
        </div>
      </section>



      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <div className="section-title">
            <h2>Get in Touch</h2>
            <p>Have questions? We're here to help! Contact us for any information about our programs.</p>
          </div>
          <div className="contact-content">
            <div className="contact-image-placeholder"></div>
            <div className="contact-form">
              {contactSuccess && (
                <div className="success-message">
                  Thank you for your message! We will get back to you within 24 hours.
                </div>
              )}
              <h3>Send us a Message</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="contactName"
                    value={contactForm.contactName}
                    onChange={handleContactChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Your Email *</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={contactForm.contactEmail}
                    onChange={handleContactChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Your Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={contactForm.contactPhone}
                    onChange={handleContactChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select
                    name="contactSubject"
                    value={contactForm.contactSubject}
                    onChange={handleContactChange}
                  >
                    <option value="">Select a topic</option>
                    <option value="enrollment">Enrollment Information</option>
                    <option value="programs">Program Details</option>
                    <option value="scheduling">Scheduling Questions</option>
                    <option value="fees">Fees & Pricing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Your Message *</label>
                  <textarea
                    name="contactMessage"
                    value={contactForm.contactMessage}
                    onChange={handleContactChange}
                    rows={4}
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                </div>
                <div className="step-buttons">
                  <div></div>
                  <button type="submit" className="btn-submit">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
