import { supabase, hasSupabaseConfig, supabaseAdmin } from '../supabaseClient';

const initialMockUsers = [
  { id: 'admin_mock_id', email: 'admin@foundaxia.com', password: 'admin123', role: 'admin', full_name: 'Administrator' },
  { id: 's1', email: 'student@foundaxia.com', password: 'student123', role: 'student', full_name: 'Tobi Coker' }
];

// --- MOCK DATA ---
const initialTutors = [];

const initialStudents = [
  { id: 's1', profile_id: 's1', full_name: 'Tobi Coker', phone: '08034567890', email: 'student@foundaxia.com', date_of_birth: '2012-05-15', gender: 'male', grade_level: 'Grade 6', special_needs: 'None', program: 'tutoring', schedule: 'afternoon', start_date: '2026-01-10', additional_comments: 'Prefers virtual lectures.', avatar_url: '' }
];

const initialBookings = [
  { id: 'b1', student_name: 'Tobi Coker', parent_name: 'David Coker', phone: '08034567890', email: 'student@foundaxia.com', tutor_id: null, tutor_name: 'Unassigned', booking_date: '2026-07-02', booking_time: '14:00', meeting_type: 'virtual', status: 'approved', created_at: new Date().toISOString() }
];

const initialMessages = [
  { id: 'm1', name: 'David Coker', email: 'david@coker.com', phone: '08034567890', subject: 'Weekend Class Shift', message: 'Hello, I want to inquire if Tobi can have an extra session this weekend.', created_at: new Date().toISOString() }
];

const initialCourses = [
  { id: 'c1', title: 'React Frontend Development', description: 'Comprehensive guide to HTML, CSS, JavaScript, and React component architectures.', course_type: 'regular' },
  { id: 'c2', title: 'Creative Writing & Composition', description: 'Advanced comprehension analysis, spelling accuracy, and storytelling structure.', course_type: 'regular' },
  { id: 'c3', title: 'Programming Class', description: 'Learn logic, algorithms, coding structures, and basic software engineering principles.', course_type: 'special' },
  { id: 'c4', title: 'Generative Artificial Intelligence', description: 'Explore prompt engineering, neural network concepts, and creative AI generation tools.', course_type: 'special' },
  { id: 'c5', title: 'Data Science for Teens', description: 'An introduction to databases, data parsing, charts, and predictive analysis.', course_type: 'special' },
  { id: 'c6', title: 'Microsoft Excel and Word', description: 'Master spreadsheet tables, document structures, and formatting essentials.', course_type: 'special' },
  { id: 'c7', title: 'Website Design Basics', description: 'Design modern layout templates with clean CSS layouts and visual assets.', course_type: 'special' },
  { id: 'c8', title: 'Creative Writing', description: 'Drafting stories, building fictional worlds, and refining voice and tone.', course_type: 'special' }
];

const initialTopics = [
  { id: 'tp1', course_id: 'c1', title: 'HTML5 Semantic Web', description: 'Introduction to document outlines, elements, and layout trees.', sort_order: 1 },
  { id: 'tp2', course_id: 'c1', title: 'CSS3 Flexbox & Grid', description: 'Flexible layouts, margins, relative sizes, and media-query responses.', sort_order: 2 },
  { id: 'tp3', course_id: 'c1', title: 'React Hooks & State', description: 'Managing interactive client states using useState, useEffect, and custom hooks.', sort_order: 3 },
  { id: 'tp4', course_id: 'c2', title: 'Narrative Essay Outline', description: 'Structuring introductions, build-ups, and logical conclusions in writing.', sort_order: 1 }
];

const initialMaterials = [
  { id: 'mat1', course_id: 'c1', topic_id: 'tp1', title: 'HTML5 Reference Guide PDF', file_url: 'https://www.w3.org/html/html5-cheat-sheet.pdf', file_type: 'pdf' },
  { id: 'mat2', course_id: 'c1', topic_id: 'tp2', title: 'Flexbox Cheatsheet Image', file_url: 'https://css-tricks.com/flexbox-poster.png', file_type: 'image' }
];

const initialCourseTutors = [];

const initialStudentCourses = [
  { student_id: 's1', course_id: 'c1', tutor_id: null, assigned_at: new Date().toISOString() },
  { student_id: 's1', course_id: 'c2', tutor_id: null, assigned_at: new Date().toISOString() }
];

const initialTasks = [
  { 
    id: 'tk1', 
    course_id: 'c1', 
    topic_id: 'tp1', 
    title: 'HTML Structural Syntax Test', 
    description: 'Solve this interactive quiz to review layout elements.', 
    task_type: 'quiz', 
    max_points: 100,
    quiz_questions: [
      { question: 'Which tag defines a header container?', options: ['<head>', '<header>', '<hgroup>'], correct: 1 },
      { question: 'What is the correct tag for a line break?', options: ['<br>', '<lb>', '<break>'], correct: 0 }
    ]
  },
  { id: 'tk2', course_id: 'c1', topic_id: 'tp3', title: 'React To-Do List Application', description: 'Build a small list application managing items in a React state array.', task_type: 'assignment', max_points: 100 }
];

