import React, { useState, useEffect } from 'react';
import { 
  getBookings, getTutors, updateTutor, updateBookingStatus, uploadAvatar,
  getStudentCourses, getStudents, getCourses,
  getTasks, saveTask, deleteTask,
  getStudentTasks, gradeStudentTask,
  getSchedules, getAttendance, markAttendance, saveSchedule, deleteSchedule,
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

  // Broadcast message states
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastSelected, setBroadcastSelected] = useState([]); // student IDs
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

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

  // Scheduling state inputs
  const [schStudentId, setSchStudentId] = useState('');
  const [schCourseId, setSchCourseId] = useState('');
  const [schTitle, setSchTitle] = useState('');
  const [schStart, setSchStart] = useState('');
  const [schEnd, setSchEnd] = useState('');
  const [schLink, setSchLink] = useState('');
  const [schType, setSchType] = useState('single'); // 'single' or 'recurring'
  const [schRecurStartDate, setSchRecurStartDate] = useState('');
  const [schRecurEndDate, setSchRecurEndDate] = useState('');
  const [schRecurStartTime, setSchRecurStartTime] = useState('');
  const [schRecurEndTime, setSchRecurEndTime] = useState('');
  const [schRecurDays, setSchRecurDays] = useState([]); // ['Monday', 'Tuesday', etc.]

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

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    const actualTutorId = tutorInfo?.id || tutorId;
    if (!schStudentId || !schCourseId || !schTitle) {
      return alert('Fill out schedule title, student, and course.');
    }

    if (schType === 'single') {
      if (!schStart || !schEnd) {
        return alert('Please specify start and end dates/times for the single class.');
      }
      try {
        const saved = await saveSchedule({
          student_id: schStudentId,
          course_id: schCourseId,
          tutor_id: actualTutorId,
          title: schTitle,
          start_time: schStart,
          end_time: schEnd,
          meeting_link: schLink
        });
        setSchedules(prev => [...prev, saved]);
        setSchTitle('');
        setSchStart('');
        setSchEnd('');
        setSchLink('');
        alert('Virtual class scheduled successfully!');
      } catch (err) {
        alert('Error scheduling class: ' + err.message);
      }
    } else {
      // Recurring series generator
      if (!schRecurStartDate || !schRecurEndDate || !schRecurStartTime || !schRecurEndTime) {
        return alert('Please fill in start/end dates and start/end times for recurrence.');
      }
      if (schRecurDays.length === 0) {
        return alert('Please select at least one weekday to repeat.');
      }
      
      try {
        const generated = [];
        const [yr, mo, dy] = schRecurStartDate.split('-').map(Number);
        const [endYr, endMo, endDy] = schRecurEndDate.split('-').map(Number);
        
        let curr = new Date(yr, mo - 1, dy, 0, 0, 0);
        const limit = new Date(endYr, endMo - 1, endDy, 23, 59, 59);

        while (curr <= limit) {
          const weekdayName = curr.toLocaleDateString('en-US', { weekday: 'long' });
          if (schRecurDays.includes(weekdayName)) {
            const y = curr.getFullYear();
            const m = String(curr.getMonth() + 1).padStart(2, '0');
            const d = String(curr.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;

            const startISO = new Date(`${dateStr}T${schRecurStartTime}`).toISOString();
            const endISO = new Date(`${dateStr}T${schRecurEndTime}`).toISOString();

            const saved = await saveSchedule({
              student_id: schStudentId,
              course_id: schCourseId,
              tutor_id: actualTutorId,
              title: schTitle,
              start_time: startISO,
              end_time: endISO,
              meeting_link: schLink
            });
            generated.push(saved);
          }
          curr.setDate(curr.getDate() + 1);
        }

        if (generated.length === 0) {
          alert('No classes scheduled. Verify that selected weekdays fall within your start and end date range.');
        } else {
          setSchedules(prev => [...prev, ...generated]);
          setSchTitle('');
          setSchLink('');
          setSchRecurStartDate('');
          setSchRecurEndDate('');
          setSchRecurStartTime('');
          setSchRecurEndTime('');
          setSchRecurDays([]);
          alert(`Successfully scheduled ${generated.length} recurring class sessions!`);
        }
      } catch (err) {
        alert('Error generating recurring sessions: ' + err.message);
      }
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this virtual class?')) return;
    try {
      await deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      alert('Class deleted.');
    } catch (err) {
      alert('Error: ' + err.message);
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

  // Broadcast: send same message to multiple students simultaneously
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return alert('Please type a message.');
    if (broadcastSelected.length === 0) return alert('Please select at least one student.');
    setBroadcastSending(true);
    try {
      const senderId = tutorInfo?.id || tutorId;
      const sentMessages = await Promise.all(
        broadcastSelected.map(studentId => {
          const student = tutorStudents.find(s => s.id === studentId);
          return sendChatMessage({
            course_id: null,
            sender_id: senderId,
            receiver_id: student?.profile_id || studentId,
            message_text: broadcastText.trim()
          });
        })
      );
      setChatMessages(prev => [...prev, ...sentMessages]);
      setBroadcastText('');
      setBroadcastSelected([]);
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
    } catch (err) {
      alert('Failed to send broadcast: ' + err.message);
    } finally {
      setBroadcastSending(false);
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
          <li className={`sidebar-item ${activeTab === 'messages' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('messages')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} /> Messages
              {chatMessages.length > 0 && (
                <span style={{ background: 'var(--accent-color)', color: 'white', borderRadius: '50%', fontSize: '0.65rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', fontWeight: 'bold' }}>
                  {chatMessages.filter(m => m.receiver_id === (tutorInfo?.id || '') && !m.read).length || chatMessages.length > 0 ? chatMessages.filter(m => m.receiver_id === (tutorInfo?.id || '')).length : ''}
                </span>
              )}
            </button>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start', marginBottom: '2rem' }}>
              
              {/* Left Column: Create Schedule */}
              <div className="dashboard-card" style={{ marginBottom: 0 }}>
                <h3><Calendar size={18} color="var(--primary-color)" /> Schedule Virtual Class</h3>
                <form onSubmit={handleCreateSchedule} className="login-form" style={{ gap: '0.8rem' }}>
                  <div className="form-group">
                    <label>Select Assigned Student *</label>
                    <select value={schStudentId} onChange={(e) => {
                      setSchStudentId(e.target.value);
                      setSchCourseId(''); // Reset selected course
                    }} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%', fontFamily: 'inherit' }}>
                      <option value="">-- Choose Student --</option>
                      {(() => {
                        const actualTutorId = tutorInfo?.id || tutorId;
                        const myEnrollments = enrollments.filter(sc => sc.tutor_id === actualTutorId);
                        const myStudentIds = [...new Set(myEnrollments.map(sc => sc.student_id))];
                        return students.filter(s => myStudentIds.includes(s.id)).map(s => (
                          <option key={s.id} value={s.id}>{s.full_name}</option>
                        ));
                      })()}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Select Assigned Course *</label>
                    <select value={schCourseId} onChange={(e) => setSchCourseId(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%', fontFamily: 'inherit' }}>
                      <option value="">-- Choose Course --</option>
                      {(() => {
                        const actualTutorId = tutorInfo?.id || tutorId;
                        return enrollments
                          .filter(sc => sc.student_id === schStudentId && sc.tutor_id === actualTutorId)
                          .map(sc => courses.find(c => c.id === sc.course_id))
                          .filter(Boolean)
                          .map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ));
                      })()}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Lecture Title / Topic *</label>
                    <input type="text" value={schTitle} onChange={(e) => setSchTitle(e.target.value)} placeholder="e.g. State Management Intro" required style={{ width: '100%' }} />
                  </div>
                  <div className="form-group">
                    <label>Schedule Mode *</label>
                    <select value={schType} onChange={(e) => setSchType(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '10px', border: '2px solid #e2e8f0', width: '100%', fontFamily: 'inherit' }}>
                      <option value="single">Single Class Session</option>
                      <option value="recurring">Recurring Class Series</option>
                    </select>
                  </div>

                  {schType === 'single' ? (
                    <>
                      <div className="form-group">
                        <label>Start Time *</label>
                        <input type="datetime-local" value={schStart} onChange={(e) => setSchStart(e.target.value)} required style={{ width: '100%' }} />
                      </div>
                      <div className="form-group">
                        <label>End Time *</label>
                        <input type="datetime-local" value={schEnd} onChange={(e) => setSchEnd(e.target.value)} required style={{ width: '100%' }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div className="form-group">
                          <label>Start Date *</label>
                          <input type="date" value={schRecurStartDate} onChange={(e) => setSchRecurStartDate(e.target.value)} required style={{ width: '100%' }} />
                        </div>
                        <div className="form-group">
                          <label>End Date *</label>
                          <input type="date" value={schRecurEndDate} onChange={(e) => setSchRecurEndDate(e.target.value)} required style={{ width: '100%' }} />
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div className="form-group">
                          <label>Start Time (Daily) *</label>
                          <input type="time" value={schRecurStartTime} onChange={(e) => setSchRecurStartTime(e.target.value)} required style={{ width: '100%' }} />
                        </div>
                        <div className="form-group">
                          <label>End Time (Daily) *</label>
                          <input type="time" value={schRecurEndTime} onChange={(e) => setSchRecurEndTime(e.target.value)} required style={{ width: '100%' }} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Repeat Days *</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                            const isChecked = schRecurDays.includes(day);
                            return (
                              <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', background: isChecked ? 'rgba(15, 44, 89, 0.1)' : '#f7fafc', color: isChecked ? 'var(--primary-color)' : '#4a5568', padding: '0.35rem 0.6rem', borderRadius: '6px', border: isChecked ? '1px solid var(--primary-color)' : '1px solid #edf2f7', cursor: 'pointer', fontWeight: isChecked ? 'bold' : 'normal', transition: 'all 0.15s ease' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isChecked} 
                                  onChange={() => {
                                    if (isChecked) {
                                      setSchRecurDays(prev => prev.filter(d => d !== day));
                                    } else {
                                      setSchRecurDays(prev => [...prev, day]);
                                    }
                                  }}
                                  style={{ margin: 0 }}
                                />
                                {day.substring(0, 3)}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="form-group">
                    <label>Meeting Join Link (e.g. Zoom/Meet)</label>
                    <input type="url" value={schLink} onChange={(e) => setSchLink(e.target.value)} placeholder="https://meet.google.com/xyz" style={{ width: '100%' }} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }}>Schedule Lecture</button>
                </form>
              </div>

              {/* Right Column: Scheduled Lectures Grid */}
              <div className="dashboard-card" style={{ marginBottom: 0 }}>
                <h3><Clock size={20} color="var(--primary-color)" /> My Lecture Timetable</h3>
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
                          <th>Action</th>
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
                              <td>
                                <button className="btn-action delete" style={{ padding: '0.2rem 0.4rem' }} onClick={() => handleDeleteSchedule(sch.id)} title="Delete Class">
                                  <Trash2 size={12} />
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
                                  setActiveTab('messages');
                                }}
                              >
                                <MessageSquare size={14} />
                                Message
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
          </div>
        )}

        {/* Tab: Messages / Student Chat Inbox */}
        {activeTab === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* ── Broadcast Toolbar ── */}
            <div className="dashboard-card" style={{ padding: '1rem 1.5rem', marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📢</span>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary-color)' }}>Broadcast Message</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>Send one message to multiple students at once</div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowBroadcast(!showBroadcast); setBroadcastSelected([]); setBroadcastText(''); setBroadcastSuccess(false); }}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.83rem',
                    background: showBroadcast ? '#edf2f7' : 'var(--primary-color)',
                    color: showBroadcast ? 'var(--primary-color)' : 'white',
                    display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s'
                  }}
                >
                  {showBroadcast ? '✕ Cancel' : '+ Compose Broadcast'}
                </button>
              </div>

              {/* Expanded compose panel */}
              {showBroadcast && (
                <form onSubmit={handleBroadcast} style={{ marginTop: '1rem', borderTop: '1px solid #edf2f7', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                  {/* Success banner */}
                  {broadcastSuccess && (
                    <div style={{ padding: '0.6rem 1rem', background: 'rgba(40,167,69,0.12)', border: '1px solid #28a745', borderRadius: '8px', color: '#276c3a', fontSize: '0.83rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ✅ Broadcast sent successfully to {broadcastSelected.length || 0} student{broadcastSelected.length !== 1 ? 's' : ''}!
                    </div>
                  )}

                  {/* Student checkboxes */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label style={{ fontWeight: '600', fontSize: '0.83rem', color: 'var(--primary-color)' }}>
                        Select Recipients ({broadcastSelected.length}/{tutorStudents.length} selected)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          broadcastSelected.length === tutorStudents.length
                            ? setBroadcastSelected([])
                            : setBroadcastSelected(tutorStudents.map(s => s.id))
                        }
                        style={{ background: 'none', border: '1px solid #cbd5e0', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--primary-color)', fontWeight: '600' }}
                      >
                        {broadcastSelected.length === tutorStudents.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {tutorStudents.length === 0 ? (
                        <span style={{ fontSize: '0.82rem', color: '#a0aec0' }}>No students assigned to you yet.</span>
                      ) : (
                        tutorStudents.map(s => {
                          const checked = broadcastSelected.includes(s.id);
                          return (
                            <label
                              key={s.id}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.35rem 0.75rem', borderRadius: '20px', cursor: 'pointer',
                                border: `1.5px solid ${checked ? 'var(--primary-color)' : '#e2e8f0'}`,
                                background: checked ? 'var(--primary-color)' : 'white',
                                color: checked ? 'white' : 'var(--text-dark)',
                                fontSize: '0.82rem', fontWeight: checked ? '600' : '400',
                                transition: 'all 0.15s ease', userSelect: 'none'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setBroadcastSelected(prev =>
                                    checked ? prev.filter(id => id !== s.id) : [...prev, s.id]
                                  )
                                }
                                style={{ display: 'none' }}
                              />
                              {checked ? '✓ ' : ''}{s.full_name}
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div>
                    <label style={{ fontWeight: '600', fontSize: '0.83rem', color: 'var(--primary-color)', display: 'block', marginBottom: '0.4rem' }}>
                      Message
                    </label>
                    <textarea
                      value={broadcastText}
                      onChange={(e) => setBroadcastText(e.target.value)}
                      placeholder="Type your broadcast message here... It will be sent privately to each selected student."
                      rows={3}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: '1.5' }}
                    />
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#718096' }}>
                      {broadcastSelected.length > 0 && broadcastText.trim()
                        ? `Ready to send to ${broadcastSelected.length} student${broadcastSelected.length !== 1 ? 's' : ''}`
                        : 'Select students and type a message'}
                    </span>
                    <button
                      type="submit"
                      disabled={broadcastSending || broadcastSelected.length === 0 || !broadcastText.trim()}
                      className="btn-primary"
                      style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (broadcastSending || broadcastSelected.length === 0 || !broadcastText.trim()) ? 0.55 : 1 }}
                    >
                      {broadcastSending ? (
                        <>⏳ Sending...</>
                      ) : (
                        <><Send size={15} /> Send to {broadcastSelected.length || 0} Student{broadcastSelected.length !== 1 ? 's' : ''}</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ── Chat split-pane ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', height: '620px' }}>

            {/* Left: Student contact list */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #edf2f7', background: 'var(--primary-color)', color: 'white' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={16} /> Student Conversations</h3>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {tutorStudents.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0', fontSize: '0.85rem' }}>No students assigned yet.</div>
                ) : (
                  tutorStudents.map(s => {
                    const thread = chatMessages.filter(m =>
                      (m.sender_id === (tutorInfo?.id || tutorId) && m.receiver_id === (s.profile_id || s.id)) ||
                      (m.sender_id === (s.profile_id || s.id) && m.receiver_id === (tutorInfo?.id || tutorId))
                    );
                    const lastMsg = thread[thread.length - 1];
                    const isActive = activeStudentChat?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => { setActiveStudentChat(s); }}
                        style={{
                          padding: '0.85rem 1.25rem',
                          borderBottom: '1px solid #f0f4f8',
                          cursor: 'pointer',
                          background: isActive ? 'rgba(var(--primary-rgb, 15, 44, 89), 0.07)' : 'white',
                          borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isActive ? 'var(--primary-color)' : '#e2e8f0', color: isActive ? 'white' : 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>
                            {s.full_name?.[0] || '?'}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: isActive ? 'bold' : '600', fontSize: '0.88rem', color: 'var(--primary-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#718096', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {lastMsg ? lastMsg.message_text : 'No messages yet'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Chat thread panel */}
            {activeStudentChat ? (
              <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', marginBottom: 0 }}>
                {/* Thread Header */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #edf2f7', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {activeStudentChat.full_name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{activeStudentChat.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>{activeStudentChat.grade_level} · {activeStudentChat.email}</div>
                    </div>
                  </div>
                  <button onClick={() => setActiveStudentChat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: '0.25rem' }}><X size={18} /></button>
                </div>

                {/* Messages scroll area */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
                  {chatMessages.filter(m =>
                    (m.sender_id === (tutorInfo?.id || tutorId) && m.receiver_id === (activeStudentChat.profile_id || activeStudentChat.id)) ||
                    (m.sender_id === (activeStudentChat.profile_id || activeStudentChat.id) && m.receiver_id === (tutorInfo?.id || tutorId))
                  ).length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#a0aec0', padding: '3rem', fontSize: '0.9rem' }}>
                      <MessageSquare size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages.filter(m =>
                      (m.sender_id === (tutorInfo?.id || tutorId) && m.receiver_id === (activeStudentChat.profile_id || activeStudentChat.id)) ||
                      (m.sender_id === (activeStudentChat.profile_id || activeStudentChat.id) && m.receiver_id === (tutorInfo?.id || tutorId))
                    ).map(m => {
                      const isMe = m.sender_id === (tutorInfo?.id || tutorId);
                      return (
                        <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            background: isMe ? 'var(--primary-color)' : '#edf2f7',
                            color: isMe ? 'white' : 'var(--text-dark)',
                            padding: '0.7rem 1rem',
                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            maxWidth: '70%',
                            fontSize: '0.88rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
                            lineHeight: '1.45'
                          }}>
                            <div>{m.message_text}</div>
                            <div style={{ fontSize: '0.65rem', opacity: 0.65, textAlign: 'right', marginTop: '4px' }}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Compose area */}
                <div style={{ borderTop: '1px solid #edf2f7', padding: '1rem 1.5rem', background: '#fafafa' }}>
                  <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Message ${activeStudentChat.full_name}...`}
                      style={{ flex: 1, padding: '0.7rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '24px', fontSize: '0.88rem', outline: 'none', transition: 'border-color 0.2s' }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.7rem 1.2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Send size={15} /> Send
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: '#a0aec0', marginBottom: 0 }}>
                <MessageSquare size={48} style={{ opacity: 0.25 }} />
                <p style={{ fontSize: '1rem', fontWeight: '500' }}>Select a student to view your conversation</p>
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
