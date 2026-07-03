import React, { useState, useEffect } from 'react';
import { 
  getBookings, getStudents, updateStudent, updateBookingStatus, uploadAvatar,
  getStudentCourses, getCourses, getTutors,
  getTopics, getMaterials, uploadMaterialFile,
  getTasks, getStudentTasks, submitStudentTask,
  getSchedules, getAttendance,
  getAnnouncements,
  getChatMessages, sendChatMessage
} from '../services/dataService';
import { 
  Calendar, User, BookOpen, Clock, AlertCircle, Save, 
  MessageSquare, FileText, Send, CheckSquare, Award, Check, X, Megaphone, Play, LayoutDashboard
} from 'lucide-react';
import '../styles/Dashboard.css';

export default function StudentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // LMS Student state variables
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Active LMS states
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Interactive Quiz state variables
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  // Homework Submission inputs
  const [activeSubTaskId, setActiveSubTaskId] = useState(null);
  const [subText, setSubText] = useState('');
  const [subFile, setSubFile] = useState(null);

  // Chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [activeTutorChat, setActiveTutorChat] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // Load dynamically based on logged-in student details
  const studentId = user?.id || 's1'; 

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadAvatar(studentInfo?.id || user?.id, file);
      setStudentInfo(prev => ({ ...prev, avatar_url: publicUrl }));
      alert('Picture uploaded successfully! Remember to save changes at the bottom.');
    } catch (err) {
      alert('Failed to upload picture: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const loadStudentData = async () => {
    try {
      const [allBookings, allStudents, scList, cList, tList, tpList, matList, tkList, subList, schList, attList, annList, msgList] = await Promise.all([
        getBookings(), getStudents(), getStudentCourses(), getCourses(), getTutors(),
        getTopics(), getMaterials(), getTasks(), getStudentTasks(), getSchedules(),
        getAttendance(), getAnnouncements(), getChatMessages()
      ]);

      const currentStudent = allStudents.find(s => 
        s.id === studentId || 
        s.profile_id === studentId ||
        s.email === user?.email
      );
      setStudentInfo(currentStudent);

      const actualStudentId = currentStudent?.id || studentId;

      // Filter bookings for Tobi Coker (or matching by student_name)
      const nameToMatch = currentStudent ? currentStudent.full_name : (user?.full_name || 'Tobi Coker');
      const filtered = allBookings.filter(b => 
        b.student_name.toLowerCase() === nameToMatch.toLowerCase() ||
        b.email === currentStudent?.email ||
        b.email === user?.email
      );
      setBookings(filtered);

      const studEnroll = scList.filter(x => x.student_id === actualStudentId);
      setEnrollments(studEnroll);
      setCourses(cList);
      setTutors(tList);
      setTopics(tpList);
      setMaterials(matList);
      setTasks(tkList);
      setSubmissions(subList.filter(x => x.student_id === actualStudentId));
      setSchedules(schList.filter(x => x.student_id === actualStudentId));
      setAttendanceLogs(attList.filter(x => x.student_id === actualStudentId));
      setAnnouncements(annList);
      setChatMessages(msgList);

      if (studEnroll.length > 0) setSelectedCourseId(studEnroll[0].course_id);
    } catch (err) {
      console.error('Error loading student dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Never allow email, password, or start_date to be updated from the student side
      const { email, password, start_date, ...safeUpdates } = studentInfo;
      await updateStudent(studentInfo.id, safeUpdates);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      alert('Booking cancelled successfully.');
    } catch (err) {
      alert('Error cancelling booking: ' + err.message);
    }
  };

  // --- LMS STUDENT HANDLERS ---

  const handleQuizOptionSelect = (qIdx, optIdx) => {
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleQuizSubmit = async (taskObj) => {
    const questions = taskObj.quiz_questions || [];
    let correctCount = 0;
    
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    const finalPercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    setQuizScore(finalPercent);

    try {
      const saved = await submitStudentTask({
        task_id: taskObj.id,
        student_id: studentInfo?.id || studentId,
        submission_text: `Interactive Quiz completed. Score: ${finalPercent}% (${correctCount}/${questions.length} correct).`
      });
      setSubmissions(prev => [...prev, saved]);
      alert(`Quiz completed! You scored ${finalPercent}%.`);
    } catch (err) {
      alert('Failed to save quiz results: ' + err.message);
    }
  };

  const handleHomeworkSubmit = async (e) => {
    e.preventDefault();
    if (!activeSubTaskId) return;
    setSaving(true);
    try {
      let fileUrl = '';
      if (subFile) {
        fileUrl = await uploadMaterialFile('sub_' + Date.now(), subFile);
      }
      const saved = await submitStudentTask({
        task_id: activeSubTaskId,
        student_id: studentInfo?.id || studentId,
        submission_text: subText,
        file_url: fileUrl
      });
      setSubmissions(prev => [...prev, saved]);
      setSubText('');
      setSubFile(null);
      setActiveSubTaskId(null);
      alert('Homework submitted successfully!');
    } catch (err) {
      alert('Error submitting homework: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeTutorChat) return;
    try {
      const saved = await sendChatMessage({
        course_id: selectedCourseId || null,
        sender_id: studentInfo?.profile_id || studentInfo?.id || studentId,
        receiver_id: activeTutorChat.profile_id || activeTutorChat.id,
        message_text: chatInput.trim()
      });
      setChatMessages(prev => [...prev, saved]);
      setChatInput('');
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  // Calculations
  const attendedCount = attendanceLogs.filter(a => a.status === 'attended').length;
  const missedCount = attendanceLogs.filter(a => a.status === 'missed').length;
  const totalClasses = attendedCount + missedCount;
  const attendanceRate = totalClasses > 0 ? Math.round((attendedCount / totalClasses) * 100) : 100;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '3rem', color: 'white' }}>Loading Student Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">Student Portal</div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('overview')}><LayoutDashboard size={18} /> Dashboard</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'courses' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('courses')}><BookOpen size={18} /> My Courses</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'timetable' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('timetable')}><Clock size={18} /> Timetable</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'chat' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('chat')}><MessageSquare size={18} /> Tutor Chat</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'homework' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('homework')}><CheckSquare size={18} /> Tasks & Grades</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('bookings')}><Calendar size={18} /> Consultations</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('profile')}><User size={18} /> Personal Info</button>
          </li>
        </ul>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main">

        {/* Tab 0: Overview Dashboard */}
        {activeTab === 'overview' && (
          <div>
            {/* Welcome Banner */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-color) 0%, #1a3a6e 100%)',
              borderRadius: '16px',
              padding: '2rem 2.5rem',
              marginBottom: '2rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', opacity: 0.85 }}>Welcome back,</p>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 800 }}>
                  {studentInfo?.full_name || user?.full_name || 'Student'} 👋
                </h2>
                <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.75 }}>
                  {enrollments.length > 0
                    ? `You're enrolled in ${enrollments.length} course${enrollments.length > 1 ? 's' : ''}. Keep pushing forward!`
                    : 'Your learning journey starts here. Check out available courses!'}
                </p>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '1rem 1.5rem',
                textAlign: 'center',
                minWidth: '120px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{attendanceRate}%</div>
                <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Attendance Rate</div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {[
                { label: 'Courses Enrolled', value: enrollments.length, icon: '📚', color: '#4c6ef5', tab: 'courses' },
                { label: 'Upcoming Classes', value: schedules.filter(s => new Date(s.scheduled_date) >= new Date()).length, icon: '📅', color: '#12b886', tab: 'timetable' },
                { label: 'Pending Tasks', value: tasks.filter(t => !submissions.find(s => s.task_id === t.id)).length, icon: '✏️', color: '#f59f00', tab: 'homework' },
                { label: 'Unread Messages', value: chatMessages.filter(m => m.receiver_id === (studentInfo?.profile_id || studentInfo?.id)).length, icon: '💬', color: '#ae3ec9', tab: 'chat' },
              ].map(stat => (
                <div
                  key={stat.tab}
                  onClick={() => setActiveTab(stat.tab)}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    borderLeft: `4px solid ${stat.color}`,
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
                >
                  <div style={{ fontSize: '1.75rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card">
              <h3 style={{ marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutDashboard size={18} color="var(--primary-color)" /> Quick Actions
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {[
                  { label: '📖 Open My Courses', tab: 'courses' },
                  { label: '🗓️ View Timetable', tab: 'timetable' },
                  { label: '✏️ Tasks & Grades', tab: 'homework' },
                  { label: '💬 Message Tutor', tab: 'chat' },
                  { label: '📞 Book Consultation', tab: 'bookings' },
                  { label: '👤 Edit Profile', tab: 'profile' },
                ].map(action => (
                  <button
                    key={action.tab}
                    onClick={() => setActiveTab(action.tab)}
                    style={{
                      padding: '0.55rem 1.25rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'opacity 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Announcements */}
            {announcements.length > 0 && (
              <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Megaphone size={18} color="var(--primary-color)" /> Recent Announcements
                </h3>
                {announcements.slice(0, 3).map(ann => (
                  <div key={ann.id} style={{
                    padding: '0.85rem 1rem',
                    background: '#f7fafc',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    borderLeft: '3px solid var(--primary-color)'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.25rem' }}>{ann.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#4a5568' }}>{ann.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <div>
            
            <div className="dashboard-card">
              <h3><Calendar size={20} color="var(--primary-color)" /> Appointment Log</h3>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No active consult bookings.</div>
              ) : (
                <div className="table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Assigned Tutor</th>
                        <th>Meeting Date</th>
                        <th>Meeting Time</th>
                        <th>Consultation Type</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 'bold' }}>{b.tutor_name}</td>
                          <td>{b.booking_date}</td>
                          <td>{b.booking_time}</td>
                          <td style={{ textTransform: 'capitalize' }}>{b.meeting_type}</td>
                          <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                          <td>
                            {b.status !== 'cancelled' && b.status !== 'completed' ? (
                              <button className="btn-action cancel" onClick={() => handleCancelBooking(b.id)}>Cancel</button>
                            ) : (
                              <span style={{ fontSize: '0.85rem', color: '#cbd5e0' }}>Inactive</span>
                            )}
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

        {/* Tab 2: My Courses Curriculum Reader */}
        {activeTab === 'courses' && (
          <div>

            {enrollments.length === 0 ? (
              <div style={{ padding: '2rem', background: 'white', borderRadius: '15px', color: '#a0aec0', textAlign: 'center' }}>You are not currently enrolled in any classes. Contact the administrator to assign you.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.8fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* Enrolled selector sidebar */}
                <div className="dashboard-card" style={{ padding: '1rem' }}>
                  <h3>Courses List</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {enrollments.map(en => {
                      const c = courses.find(co => co.id === en.course_id);
                      if (!c) return null;
                      return (
                        <li 
                          key={c.id} 
                          style={{ 
                            padding: '0.8rem', 
                            borderRadius: '10px', 
                            background: selectedCourseId === c.id ? '#edf2f7' : '#f7fafc',
                            cursor: 'pointer',
                            border: selectedCourseId === c.id ? '1px solid var(--primary-color)' : '1px solid transparent'
                          }}
                          onClick={() => { setSelectedCourseId(c.id); setActiveQuizId(null); setQuizAnswers({}); setQuizScore(null); }}
                        >
                          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary-color)', display: 'block' }}>{c.title}</span>
                          <span style={{ fontSize: '0.75rem', color: '#718096' }}>Tutor: {tutors.find(t => t.id === en.tutor_id)?.full_name || 'Assigned'}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Course Reader Workspace */}
                {selectedCourseId ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Course Header Details */}
                    <div className="dashboard-card">
                      <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>{courses.find(c => c.id === selectedCourseId)?.title}</h2>
                      <p style={{ color: '#4a5568', fontSize: '0.9rem', margin: 0 }}>{courses.find(c => c.id === selectedCourseId)?.description}</p>
                    </div>

                    {/* Announcements Board */}
                    {announcements.filter(a => a.course_id === selectedCourseId).length > 0 && (
                      <div className="dashboard-card" style={{ borderLeft: '4px solid var(--accent-color)', background: '#fffbeb' }}>
                        <h3><Megaphone size={16} /> Course Announcements</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {announcements.filter(a => a.course_id === selectedCourseId).map(a => (
                            <li key={a.id}>
                              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary-color)' }}>{a.title}</div>
                              <p style={{ fontSize: '0.85rem', color: '#4a5568', margin: '0.2rem 0' }}>"{a.announcement}"</p>
                              <span style={{ fontSize: '0.7rem', color: '#718096' }}>Posted: {new Date(a.created_at).toLocaleDateString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Syllabus Outline */}
                    <div className="dashboard-card">
                      <h3>Syllabus Lessons & Outlines</h3>
                      {topics.filter(t => t.course_id === selectedCourseId).length === 0 ? (
                        <div style={{ color: '#a0aec0', fontSize: '0.85rem' }}>No lessons posted yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          {topics.filter(t => t.course_id === selectedCourseId).map((t, idx) => {
                            const topicMats = materials.filter(m => m.topic_id === t.id);
                            const topicTasks = tasks.filter(tk => tk.topic_id === t.id);
                            
                            return (
                              <div key={t.id} style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '1rem' }}>
                                <h4 style={{ color: 'var(--primary-color)', fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.3rem 0' }}>Lesson {idx + 1}: {t.title}</h4>
                                <p style={{ color: '#718096', fontSize: '0.85rem', margin: '0 0 0.8rem 0' }}>{t.description}</p>
                                
                                {/* Downloads / View Files */}
                                {topicMats.length > 0 && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                      <FileText size={13} /> Attached Files
                                    </div>
                                    {topicMats.map(m => {
                                      const type = (m.file_type || '').toLowerCase();
                                      const isImage = type === 'image' || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(m.file_url || '');
                                      const isPdf   = type === 'pdf'   || /\.pdf$/i.test(m.file_url || '');
                                      const isVideo = type === 'video' || /\.(mp4|webm|mov|avi)$/i.test(m.file_url || '');
                                      const isDoc   = type === 'doc' || type === 'docx' || /\.(doc|docx)$/i.test(m.file_url || '');

                                      const fileIcon = isImage ? '🖼️' : isPdf ? '📄' : isVideo ? '🎬' : isDoc ? '📝' : '📎';
                                      const typeLabel = isImage ? 'Image' : isPdf ? 'PDF' : isVideo ? 'Video' : isDoc ? 'Document' : 'File';

                                      return (
                                        <div key={m.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                                          {/* File info */}
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                                            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{fileIcon}</span>
                                            <div>
                                              <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--primary-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                                                {m.title}
                                              </div>
                                              <div style={{ fontSize: '0.7rem', color: '#a0aec0', textTransform: 'uppercase', fontWeight: '600' }}>{typeLabel}</div>
                                            </div>
                                          </div>

                                          {/* Action buttons */}
                                          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                            {/* View button — opens in new tab */}
                                            <a
                                              href={m.file_url}
                                              target="_blank"
                                              rel="noreferrer"
                                              style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem',
                                                fontWeight: '600', textDecoration: 'none',
                                                background: 'var(--primary-color)', color: 'white',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.12)', transition: 'opacity 0.15s'
                                              }}
                                              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                            >
                                              👁 View
                                            </a>

                                            {/* Download button — forces download */}
                                            <a
                                              href={m.file_url}
                                              download={m.title || 'file'}
                                              target="_blank"
                                              rel="noreferrer"
                                              style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem',
                                                fontWeight: '600', textDecoration: 'none',
                                                background: '#e6f4ff', color: '#0369a1',
                                                border: '1px solid #bae0fd', transition: 'opacity 0.15s'
                                              }}
                                              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                            >
                                              ⬇ Download
                                            </a>
                                          </div>

                                          {/* Inline image preview */}
                                          {isImage && (
                                            <div style={{ width: '100%', marginTop: '0.5rem', borderRadius: '8px', overflow: 'hidden', maxHeight: '180px' }}>
                                              <img
                                                src={m.file_url}
                                                alt={m.title}
                                                style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', background: '#f0f4f8', display: 'block' }}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Interactive Quiz trigger links */}
                                {topicTasks.filter(tk => tk.task_type === 'quiz').map(tk => {
                                  const sub = submissions.find(x => x.task_id === tk.id);
                                  return (
                                    <div key={tk.id} style={{ marginTop: '0.5rem' }}>
                                      {sub ? (
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#166534', background: '#d1fae5', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                                          <Award size={12} /> Score: {sub.grade}% (Completed)
                                        </div>
                                      ) : (
                                        <button 
                                          className="btn-action edit" 
                                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                          onClick={() => { setActiveQuizId(tk.id); setQuizAnswers({}); setQuizScore(null); }}
                                        >
                                          <Play size={12} /> Start {tk.title}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}

                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Interactive Quiz Solving Modal */}
                    {activeQuizId && (
                      <div className="dashboard-card" style={{ background: '#f8fafc', borderLeft: '4px solid var(--accent-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>
                            📝 {tasks.find(t => t.id === activeQuizId)?.title}
                          </h4>
                          <button onClick={() => { setActiveQuizId(null); setQuizScore(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}><X size={18} /></button>
                        </div>

                        {/* Questions list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {(tasks.find(t => t.id === activeQuizId)?.quiz_questions || []).map((q, qIdx) => (
                            <div key={qIdx} style={{ background: 'white', padding: '1rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                              <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.6rem' }}>{qIdx + 1}. {q.question}</p>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {q.options.map((opt, optIdx) => (
                                  <label 
                                    key={optIdx} 
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '0.5rem', 
                                      fontSize: '0.85rem', 
                                      padding: '0.5rem', 
                                      borderRadius: '6px', 
                                      background: quizAnswers[qIdx] === optIdx ? '#ebf8ff' : 'transparent',
                                      border: quizAnswers[qIdx] === optIdx ? '1px solid var(--primary-color)' : '1px solid #edf2f7',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <input 
                                      type="radio" 
                                      name={`quiz-${activeQuizId}-${qIdx}`} 
                                      checked={quizAnswers[qIdx] === optIdx}
                                      onChange={() => handleQuizOptionSelect(qIdx, optIdx)}
                                      disabled={quizScore !== null}
                                    />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Submit Button */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                          {quizScore === null ? (
                            <button 
                              className="btn-primary" 
                              style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                              onClick={() => handleQuizSubmit(tasks.find(t => t.id === activeQuizId))}
                            >
                              Submit Answers
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ fontWeight: 'bold', color: '#166534', fontSize: '0.95rem' }}>Result Score: {quizScore}%</span>
                              <button className="btn-action edit" style={{ padding: '0.6rem 1rem' }} onClick={() => { setActiveQuizId(null); setQuizScore(null); }}>Done</button>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                  </div>
                ) : (
                  <div style={{ padding: '2rem', background: '#f7fafc', borderRadius: '15px', color: '#a0aec0', textAlign: 'center' }}>Choose a course from the list to display topics, files, quizzes, and bulletins.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Student Timetable */}
        {activeTab === 'timetable' && (
          <div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Left Column: Attendance rate */}
              <div className="dashboard-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}><Award size={20} color="var(--primary-color)" /> My Class Attendance</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem 0' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '8px solid #edf2f7', borderTopColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {attendanceRate}%
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.9rem', color: '#718096' }}>
                  <div>🟢 Attended: <strong>{attendedCount}</strong></div>
                  <div>🔴 Missed: <strong>{missedCount}</strong></div>
                </div>
              </div>

              {/* Right Column: Schedules Timetable list */}
              <div className="dashboard-card">
                <h3>Upcoming Class Timetable</h3>
                {schedules.length === 0 ? (
                  <div style={{ color: '#a0aec0', padding: '2rem', textAlign: 'center' }}>No live classes scheduled for you.</div>
                ) : (
                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Subject / Course</th>
                          <th>Tutor</th>
                          <th>Class Time</th>
                          <th>Meeting URL Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map(sch => {
                          const cTitle = courses.find(c => c.id === sch.course_id)?.title || 'Course';
                          const tName = tutors.find(t => t.id === sch.tutor_id)?.full_name || 'Tutor';
                          return (
                            <tr key={sch.id}>
                              <td style={{ fontWeight: 'bold' }}>{sch.title} <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#718096' }}>{cTitle}</div></td>
                              <td>{tName}</td>
                              <td style={{ fontSize: '0.8rem' }}>{new Date(sch.start_time).toLocaleString()}</td>
                              <td>
                                {sch.meeting_link ? (
                                  <a href={sch.meeting_link} target="_blank" rel="noreferrer" className="btn-action approve" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Join Class</a>
                                ) : (
                                  <span style={{ color: '#cbd5e0' }}>None</span>
                                )}
                              </td>
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

        {/* Tab 4: Student-Tutor messaging */}
        {activeTab === 'chat' && (
          <div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.8fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Tutors selector */}
              <div className="dashboard-card" style={{ padding: '1rem' }}>
                <h3>Assigned Tutors</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {enrollments.map(en => {
                    const t = tutors.find(tu => tu.id === en.tutor_id);
                    const c = courses.find(co => co.id === en.course_id);
                    if (!t) return null;
                    return (
                      <li 
                        key={en.course_id} 
                        style={{ 
                          padding: '0.8rem', 
                          borderRadius: '10px', 
                          background: activeTutorChat?.id === t.id ? '#edf2f7' : '#f7fafc',
                          cursor: 'pointer',
                          border: activeTutorChat?.id === t.id ? '1px solid var(--primary-color)' : '1px solid transparent'
                        }}
                        onClick={() => { setActiveTutorChat(t); }}
                      >
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary-color)', display: 'block' }}>{t.full_name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#718096' }}>Subject: {c?.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Messaging Panel */}
              {activeTutorChat ? (
                <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '550px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #edf2f7', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Instructor Chat Thread: {activeTutorChat.full_name}</span>
                  </div>

                  {/* Message logs */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.5rem', marginBottom: '1rem' }}>
                    {chatMessages.filter(m => 
                      (m.sender_id === (studentInfo?.profile_id || studentInfo?.id || studentId) && m.receiver_id === (activeTutorChat.profile_id || activeTutorChat.id)) ||
                      (m.sender_id === (activeTutorChat.profile_id || activeTutorChat.id) && m.receiver_id === (studentInfo?.profile_id || studentInfo?.id || studentId))
                    ).map(m => {
                      const isMe = m.sender_id === (studentInfo?.profile_id || studentInfo?.id || studentId);
                      return (
                        <div 
                          key={m.id} 
                          style={{ 
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            background: isMe ? 'var(--primary-color)' : '#edf2f7',
                            color: isMe ? 'white' : 'var(--text-dark)',
                            padding: '0.6rem 0.9rem',
                            borderRadius: '12px',
                            maxWidth: '75%',
                            fontSize: '0.85rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                          }}
                        >
                          <div>{m.message_text}</div>
                          <span style={{ fontSize: '0.65rem', opacity: 0.7, float: 'right', marginTop: '2px' }}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat sender input form */}
                  <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #edf2f7', paddingTop: '1rem' }}>
                    <input 
                      type="text" 
                      value={chatInput} 
                      onChange={(e) => setChatInput(e.target.value)} 
                      placeholder="Type your message..." 
                      style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '0.85rem' }} 
                      required 
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '8px' }}><Send size={16} /></button>
                  </form>
                </div>
              ) : (
                <div style={{ padding: '2rem', background: '#f7fafc', borderRadius: '15px', color: '#a0aec0', textAlign: 'center' }}>Choose an assigned instructor to review messages and text directly.</div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Homework Assignments & Grading Summary */}
        {activeTab === 'homework' && (
          <div>

            <div className="dashboard-card">
              <h3><CheckSquare size={20} color="var(--primary-color)" /> Homework Submission Panel</h3>
              {tasks.filter(tk => enrollments.some(e => e.course_id === tk.course_id)).length === 0 ? (
                <div style={{ color: '#a0aec0', padding: '1rem' }}>No assignments or tasks assigned.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {tasks.filter(tk => enrollments.some(e => e.course_id === tk.course_id)).map(tk => {
                    const sub = submissions.find(s => s.task_id === tk.id);
                    const cTitle = courses.find(c => c.id === tk.course_id)?.title || 'Course';
                    
                    return (
                      <li key={tk.id} style={{ padding: '1rem', border: '1px solid #edf2f7', borderRadius: '12px', background: '#fcfdfe' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.92rem' }}>{tk.title} ({cTitle})</span>
                          {sub ? (
                            <span className={`badge ${sub.grade !== null ? 'badge-approved' : 'badge-pending'}`}>
                              {sub.grade !== null ? `Graded: ${sub.grade}/${tk.max_points}` : 'Submitted'}
                            </span>
                          ) : (
                            <span className="badge badge-pending">Not Submitted</span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0.2rem 0' }}>Instructions: {tk.description}</p>
                        
                        {sub ? (
                          <div style={{ marginTop: '0.5rem', background: '#edf2f7', padding: '0.6rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                            <div>📩 Your submission: "{sub.submission_text}"</div>
                            {sub.feedback && <div style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginTop: '0.3rem' }}>📝 Tutor Feedback: "{sub.feedback}"</div>}
                          </div>
                        ) : (
                          tk.task_type !== 'quiz' && (
                            <div style={{ marginTop: '0.8rem' }}>
                              {activeSubTaskId === tk.id ? (
                                <form onSubmit={handleHomeworkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: '#f7fafc', padding: '1rem', borderRadius: '10px' }}>
                                  <div className="form-group">
                                    <label style={{ fontSize: '0.8rem' }}>Write homework solution / notes *</label>
                                    <textarea value={subText} onChange={(e) => setSubText(e.target.value)} placeholder="Type answer details..." rows={3} required style={{ padding: '0.4rem', fontSize: '0.82rem' }}></textarea>
                                  </div>
                                  <div className="form-group">
                                    <label style={{ fontSize: '0.8rem' }}>Attach File (Optional)</label>
                                    <input type="file" onChange={(e) => setSubFile(e.target.files[0])} style={{ border: 'none', background: 'transparent' }} />
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-action cancel" style={{ padding: '0.35rem 0.7rem' }} onClick={() => setActiveSubTaskId(null)}>Cancel</button>
                                    <button type="submit" className="btn-action approve" style={{ padding: '0.35rem 0.7rem' }}>Submit Task</button>
                                  </div>
                                </form>
                              ) : (
                                <button className="btn-action edit" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => { setActiveSubTaskId(tk.id); setSubText(''); setSubFile(null); }}>Submit Homework</button>
                              )}
                            </div>
                          )
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Profile Personal Info */}
        {activeTab === 'profile' && studentInfo && (
          <div>
            <div className="dashboard-card">
              <h3><User size={20} color="var(--primary-color)" /> Personal Profile</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="profile-avatar-row" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                  {studentInfo.avatar_url ? (
                    <img src={studentInfo.avatar_url} alt={studentInfo.full_name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }} />
                  ) : (
                    <div className="profile-avatar-box" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                      {studentInfo.full_name ? studentInfo.full_name[0] : 'S'}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{studentInfo.full_name}</h4>
                    <p style={{ color: '#718096', fontSize: '0.9rem', margin: 0 }}>Student ID: {studentInfo.id}</p>
                    <label style={{ fontSize: '0.8rem', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline', marginTop: '4px' }}>
                      {uploading ? 'Uploading picture...' : 'Upload Profile Picture (Optional)'}
                      <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                  </div>
                </div>

                <div className="profile-form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="full_name" value={studentInfo.full_name} onChange={(e) => setStudentInfo(prev => ({ ...prev, full_name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Grade Level</label>
                    <input type="text" name="grade_level" value={studentInfo.grade_level} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Email Address <span style={{ fontSize: '0.72rem', color: '#a0aec0', fontWeight: 'normal' }}>— cannot be changed</span></label>
                    <input
                      type="email"
                      value={studentInfo.email || ''}
                      readOnly
                      style={{ background: '#f7fafc', color: '#a0aec0', cursor: 'not-allowed', border: '1.5px dashed #e2e8f0' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={studentInfo.phone || ''} onChange={(e) => setStudentInfo(prev => ({ ...prev, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={studentInfo.date_of_birth || ''}
                      onChange={(e) => setStudentInfo(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={studentInfo.gender} onChange={(e) => setStudentInfo(prev => ({ ...prev, gender: e.target.value }))}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="profile-form-grid" style={{ marginTop: '1rem', borderTop: '1px solid #edf2f7', paddingTop: '1.5rem' }}>
                  <div className="form-group">
                    <label>Program Enrolled</label>
                    <input type="text" value={studentInfo.program} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Preferred Schedule</label>
                    <input type="text" value={studentInfo.schedule} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="text" value={studentInfo.start_date} readOnly />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem', marginTop: '1rem' }}>
                  <label>Special Learning Needs</label>
                  <textarea name="special_needs" value={studentInfo.special_needs || ''} onChange={(e) => setStudentInfo(prev => ({ ...prev, special_needs: e.target.value }))} rows={2}></textarea>
                </div>
                <button type="submit" className="btn-submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Details'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