const initialStudentTasks = [
  { id: 'st1', task_id: 'tk1', student_id: 's1', submission_text: 'Completed Quiz. Score: 100%', grade: 100, feedback: 'Excellent structural understanding!', submitted_at: new Date(Date.now() - 36000000).toISOString(), graded_at: new Date().toISOString(), graded_by: null }
];

const initialSchedules = [];
const initialAttendance = [];
const initialAnnouncements = [];
const initialChatMessages = [];

const initLocalStorage = () => {
  if (!localStorage.getItem('lc_users')) {
    localStorage.setItem('lc_users', JSON.stringify(initialMockUsers));
  }
  if (!localStorage.getItem('lc_tutors')) {
    localStorage.setItem('lc_tutors', JSON.stringify(initialTutors));
  }
  if (!localStorage.getItem('lc_students')) {
    localStorage.setItem('lc_students', JSON.stringify(initialStudents));
  }
  if (!localStorage.getItem('lc_bookings')) {
    localStorage.setItem('lc_bookings', JSON.stringify(initialBookings));
  }
  if (!localStorage.getItem('lc_messages')) {
    localStorage.setItem('lc_messages', JSON.stringify(initialMessages));
  }
  if (!localStorage.getItem('lc_courses')) {
    localStorage.setItem('lc_courses', JSON.stringify(initialCourses));
  }
  if (!localStorage.getItem('lc_topics')) {
    localStorage.setItem('lc_topics', JSON.stringify(initialTopics));
  }
  if (!localStorage.getItem('lc_materials')) {
    localStorage.setItem('lc_materials', JSON.stringify(initialMaterials));
  }
  if (!localStorage.getItem('lc_course_tutors')) {
    localStorage.setItem('lc_course_tutors', JSON.stringify(initialCourseTutors));
  }
  if (!localStorage.getItem('lc_student_courses')) {
    localStorage.setItem('lc_student_courses', JSON.stringify(initialStudentCourses));
  }
  if (!localStorage.getItem('lc_tasks')) {
    localStorage.setItem('lc_tasks', JSON.stringify(initialTasks));
  }
  if (!localStorage.getItem('lc_student_tasks')) {
    localStorage.setItem('lc_student_tasks', JSON.stringify(initialStudentTasks));
  }
  if (!localStorage.getItem('lc_schedules')) {
    localStorage.setItem('lc_schedules', JSON.stringify(initialSchedules));
  }
  if (!localStorage.getItem('lc_attendance')) {
    localStorage.setItem('lc_attendance', JSON.stringify(initialAttendance));
  }
  if (!localStorage.getItem('lc_announcements')) {
    localStorage.setItem('lc_announcements', JSON.stringify(initialAnnouncements));
  }
  if (!localStorage.getItem('lc_chat_messages')) {
    localStorage.setItem('lc_chat_messages', JSON.stringify(initialChatMessages));
  }
};

// --- DATA SERVICES ---


export const getTutors = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('tutors').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_tutors'));
  }
};

export const saveTutor = async (tutor) => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('tutors').insert([tutor]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const tutors = JSON.parse(localStorage.getItem('lc_tutors'));
    const newTutor = { id: 't_' + Date.now(), rating: 5.0, ...tutor };
    tutors.push(newTutor);
    localStorage.setItem('lc_tutors', JSON.stringify(tutors));
    return newTutor;
  }
};

export const updateTutor = async (id, updates) => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('tutors').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const tutors = JSON.parse(localStorage.getItem('lc_tutors'));
    const idx = tutors.findIndex(t => t.id === id);
    if (idx !== -1) {
      tutors[idx] = { ...tutors[idx], ...updates };
      localStorage.setItem('lc_tutors', JSON.stringify(tutors));
      return tutors[idx];
    }
    throw new Error('Tutor not found');
  }
};

export const deleteTutor = async (id) => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.from('tutors').delete().eq('id', id);
    if (error) throw error;
  } else {
    initLocalStorage();
    let tutors = JSON.parse(localStorage.getItem('lc_tutors'));
    tutors = tutors.filter(t => t.id !== id);
    localStorage.setItem('lc_tutors', JSON.stringify(tutors));
  }
};

export const getStudents = async () => {
  if (hasSupabaseConfig) {
    try {
      // 1. Fetch all student records
      const { data: students, error: studentError } = await supabase.from('students').select('*');
      if (studentError) throw studentError;

      // 2. Fetch all profile IDs to accurately identify active login accounts
      const { data: profiles, error: profileError } = await supabase.from('profiles').select('id');
      const activeUserIds = new Set((profiles || []).map(p => p.id));

      return students.map(s => {
        const isActive = activeUserIds.has(s.id);
        return {
          ...s,
          is_active: isActive,
          status: isActive ? 'approved' : (s.status || 'pending')
        };
      });
    } catch (err) {
      console.error('Error in getStudents:', err.message);
      // Fallback: select just student records and default status
      const { data: students, error: studentError } = await supabase.from('students').select('*');
      if (studentError) throw studentError;
      return students.map(s => ({
        ...s,
        is_active: false,
        status: s.status || 'pending'
      }));
    }
  } else {
    initLocalStorage();
    const students = JSON.parse(localStorage.getItem('lc_students'));
    const users = JSON.parse(localStorage.getItem('lc_users'));
    return students.map(s => {
      const isActive = users.some(u => u.id === s.id);
      return {
        ...s,
        is_active: isActive,
        status: isActive ? 'approved' : (s.status || 'pending')
      };
    });
  }
};

