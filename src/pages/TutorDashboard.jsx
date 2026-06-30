import React, { useState, useEffect } from 'react';
import { 
  getBookings, getTutors, updateTutor, updateBookingStatus, uploadAvatar,
  getStudentCourses, getStudents, getCourses,
  getTasks, saveTask, deleteTask,
  getStudentTasks, gradeStudentTask,
  getSchedules, getAttendance, markAttendance,
  getAnnouncements, createAnnouncement,
  getChatMessages, sendChatMessage
} from '../services/dataService';
import { 
  Calendar, User, Clock, AlertCircle, Save, Check, X, 
  MessageSquare, Plus, CheckSquare, Megaphone, Trash2, Send
} from 'lucide-react';
import '../styles/Dashboard.css';

export default function TutorDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [bookings, setBookings] = useState([]);
  const [tutorInfo, setTutorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // LMS Data lists
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  // Chat Inbox states
  const [chatMessages, setChatMessages] = useState([]);
  const [activeStudentChat, setActiveStudentChat] = useState(null);
  const [activeCourseChat, setActiveCourseChat] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // Tutor Task Creation state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCourse, setNewTaskCourse] = useState('');
  const [newTaskMax, setNewTaskMax] = useState(100);

  // Grading states
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Announcement state inputs
  const [annTitle, setAnnTitle] = useState('');
  const [annDesc, setAnnDesc] = useState('');
  const [annCourseId, setAnnCourseId] = useState('');

  // Load dynamically based on logged-in tutor details
  const tutorId = user?.id || 't1';

  const loadTutorDashboard = async () => {
    try {
      const [allBookings, allTutors, sList, cList, scList, tkList, subList, schList, attList, annList, msgList] = await Promise.all([
        getBookings(), getTutors(), getStudents(), getCourses(), getStudentCourses(),
        getTasks(), getStudentTasks(), getSchedules(), getAttendance(), getAnnouncements(), getChatMessages()
      ]);

      const currentTutor = allTutors.find(t => 
        t.id === tutorId || 
        t.profile_id === tutorId ||
        t.full_name === (user?.full_name || 'Adebayo Olumide')
      );
      setTutorInfo(currentTutor);

      const actualTutorId = currentTutor?.id || tutorId;

      // Filter bookings scheduled with this tutor
      const filteredBookings = allBookings.filter(b => 
        b.tutor_id === actualTutorId || 
        b.tutor_name === currentTutor?.full_name
      );
      setBookings(filteredBookings);

      setStudents(sList);
      setCourses(cList);
      setEnrollments(scList);
      setTasks(tkList);
      setSubmissions(subList);
      setSchedules(schList.filter(s => s.tutor_id === actualTutorId));
      setAttendanceLog(attList);
      setAnnouncements(annList);
      setChatMessages(msgList);

      if (cList.length > 0) setNewTaskCourse(cList[0].id);
    } catch (err) {
      console.error('Error loading tutor dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutorDashboard();
  }, [tutorId]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadAvatar(tutorInfo?.id || user?.id, file);
      setTutorInfo(prev => ({ ...prev, avatar_url: publicUrl }));
      alert('Picture uploaded successfully! Remember to save changes at the bottom.');
    } catch (err) {
      alert('Failed to upload picture: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTutor(tutorInfo.id, tutorInfo);
      alert('Tutor profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      alert(`Booking ${status} successfully.`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // --- LMS TUTOR HANDLERS ---

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskCourse) return alert('Fill out task title and course.');
    try {
      const saved = await saveTask({
        course_id: newTaskCourse,
        title: newTaskTitle,
        description: newTaskDesc,
        task_type: 'assignment',
        max_points: newTaskMax
      });
      setTasks(prev => [...prev, saved]);
      setNewTaskTitle('');
      setNewTaskDesc('');
      alert('Task created successfully!');
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!activeSubmissionId || !gradeInput) return alert('Enter grade details.');
    try {
      const saved = await gradeStudentTask(activeSubmissionId, Number(gradeInput), feedbackInput, tutorInfo?.id || tutorId);
      setSubmissions(prev => prev.map(s => s.id === activeSubmissionId ? saved : s));
      setActiveSubmissionId(null);
      setGradeInput('');
      setFeedbackInput('');
      alert('Student submission graded successfully!');
    } catch (err) {
      alert('Error grading: ' + err.message);
    }
  };

  const handleMarkAttendance = async (scheduleId, studentId, status) => {
    try {
      const saved = await markAttendance({
        schedule_id: scheduleId,
        student_id: studentId,
        status: status,
        marked_by: tutorInfo?.id || tutorId
      });
      setAttendanceLog(prev => {
        const filtered = prev.filter(x => !(x.schedule_id === scheduleId && x.student_id === studentId));
        return [...filtered, saved];
      });
      alert(`Attendance marked as ${status} successfully.`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle || !annDesc || !annCourseId) return alert('Fill out announcement details.');
    try {
      const saved = await createAnnouncement({
        course_id: annCourseId,
        tutor_id: tutorInfo?.id || tutorId,
        title: annTitle,
        announcement: annDesc
      });
      setAnnouncements(prev => [saved, ...prev]);
      setAnnTitle('');
      setAnnDesc('');
      alert('Announcement published!');
    } catch (err) {
      alert('Error publishing bulletin: ' + err.message);
    }
  };

  // Chat Actions
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeStudentChat) return;
    try {
      const saved = await sendChatMessage({
        course_id: activeCourseChat || null,
        sender_id: tutorInfo?.id || tutorId,
        receiver_id: activeStudentChat.profile_id || activeStudentChat.id,
        message_text: chatInput.trim()
      });
      setChatMessages(prev => [...prev, saved]);
      setChatInput('');
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  // Find students mapped to this tutor
  const tutorStudents = students.filter(s => 
    enrollments.some(sc => sc.student_id === s.id && sc.tutor_id === (tutorInfo?.id || tutorId))
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '3rem', color: 'white' }}>Loading Tutor Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">Tutor Portal</div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'schedule' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('schedule')}><Clock size={18} /> Lesson Schedules</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'students' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('students')}><User size={18} /> Assigned Students</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'tasks' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('tasks')}><CheckSquare size={18} /> Tasks & Grading</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'announcements' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('announcements')}><Megaphone size={18} /> Bulletins</button>
          </li>
          <li className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('settings')}><Save size={18} /> Profile Settings</button>
          </li>
        </ul>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main">
        {/* Tab 1: Lecture Schedule & Bookings */}
        {activeTab === 'schedule' && (
          <div>


            {/* Scheduled Lectures Grid */}
            <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
              <h3><Calendar size={20} color="var(--primary-color)" /> My Lecture Timetable</h3>
              {schedules.length === 0 ? (
                <div style={{ padding: '1.5rem', color: '#a0aec0', fontSize: '0.85rem' }}>No lectures scheduled.</div>
              ) : (
                <div className="table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Class Topic</th>
                        <th>Student</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Action / Link</th>
                        <th>Mark Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map(sch => {
                        const sName = students.find(s => s.id === sch.student_id)?.full_name || 'Student';
                        const att = attendanceLog.find(x => x.schedule_id === sch.id && x.student_id === sch.student_id);
                        return (
                          <tr key={sch.id}>
                            <td style={{ fontWeight: 'bold' }}>{sch.title}</td>
                            <td>{sName}</td>
                            <td>{new Date(sch.start_time).toLocaleString()}</td>
                            <td>{new Date(sch.end_time).toLocaleTimeString()}</td>
                            <td>
                              {sch.meeting_link ? <a href={sch.meeting_link} target="_blank" rel="noreferrer" className="btn-action approve" style={{ padding: '0.3rem 0.6rem' }}>Launch Link</a> : <span style={{ color: '#cbd5e0' }}>No Link</span>}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                <button className={`btn-action approve ${att?.status === 'attended' ? 'active' : ''}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', opacity: att?.status === 'attended' ? 1 : 0.6 }} onClick={() => handleMarkAttendance(sch.id, sch.student_id, 'attended')}>Attended</button>
                                <button className={`btn-action cancel ${att?.status === 'missed' ? 'active' : ''}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', opacity: att?.status === 'missed' ? 1 : 0.6 }} onClick={() => handleMarkAttendance(sch.id, sch.student_id, 'missed')}>Missed</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* General Consultation Bookings */}
            <div className="dashboard-card">
              <h3><Clock size={20} color="var(--primary-color)" /> General Appointment Consultations</h3>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>You do not have any active appointments.</div>
              ) : (
                <div className="table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Parent Name</th>
                        <th>Phone</th>
                        <th>Date</th>
                        <th>Time</th>
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
                          <td>{b.booking_date}</td>
                          <td>{b.booking_time}</td>
                          <td style={{ textTransform: 'capitalize' }}>{b.meeting_type}</td>
                          <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                          <td>
                            <div className="btn-action-group">
                              {b.status === 'pending' && (
                                <>
                                  <button className="btn-action approve" onClick={() => handleStatusUpdate(b.id, 'approved')}>Approve</button>
                                  <button className="btn-action cancel" onClick={() => handleStatusUpdate(b.id, 'cancelled')}>Cancel</button>
                                </>
                              )}
                              {b.status === 'approved' && (
                                <button className="btn-action complete" onClick={() => handleStatusUpdate(b.id, 'completed')}>Complete</button>
                              )}
                              {(b.status === 'completed' || b.status === 'cancelled') && (
                                <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>Archived</span>
                              )}
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

        {/* Tab 2: Assigned Students */}
        {activeTab === 'students' && (
          <div>


            <div style={{ display: 'grid', gridTemplateColumns: activeStudentChat ? '1.5fr 1fr' : '1fr', gap: '2rem', transition: 'all 0.3s ease' }}>
              
              {/* Students Grid List */}
              <div className="dashboard-card">
                <h3><User size={18} /> Enrolled Students</h3>
                {tutorStudents.length === 0 ? (
                  <div style={{ color: '#a0aec0', padding: '2rem', textAlign: 'center' }}>No students currently assigned to your classes.</div>
                ) : (
                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Enrolled Course</th>
                          <th>Grade</th>
                          <th>Parent Contact</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tutorStudents.map(s => {
                          const courseMaps = enrollments.filter(e => e.student_id === s.id && e.tutor_id === (tutorInfo?.id || tutorId));
                          return (
                            <tr key={s.id}>
                              <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {s.avatar_url ? (
                                  <img src={s.avatar_url} alt={s.full_name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>{s.full_name[0]}</div>
                                )}
                                <span style={{ fontWeight: 'bold' }}>{s.full_name}</span>
                              </td>
                              <td style={{ fontSize: '0.85rem' }}>
                                {courseMaps.map(m => courses.find(c => c.id === m.course_id)?.title).join(', ')}
                              </td>
                              <td>{s.grade_level}</td>
                              <td>
                                <div style={{ fontSize: '0.8rem' }}>{s.phone}</div>
                                <div style={{ fontSize: '0.75rem', color: '#718096' }}>{s.email}</div>
                              </td>
                              <td>
                                <button 
                                  className="btn-action edit" 
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.7rem' }}
                                  onClick={() => {
                                    setActiveStudentChat(s);
                                    if (courseMaps.length > 0) setActiveCourseChat(courseMaps[0].course_id);
                                  }}
                                >
                                  <MessageSquare size={14} />
                                  Chat
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Instant Chat Drawer (Displays next to student grid) */}
              {activeStudentChat && (
                <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '550px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Chat: {activeStudentChat.full_name}</span>
                    </div>
                    <button onClick={() => setActiveStudentChat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}><X size={18} /></button>
                  </div>

                  {/* Messages log */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.5rem', marginBottom: '1rem' }}>
                    {chatMessages.filter(m => 
                      (m.sender_id === (tutorInfo?.id || tutorId) && m.receiver_id === (activeStudentChat.profile_id || activeStudentChat.id)) ||
                      (m.sender_id === (activeStudentChat.profile_id || activeStudentChat.id) && m.receiver_id === (tutorInfo?.id || tutorId))
                    ).map(m => {
                      const isMe = m.sender_id === (tutorInfo?.id || tutorId);
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
                      placeholder="Type message..." 
                      style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '0.85rem' }} 
                      required 
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '8px' }}><Send size={16} /></button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Tab 3: Tasks and Grading */}
        {activeTab === 'tasks' && (
          <div>


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Task Creation Form */}
              <div className="dashboard-card">
                <h3><Plus size={18} /> Post Lesson Assignment</h3>
                <form onSubmit={handleCreateTask} className="login-form" style={{ gap: '0.8rem' }}>
                  <div className="form-group">
                    <label>Select Course *</label>
                    <select value={newTaskCourse} onChange={(e) => setNewTaskCourse(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                      <option value="">-- Choose Course --</option>
                      {courses.filter(c => enrollments.some(sc => sc.course_id === c.id && sc.tutor_id === (tutorInfo?.id || tutorId))).map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Task Title *</label>
                    <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="e.g. Read Chapter 2 and Write Abstract" required />
                  </div>
                  <div className="form-group">
                    <label>Max Grading Points</label>
                    <input type="number" value={newTaskMax} onChange={(e) => setNewTaskMax(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label>Task Description Instructions</label>
                    <textarea value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} placeholder="Describe grading details..." rows={3}></textarea>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>Post Task</button>
                </form>
              </div>

              {/* Grading Submission Center */}
              <div className="dashboard-card">
                <h3><CheckSquare size={18} /> Student Homework Inbox</h3>
                
                {submissions.filter(sub => 
                  tasks.some(t => t.id === sub.task_id && enrollments.some(sc => sc.course_id === t.course_id && sc.tutor_id === (tutorInfo?.id || tutorId)))
                ).length === 0 ? (
                  <div style={{ color: '#a0aec0', padding: '1rem' }}>No student homework submissions found.</div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {submissions.filter(sub => 
                      tasks.some(t => t.id === sub.task_id && enrollments.some(sc => sc.course_id === t.course_id && sc.tutor_id === (tutorInfo?.id || tutorId)))
                    ).map(sub => {
                      const sName = students.find(s => s.id === sub.student_id)?.full_name || 'Student';
                      const tObj = tasks.find(t => t.id === sub.task_id);
                      const isGraded = sub.grade !== null && sub.grade !== undefined;
                      
                      return (
                        <li key={sub.id} style={{ padding: '1rem', border: '1px solid #edf2f7', borderRadius: '12px', background: activeSubmissionId === sub.id ? '#edf2f7' : '#fcfdfe' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{sName}</span>
                            <span className={`badge ${isGraded ? 'badge-approved' : 'badge-pending'}`}>{isGraded ? `Score: ${sub.grade}/${tObj?.max_points || 100}` : 'Needs Grade'}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem' }}>Task: <strong>{tObj?.title}</strong></div>
                          <p style={{ fontSize: '0.8rem', margin: '0.2rem 0', background: 'white', padding: '0.5rem', borderRadius: '6px', border: '1px dashed #e2e8f0' }}>"{sub.submission_text}"</p>
                          
                          {sub.file_url && <div style={{ fontSize: '0.78rem', margin: '0.4rem 0' }}><Paperclip size={12} style={{ display: 'inline', marginRight: '4px' }} /> <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>View Submission File</a></div>}

                          {isGraded ? (
                            <div style={{ fontSize: '0.8rem', color: '#4a5568', background: '#e0f2fe', padding: '0.5rem', borderRadius: '6px', marginTop: '0.5rem' }}>
                              📝 Feedback: "{sub.feedback || 'None'}"
                            </div>
                          ) : (
                            <button className="btn-action edit" style={{ marginTop: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.78rem' }} onClick={() => { setActiveSubmissionId(sub.id); setGradeInput(''); setFeedbackInput(''); }}>Grade Homework</button>
                          )}

                          {activeSubmissionId === sub.id && (
                            <form onSubmit={handleGradeSubmission} style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              <div className="form-group" style={{ flexDirection: 'row', gap: '0.5rem', alignItems: 'center' }}>
                                <label style={{ fontSize: '0.8rem', minWidth: '100px' }}>Score Points *</label>
                                <input type="number" value={gradeInput} onChange={(e) => setGradeInput(e.target.value)} required max={tObj?.max_points || 100} style={{ padding: '0.4rem', maxWidth: '100px' }} />
                                <span style={{ fontSize: '0.8rem', color: '#718096' }}>/ {tObj?.max_points || 100}</span>
                              </div>
                              <div className="form-group">
                                <label style={{ fontSize: '0.8rem' }}>Tutor Feedback Remarks</label>
                                <textarea value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} placeholder="Well done..." rows={2} style={{ padding: '0.4rem', fontSize: '0.8rem' }}></textarea>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-action cancel" style={{ padding: '0.3rem 0.6rem' }} onClick={() => setActiveSubmissionId(null)}>Cancel</button>
                                <button type="submit" className="btn-action approve" style={{ padding: '0.3rem 0.6rem' }}>Submit Grade</button>
                              </div>
                            </form>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: announcements */}
        {activeTab === 'announcements' && (
          <div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Broadcast Announcement */}
              <div className="dashboard-card">
                <h3><Megaphone size={18} /> Publish Notice</h3>
                <form onSubmit={handlePostAnnouncement} className="login-form" style={{ gap: '0.8rem' }}>
                  <div className="form-group">
                    <label>Broadcast Course *</label>
                    <select value={annCourseId} onChange={(e) => setAnnCourseId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0' }}>
                      <option value="">-- Choose Course --</option>
                      {courses.filter(c => enrollments.some(sc => sc.course_id === c.id && sc.tutor_id === (tutorInfo?.id || tutorId))).map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notice Subject *</label>
                    <input type="text" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="e.g. Schedule Update / Reschedule" required />
                  </div>
                  <div className="form-group">
                    <label>Notice Description *</label>
                    <textarea value={annDesc} onChange={(e) => setAnnDesc(e.target.value)} placeholder="Write details here..." rows={4} required></textarea>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>Publish Bulletin</button>
                </form>
              </div>

              {/* Notice Log */}
              <div className="dashboard-card">
                <h3><Megaphone size={18} /> Published Notices Board</h3>
                {announcements.filter(a => a.tutor_id === (tutorInfo?.id || tutorId)).length === 0 ? (
                  <div style={{ color: '#a0aec0', padding: '1rem' }}>No notice bulletins published.</div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {announcements.filter(a => a.tutor_id === (tutorInfo?.id || tutorId)).map(a => {
                      const cName = courses.find(c => c.id === a.course_id)?.title || 'Course';
                      return (
                        <li key={a.id} style={{ padding: '1rem', border: '1px solid #edf2f7', borderRadius: '12px', background: '#fcfdfe' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '0.9rem' }}>{a.title}</span>
                            <span style={{ fontSize: '0.75rem', color: '#718096' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: '600', marginBottom: '0.5rem' }}>Course: {cName}</div>
                          <p style={{ fontSize: '0.82rem', color: '#4a5568', margin: 0 }}>"{a.announcement}"</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && tutorInfo && (
          <div>
            <div className="dashboard-card">
              <h3><User size={20} color="var(--primary-color)" /> Edit Profile Card</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="profile-avatar-row" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                  {tutorInfo.avatar_url ? (
                    <img src={tutorInfo.avatar_url} alt={tutorInfo.full_name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }} />
                  ) : (
                    <div className="profile-avatar-box" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                      {tutorInfo.full_name ? tutorInfo.full_name[0] : 'T'}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{tutorInfo.full_name}</h4>
                    <p style={{ color: '#718096', fontSize: '0.9rem', margin: 0 }}>Subject Focus: {tutorInfo.subject}</p>
                    <p style={{ color: '#ffd700', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Rating: ⭐ {tutorInfo.rating}</p>
                    <label style={{ fontSize: '0.8rem', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline', marginTop: '4px' }}>
                      {uploading ? 'Uploading picture...' : 'Upload Profile Picture'}
                      <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                  </div>
                </div>

                <div className="profile-form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="full_name" value={tutorInfo.full_name} onChange={(e) => setTutorInfo(prev => ({ ...prev, full_name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Teaching Subject Focus</label>
                    <input type="text" name="subject" value={tutorInfo.subject} onChange={(e) => setTutorInfo(prev => ({ ...prev, subject: e.target.value }))} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Experience Credentials</label>
                    <input type="text" name="experience" value={tutorInfo.experience} onChange={(e) => setTutorInfo(prev => ({ ...prev, experience: e.target.value }))} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Avatar URL (Publicly Displayed)</label>
                    <input type="text" name="avatar_url" value={tutorInfo.avatar_url || ''} readOnly />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label>Professional Bio Description (Shown on Cards)</label>
                  <textarea name="bio" value={tutorInfo.bio || ''} onChange={(e) => setTutorInfo(prev => ({ ...prev, bio: e.target.value }))} rows={4}></textarea>
                </div>
                <button type="submit" className="btn-submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Update Public Card'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
