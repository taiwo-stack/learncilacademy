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
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

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

  // Booking Form Handlers
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        tutor_id: selectedTutor ? selectedTutor.id : null,
        tutor_name: selectedTutor ? selectedTutor.full_name : 'Unassigned',
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
      setSelectedTutor(null);
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
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.8rem 1.6rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    textAlign: 'left',
                    background: 'var(--accent-color)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-color)'}
                  onClick={() => {
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
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.8rem 1.6rem',
                    borderRadius: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    background: 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'background 0.2s, border-color 0.2s',
                    textAlign: 'left',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  }}
                  onClick={() => {
                    const el = document.getElementById('courses');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span style={{ fontSize: '1.05rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📚 Explore Study Programs
                  </span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.8, fontWeight: 'normal', marginTop: '2px' }}>
                    See our standard & custom courses
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
                    flex: 1,
                    padding: '0.5rem 0.25rem',
                    background: activeTab === 'registration' ? 'var(--accent-color)' : 'transparent',
                    border: 'none',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Quick Register
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('booking')}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.25rem',
                    background: activeTab === 'booking' ? 'var(--accent-color)' : 'transparent',
                    border: 'none',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Book Meeting
                </button>
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
                    <input 
                      type="text" 
                      name="studentName" 
                      value={studentForm.studentName} 
                      onChange={handleRegChange} 
                      placeholder="e.g. John Doe"
                      required 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Parent Email *</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={studentForm.email} 
                        onChange={handleRegChange} 
                        placeholder="parent@example.com"
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Contact Phone *</label>
                      <input 
                        type="tel" 
                        name="primaryPhone" 
                        value={studentForm.primaryPhone} 
                        onChange={handleRegChange} 
                        placeholder="080..."
                        required 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Grade Level *</label>
                      <select name="gradeLevel" value={studentForm.gradeLevel} onChange={handleRegChange} required>
                        <option value="">Select Grade</option>
                        <option value="Grade 1">Grade 1</option>
                        <option value="Grade 2">Grade 2</option>
                        <option value="Grade 3">Grade 3</option>
                        <option value="Grade 4">Grade 4</option>
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 6">Grade 6</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
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
                        <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {bookingForm.bookingTimezone
                            ? (tzOptions.find(t => t.value === bookingForm.bookingTimezone)?.label || bookingForm.bookingTimezone)
                            : '-- Choose Time Zone --'}
                        </span>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', flexShrink: 0 }}>{tzOpen ? '▲' : '▼'}</span>
                      </div>
                      {tzOpen && (
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                          background: 'white', border: '1.5px solid var(--primary-color)',
                          borderRadius: '10px', zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                          overflow: 'hidden'
                        }}>
                          {/* Search input */}
                          <div style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <input
                              type="text"
                              autoFocus
                              value={tzSearch}
                              onChange={e => setTzSearch(e.target.value)}
                              placeholder="Search timezone or abbreviation..."
                              style={{
                                width: '100%', padding: '0.45rem 0.65rem', boxSizing: 'border-box',
                                border: '1px solid #cbd5e0', borderRadius: '6px',
                                fontSize: '0.82rem', outline: 'none'
                              }}
                            />
                          </div>
                          {/* Options list */}
                          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {tzOptions
                              .filter(t => t.label.toLowerCase().includes(tzSearch.toLowerCase()))
                              .map(t => (
                                <div
                                  key={t.value}
                                  onClick={() => {
                                    handleBookingChange({ target: { name: 'bookingTimezone', value: t.value } });
                                    setTzOpen(false);
                                    setTzSearch('');
                                  }}
                                  style={{
                                    padding: '0.55rem 0.85rem', cursor: 'pointer', fontSize: '0.82rem',
                                    background: bookingForm.bookingTimezone === t.value ? 'var(--primary-color)' : 'white',
                                    color: bookingForm.bookingTimezone === t.value ? 'white' : 'var(--text-dark)',
                                    transition: 'background 0.15s'
                                  }}
                                  onMouseEnter={e => { if (bookingForm.bookingTimezone !== t.value) e.target.style.background = '#f0f4ff'; }}
                                  onMouseLeave={e => { if (bookingForm.bookingTimezone !== t.value) e.target.style.background = 'white'; }}
                                >
                                  {t.label}
                                </div>
                              ))
                            }
                            {tzOptions.filter(t => t.label.toLowerCase().includes(tzSearch.toLowerCase())).length === 0 && (
                              <div style={{ padding: '0.75rem', textAlign: 'center', color: '#a0aec0', fontSize: '0.82rem' }}>No results found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Hidden real input for form validation */}
                    <input type="text" name="bookingTimezone" value={bookingForm.bookingTimezone} onChange={() => {}} required tabIndex={-1} style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Write us a note (Optional)</label>
                    <textarea 
                      name="bookingMessage" 
                      value={bookingForm.bookingMessage} 
                      onChange={handleBookingChange} 
                      placeholder="Tell us what you'd like to discuss or any questions you have..." 
                      rows={3} 
                      style={{ resize: 'vertical', width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e0', background: 'white', color: 'var(--primary-color)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.65rem', fontSize: '0.85rem', width: '100%', marginTop: '0.5rem', boxShadow: 'none' }}>
                    Book Consultation
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-title">
            <h2>Our Learning Approach</h2>
            <p>We believe in a comprehensive, student-centered approach that addresses every aspect of your child's development</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Learning Plans</h3>
              <p>Every student receives a customized learning plan tailored to their unique needs, learning style, and academic goals. We assess each student's strengths and areas for improvement.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Flexible Scheduling</h3>
              <p>We're open 8:00 AM - 6:00 PM, Monday through Saturday, with flexible appointment scheduling to accommodate busy family schedules and different learning preferences.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Holistic Development</h3>
              <p>Beyond academics, we incorporate activities including arts, music, STEM projects, and physical fitness to develop well-rounded, confident learners.</p>
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
              courses.filter(c => c.course_type !== 'special').map((c) => (
                <div className="course-card" key={c.id}>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  <button
                    className="learn-more"
                    onClick={() => {
                      const el = document.getElementById('register');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Learn More
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose" id="about">
        <div className="container">
          <div className="why-choose-content">
            <div className="why-choose-image"></div>
            <div className="why-choose-text">
              <h2>Why Families Trust Foundaxia</h2>
              <p>We've built our reputation on delivering exceptional educational outcomes while maintaining the highest standards of care and professionalism. Here's what sets us apart from other tutoring centers:</p>
              <ul className="checkmark-list">
                <li><strong>Certified Expert Teachers</strong> - All our educators hold advanced degrees and specialized certifications</li>
                <li><strong>Safe & Nurturing Environment</strong> - Background-checked staff and secure, child-friendly facilities</li>
                <li><strong>Proven Track Record</strong> - 98% of our students show measurable improvement within 3 months</li>
                <li><strong>Individual Attention</strong> - Maximum 1:3 teacher-to-student ratio in all sessions</li>
                <li><strong>Modern Learning Tech</strong> - Interactive whiteboards, educational apps, and digital resources</li>
                <li><strong>Transparent Pricing</strong> - No hidden fees, flexible payment plans, and excellent value</li>
              </ul>
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
                    <div className="teacher-card" key={t.id}>
                      <div 
                        className="teacher-avatar" 
                        style={{ 
                          background: `url(${t.avatar_url}) center center`, 
                          backgroundSize: 'cover' 
                        }}
                      ></div>
                      <h3>{t.full_name}</h3>
                      <p>{t.subject} Teacher</p>
                      <p>{t.experience}</p>
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
                q: 'How does 1-on-1 tutoring work at Learncil?',
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
  );
}