export const registerStudent = async (student) => {
  let savedStudent;
  if (hasSupabaseConfig) {
    // Strip client-only or non-existent columns from database insertion
    const { 
      parentName, 
      relationship, 
      previous_school, 
      emergencyName, 
      emergencyPhone, 
      address, 
      ...cleanStudent 
    } = student;

    // Convert empty strings to default values to satisfy Postgres NOT NULL constraints
    if (cleanStudent.date_of_birth === '' || cleanStudent.date_of_birth === null) {
      cleanStudent.date_of_birth = new Date().toISOString().split('T')[0];
    }
    if (cleanStudent.start_date === '' || cleanStudent.start_date === null) {
      cleanStudent.start_date = new Date().toISOString().split('T')[0];
    }

    let comments = student.additional_comments || '';
    const extras = [];
    if (parentName) extras.push(`Parent/Guardian: ${parentName} (${relationship || 'guardian'})`);
    if (previous_school && previous_school !== 'None') extras.push(`Previous School: ${previous_school}`);
    if (address) extras.push(`Address: ${address}`);
    if (emergencyName) extras.push(`Emergency Contact: ${emergencyName} (${emergencyPhone || 'No Phone'})`);

    if (extras.length > 0) {
      cleanStudent.additional_comments = (comments && comments !== 'None' ? comments + '\n\n' : '') + '[Public Form Details]\n' + extras.join('\n');
    }

    const studentId = self.crypto.randomUUID();
    const { data, error } = await supabase.from('students').insert([{
      id: studentId,
      status: 'pending',
      ...cleanStudent
    }]).select();
    if (error) throw error;
    savedStudent = data[0];
  } else {
    initLocalStorage();
    const students = JSON.parse(localStorage.getItem('lc_students'));
    const studentId = 's_' + Date.now();
    savedStudent = { id: studentId, status: 'pending', ...student };
    students.push(savedStudent);
    localStorage.setItem('lc_students', JSON.stringify(students));
  }

  return savedStudent;
};

export const updateStudent = async (id, updates) => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('students').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const students = JSON.parse(localStorage.getItem('lc_students'));
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...updates };
      localStorage.setItem('lc_students', JSON.stringify(students));
      return students[idx];
    }
    throw new Error('Student not found');
  }
};

export const deleteStudent = async (id) => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
  } else {
    initLocalStorage();
    let students = JSON.parse(localStorage.getItem('lc_students'));
    students = students.filter(s => s.id !== id);
    localStorage.setItem('lc_students', JSON.stringify(students));
  }
};

export const getBookings = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('bookings').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_bookings'));
  }
};

export const createBooking = async (booking) => {
  // Sanitize date fields — Postgres DATE column rejects empty strings and 'N/A'
  const sanitizeDate = (val) => {
    if (!val || val === '' || val === 'N/A' || val === 'null') return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : val;
  };

  const cleanBooking = {
    ...booking,
    booking_date: sanitizeDate(booking.booking_date),
  };

  let savedBooking;
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('bookings').insert([cleanBooking]).select();
    if (error) {
      // If the error is about missing columns (timezone/message not yet migrated),
      // retry without those fields so the booking still saves.
      const isMissingColumn = error.message && (
        error.message.includes('column') ||
        error.message.includes('does not exist') ||
        error.code === '42703'
      );
      if (isMissingColumn) {
        console.warn(
          '[LearnCil] bookings table is missing timezone/message columns. ' +
          'Run the migration in Supabase SQL Editor:\n' +
          'ALTER TABLE public.bookings\n' +
          '  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT \'Africa/Lagos\',\n' +
          '  ADD COLUMN IF NOT EXISTS message TEXT;\n' +
          'Saving booking without those fields for now.'
        );
        const { timezone, message, ...coreBooking } = cleanBooking;
        const { data: retryData, error: retryError } = await supabase.from('bookings').insert([coreBooking]).select();
        if (retryError) throw retryError;
        savedBooking = retryData[0];
      } else {
        throw error;
      }
    } else {
      savedBooking = data[0];
    }
  } else {
    initLocalStorage();
    const bookings = JSON.parse(localStorage.getItem('lc_bookings'));
    savedBooking = { 
      id: 'b_' + Date.now(), 
      status: 'pending', 
      created_at: new Date().toISOString(),
      ...booking 
    };
    bookings.push(savedBooking);
    localStorage.setItem('lc_bookings', JSON.stringify(bookings));
  }

  return savedBooking;
};

