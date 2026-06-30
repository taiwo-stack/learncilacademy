import React, { useState, useEffect } from 'react';
import { 
  getBookings, getStudents, getTutors, getContactMessages,
  updateBookingStatus, deleteBooking, deleteStudent, deleteTutor, updateStudent,
  createStudentAccount, createTutorAccount, uploadAvatar, activateStudentAccount, resetUserPassword,
  getCourses, saveCourse, deleteCourse,
  getTopics, saveTopic, deleteTopic, updateTopic,
  getMaterials, saveMaterial, deleteMaterial, uploadMaterialFile,
  getCourseTutors, assignTutorToCourse, removeTutorFromCourse,
  getStudentCourses, enrollStudentInCourse, unenrollStudentFromCourse,
  getTasks, saveTask, deleteTask,
  getSchedules, saveSchedule, deleteSchedule
} from '../services/dataService';
import { 
  Users, Calendar, UserCheck, Mail, Plus, Trash2, AlertCircle, Layers, X,
  BookOpen, FolderMinus, Link2, BookOpenCheck, Settings, Eye, Paperclip, Clock,
  ArrowUp, ArrowDown
} from 'lucide-react';
import '../styles/Dashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data lists
  const [bookings, setBookings] = useState([]);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // LMS Data lists
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [courseTutors, setCourseTutors] = useState([]);
  const [studentCourses, setStudentCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Add Tutor Modal state
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [newTutor, setNewTutor] = useState({
    email: '', password: '', full_name: '', subject: '', experience: '', bio: '', avatar_url: ''
  });

  // Add Student Modal state
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // Activation Modal State
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [studentToActivate, setStudentToActivate] = useState(null);
  const [activationPassword, setActivationPassword] = useState('');
  const [activating, setActivating] = useState(false);

  // Edit Student State
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentEditPassword, setStudentEditPassword] = useState('');
  const [newStudent, setNewStudent] = useState({
    email: '', password: '', full_name: '', phone: '', date_of_birth: '',
    gender: 'male', grade_level: 'Grade 1', special_needs: '', program: 'regular',
    schedule: 'morning', start_date: '', additional_comments: '', avatar_url: ''
  });

  // LMS State Inputs
  const [newCourse, setNewCourse] = useState({ title: '', description: '', course_type: 'regular' });
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newTopic, setNewTopic] = useState({ title: '', description: '', sort_order: 1 });
  const [activeTopicMaterialId, setActiveTopicMaterialId] = useState('');
  const [activeTopicTaskId, setActiveTopicTaskId] = useState('');
  
  // Materials Upload State
  const [materialTitle, setMaterialTitle] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [materialFile, setMaterialFile] = useState(null);

  // Task creation state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskType, setTaskType] = useState('assignment'); // 'quiz', 'assignment', 'instruction'
  const [maxPoints, setMaxPoints] = useState(100);
  
  // Quiz Question builder state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);

  // Enrolment state inputs
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');
  const [enrollTutorId, setEnrollTutorId] = useState('');

  // Course-Tutor mapping state inputs
  const [mapCourseId, setMapCourseId] = useState('');
  const [mapTutorId, setMapTutorId] = useState('');

  // Class scheduling state inputs
  const [schStudentId, setSchStudentId] = useState('');
  const [schCourseId, setSchCourseId] = useState('');
  const [schTutorId, setSchTutorId] = useState('');
  const [schTitle, setSchTitle] = useState('');
  const [schStart, setSchStart] = useState('');
  const [schEnd, setSchEnd] = useState('');
  const [schLink, setSchLink] = useState('');

  const [uploading, setUploading] = useState(false);

  const loadAllData = async () => {
    const safeLoad = async (promise, fallback = []) => {
      try {
        return await promise;
      } catch (e) {
        console.warn('Dashboard table loading error caught gracefully:', e.message);
        return fallback;
      }
    };

    try {
      const [bData, sData, tData, mData, cData, tpData, matData, ctData, scData, tkData, schData] = await Promise.all([
        safeLoad(getBookings()),
        safeLoad(getStudents()),
        safeLoad(getTutors()),
        safeLoad(getContactMessages()),
        safeLoad(getCourses()),
        safeLoad(getTopics()),
        safeLoad(getMaterials()),
        safeLoad(getCourseTutors()),
        safeLoad(getStudentCourses()),
        safeLoad(getTasks()),
        safeLoad(getSchedules())
      ]);

      setBookings(bData);
      setStudents(sData);
      setTutors(tData);
      setMessages(mData);
      setCourses(cData);
      setTopics(tpData);
      setMaterials(matData);
      setCourseTutors(ctData);
      setStudentCourses(scData);
      setTasks(tkData);
      setSchedules(schData);

      if (cData.length > 0) setSelectedCourseId(cData[0].id);
    } catch (err) {
      console.error('Error loading admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleModalTutorAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await uploadAvatar('new_tutor_' + Date.now(), file);
      setNewTutor(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      alert('Failed to upload tutor picture: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleModalStudentAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await uploadAvatar('new_student_' + Date.now(), file);
      setNewStudent(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      alert('Failed to upload student picture: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Booking Actions
  const handleBookingStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) {
      alert('Error updating booking: ' + err.message);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await deleteBooking(id);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert('Error deleting booking: ' + err.message);
    }
  };

  // Student Actions
  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Remove this student registration permanently?')) return;
    try {
      await deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Error deleting student: ' + err.message);
    }
  };

  // Tutor Actions
  const handleDeleteTutor = async (id) => {
    if (!window.confirm('Remove this tutor from academy registry?')) return;
    try {
      await deleteTutor(id);
      setTutors(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Error removing tutor: ' + err.message);
    }
  };

  const handleAddTutorSubmit = async (e) => {
    e.preventDefault();
    try {
      const tutorData = {
        full_name: newTutor.full_name,
        subject: newTutor.subject,
        experience: newTutor.experience,
        bio: newTutor.bio,
        avatar_url: newTutor.avatar_url || '/images/logo.png'
      };
      const saved = await createTutorAccount(newTutor.email, newTutor.password, tutorData);
      setTutors(prev => [...prev, saved]);
      setShowTutorModal(false);
      setNewTutor({ email: '', password: '', full_name: '', subject: '', experience: '', bio: '', avatar_url: '' });
      alert('Tutor added successfully with login credentials!');
    } catch (err) {
      alert('Error adding tutor: ' + err.message);
    }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const studentData = {
        full_name: newStudent.full_name,
        phone: newStudent.phone,
        date_of_birth: newStudent.date_of_birth,
        gender: newStudent.gender,
        grade_level: newStudent.grade_level,
        special_needs: newStudent.special_needs,
        program: newStudent.program,
        schedule: newStudent.schedule,
        start_date: newStudent.start_date || new Date().toISOString().split('T')[0],
        additional_comments: newStudent.additional_comments,
        avatar_url: newStudent.avatar_url || ''
      };
      const saved = await createStudentAccount(newStudent.email, newStudent.password, studentData);
      setStudents(prev => [...prev, saved]);
      setShowStudentModal(false);
      setNewStudent({
        email: '', password: '', full_name: '', phone: '', date_of_birth: '',
        gender: 'male', grade_level: 'Grade 1',
        special_needs: '', program: 'regular', schedule: 'morning',
        start_date: '', additional_comments: '', avatar_url: ''
      });
      alert('Student registered successfully with login credentials!');
    } catch (err) {
      alert('Error adding student: ' + err.message);
    }
  };

  const handleActivateStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentToActivate) return;
    setActivating(true);
    try {
      await activateStudentAccount(
        studentToActivate.id,
        studentToActivate.email,
        activationPassword
      );
      alert('Student account activated successfully! Login profile created.');
      setShowActivationModal(false);
      setActivationPassword('');
      setStudentToActivate(null);
      // Reload students list to update UI status
      const sList = await getStudents();
      setStudents(sList);
    } catch (err) {
      alert('Error activating student: ' + err.message);
    } finally {
      setActivating(false);
    }
  };

  const handleEditStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      let activeStudent = { ...editingStudent };
      
      // If the student has no auth account yet and a password was filled, activate them now!
      if (!editingStudent.is_active && studentEditPassword.trim()) {
        if (studentEditPassword.length < 6) {
          alert('Password must be at least 6 characters.');
          return;
        }
        
        const activated = await activateStudentAccount(
          editingStudent.id,
          editingStudent.email,
          studentEditPassword
        );
        
        // Update current reference with the new authenticated user ID
        activeStudent.id = activated.id || activated;
      }
      
      // If the student is already active and a new password was filled, reset/update their password!
      if (editingStudent.is_active && studentEditPassword.trim()) {
        if (studentEditPassword.length < 6) {
          alert('Password must be at least 6 characters.');
          return;
        }
        await resetUserPassword(editingStudent.id, studentEditPassword);
      }

      // Strip fields that shouldn't go to students table directly
      const { id, email, is_active, profiles, created_at, ...updates } = activeStudent;
      await updateStudent(id, updates);
      
      alert('Student profile updated successfully!');
      setShowEditStudentModal(false);
      setEditingStudent(null);
      setStudentEditPassword('');
      // Reload data
      const sList = await getStudents();
      setStudents(sList);
    } catch (err) {
      alert('Error updating student: ' + err.message);
    }
  };

  const handleEditModalStudentAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !editingStudent) return;
    setUploading(true);
    try {
      const publicUrl = await uploadAvatar('student_' + editingStudent.id, file);
      setEditingStudent(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      alert('Failed to upload student picture: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- LMS HANDLERS ---

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const saved = await saveCourse(newCourse);
      setCourses(prev => [...prev, saved]);
      setNewCourse({ title: '', description: '', course_type: 'regular' });
      setSelectedCourseId(saved.id);
      alert('Course created successfully!');
    } catch (err) {
      alert('Error creating course: ' + err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course, all its topics, and uploads?')) return;
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      if (selectedCourseId === id) setSelectedCourseId('');
      alert('Course deleted.');
    } catch (err) {
      alert('Error deleting course: ' + err.message);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Please select a course first.');
    try {
      const saved = await saveTopic({ ...newTopic, course_id: selectedCourseId });
      setTopics(prev => [...prev, saved]);
      setNewTopic({ title: '', description: '', sort_order: newTopic.sort_order + 1 });
      alert('Topic added to course!');
    } catch (err) {
      alert('Error creating topic: ' + err.message);
    }
  };

  const handleDeleteTopic = async (id) => {
    if (!window.confirm('Remove this topic?')) return;
    try {
      await deleteTopic(id);
      setTopics(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Error removing topic: ' + err.message);
    }
  };

  const handleMoveTopic = async (topicId, direction) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    const offset = direction === 'up' ? -1 : 1;
    const newOrder = Math.max(1, topic.sort_order + offset);
    try {
      await updateTopic(topicId, { sort_order: newOrder });
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, sort_order: newOrder } : t).sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      alert('Error updating order: ' + err.message);
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedTopicId || !materialFile) {
      return alert('Please select a topic and file first.');
    }
    setUploading(true);
    try {
      const fileUrl = await uploadMaterialFile(materialFile.name, materialFile);
      const fileType = materialFile.type.includes('pdf') ? 'pdf' : (materialFile.type.includes('image') ? 'image' : 'other');
      const saved = await saveMaterial({
        course_id: selectedCourseId,
        topic_id: selectedTopicId,
        title: materialTitle || materialFile.name,
        file_url: fileUrl,
        file_type: fileType
      });
      setMaterials(prev => [...prev, saved]);
      setMaterialTitle('');
      setMaterialFile(null);
      alert('Course material uploaded successfully!');
    } catch (err) {
      alert('Failed to upload material: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this material file?')) return;
    try {
      await deleteMaterial(id);
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert('Error deleting file: ' + err.message);
    }
  };

  const handleAddQuizQuestion = () => {
    if (!newQText) return alert('Enter question text.');
    const qObj = { question: newQText, options: newQOptions, correct: Number(newQCorrect) };
    setQuizQuestions(prev => [...prev, qObj]);
    setNewQText('');
    setNewQOptions(['', '', '']);
    setNewQCorrect(0);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Select a course.');
    try {
      const saved = await saveTask({
        course_id: selectedCourseId,
        topic_id: selectedTopicId || null,
        title: taskTitle,
        description: taskDesc,
        task_type: taskType,
        max_points: maxPoints,
        quiz_questions: taskType === 'quiz' ? quizQuestions : null
      });
      setTasks(prev => [...prev, saved]);
      setTaskTitle('');
      setTaskDesc('');
      setQuizQuestions([]);
      alert('Task created successfully!');
    } catch (err) {
      alert('Error saving task: ' + err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleMapTutor = async (e) => {
    e.preventDefault();
    if (!mapCourseId || !mapTutorId) return alert('Select course and tutor.');
    try {
      await assignTutorToCourse(mapCourseId, mapTutorId);
      setCourseTutors(prev => [...prev, { course_id: mapCourseId, tutor_id: mapTutorId }]);
      alert('Tutor assigned to teach this course!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleUnmapTutor = async (courseId, tutorId) => {
    if (!window.confirm('Remove instructor from course?')) return;
    try {
      await removeTutorFromCourse(courseId, tutorId);
      setCourseTutors(prev => prev.filter(x => !(x.course_id === courseId && x.tutor_id === tutorId)));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!enrollStudentId || !enrollCourseId || !enrollTutorId) return alert('Select Student, Course and Tutor.');
    try {
      const saved = await enrollStudentInCourse(enrollStudentId, enrollCourseId, enrollTutorId);
      setStudentCourses(prev => [...prev, saved]);
      alert('Student enrolled successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleUnenrollStudent = async (studentId, courseId) => {
    if (!window.confirm('Unenroll student from this course?')) return;
    try {
      await unenrollStudentFromCourse(studentId, courseId);
      setStudentCourses(prev => prev.filter(x => !(x.student_id === studentId && x.course_id === courseId)));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!schStudentId || !schCourseId || !schTutorId || !schTitle || !schStart || !schEnd) {
      return alert('Fill out all required class schedule details.');
    }
    try {
      const saved = await saveSchedule({
        student_id: schStudentId,
        course_id: schCourseId,
        tutor_id: schTutorId,
        title: schTitle,
        start_time: new Date(schStart).toISOString(),
        end_time: new Date(schEnd).toISOString(),
        meeting_link: schLink
      });
      setSchedules(prev => [...prev, saved]);
      setSchTitle('');
      setSchStart('');
      setSchEnd('');
      setSchLink('');
      alert('Class scheduled successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this class schedule?')) return;
    try {
      await deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Metrics
  const pendingApprovals = bookings.filter(b => b.status === 'pending').length;
  const totalBookings = bookings.length;
  const totalStudents = students.length;
  const totalTutors = tutors.length;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '3rem', color: 'white' }}>Loading Admin Panel...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">Admin Console</div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('overview')}><Layers size={18} /> Overview</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('bookings')}><Calendar size={18} /> Bookings</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'students' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('students')}><Users size={18} /> Students</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'tutors' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('tutors')}><UserCheck size={18} /> Tutors</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'courses' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('courses')}><BookOpen size={18} /> Course Builder</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'enrollments' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('enrollments')}><BookOpenCheck size={18} /> Enrollments</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'schedules' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('schedules')}><Clock size={18} /> Schedules</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'inquiries' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('inquiries')}><Mail size={18} /> Inquiries</button>
          </li>
        </ul>
      </aside>

      {/* Main Content Workspace */}
      <main className="dashboard-main">
        
        {/* Tab 0: Overview Dashboard */}
        {activeTab === 'overview' && (
          <div>
            
            {/* Top metrics stats grid */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card">
                <div className="stat-icon"><Calendar size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{totalBookings}</span>
                  <span className="stat-label">Total Bookings</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Users size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{totalStudents}</span>
                  <span className="stat-label">Students</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><UserCheck size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{totalTutors}</span>
                  <span className="stat-label">Active Tutors</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><AlertCircle size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{pendingApprovals}</span>
                  <span className="stat-label">Pending Reviews</span>
                </div>
              </div>
            </div>

            {/* Welcome Summary & Activity grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
              {/* Quick Admin Actions */}
              <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h3 style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '0.5rem', margin: 0 }}>Console Actions</h3>
                <p style={{ fontSize: '0.88rem', color: '#718096', margin: 0 }}>Use shortcuts below to manage resources quickly:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                  <button className="btn-primary" onClick={() => setShowStudentModal(true)} style={{ flex: '1 1 45%', padding: '0.8rem', fontSize: '0.85rem' }}>+ Register Student</button>
                  <button className="btn-primary" onClick={() => setShowTutorModal(true)} style={{ flex: '1 1 45%', padding: '0.8rem', fontSize: '0.85rem' }}>+ Add Instructor</button>
                  <button className="btn-action approve" onClick={() => setActiveTab('courses')} style={{ flex: '1 1 45%', padding: '0.8rem', fontSize: '0.85rem' }}>Course Builder</button>
                  <button className="btn-action edit" onClick={() => setActiveTab('enrollments')} style={{ flex: '1 1 45%', padding: '0.8rem', fontSize: '0.85rem' }}>Enroll Students</button>
                </div>
              </div>

              {/* Consultation appointments activity list */}
              <div className="dashboard-card">
                <h3 style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '0.5rem', margin: '0 0 1rem 0' }}>Consultations Overview</h3>
                {bookings.length === 0 ? (
                  <div style={{ padding: '1rem', color: '#a0aec0', fontSize: '0.85rem', textAlign: 'center' }}>No active bookings.</div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {bookings.slice(0, 3).map(b => (
                      <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f7fafc', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{b.student_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#718096' }}>Type: {b.meeting_type} | Time: {b.booking_date} @ {b.booking_time}</div>
                        </div>
                        <span className={`badge badge-${b.status}`} style={{ fontSize: '0.7rem' }}>{b.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Bookings Management */}
        {activeTab === 'bookings' && (
          <div>
            <div className="dashboard-card">
              <h3><Layers size={18} color="var(--primary-color)" /> Active Appointment Log</h3>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No bookings found.</div>
              ) : (
                <div className="table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Parent</th>
                        <th>Phone</th>
                        <th>Tutor</th>
                        <th>Date / Time</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 'bold' }}>{b.student_name}</td>
                          <td>{b.parent_name}</td>
                          <td>{b.phone}</td>
                          <td>{b.tutor_name}</td>
                          <td>{b.booking_date} @ {b.booking_time}</td>
                          <td style={{ textTransform: 'capitalize' }}>{b.meeting_type}</td>
                          <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                          <td>
                            <div className="btn-action-group">
                              {b.status === 'pending' && (
                                <button className="btn-action approve" onClick={() => handleBookingStatus(b.id, 'approved')}>Approve</button>
                              )}
                              {b.status === 'approved' && (
                                <button className="btn-action complete" onClick={() => handleBookingStatus(b.id, 'completed')}>Complete</button>
                              )}
                              {b.status !== 'cancelled' && (
                                <button className="btn-action cancel" onClick={() => handleBookingStatus(b.id, 'cancelled')}>Cancel</button>
                              )}
                              <button className="btn-action delete" onClick={() => handleDeleteBooking(b.id)} title="Delete Record"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Students List */}
        {activeTab === 'students' && (
          <div>
            <div className="dashboard-card">
              <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} color="var(--primary-color)" /> Active Registrations</span>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={() => setShowStudentModal(true)}>
                  <Plus size={14} /> Register Student
                </button>
              </h3>
              {students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No registered students.</div>
              ) : (
                <div className="table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Grade</th>
                        <th>Program</th>
                        <th>Schedule</th>
                        <th>Parent Contact</th>
                        <th>Start Date</th>
                        <th>Special Needs</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {s.avatar_url ? (
                              <img src={s.avatar_url} alt={s.full_name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary-color)' }} />
                            ) : (
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{s.full_name ? s.full_name[0] : 'S'}</div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 'bold' }}>{s.full_name}</span>
                              {s.status === 'pending' ? (
                                <span style={{ 
                                  width: 'fit-content',
                                  background: 'rgba(242, 122, 36, 0.1)', 
                                  color: 'var(--accent-color)', 
                                  padding: '0.15rem 0.45rem', 
                                  borderRadius: '6px', 
                                  fontSize: '0.65rem', 
                                  fontWeight: 'bold',
                                  marginTop: '0.2rem'
                                }}>
                                  Pending Review
                                </span>
                              ) : (
                                <span style={{ 
                                  width: 'fit-content',
                                  background: 'rgba(40, 167, 69, 0.1)', 
                                  color: '#28a745', 
                                  padding: '0.15rem 0.45rem', 
                                  borderRadius: '6px', 
                                  fontSize: '0.65rem', 
                                  fontWeight: 'bold',
                                  marginTop: '0.2rem'
                                }}>
                                  Approved
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{s.grade_level}</td>
                          <td style={{ textTransform: 'capitalize' }}>{s.program}</td>
                          <td style={{ textTransform: 'capitalize' }}>{s.schedule}</td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>{s.parentName || 'N/A'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#718096' }}>{s.phone} | {s.email}</div>
                          </td>
                          <td>{s.start_date}</td>
                          <td style={{ fontSize: '0.8rem', maxWidth: '200px' }}>{s.special_needs || <span style={{ color: '#cbd5e0' }}>None</span>}</td>
                          <td>
                            <div className="btn-action-group" style={{ display: 'flex', gap: '0.4rem' }}>
                              {!s.is_active && (
                                <button 
                                  className="btn-action approve" 
                                  onClick={() => {
                                    setStudentToActivate(s);
                                    setShowActivationModal(true);
                                    setActivationPassword('');
                                  }}
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  Activate
                                </button>
                              )}
                              <button 
                                className="btn-action edit" 
                                onClick={() => {
                                  setEditingStudent(s);
                                  setShowEditStudentModal(true);
                                }}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                Edit
                              </button>
                              <button className="btn-action delete" onClick={() => handleDeleteStudent(s.id)}>Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Tutors Registry */}
        {activeTab === 'tutors' && (
          <div>
            <div className="dashboard-card">
              <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserCheck size={18} color="var(--primary-color)" /> Active Tutors</span>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={() => setShowTutorModal(true)}>
                  <Plus size={14} /> Add New Tutor
                </button>
              </h3>
              {tutors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No active tutors.</div>
              ) : (
                <div className="table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Tutor Name</th>
                        <th>Subject</th>
                        <th>Rating</th>
                        <th>Experience</th>
                        <th>Bio Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tutors.map((t) => (
                        <tr key={t.id}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `url(${t.avatar_url}) center center`, backgroundSize: 'cover' }}></div>
                            <span style={{ fontWeight: 'bold' }}>{t.full_name}</span>
                          </td>
                          <td>{t.subject}</td>
                          <td>⭐ {t.rating}</td>
                          <td style={{ fontSize: '0.85rem' }}>{t.experience}</td>
                          <td style={{ fontSize: '0.8rem', maxWidth: '250px' }}>{t.bio || 'No bio provided'}</td>
                          <td><button className="btn-action delete" onClick={() => handleDeleteTutor(t.id)}>Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Course Builder */}
        {activeTab === 'courses' && (
          <div style={{ height: 'calc(100vh - 10rem)', display: 'flex', flexDirection: 'column' }}>

            {/* Course Builder layout grid */}
            <div className="course-builder-layout">
              
              {/* Left Column: Create Course & Selection */}
              <div className="course-builder-left">
                
                {/* Course Creation Card */}
                <div className="dashboard-card">
                  <h3><Plus size={16} /> New Course</h3>
                  <form onSubmit={handleCreateCourse} className="login-form" style={{ gap: '0.8rem' }}>
                    <div className="form-group">
                      <label>Course Title *</label>
                      <input 
                        type="text" 
                        value={newCourse.title} 
                        onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Frontend Development"
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Course Description</label>
                      <textarea 
                        value={newCourse.description} 
                        onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Short overview..."
                        rows={3}
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Course Category *</label>
                      <select
                        value={newCourse.course_type || 'regular'}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, course_type: e.target.value }))}
                        required
                        style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '0.85rem' }}
                      >
                        <option value="regular">Regular Course (e.g. Class I-VI)</option>
                        <option value="special">Special Class (e.g. Programming, AI)</option>
                      </select>
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '0.7rem' }}>Create Course</button>
                  </form>
                </div>

                {/* Course Registry List */}
                <div className="dashboard-card course-builder-left-list" style={{ padding: '1.25rem', marginBottom: 0 }}>
                  <h3><BookOpen size={16} /> Course Registry</h3>
                  {courses.length === 0 ? (
                    <div style={{ padding: '1rem', color: '#a0aec0', fontSize: '0.85rem' }}>No courses.</div>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {courses.map(c => (
                        <li 
                          key={c.id} 
                          style={{ 
                            padding: '0.75rem', 
                            borderRadius: '10px', 
                            background: selectedCourseId === c.id ? '#edf2f7' : '#f7fafc',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: selectedCourseId === c.id ? '1px solid var(--primary-color)' : '1px solid transparent'
                          }}
                          onClick={() => setSelectedCourseId(c.id)}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary-color)' }}>{c.title}</span>
                            <span style={{ fontSize: '0.72rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              ID: {c.id}
                              <span style={{ 
                                background: c.course_type === 'special' ? 'rgba(242, 122, 36, 0.1)' : 'rgba(15, 44, 89, 0.1)', 
                                color: c.course_type === 'special' ? 'var(--accent-color)' : 'var(--primary-color)',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                textTransform: 'capitalize'
                              }}>
                                {c.course_type || 'regular'}
                              </span>
                            </span>
                          </div>
                          <button 
                            className="btn-action delete" 
                            style={{ padding: '0.2rem 0.4rem' }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteCourse(c.id); }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right Column: Topics, Materials, Tasks */}
              <div className="course-builder-right">
                {selectedCourseId ? (
                  <>
                    
                    {/* Top: Add Syllabus Topic */}
                    <div className="dashboard-card" style={{ background: '#fcfdfe', padding: '1.25rem', marginBottom: 0 }}>
                      <h3><Plus size={16} /> Add Syllabus Topic</h3>
                      <form onSubmit={handleCreateTopic} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem' }}>Topic Title *</label>
                        <input type="text" value={newTopic.title} onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Intro to Loops" required />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem' }}>Description Summary</label>
                        <input type="text" value={newTopic.description} onChange={(e) => setNewTopic(prev => ({ ...prev, description: e.target.value }))} placeholder="Briefly describe what students will learn..." />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem' }}>Sort Order</label>
                        <input type="number" value={newTopic.sort_order} onChange={(e) => setNewTopic(prev => ({ ...prev, sort_order: Number(e.target.value) }))} required />
                      </div>
                      <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1rem' }}>Add Lesson</button>
                    </form>
                  </div>

                  {/* Syllabus Outline Tree */}
                  <div className="dashboard-card course-builder-syllabus-scroll" style={{ padding: '1.5rem', marginBottom: 0 }}>
                    <h3 style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                      <Layers size={18} /> Course Outline Syllabus ({courses.find(c => c.id === selectedCourseId)?.title})
                    </h3>

                    {topics.filter(t => t.course_id === selectedCourseId).length === 0 ? (
                      <div style={{ padding: '3rem', background: '#f7fafc', border: '2px dashed #edf2f7', borderRadius: '15px', textAlign: 'center', color: '#a0aec0' }}>
                        No topics added to this syllabus yet. Use the form above to add lessons.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {topics.filter(t => t.course_id === selectedCourseId).map((t, idx) => {
                          const topicMats = materials.filter(m => m.topic_id === t.id);
                          const topicTasks = tasks.filter(tk => tk.topic_id === t.id);
                          const showMaterialForm = activeTopicMaterialId === t.id;
                          const showTaskForm = activeTopicTaskId === t.id;

                          return (
                            <div key={t.id} className="dashboard-card" style={{ border: '1px solid #edf2f7', borderRadius: '15px', position: 'relative' }}>
                              
                              {/* Topic Header */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f7fafc', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                                <div>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-color)', textTransform: 'uppercase', tracking: 'wide' }}>
                                    Lesson {t.sort_order}
                                  </span>
                                  <h4 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: '0.2rem 0 0.3rem 0' }}>
                                    {t.title}
                                  </h4>
                                  <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0 }}>
                                    {t.description || 'No description summary.'}
                                  </p>
                                </div>
                                
                                {/* Topic actions */}
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <button className="btn-action edit" style={{ padding: '0.3rem' }} onClick={() => handleMoveTopic(t.id, 'up')} title="Move Lesson Up">
                                    <ArrowUp size={14} />
                                  </button>
                                  <button className="btn-action edit" style={{ padding: '0.3rem' }} onClick={() => handleMoveTopic(t.id, 'down')} title="Move Lesson Down">
                                    <ArrowDown size={14} />
                                  </button>
                                  <button className="btn-action delete" style={{ padding: '0.3rem', color: 'red' }} onClick={() => handleDeleteTopic(t.id)} title="Delete Lesson">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Topic Body: Materials and Tasks */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                
                                {/* Left Section: Materials */}
                                <div style={{ borderRight: '1px solid #edf2f7', paddingRight: '1rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                    <h5 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>Lesson Attachments</h5>
                                    <button 
                                      className="btn-action approve" 
                                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                      onClick={() => {
                                        if (showMaterialForm) {
                                          setActiveTopicMaterialId('');
                                        } else {
                                          setActiveTopicMaterialId(t.id);
                                          setSelectedTopicId(t.id);
                                          setMaterialTitle('');
                                          setMaterialFile(null);
                                        }
                                      }}
                                    >
                                      {showMaterialForm ? 'Cancel' : '+ Add File'}
                                    </button>
                                  </div>

                                  {/* Upload Material Inline Form */}
                                  {showMaterialForm && (
                                    <form onSubmit={handleUploadMaterial} style={{ background: '#f7fafc', padding: '0.8rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.8rem' }}>
                                      <div className="form-group" style={{ margin: 0 }}>
                                        <input type="text" value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} placeholder="File Title (e.g. PDF Guide)" required style={{ padding: '0.4rem', fontSize: '0.8rem' }} />
                                      </div>
                                      <div className="form-group" style={{ margin: 0 }}>
                                        <input type="file" onChange={(e) => setMaterialFile(e.target.files[0])} required style={{ fontSize: '0.75rem' }} />
                                      </div>
                                      <button type="submit" className="btn-primary" style={{ padding: '0.4rem', fontSize: '0.8rem' }} disabled={uploading}>
                                        {uploading ? 'Uploading...' : 'Upload Attachment'}
                                      </button>
                                    </form>
                                  )}

                                  {/* Materials List */}
                                  {topicMats.length === 0 ? (
                                    <span style={{ fontSize: '0.8rem', color: '#cbd5e0', fontStyle: 'italic' }}>No files attached.</span>
                                  ) : (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                      {topicMats.map(m => (
                                        <li key={m.id} style={{ display: 'flex', justify: 'space-between', items: 'center', background: '#f7fafc', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Paperclip size={12} color="#4a5568" />
                                            <a href={m.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', fontWeight: '500', textDecoration: 'underline' }}>{m.title}</a>
                                            <span style={{ fontSize: '0.65rem', color: '#a0aec0', textTransform: 'uppercase' }}>({m.file_type})</span>
                                          </div>
                                          <button style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer' }} onClick={() => handleDeleteMaterial(m.id)}><Trash2 size={12} /></button>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>

                                {/* Right Section: Tasks & Quizzes */}
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                    <h5 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>Homework & Quizzes</h5>
                                    <button 
                                      className="btn-action approve" 
                                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                      onClick={() => {
                                        if (showTaskForm) {
                                          setActiveTopicTaskId('');
                                        } else {
                                          setActiveTopicTaskId(t.id);
                                          setSelectedTopicId(t.id);
                                          setTaskTitle('');
                                          setTaskDesc('');
                                          setTaskType('assignment');
                                          setMaxPoints(100);
                                          setQuizQuestions([]);
                                        }
                                      }}
                                    >
                                      {showTaskForm ? 'Cancel' : '+ Add Task'}
                                    </button>
                                  </div>

                                  {/* Add Task Inline Form */}
                                  {showTaskForm && (
                                    <form onSubmit={handleAddTask} style={{ background: '#f7fafc', padding: '0.8rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.8rem' }}>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.5rem' }}>
                                        <select value={taskType} onChange={(e) => setTaskType(e.target.value)} required style={{ padding: '0.35rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                                          <option value="assignment">Assignment</option>
                                          <option value="quiz">Interactive Quiz</option>
                                          <option value="instruction">Instructional Text</option>
                                        </select>
                                        <input type="number" value={maxPoints} onChange={(e) => setMaxPoints(Number(e.target.value))} placeholder="Max Pts" required style={{ padding: '0.35rem', fontSize: '0.8rem' }} />
                                      </div>
                                      
                                      <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task Title" required style={{ padding: '0.35rem', fontSize: '0.8rem' }} />
                                      <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Instructions..." rows={2} style={{ padding: '0.35rem', fontSize: '0.8rem' }}></textarea>

                                      {/* Inline Quiz Question Compiler */}
                                      {taskType === 'quiz' && (
                                        <div style={{ background: 'white', padding: '0.6rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-color)', fontSize: '0.8rem' }}>
                                          <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.4rem', color: 'var(--primary-color)' }}>Questions Config</span>
                                          
                                          <input type="text" value={newQText} onChange={(e) => setNewQText(e.target.value)} placeholder="Question Prompt" style={{ padding: '0.3rem', fontSize: '0.75rem', width: '100%', marginBottom: '0.4rem' }} />
                                          
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.4rem' }}>
                                            {newQOptions.map((opt, oIdx) => (
                                              <input 
                                                key={oIdx}
                                                type="text" 
                                                value={opt} 
                                                onChange={(e) => {
                                                  const cpy = [...newQOptions];
                                                  cpy[oIdx] = e.target.value;
                                                  setNewQOptions(cpy);
                                                }}
                                                placeholder={`Choice ${oIdx + 1}`}
                                                style={{ padding: '0.25rem', fontSize: '0.7rem' }}
                                              />
                                            ))}
                                          </div>

                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <select value={newQCorrect} onChange={(e) => setNewQCorrect(Number(e.target.value))} style={{ padding: '0.2rem', fontSize: '0.7rem' }}>
                                              <option value={0}>Ans: Opt 1</option>
                                              <option value={1}>Ans: Opt 2</option>
                                              <option value={2}>Ans: Opt 3</option>
                                            </select>
                                            <button type="button" className="btn-action approve" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }} onClick={handleAddQuizQuestion}>+ Add Q</button>
                                          </div>

                                          {/* Quiz Compiled List */}
                                          {quizQuestions.length > 0 && (
                                            <div style={{ marginTop: '0.4rem', borderTop: '1px solid #edf2f7', paddingTop: '0.3rem' }}>
                                              <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Added questions: {quizQuestions.length}</span>
                                              <ul style={{ paddingLeft: '1rem', margin: '0.2rem 0', fontSize: '0.68rem' }}>
                                                {quizQuestions.map((q, idx) => (
                                                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>{idx + 1}. {q.question}</span>
                                                    <button type="button" onClick={() => setQuizQuestions(prev => prev.filter((_, i) => i !== idx))} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer', fontSize: '0.7rem' }}>X</button>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <button type="submit" className="btn-primary" style={{ padding: '0.4rem', fontSize: '0.8rem' }}>Create Task</button>
                                    </form>
                                  )}

                                  {/* Tasks List */}
                                  {topicTasks.length === 0 ? (
                                    <span style={{ fontSize: '0.8rem', color: '#cbd5e0', fontStyle: 'italic' }}>No tasks assigned.</span>
                                  ) : (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                      {topicTasks.map(tk => (
                                        <li key={tk.id} style={{ display: 'flex', justify: 'space-between', items: 'center', background: '#f7fafc', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span className={`badge`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', textTransform: 'capitalize' }}>{tk.task_type}</span>
                                            <span style={{ fontWeight: 'bold' }}>{tk.title}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#718096' }}>({tk.max_points} pts)</span>
                                          </div>
                                          <button style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer' }} onClick={() => handleDeleteTask(tk.id)}><Trash2 size={12} /></button>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>

                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '2rem', background: '#f7fafc', borderRadius: '15px', textAlign: 'center', color: '#a0aec0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', marginBottom: 0 }}>
                  Please create or select a Course to configure syllabus topics, files, and quizzes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Tab 5: Enrollments mapping */}
        {activeTab === 'enrollments' && (
          <div>


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Tutor-to-Course Mapper */}
              <div className="dashboard-card">
                <h3><UserCheck size={18} /> Assign Tutors to Course</h3>
                <form onSubmit={handleMapTutor} className="login-form" style={{ gap: '1rem', marginBottom: '2rem' }}>
                  <div className="form-group">
                    <label>Select Course *</label>
                    <select value={mapCourseId} onChange={(e) => setMapCourseId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                      <option value="">-- Choose Course --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Instructor *</label>
                    <select value={mapTutorId} onChange={(e) => setMapTutorId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                      <option value="">-- Choose Tutor --</option>
                      {tutors.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>Assign Instructor</button>
                </form>

                {/* Course Tutor Assignment Log */}
                <h4>Assigned Teaching Staff</h4>
                {courseTutors.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#a0aec0', padding: '1rem' }}>No mapping assignments.</div>
                ) : (
                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Tutor</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseTutors.map((ct, i) => {
                          const cTitle = courses.find(c => c.id === ct.course_id)?.title || 'Course';
                          const tName = tutors.find(t => t.id === ct.tutor_id)?.full_name || 'Tutor';
                          return (
                            <tr key={i}>
                              <td style={{ fontWeight: 'bold' }}>{cTitle}</td>
                              <td>{tName}</td>
                              <td><button className="btn-action delete" style={{ padding: '0.2rem 0.4rem' }} onClick={() => handleUnmapTutor(ct.course_id, ct.tutor_id)}><Trash2 size={12} /></button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Student Course Enrollment Mapper */}
              <div className="dashboard-card">
                <h3><BookOpenCheck size={18} /> Enroll Student in Course</h3>
                <form onSubmit={handleEnrollStudent} className="login-form" style={{ gap: '1rem', marginBottom: '2rem' }}>
                  <div className="form-group">
                    <label>Select Student *</label>
                    <select value={enrollStudentId} onChange={(e) => setEnrollStudentId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                      <option value="">-- Choose Student --</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Course *</label>
                    <select value={enrollCourseId} onChange={(e) => setEnrollCourseId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                      <option value="">-- Choose Course --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Assigned Tutor *</label>
                    <select value={enrollTutorId} onChange={(e) => setEnrollTutorId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                      <option value="">-- Choose Instructor --</option>
                      {courseTutors.filter(ct => ct.course_id === enrollCourseId).map(ct => {
                        const t = tutors.find(tu => tu.id === ct.tutor_id);
                        return t ? <option key={t.id} value={t.id}>{t.full_name}</option> : null;
                      })}
                      {courseTutors.filter(ct => ct.course_id === enrollCourseId).length === 0 && tutors.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>Enroll Student</button>
                </form>

                {/* Enrollment Log */}
                <h4>Student Enrollment Registry</h4>
                {studentCourses.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#a0aec0', padding: '1rem' }}>No student enrolments.</div>
                ) : (
                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Course</th>
                          <th>Tutor</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentCourses.map((sc, i) => {
                          const sName = students.find(s => s.id === sc.student_id)?.full_name || 'Student';
                          const cTitle = courses.find(c => c.id === sc.course_id)?.title || 'Course';
                          const tName = tutors.find(t => t.id === sc.tutor_id)?.full_name || 'Tutor';
                          return (
                            <tr key={i}>
                              <td style={{ fontWeight: 'bold' }}>{sName}</td>
                              <td>{cTitle}</td>
                              <td>{tName}</td>
                              <td><button className="btn-action delete" style={{ padding: '0.2rem 0.4rem' }} onClick={() => handleUnenrollStudent(sc.student_id, sc.course_id)}><Trash2 size={12} /></button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 6: Class Schedules */}
        {activeTab === 'schedules' && (
          <div>

            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Left Column: Create Schedule */}
              <div className="dashboard-card">
                <h3><Calendar size={18} /> Schedule Virtual Class</h3>
                <form onSubmit={handleCreateSchedule} className="login-form" style={{ gap: '0.8rem' }}>
                  <div className="form-group">
                    <label>Select Student *</label>
                    <select value={schStudentId} onChange={(e) => setSchStudentId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                      <option value="">-- Choose Student --</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Course *</label>
                    <select value={schCourseId} onChange={(e) => setSchCourseId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                      <option value="">-- Choose Course --</option>
                      {studentCourses.filter(sc => sc.student_id === schStudentId).map(sc => {
                        const c = courses.find(co => co.id === sc.course_id);
                        return c ? <option key={c.id} value={c.id}>{c.title}</option> : null;
                      })}
                      {studentCourses.filter(sc => sc.student_id === schStudentId).length === 0 && courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Tutor *</label>
                    <select value={schTutorId} onChange={(e) => setSchTutorId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                      <option value="">-- Choose Instructor --</option>
                      {studentCourses.filter(sc => sc.student_id === schStudentId && sc.course_id === schCourseId).map(sc => {
                        const t = tutors.find(tu => tu.id === sc.tutor_id);
                        return t ? <option key={t.id} value={t.id}>{t.full_name}</option> : null;
                      })}
                      {studentCourses.filter(sc => sc.student_id === schStudentId && sc.course_id === schCourseId).length === 0 && tutors.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Lecture Title *</label>
                    <input type="text" value={schTitle} onChange={(e) => setSchTitle(e.target.value)} placeholder="e.g. HTML Intro Live Session" required />
                  </div>
                  <div className="form-group">
                    <label>Start Time *</label>
                    <input type="datetime-local" value={schStart} onChange={(e) => setSchStart(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>End Time *</label>
                    <input type="datetime-local" value={schEnd} onChange={(e) => setSchEnd(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Meeting Join Link (e.g. Zoom/Teams)</label>
                    <input type="url" value={schLink} onChange={(e) => setSchLink(e.target.value)} placeholder="https://zoom.us/j/123456" />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>Schedule Lecture</button>
                </form>
              </div>

              {/* Right Column: Timetable Grid */}
              <div className="dashboard-card">
                <h3><Clock size={18} /> Scheduled Lectures Registry</h3>
                {schedules.length === 0 ? (
                  <div style={{ color: '#a0aec0', padding: '2rem', textAlign: 'center' }}>No scheduled classes.</div>
                ) : (
                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Lecture</th>
                          <th>Student</th>
                          <th>Tutor</th>
                          <th>Date / Time</th>
                          <th>Link</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map(s => {
                          const sName = students.find(st => st.id === s.student_id)?.full_name || 'Student';
                          const tName = tutors.find(tu => tu.id === s.tutor_id)?.full_name || 'Tutor';
                          return (
                            <tr key={s.id}>
                              <td style={{ fontWeight: 'bold' }}>{s.title}</td>
                              <td>{sName}</td>
                              <td>{tName}</td>
                              <td style={{ fontSize: '0.8rem' }}>
                                {new Date(s.start_time).toLocaleString()} - {new Date(s.end_time).toLocaleTimeString()}
                              </td>
                              <td>
                                {s.meeting_link ? <a href={s.meeting_link} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline', fontSize: '0.8rem' }}>Join Class</a> : <span style={{ color: '#cbd5e0' }}>None</span>}
                              </td>
                              <td><button className="btn-action delete" style={{ padding: '0.2rem 0.4rem' }} onClick={() => handleDeleteSchedule(s.id)}><Trash2 size={12} /></button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 7: Contact Messages */}
        {activeTab === 'inquiries' && (
          <div>

            <div className="dashboard-card">
              <h3><Mail size={18} color="var(--primary-color)" /> Contact Inquiries</h3>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No customer messages.</div>
              ) : (
                <div className="table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Sender</th>
                        <th>Subject</th>
                        <th>Contact Details</th>
                        <th>Message Body</th>
                        <th>Received At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 'bold' }}>{m.name}</td>
                          <td style={{ fontWeight: '600' }}>{m.subject || 'No Subject'}</td>
                          <td style={{ fontSize: '0.8rem' }}>
                            <div>{m.email}</div>
                            <div>{m.phone || 'No Phone'}</div>
                          </td>
                          <td style={{ fontSize: '0.85rem', maxWidth: '350px' }}>{m.message}</td>
                          <td style={{ fontSize: '0.8rem' }}>{m.created_at ? new Date(m.created_at).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Tutor Modal Overlay */}
      {showTutorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowTutorModal(false)}><X size={20} /></button>
            <h3 className="modal-title">Register New Instructor</h3>
            <form onSubmit={handleAddTutorSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Login Email *</label>
                  <input type="email" value={newTutor.email} onChange={(e) => setNewTutor(prev => ({ ...prev, email: e.target.value }))} placeholder="tutor@foundaxia.com" required />
                </div>
                <div className="form-group">
                  <label>Login Password *</label>
                  <input type="password" value={newTutor.password} onChange={(e) => setNewTutor(prev => ({ ...prev, password: e.target.value }))} placeholder="Enter secure password" required />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Instructor Name *</label>
                <input type="text" value={newTutor.full_name} onChange={(e) => setNewTutor(prev => ({ ...prev, full_name: e.target.value }))} placeholder="e.g. Chioma Okafor" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Subject Focus *</label>
                  <input type="text" value={newTutor.subject} onChange={(e) => setNewTutor(prev => ({ ...prev, subject: e.target.value }))} placeholder="e.g. Mathematics, English" required />
                </div>
                <div className="form-group">
                  <label>Experience / Credentials *</label>
                  <input type="text" value={newTutor.experience} onChange={(e) => setNewTutor(prev => ({ ...prev, experience: e.target.value }))} placeholder="e.g. B.Sc Chemistry, 5+ years" required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Instructor Avatar Photo (Optional)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input type="file" accept="image/*" onChange={handleModalTutorAvatarChange} disabled={uploading} style={{ flex: '1', border: 'none', background: 'transparent', padding: '0.5rem 0' }} />
                  <input type="text" value={newTutor.avatar_url} onChange={(e) => setNewTutor(prev => ({ ...prev, avatar_url: e.target.value }))} placeholder="Avatar image URL (Auto-filled on upload)" style={{ flex: '2' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Instructor Short Bio Details</label>
                <textarea value={newTutor.bio} onChange={(e) => setNewTutor(prev => ({ ...prev, bio: e.target.value }))} placeholder="Describe credentials and rate details..." rows={3}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-prev" onClick={() => setShowTutorModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Add Tutor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal Overlay */}
      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <button className="modal-close" onClick={() => setShowStudentModal(false)}><X size={20} /></button>
            <h3 className="modal-title">Register New Student Account</h3>
            <form onSubmit={handleAddStudentSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Login Email *</label>
                  <input type="email" value={newStudent.email} onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))} placeholder="student@foundaxia.com" required />
                </div>
                <div className="form-group">
                  <label>Login Password *</label>
                  <input type="password" value={newStudent.password} onChange={(e) => setNewStudent(prev => ({ ...prev, password: e.target.value }))} placeholder="Create secure password" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Student Full Name *</label>
                  <input type="text" value={newStudent.full_name} onChange={(e) => setNewStudent(prev => ({ ...prev, full_name: e.target.value }))} placeholder="e.g. Tobi Coker" required />
                </div>
                <div className="form-group">
                  <label>Contact Phone *</label>
                  <input type="text" value={newStudent.phone} onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))} placeholder="e.g. 08012345678" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" value={newStudent.date_of_birth} onChange={(e) => setNewStudent(prev => ({ ...prev, date_of_birth: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select value={newStudent.gender} onChange={(e) => setNewStudent(prev => ({ ...prev, gender: e.target.value }))} style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Grade Level *</label>
                <input type="text" value={newStudent.grade_level} onChange={(e) => setNewStudent(prev => ({ ...prev, grade_level: e.target.value }))} placeholder="e.g. Grade 5" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Program Focus *</label>
                  <select value={newStudent.program} onChange={(e) => setNewStudent(prev => ({ ...prev, program: e.target.value }))} style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                    <option value="regular">Regular Academy</option>
                    <option value="tutoring">One-on-One Tutoring</option>
                    <option value="remedial">Remedial Classes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Preferred Schedule *</label>
                  <select value={newStudent.schedule} onChange={(e) => setNewStudent(prev => ({ ...prev, schedule: e.target.value }))} style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                    <option value="morning">Morning Shift (9am - 12pm)</option>
                    <option value="afternoon">Afternoon Shift (1pm - 4pm)</option>
                    <option value="weekend">Weekend Shift (10am - 2pm)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={newStudent.start_date} onChange={(e) => setNewStudent(prev => ({ ...prev, start_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Special Needs / Health Notes</label>
                  <input type="text" value={newStudent.special_needs} onChange={(e) => setNewStudent(prev => ({ ...prev, special_needs: e.target.value }))} placeholder="e.g. dyslexic, asthma notes" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Student Avatar Photo (Optional)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input type="file" accept="image/*" onChange={handleModalStudentAvatarChange} disabled={uploading} style={{ flex: '1', border: 'none', background: 'transparent', padding: '0.5rem 0' }} />
                  <input type="text" value={newStudent.avatar_url || ''} onChange={(e) => setNewStudent(prev => ({ ...prev, avatar_url: e.target.value }))} placeholder="Avatar image URL (Auto-filled on upload)" style={{ flex: '2' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-prev" onClick={() => setShowStudentModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Register Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Account Activation Modal */}
      {showActivationModal && studentToActivate && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-in" style={{ maxWidth: '420px', padding: '2rem', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #edf2f7', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.25rem' }}>Activate Student Login</h3>
              <button onClick={() => { setShowActivationModal(false); setStudentToActivate(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleActivateStudentSubmit}>
              <div style={{ background: '#f7fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#4a5568' }}>
                <p style={{ margin: '0 0 0.4rem 0' }}><strong>Student Name:</strong> {studentToActivate.full_name}</p>
                <p style={{ margin: 0 }}><strong>Email/Login Username:</strong> {studentToActivate.email}</p>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Set Login Password *</label>
                <input 
                  type="password" 
                  value={activationPassword} 
                  onChange={(e) => setActivationPassword(e.target.value)} 
                  placeholder="Min 6 characters..." 
                  required 
                  minLength={6}
                  style={{ padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-prev" onClick={() => { setShowActivationModal(false); setStudentToActivate(null); }}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={activating}>
                  {activating ? 'Activating...' : 'Activate Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Profile Modal */}
      {showEditStudentModal && editingStudent && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-in" style={{ maxWidth: '600px', padding: '2rem', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #edf2f7', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.25rem' }}>Edit Student Profile</h3>
              <button onClick={() => { setShowEditStudentModal(false); setEditingStudent(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditStudentSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Student Email Address *</label>
                  <input 
                    type="email" 
                    value={editingStudent.email || ''} 
                    onChange={(e) => setEditingStudent(prev => ({ ...prev, email: e.target.value }))} 
                    required 
                    readOnly={editingStudent.is_active}
                    style={{ 
                      padding: '0.75rem', 
                      borderRadius: '10px', 
                      border: '2px solid #e2e8f0', 
                      width: '100%',
                      background: editingStudent.is_active ? '#f7fafc' : 'white',
                      cursor: editingStudent.is_active ? 'not-allowed' : 'text'
                    }} 
                  />
                  {editingStudent.is_active && (
                    <span style={{ fontSize: '0.7rem', color: '#a0aec0' }}>Email is locked for active accounts</span>
                  )}
                </div>
                
                {!editingStudent.is_active ? (
                  <div className="form-group">
                    <label>Set Login Password (Activate Account)</label>
                    <input 
                      type="password" 
                      value={studentEditPassword} 
                      onChange={(e) => setStudentEditPassword(e.target.value)} 
                      placeholder="Min 6 characters to activate..." 
                      style={{ padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }} 
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Update Login Password (Leave blank to keep current)</label>
                    <input 
                      type="password" 
                      value={studentEditPassword} 
                      onChange={(e) => setStudentEditPassword(e.target.value)} 
                      placeholder="Enter new password to reset..." 
                      style={{ padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }} 
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Student's Full Name *</label>
                  <input type="text" value={editingStudent.full_name || ''} onChange={(e) => setEditingStudent(prev => ({ ...prev, full_name: e.target.value }))} required style={{ padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }} />
                </div>
                <div className="form-group">
                  <label>Contact Phone *</label>
                  <input type="text" value={editingStudent.phone || ''} onChange={(e) => setEditingStudent(prev => ({ ...prev, phone: e.target.value }))} required style={{ padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Date of Birth (Admin Only) *</label>
                  <input type="date" value={editingStudent.date_of_birth || ''} onChange={(e) => setEditingStudent(prev => ({ ...prev, date_of_birth: e.target.value }))} required style={{ padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }} />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select value={editingStudent.gender || 'male'} onChange={(e) => setEditingStudent(prev => ({ ...prev, gender: e.target.value }))} style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Registration Status *</label>
                <select value={editingStudent.status || 'pending'} onChange={(e) => setEditingStudent(prev => ({ ...prev, status: e.target.value }))} style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%', fontFamily: 'inherit' }}>
                  <option value="pending">Pending Review (Public Lead)</option>
                  <option value="approved">Approved / Enrolled Student</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Grade Level *</label>
                <input type="text" value={editingStudent.grade_level || ''} onChange={(e) => setEditingStudent(prev => ({ ...prev, grade_level: e.target.value }))} required style={{ padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Program Focus *</label>
                  <select value={editingStudent.program || 'regular'} onChange={(e) => setEditingStudent(prev => ({ ...prev, program: e.target.value }))} style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }}>
                    <option value="regular">Regular Academy</option>
                    <option value="tutoring">One-on-One Tutoring</option>
                    <option value="remedial">Remedial Classes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Preferred Schedule *</label>
                  <select value={editingStudent.schedule || 'morning'} onChange={(e) => setEditingStudent(prev => ({ ...prev, schedule: e.target.value }))} style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }}>
                    <option value="morning">Morning Shift (9am - 12pm)</option>
                    <option value="afternoon">Afternoon Shift (1pm - 4pm)</option>
                    <option value="weekend">Weekend Shift (10am - 2pm)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={editingStudent.start_date || ''} onChange={(e) => setEditingStudent(prev => ({ ...prev, start_date: e.target.value }))} style={{ padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }} />
                </div>
                <div className="form-group">
                  <label>Special Needs / Health Notes</label>
                  <input type="text" value={editingStudent.special_needs || ''} onChange={(e) => setEditingStudent(prev => ({ ...prev, special_needs: e.target.value }))} style={{ padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Student Avatar Photo</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input type="file" accept="image/*" onChange={handleEditModalStudentAvatarChange} disabled={uploading} style={{ flex: '1', border: 'none', background: 'transparent', padding: '0.5rem 0' }} />
                  <input type="text" value={editingStudent.avatar_url || ''} onChange={(e) => setEditingStudent(prev => ({ ...prev, avatar_url: e.target.value }))} placeholder="Avatar image URL" style={{ flex: '2', padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Additional Comments / Public Form Details</label>
                <textarea 
                  value={editingStudent.additional_comments || ''} 
                  onChange={(e) => setEditingStudent(prev => ({ ...prev, additional_comments: e.target.value }))} 
                  rows={4}
                  placeholder="Enter comments or notes..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '2px solid #e2e8f0', fontFamily: 'inherit', fontSize: '0.9rem' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-prev" onClick={() => { setShowEditStudentModal(false); setEditingStudent(null); }}>Cancel</button>
                <button type="submit" className="btn-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