export const updateBookingStatus = async (id, status) => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const bookings = JSON.parse(localStorage.getItem('lc_bookings'));
    const idx = bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      bookings[idx].status = status;
      localStorage.setItem('lc_bookings', JSON.stringify(bookings));
      return bookings[idx];
    }
    throw new Error('Booking not found');
  }
};

export const deleteBooking = async (id) => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
  } else {
    initLocalStorage();
    let bookings = JSON.parse(localStorage.getItem('lc_bookings'));
    bookings = bookings.filter(b => b.id !== id);
    localStorage.setItem('lc_bookings', JSON.stringify(bookings));
  }
};

export const getContactMessages = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('contact_messages').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_messages'));
  }
};

export const createContactMessage = async (msg) => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('contact_messages').insert([msg]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const messages = JSON.parse(localStorage.getItem('lc_messages'));
    const newMsg = {
      id: 'm_' + Date.now(),
      created_at: new Date().toISOString(),
      ...msg
    };
    messages.push(newMsg);
    localStorage.setItem('lc_messages', JSON.stringify(messages));
    return newMsg;
  }
};

// --- AUTHENTICATION SERVICES ---

export const signIn = async (email, password) => {
  if (hasSupabaseConfig) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (authError) throw authError;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      throw new Error(`Profile not found for authenticated user: ${profileError.message}`);
    }

    let fullName = 'User';
    let profileRecordId = authData.user.id;

    if (profile.role === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('id, full_name')
        .eq('profile_id', authData.user.id)
        .single();
      if (student) {
        fullName = student.full_name;
        profileRecordId = student.id;
      }
    } else if (profile.role === 'tutor') {
      const { data: tutor } = await supabase
        .from('tutors')
        .select('id, full_name')
        .eq('profile_id', authData.user.id)
        .single();
      if (tutor) {
        fullName = tutor.full_name;
        profileRecordId = tutor.id;
      }
    } else {
      fullName = profile.full_name || 'Administrator';
    }

    return {
      id: profileRecordId,
      profile_id: authData.user.id,
      email: authData.user.email,
      role: profile.role,
      full_name: fullName
    };
  } else {
    initLocalStorage();
    const users = JSON.parse(localStorage.getItem('lc_users'));
    const matched = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!matched) throw new Error('Invalid email or password.');
    return matched;
  }
};

export const signOut = async () => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

export const createStudentAccount = async (email, password, studentData) => {
  if (hasSupabaseConfig) {
    let authUserId = null;
    try {
      const { data: existingTempStudents } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('email', email);

      if (existingTempStudents && existingTempStudents.length > 0) {
        const tempIds = existingTempStudents.map(s => s.id);
        await supabaseAdmin.from('students').delete().in('id', tempIds);
      }

      let authUser = null;
      let authError = null;

      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        });
        authUser = data?.user;
        authError = error;
      } catch (err) {
        authError = err;
      }

      if (authError) {
        if (authError.message && authError.message.toLowerCase().includes('already')) {
          // Try to look up existing user ID from profiles table
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase())
            .maybeSingle();

          if (profileRow) {
            authUserId = profileRow.id;
          } else {
            // Fallback to auth listUsers
            const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            if (!listError && userList && userList.users) {
              const existingUser = userList.users.find(u => u.email.toLowerCase() === email.toLowerCase());
              if (existingUser) {
                authUserId = existingUser.id;
              }
            }
          }

          if (authUserId) {
            await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
          }
        }
        if (!authUserId) throw authError;
      } else if (authUser) {
        authUserId = authUser.id;
      }

      const { error: profileError } = await supabaseAdmin.from('profiles').upsert([
        {
          id: authUserId,
          email,
          role: 'student',
          full_name: studentData.full_name
        }
      ]);
      if (profileError) throw new Error(profileError.message || JSON.stringify(profileError));

      const { profile_id, ...cleanStudentData } = studentData;

      if (cleanStudentData.date_of_birth === '' || cleanStudentData.date_of_birth === null) {
        cleanStudentData.date_of_birth = new Date().toISOString().split('T')[0];
      }
      if (cleanStudentData.start_date === '' || cleanStudentData.start_date === null) {
        cleanStudentData.start_date = new Date().toISOString().split('T')[0];
      }

      const { data: student, error: studentError } = await supabaseAdmin.from('students').insert([
        {
          id: authUserId,
          email,
          status: 'approved',
          ...cleanStudentData
        }
      ]).select();
      if (studentError) throw new Error(studentError.message || JSON.stringify(studentError));

      return student[0];
    } catch (err) {
      throw new Error(err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)));
    }
  } else {
    initLocalStorage();
    const users = JSON.parse(localStorage.getItem('lc_users'));
    let students = JSON.parse(localStorage.getItem('lc_students'));

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    // Filter out any temporary lead student record with the same email
    students = students.filter(s => s.email.toLowerCase() !== email.toLowerCase());

    const newUserId = 's_' + Date.now();
    users.push({
      id: newUserId,
      email,
      password,
      role: 'student',
      full_name: studentData.full_name
    });
    localStorage.setItem('lc_users', JSON.stringify(users));

    const newStudent = { id: newUserId, profile_id: newUserId, ...studentData };
    students.push(newStudent);
    localStorage.setItem('lc_students', JSON.stringify(students));

    return newStudent;
  }
};

export const activateStudentAccount = async (studentId, email, password) => {
  if (hasSupabaseConfig) {
    let authUserId = null;
    try {
      let authUser = null;
      let authError = null;

      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        });
        authUser = data?.user;
        authError = error;
      } catch (err) {
        authError = err;
      }

      if (authError) {
        if (authError.message && authError.message.toLowerCase().includes('already')) {
          // Try to look up existing user ID from profiles table
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase())
            .maybeSingle();

          if (profileRow) {
            authUserId = profileRow.id;
          } else {
            // Fallback to auth listUsers
            const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            if (!listError && userList && userList.users) {
              const existingUser = userList.users.find(u => u.email.toLowerCase() === email.toLowerCase());
              if (existingUser) {
                authUserId = existingUser.id;
              }
            }
          }

          if (authUserId) {
            await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
          }
        }
        if (!authUserId) throw authError;
      } else if (authUser) {
        authUserId = authUser.id;
      }

      // Get existing student details to copy over
      const { data: studentRow, error: getError } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      if (getError) throw getError;

      // Upsert into profiles table to prevent constraint failures
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert([
        {
          id: authUserId,
          email,
          role: 'student',
          full_name: studentRow.full_name
        }
      ]);
      if (profileError) throw new Error(profileError.message || JSON.stringify(profileError));

      // Delete the temporary lead record
      const { error: deleteError } = await supabaseAdmin
        .from('students')
        .delete()
        .eq('id', studentId);
      if (deleteError) throw new Error(deleteError.message || JSON.stringify(deleteError));

      // Upsert student record linked to the authUserId
      const { profiles, ...studentWithoutRelations } = studentRow;
      const { data: student, error: studentInsertError } = await supabaseAdmin.from('students').upsert([
        {
          ...studentWithoutRelations,
          id: authUserId,
          email,
          status: 'approved'
        }
      ]).select();
      if (studentInsertError) throw new Error(studentInsertError.message || JSON.stringify(studentInsertError));

      return student[0];
    } catch (err) {
      if (authUserId) {
        await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => {});
      }
      throw new Error(err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)));
    }
  } else {
    initLocalStorage();
    const users = JSON.parse(localStorage.getItem('lc_users'));
    const students = JSON.parse(localStorage.getItem('lc_students'));

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const idx = students.findIndex(s => s.id === studentId);
    if (idx === -1) throw new Error('Student record not found.');

    const newUserId = 's_' + Date.now();
    users.push({
      id: newUserId,
      email,
      password,
      role: 'student',
      full_name: students[idx].full_name
    });
    localStorage.setItem('lc_users', JSON.stringify(users));

    // Update existing student reference
    students[idx].id = newUserId;
    students[idx].profile_id = newUserId;
    students[idx].email = email;
    students[idx].status = 'approved';
    localStorage.setItem('lc_students', JSON.stringify(students));

    return students[idx];
  }
};

export const resetUserPassword = async (userId, newPassword) => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    const users = JSON.parse(localStorage.getItem('lc_users'));
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].password = newPassword;
      localStorage.setItem('lc_users', JSON.stringify(users));
    }
  }
};


export const createTutorAccount = async (email, password, tutorData) => {
  if (hasSupabaseConfig) {
    let authUserId = null;
    let isNewUser = false;
    try {
      let authUser = null;
      let authError = null;

      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        });
        authUser = data?.user;
        authError = error;
      } catch (err) {
        authError = err;
      }

      if (authError) {
        if (authError.message && authError.message.toLowerCase().includes('already')) {
          // Try to look up existing user ID from profiles table
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase())
            .maybeSingle();

          if (profileRow) {
            authUserId = profileRow.id;
          } else {
            // Fallback to auth listUsers
            const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            if (!listError && userList && userList.users) {
              const existingUser = userList.users.find(u => u.email.toLowerCase() === email.toLowerCase());
              if (existingUser) {
                authUserId = existingUser.id;
              }
            }
          }

          if (authUserId) {
            await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
          }
        }
        if (!authUserId) throw authError;
      } else if (authUser) {
        authUserId = authUser.id;
        isNewUser = true;
      }

      // Upsert into profiles table to prevent constraint failures
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert([
        {
          id: authUserId,
          email,
          role: 'tutor',
          full_name: tutorData.full_name
        }
      ]);
      if (profileError) throw new Error(profileError.message || JSON.stringify(profileError));

      // Strip any client-only or non-existent DB columns before inserting
      const { profile_id, ...cleanTutorData } = tutorData;

      // Upsert into tutors table
      const { data: tutor, error: tutorError } = await supabaseAdmin.from('tutors').upsert([
        {
          id: authUserId,
          rating: 5.0,
          ...cleanTutorData
        }
      ]).select();
      if (tutorError) throw new Error(tutorError.message || JSON.stringify(tutorError));

      return tutor[0];
    } catch (err) {
      // Rollback only if the user was newly created in this run
      if (authUserId && isNewUser) {
        await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => {});
      }
      throw new Error(err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)));
    }
  } else {
    initLocalStorage();
    const users = JSON.parse(localStorage.getItem('lc_users'));
    const tutors = JSON.parse(localStorage.getItem('lc_tutors'));

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const newUserId = 't_' + Date.now();

    users.push({
      id: newUserId,
      email,
      password,
      role: 'tutor',
      full_name: tutorData.full_name
    });
    localStorage.setItem('lc_users', JSON.stringify(users));

    const newTutor = { id: newUserId, profile_id: newUserId, rating: 5.0, ...tutorData };
    tutors.push(newTutor);
    localStorage.setItem('lc_tutors', JSON.stringify(tutors));

    return newTutor;
  }
};

export const uploadAvatar = async (userId, file) => {
  if (hasSupabaseConfig) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatar_${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to Base64 encoding:', err.message);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve('');
      });
    }
  } else {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
};

// --- LMS NEW CHANNELS ---

// 1. Courses CRUD
export const getCourses = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_courses'));
  }
};

export const saveCourse = async (course) => {
  if (hasSupabaseConfig) {
    if (course.id) {
      const { data, error } = await supabase.from('courses').update(course).eq('id', course.id).select();
      if (error) throw error;
      return data[0];
    } else {
      const courseId = 'c_' + Date.now();
      const { data, error } = await supabase.from('courses').insert([{ id: courseId, ...course }]).select();
      if (error) throw error;
      return data[0];
    }
  } else {
    initLocalStorage();
    const courses = JSON.parse(localStorage.getItem('lc_courses'));
    if (course.id) {
      const idx = courses.findIndex(c => c.id === course.id);
      if (idx !== -1) {
        courses[idx] = { ...courses[idx], ...course };
        localStorage.setItem('lc_courses', JSON.stringify(courses));
        return courses[idx];
      }
      throw new Error('Course not found');
    } else {
      const courseId = 'c_' + Date.now();
      const newCourse = { id: courseId, ...course };
      courses.push(newCourse);
      localStorage.setItem('lc_courses', JSON.stringify(courses));
      return newCourse;
    }
  }
};

export const deleteCourse = async (id) => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
  } else {
    initLocalStorage();
    let courses = JSON.parse(localStorage.getItem('lc_courses'));
    courses = courses.filter(c => c.id !== id);
    localStorage.setItem('lc_courses', JSON.stringify(courses));
  }
};

// 2. Topics CRUD
export const getTopics = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('topics').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_topics')).sort((a, b) => a.sort_order - b.sort_order);
  }
};

export const saveTopic = async (topic) => {
  const topicId = 'tp_' + Date.now();
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('topics').insert([{ id: topicId, ...topic }]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const topics = JSON.parse(localStorage.getItem('lc_topics'));
    const newTopic = { id: topicId, ...topic };
    topics.push(newTopic);
    localStorage.setItem('lc_topics', JSON.stringify(topics));
    return newTopic;
  }
};

export const deleteTopic = async (id) => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.from('topics').delete().eq('id', id);
    if (error) throw error;
  } else {
    initLocalStorage();
    let topics = JSON.parse(localStorage.getItem('lc_topics'));
    topics = topics.filter(t => t.id !== id);
    localStorage.setItem('lc_topics', JSON.stringify(topics));
  }
};

export const updateTopic = async (id, updates) => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('topics').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const topics = JSON.parse(localStorage.getItem('lc_topics'));
    const idx = topics.findIndex(t => t.id === id);
    if (idx !== -1) {
      topics[idx] = { ...topics[idx], ...updates };
      localStorage.setItem('lc_topics', JSON.stringify(topics));
      return topics[idx];
    }
    throw new Error('Topic not found');
  }
};

// 3. Materials Upload & CRUD
export const uploadMaterialFile = async (fileName, file) => {
  if (hasSupabaseConfig) {
    try {
      const fileExt = file.name.split('.').pop();
      const uniquePath = `mat_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(uniquePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('materials').getPublicUrl(uniquePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Supabase materials storage upload failed, falling back to Base64 encoding:', err.message);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve('');
      });
    }
  } else {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
};

export const getMaterials = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('course_materials').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_materials'));
  }
};

export const saveMaterial = async (material) => {
  const materialId = 'mat_' + Date.now();
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('course_materials').insert([{ id: materialId, ...material }]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const materials = JSON.parse(localStorage.getItem('lc_materials'));
    const newMaterial = { id: materialId, ...material };
    materials.push(newMaterial);
    localStorage.setItem('lc_materials', JSON.stringify(materials));
    return newMaterial;
  }
};

export const deleteMaterial = async (id) => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.from('course_materials').delete().eq('id', id);
    if (error) throw error;
  } else {
    initLocalStorage();
    let materials = JSON.parse(localStorage.getItem('lc_materials'));
    materials = materials.filter(m => m.id !== id);
    localStorage.setItem('lc_materials', JSON.stringify(materials));
  }
};

// 4. Course Tutors Junction
export const getCourseTutors = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('course_tutors').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_course_tutors'));
  }
};

export const assignTutorToCourse = async (courseId, tutorId) => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('course_tutors').insert([{ course_id: courseId, tutor_id: tutorId }]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const items = JSON.parse(localStorage.getItem('lc_course_tutors'));
    if (!items.some(x => x.course_id === courseId && x.tutor_id === tutorId)) {
      items.push({ course_id: courseId, tutor_id: tutorId });
      localStorage.setItem('lc_course_tutors', JSON.stringify(items));
    }
    return { course_id: courseId, tutor_id: tutorId };
  }
};

export const removeTutorFromCourse = async (courseId, tutorId) => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.from('course_tutors').delete().eq('course_id', courseId).eq('tutor_id', tutorId);
    if (error) throw error;
  } else {
    initLocalStorage();
    let items = JSON.parse(localStorage.getItem('lc_course_tutors'));
    items = items.filter(x => !(x.course_id === courseId && x.tutor_id === tutorId));
    localStorage.setItem('lc_course_tutors', JSON.stringify(items));
  }
};

// 5. Student Courses Enrolments
export const getStudentCourses = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('student_courses').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_student_courses'));
  }
};

export const enrollStudentInCourse = async (studentId, courseId, tutorId) => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('student_courses').insert([{ student_id: studentId, course_id: courseId, tutor_id: tutorId }]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const enrollments = JSON.parse(localStorage.getItem('lc_student_courses'));
    const idx = enrollments.findIndex(x => x.student_id === studentId && x.course_id === courseId);
    const item = { student_id: studentId, course_id: courseId, tutor_id: tutorId, assigned_at: new Date().toISOString() };
    if (idx !== -1) {
      enrollments[idx] = item;
    } else {
      enrollments.push(item);
    }
    localStorage.setItem('lc_student_courses', JSON.stringify(enrollments));
    return item;
  }
};

export const unenrollStudentFromCourse = async (studentId, courseId) => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.from('student_courses').delete().eq('student_id', studentId).eq('course_id', courseId);
    if (error) throw error;
  } else {
    initLocalStorage();
    let enrollments = JSON.parse(localStorage.getItem('lc_student_courses'));
    enrollments = enrollments.filter(x => !(x.student_id === studentId && x.course_id === courseId));
    localStorage.setItem('lc_student_courses', JSON.stringify(enrollments));
  }
};

export const updateStudentEnrollment = async (studentId, oldCourseId, newCourseId, newTutorId) => {
  if (hasSupabaseConfig) {
    if (oldCourseId !== newCourseId) {
      const { error: delErr } = await supabase
        .from('student_courses')
        .delete()
        .eq('student_id', studentId)
        .eq('course_id', oldCourseId);
      if (delErr) throw delErr;

      const { data, error: insErr } = await supabase
        .from('student_courses')
        .insert([{ student_id: studentId, course_id: newCourseId, tutor_id: newTutorId }])
        .select();
      if (insErr) throw insErr;
      return data[0];
    } else {
      const { data, error } = await supabase
        .from('student_courses')
        .update({ tutor_id: newTutorId })
        .eq('student_id', studentId)
        .eq('course_id', oldCourseId)
        .select();
      if (error) throw error;
      return data[0];
    }
  } else {
    initLocalStorage();
    const enrollments = JSON.parse(localStorage.getItem('lc_student_courses'));
    const idx = enrollments.findIndex(x => x.student_id === studentId && x.course_id === oldCourseId);
    if (idx !== -1) {
      if (oldCourseId !== newCourseId) {
        enrollments.splice(idx, 1);
        const item = { student_id: studentId, course_id: newCourseId, tutor_id: newTutorId, assigned_at: new Date().toISOString() };
        enrollments.push(item);
        localStorage.setItem('lc_student_courses', JSON.stringify(enrollments));
        return item;
      } else {
        enrollments[idx].tutor_id = newTutorId;
        localStorage.setItem('lc_student_courses', JSON.stringify(enrollments));
        return enrollments[idx];
      }
    }
    throw new Error('Enrollment not found.');
  }
};

// 6. Tasks CRUD (Assignments & Quizzes)
export const getTasks = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_tasks'));
  }
};

export const saveTask = async (task) => {
  if (hasSupabaseConfig) {
    if (task.id) {
      const { data, error } = await supabase.from('tasks').update(task).eq('id', task.id).select();
      if (error) throw error;
      return data[0];
    } else {
      const taskId = 'tk_' + Date.now();
      const { data, error } = await supabase.from('tasks').insert([{ id: taskId, ...task }]).select();
      if (error) throw error;
      return data[0];
    }
  } else {
    initLocalStorage();
    const tasks = JSON.parse(localStorage.getItem('lc_tasks'));
    if (task.id) {
      const idx = tasks.findIndex(tk => tk.id === task.id);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...task };
        localStorage.setItem('lc_tasks', JSON.stringify(tasks));
        return tasks[idx];
      }
      throw new Error('Task not found');
    } else {
      const taskId = 'tk_' + Date.now();
      const newTask = { id: taskId, ...task };
      tasks.push(newTask);
      localStorage.setItem('lc_tasks', JSON.stringify(tasks));
      return newTask;
    }
  }
};

export const deleteTask = async (id) => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  } else {
    initLocalStorage();
    let tasks = JSON.parse(localStorage.getItem('lc_tasks'));
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('lc_tasks', JSON.stringify(tasks));
  }
};

// 7. Student Submissions & Grading
export const getStudentTasks = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('student_tasks').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_student_tasks'));
  }
};

export const submitStudentTask = async (submission) => {
  const submissionId = 'st_' + Date.now();
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('student_tasks').insert([{ id: submissionId, ...submission }]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const submissions = JSON.parse(localStorage.getItem('lc_student_tasks'));
    const newSub = { id: submissionId, submitted_at: new Date().toISOString(), ...submission };
    submissions.push(newSub);
    localStorage.setItem('lc_student_tasks', JSON.stringify(submissions));
    return newSub;
  }
};

export const gradeStudentTask = async (id, grade, feedback, tutorId) => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('student_tasks')
      .update({ grade, feedback, graded_at: new Date().toISOString(), graded_by: tutorId })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const submissions = JSON.parse(localStorage.getItem('lc_student_tasks'));
    const idx = submissions.findIndex(s => s.id === id);
    if (idx !== -1) {
      submissions[idx].grade = Number(grade);
      submissions[idx].feedback = feedback;
      submissions[idx].graded_at = new Date().toISOString();
      submissions[idx].graded_by = tutorId;
      localStorage.setItem('lc_student_tasks', JSON.stringify(submissions));
      return submissions[idx];
    }
    throw new Error('Submission not found');
  }
};

// 8. Class Schedules CRUD
export const getSchedules = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('schedules').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_schedules'));
  }
};

export const saveSchedule = async (schedule) => {
  const scheduleId = 'sch_' + Date.now();
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('schedules').insert([{ id: scheduleId, ...schedule }]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const items = JSON.parse(localStorage.getItem('lc_schedules'));
    const newSch = { id: scheduleId, ...schedule };
    items.push(newSch);
    localStorage.setItem('lc_schedules', JSON.stringify(items));
    return newSch;
  }
};

export const deleteSchedule = async (id) => {
  if (hasSupabaseConfig) {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw error;
  } else {
    initLocalStorage();
    let items = JSON.parse(localStorage.getItem('lc_schedules'));
    items = items.filter(s => s.id !== id);
    localStorage.setItem('lc_schedules', JSON.stringify(items));
  }
};

// 9. Attendance CRUD
export const getAttendance = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('attendance').select('*');
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_attendance'));
  }
};

export const markAttendance = async (attendance) => {
  const attendanceId = 'att_' + Date.now();
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('attendance').insert([{ id: attendanceId, ...attendance }]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const items = JSON.parse(localStorage.getItem('lc_attendance'));
    const newAtt = { id: attendanceId, marked_at: new Date().toISOString(), ...attendance };
    // Remove past duplicates
    const filtered = items.filter(x => !(x.schedule_id === attendance.schedule_id && x.student_id === attendance.student_id));
    filtered.push(newAtt);
    localStorage.setItem('lc_attendance', JSON.stringify(filtered));
    return newAtt;
  }
};

// 10. Announcements CRUD
export const getAnnouncements = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('course_announcements').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_announcements')).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

export const createAnnouncement = async (announcement) => {
  const announcementId = 'an_' + Date.now();
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('course_announcements').insert([{ id: announcementId, ...announcement }]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const items = JSON.parse(localStorage.getItem('lc_announcements'));
    const newAnn = { id: announcementId, created_at: new Date().toISOString(), ...announcement };
    items.push(newAnn);
    localStorage.setItem('lc_announcements', JSON.stringify(items));
    return newAnn;
  }
};

// 11. Chat Messages Messages CRUD
export const getChatMessages = async () => {
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  } else {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('lc_chat_messages')).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
};

export const sendChatMessage = async (msg) => {
  const chatMessageId = 'ch_' + Date.now();
  if (hasSupabaseConfig) {
    const { data, error } = await supabase.from('chat_messages').insert([{ id: chatMessageId, ...msg }]).select();
    if (error) throw error;
    return data[0];
  } else {
    initLocalStorage();
    const items = JSON.parse(localStorage.getItem('lc_chat_messages'));
    const newMsg = { id: chatMessageId, created_at: new Date().toISOString(), ...msg };
    items.push(newMsg);
    localStorage.setItem('lc_chat_messages', JSON.stringify(items));
    return newMsg;
  }
};
