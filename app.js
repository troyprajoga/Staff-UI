// State Management
let currentUser = null;
let currentPage = 'dashboard';
let currentDate = new Date();
let selectedBooking = null;

// Mock Data
const mockBookings = [
    {
        id: 'BK001',
        customer: 'John Doe',
        phone: '+1-555-0101',
        court: 1,
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        duration: '1 hour',
        price: 50,
        paymentStatus: 'paid',
        paymentMethod: 'card',
        bookingStatus: 'confirmed',
        notes: 'Regular customer',
        code: '1234',
        staff: 'Admin User',
        activityLog: [
            { time: '08:30', action: 'Booking created' },
            { time: '08:45', action: 'Payment confirmed' }
        ]
    },
    {
        id: 'BK002',
        customer: 'Jane Smith',
        phone: '+1-555-0102',
        court: 2,
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        duration: '1 hour',
        price: 50,
        paymentStatus: 'unpaid',
        paymentMethod: 'cash',
        bookingStatus: 'pending',
        notes: '',
        code: '2345',
        staff: 'Staff User',
        activityLog: [
            { time: '09:00', action: 'Booking created' }
        ]
    },
    {
        id: 'BK003',
        customer: 'Mike Johnson',
        phone: '+1-555-0103',
        court: 1,
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:30',
        duration: '1.5 hours',
        price: 75,
        paymentStatus: 'paid',
        paymentMethod: 'online',
        bookingStatus: 'checked-in',
        notes: 'Requested better lighting',
        code: '3456',
        staff: 'Admin User',
        activityLog: [
            { time: '13:30', action: 'Booking created' },
            { time: '13:35', action: 'Payment confirmed' },
            { time: '13:55', action: 'Customer checked in' }
        ]
    },
    {
        id: 'BK004',
        customer: 'Sarah Williams',
        phone: '+1-555-0104',
        court: 3,
        date: new Date().toISOString().split('T')[0],
        startTime: '16:00',
        endTime: '17:00',
        duration: '1 hour',
        price: 50,
        paymentStatus: 'unpaid',
        paymentMethod: 'cash',
        bookingStatus: 'confirmed',
        notes: '',
        code: '4567',
        staff: 'Staff User',
        activityLog: [
            { time: '15:00', action: 'Booking created' },
            { time: '15:30', action: 'Booking confirmed' }
        ]
    }
];

const mockTransactions = mockBookings.map(booking => ({
    ...booking,
    timestamp: `${booking.startTime}`
}));

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(time) {
    return time;
}

function getTimeSlots() {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
}

function isUpcoming(booking) {
    const now = new Date();
    const bookingTime = new Date(`${booking.date} ${booking.startTime}`);
    const diffMs = bookingTime - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 3;
}

function getTodayBookings() {
    const today = new Date().toISOString().split('T')[0];
    return mockBookings.filter(b => b.date === today);
}

// Authentication
function login(email, password) {
    if (email === 'staff@example.com' && password === 'password') {
        currentUser = { email, role: 'staff', name: 'Staff User' };
        return true;
    } else if (email === 'admin@example.com' && password === 'password') {
        currentUser = { email, role: 'admin', name: 'Admin User' };
        return true;
    }
    return false;
}

function logout() {
    currentUser = null;
    showPage('login');
    document.body.classList.remove('admin');
}

// Page Navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    if (pageName === 'login') {
        document.getElementById('loginPage').classList.add('active');
    } else {
        document.getElementById('mainApp').classList.add('active');
        showContentPage(pageName);
    }
}

function showContentPage(pageName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    // Hide all content pages
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected content page
    document.getElementById(`${pageName}Page`).classList.add('active');
    currentPage = pageName;
    
    // Load page data
    switch(pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'schedule':
            loadSchedule();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Dashboard Functions
function loadDashboard() {
    const todayBookings = getTodayBookings();
    
    // Update current date
    document.getElementById('currentDate').textContent = formatDate(new Date());
    
    // Load alerts
    loadAlerts(todayBookings);
    
    // Load upcoming bookings (all bookings that haven't started yet or are in progress)
    loadUpcomingBookingsToday(todayBookings);
    
    // Load completed bookings
    loadCompletedBookingsToday(todayBookings);
}

function loadAlerts(bookings) {
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';
    
    // Check for upcoming bookings starting soon
    const upcomingSoon = bookings.filter(b => {
        const now = new Date();
        const startTime = new Date(`${b.date} ${b.startTime}`);
        const diffMs = startTime - now;
        const diffMinutes = diffMs / (1000 * 60);
        return b.bookingStatus !== 'checked-in' && b.bookingStatus !== 'completed' && diffMinutes > 0 && diffMinutes <= 30;
    });
    
    if (upcomingSoon.length > 0) {
        alertsContainer.innerHTML += `
            <div class="alert alert-info">
                <span>🔔</span>
                <div>
                    <strong>Starting Soon:</strong> 
                    ${upcomingSoon.length} booking(s) starting within 30 minutes.
                </div>
            </div>
        `;
    }
}

function loadUpcomingBookingsToday(bookings) {
    const container = document.getElementById('upcomingBookings');
    const now = new Date();
    
    // Get bookings that haven't been completed yet, sorted by start time
    const upcoming = bookings
        .filter(b => b.bookingStatus !== 'completed')
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No upcoming bookings today.</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(booking => `
        <div class="booking-item">
            <div class="booking-info-main">
                <div class="booking-time">${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}</div>
                <div class="booking-details">Court ${booking.court} • ${booking.customer}</div>
            </div>
            <div class="booking-badges">
                <span class="badge ${booking.bookingStatus === 'checked-in' ? 'badge-checkedin' : 'badge-pending'}">${booking.bookingStatus === 'checked-in' ? 'Checked In' : 'Not Yet'}</span>
            </div>
            <button class="btn btn-secondary" onclick="openBookingModal('${booking.id}')">View</button>
        </div>
    `).join('');
}

function loadCompletedBookingsToday(bookings) {
    const container = document.getElementById('completedBookings');
    
    // Get completed bookings, sorted by start time
    const completed = bookings
        .filter(b => b.bookingStatus === 'completed')
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    if (completed.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No completed bookings today.</p>';
        return;
    }
    
    container.innerHTML = completed.map(booking => `
        <div class="booking-item">
            <div class="booking-info-main">
                <div class="booking-time">${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}</div>
                <div class="booking-details">Court ${booking.court} • ${booking.customer}</div>
            </div>
            <div class="booking-badges">
                <span class="badge badge-completed">Completed</span>
            </div>
            <button class="btn btn-secondary" onclick="openBookingModal('${booking.id}')">View</button>
        </div>
    `).join('');
}

// Schedule Functions
function loadSchedule() {
    const dateInput = document.getElementById('scheduleDate');
    dateInput.value = currentDate.toISOString().split('T')[0];
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const dateStr = currentDate.toISOString().split('T')[0];
    const todayBookings = mockBookings.filter(b => b.date === dateStr);
    const courtFilter = document.getElementById('courtFilter').value;
    
    // Determine courts to show
    let courts = [1, 2, 3];
    if (courtFilter !== 'all') {
        courts = [parseInt(courtFilter)];
    }
    
    // Build header
    let html = '<div class="calendar-header">';
    html += '<div class="calendar-header-cell">Time</div>';
    courts.forEach(court => {
        html += `<div class="calendar-header-cell">Court ${court}</div>`;
    });
    html += '</div>';
    
    // Build time slots
    const timeSlots = getTimeSlots();
    timeSlots.forEach(time => {
        html += '<div class="calendar-row">';
        html += `<div class="calendar-time-cell">${time}</div>`;
        
        courts.forEach(court => {
            const booking = todayBookings.find(b => 
                b.court === court && b.startTime === time
            );
            
            html += `<div class="calendar-court-cell" data-court="${court}" data-time="${time}">`;
            if (booking) {
                const isDraggable = currentUser && currentUser.role === 'admin';
                html += `
                    <div class="calendar-booking ${isDraggable ? 'draggable' : ''}" 
                         onclick="openBookingModal('${booking.id}')"
                         ${isDraggable ? `draggable="true" data-booking-id="${booking.id}"` : ''}>
                        <div class="calendar-booking-name">${booking.customer}</div>
                        <div class="calendar-booking-time">${booking.startTime} - ${booking.endTime}</div>
                        <div class="calendar-booking-badges">
                            <span class="badge ${booking.bookingStatus === 'checked-in' ? 'badge-checkedin' : 'badge-pending'}">${booking.bookingStatus === 'checked-in' ? 'Checked In' : 'Not Yet'}</span>
                        </div>
                    </div>
                `;
            }
            html += '</div>';
        });
        
        html += '</div>';
    });
    
    grid.innerHTML = html;
    
    // Add drag and drop event listeners for admin
    if (currentUser && currentUser.role === 'admin') {
        setupDragAndDrop();
    }
}

function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    document.getElementById('scheduleDate').value = currentDate.toISOString().split('T')[0];
    renderCalendar();
}

function goToToday() {
    currentDate = new Date();
    document.getElementById('scheduleDate').value = currentDate.toISOString().split('T')[0];
    renderCalendar();
}

function lookupBookingCode() {
    const code = document.getElementById('bookingCodeInput').value.trim();
    if (!code) {
        alert('Please enter a booking code');
        return;
    }
    
    const booking = mockBookings.find(b => b.code === code);
    if (booking) {
        // Open the booking modal directly
        openBookingModal(booking.id);
        document.getElementById('bookingCodeInput').value = '';
    } else {
        alert('Invalid booking code.');
    }
}

// Bookings Functions
function loadBookings() {
    const dateInput = document.getElementById('transactionDate');
    dateInput.value = new Date().toISOString().split('T')[0];
    renderBookings();
}

function renderBookings() {
    const tbody = document.getElementById('transactionsBody');
    const searchTerm = document.getElementById('bookingSearch')?.value.toLowerCase() || '';
    
    let filtered = [...mockBookings];
    
    // Filter by search term (customer name or booking ID)
    if (searchTerm) {
        filtered = filtered.filter(b => 
            b.customer.toLowerCase().includes(searchTerm) || 
            b.id.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by time
    filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    tbody.innerHTML = filtered.map(booking => `
        <tr>
            <td>${booking.startTime}</td>
            <td><a href="#" onclick="openBookingModal('${booking.id}'); return false;">${booking.id}</a></td>
            <td>${booking.customer}</td>
            <td>Court ${booking.court}</td>
            <td><span class="badge ${booking.bookingStatus === 'checked-in' ? 'badge-checkedin' : booking.bookingStatus === 'completed' ? 'badge-completed' : 'badge-pending'}">${booking.bookingStatus === 'checked-in' ? 'Checked In' : booking.bookingStatus === 'completed' ? 'Completed' : 'Not Yet'}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="openBookingModal('${booking.id}')">View</button>
                ${isAdmin ? `
                    <button class="btn btn-secondary" onclick="openRescheduleModal('${booking.id}')">Reschedule</button>
                    <button class="btn btn-danger" onclick="deleteBooking('${booking.id}')">Delete</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Settings Functions
function loadSettings() {
    if (currentUser) {
        document.getElementById('settingsName').value = currentUser.name;
        document.getElementById('settingsEmail').value = currentUser.email;
    }
}

// Booking Modal Functions
function openBookingModal(bookingId) {
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    selectedBooking = booking;
    
    // Populate modal
    document.getElementById('modalBookingId').textContent = booking.id;
    document.getElementById('modalCustomer').textContent = booking.customer;
    document.getElementById('modalPhone').textContent = booking.phone;
    document.getElementById('modalCourt').textContent = `Court ${booking.court}`;
    document.getElementById('modalDate').textContent = formatDate(booking.date);
    document.getElementById('modalTime').textContent = `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`;
    document.getElementById('modalCode').textContent = booking.code;
    
    // Activity log
    const logHtml = booking.activityLog.map(log => `
        <div class="activity-item">
            <div class="activity-time">${log.time}</div>
            <div>${log.action}</div>
        </div>
    `).join('');
    document.getElementById('modalActivityLog').innerHTML = logHtml;
    
    // Show appropriate action buttons
    updateModalButtons(booking);
    
    // Show modal
    document.getElementById('bookingModal').classList.add('active');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
    selectedBooking = null;
}

function updateModalButtons(booking) {
    const buttons = document.querySelectorAll('.action-btn');
    
    buttons.forEach(btn => {
        const action = btn.dataset.action;
        let shouldShow = true;
        
        // Hide check-in button if already checked in
        if (action === 'checkin' && booking.bookingStatus === 'checked-in') {
            shouldShow = false;
        }
        
        // Hide admin-only buttons for staff users
        if ((action === 'reschedule' || action === 'delete') && currentUser.role !== 'admin') {
            shouldShow = false;
        }
        
        btn.style.display = shouldShow ? 'inline-block' : 'none';
    });
}

function handleBookingAction(action) {
    if (!selectedBooking) return;
    
    const booking = selectedBooking;
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    if (action === 'checkin') {
        booking.bookingStatus = 'checked-in';
        booking.activityLog.push({ time: now, action: 'Customer checked in by ' + currentUser.name });
        alert('Customer checked in!');
        
        // Refresh modal
        closeBookingModal();
        openBookingModal(booking.id);
        
        // Refresh current page
        if (currentPage === 'dashboard') loadDashboard();
        if (currentPage === 'schedule') renderCalendar();
        if (currentPage === 'bookings') renderBookings();
    } else if (action === 'reschedule') {
        if (currentUser.role !== 'admin') {
            alert('Only admins can reschedule bookings');
            return;
        }
        closeBookingModal();
        openRescheduleModal(booking.id);
    } else if (action === 'delete') {
        if (currentUser.role !== 'admin') {
            alert('Only admins can delete bookings');
            return;
        }
        deleteBooking(booking.id);
    }
}

// Admin Booking Management Functions
let editingBookingId = null;

function openAddBookingModal() {
    if (currentUser.role !== 'admin') {
        alert('Only admins can add bookings');
        return;
    }
    
    editingBookingId = null;
    document.getElementById('addBookingModalTitle').textContent = 'Add Booking';
    
    // Show all fields when adding new booking
    document.getElementById('customerNameGroup').style.display = 'block';
    document.getElementById('phoneGroup').style.display = 'block';
    
    document.getElementById('bookingCustomerName').value = '';
    document.getElementById('bookingPhone').value = '';
    document.getElementById('bookingCourt').value = '1';
    document.getElementById('bookingDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('bookingStartTime').value = '';
    document.getElementById('bookingEndTime').value = '';
    
    document.getElementById('addBookingModal').classList.add('active');
}

function openRescheduleModal(bookingId) {
    if (currentUser.role !== 'admin') {
        alert('Only admins can reschedule bookings');
        return;
    }
    
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    editingBookingId = bookingId;
    document.getElementById('addBookingModalTitle').textContent = 'Reschedule Booking';
    
    // Hide customer name and phone fields when rescheduling
    document.getElementById('customerNameGroup').style.display = 'none';
    document.getElementById('phoneGroup').style.display = 'none';
    
    // Only show court, date, and times
    document.getElementById('bookingCourt').value = booking.court;
    document.getElementById('bookingDate').value = booking.date;
    document.getElementById('bookingStartTime').value = booking.startTime;
    document.getElementById('bookingEndTime').value = booking.endTime;
    
    document.getElementById('addBookingModal').classList.add('active');
}

function closeAddBookingModal() {
    document.getElementById('addBookingModal').classList.remove('active');
    editingBookingId = null;
}

function saveBooking() {
    const court = parseInt(document.getElementById('bookingCourt').value);
    const date = document.getElementById('bookingDate').value;
    const startTime = document.getElementById('bookingStartTime').value;
    const endTime = document.getElementById('bookingEndTime').value;
    
    // Validation for required fields
    if (!date || !startTime || !endTime) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (startTime >= endTime) {
        alert('End time must be after start time');
        return;
    }
    
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    if (editingBookingId) {
        // Reschedule existing booking - only update court, date, and times
        const booking = mockBookings.find(b => b.id === editingBookingId);
        if (booking) {
            booking.court = court;
            booking.date = date;
            booking.startTime = startTime;
            booking.endTime = endTime;
            booking.duration = calculateDuration(startTime, endTime);
            booking.activityLog.push({ time: now, action: 'Booking rescheduled by ' + currentUser.name });
            alert('Booking rescheduled successfully!');
        }
    } else {
        // Add new booking - need all fields
        const customerName = document.getElementById('bookingCustomerName').value.trim();
        const phone = document.getElementById('bookingPhone').value.trim();
        
        if (!customerName || !phone) {
            alert('Please fill in all required fields');
            return;
        }
        
        const newBooking = {
            id: 'BK' + String(mockBookings.length + 1).padStart(3, '0'),
            customer: customerName,
            phone: phone,
            court: court,
            date: date,
            startTime: startTime,
            endTime: endTime,
            duration: calculateDuration(startTime, endTime),
            price: 50,
            paymentStatus: 'unpaid',
            paymentMethod: 'pending',
            bookingStatus: 'pending',
            notes: '',
            code: generateBookingCode(),
            staff: currentUser.name,
            activityLog: [
                { time: now, action: 'Booking created by ' + currentUser.name }
            ]
        };
        mockBookings.push(newBooking);
        alert('Booking created successfully! Verification code: ' + newBooking.code);
    }
    
    closeAddBookingModal();
    
    // Refresh current page
    if (currentPage === 'dashboard') loadDashboard();
    if (currentPage === 'schedule') renderCalendar();
    if (currentPage === 'bookings') renderBookings();
}

function deleteBooking(bookingId) {
    if (currentUser.role !== 'admin') {
        alert('Only admins can delete bookings');
        return;
    }
    
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    if (!confirm(`Are you sure you want to delete booking ${bookingId} for ${booking.customer}?`)) {
        return;
    }
    
    const index = mockBookings.findIndex(b => b.id === bookingId);
    if (index > -1) {
        mockBookings.splice(index, 1);
        alert('Booking deleted successfully');
        
        // Close modal if open
        if (selectedBooking && selectedBooking.id === bookingId) {
            closeBookingModal();
        }
        
        // Refresh current page
        if (currentPage === 'dashboard') loadDashboard();
        if (currentPage === 'schedule') renderCalendar();
        if (currentPage === 'bookings') renderBookings();
    }
}

function calculateDuration(startTime, endTime) {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours === 1 ? '1 hour' : `${diffHours} hours`;
}

function generateBookingCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
}

// Drag and Drop for Admin
let draggedBookingId = null;

function setupDragAndDrop() {
    const draggableBookings = document.querySelectorAll('.calendar-booking.draggable');
    const dropZones = document.querySelectorAll('.calendar-court-cell');
    
    // Set up draggable bookings
    draggableBookings.forEach(booking => {
        booking.addEventListener('dragstart', handleDragStart);
        booking.addEventListener('dragend', handleDragEnd);
    });
    
    // Set up drop zones
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedBookingId = e.currentTarget.dataset.bookingId;
    e.currentTarget.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.currentTarget.style.opacity = '1';
    
    // Remove all drag-over classes
    document.querySelectorAll('.calendar-court-cell').forEach(cell => {
        cell.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();
    
    const dropZone = e.currentTarget;
    dropZone.classList.remove('drag-over');
    
    const newCourt = parseInt(dropZone.dataset.court);
    const newTime = dropZone.dataset.time;
    
    if (draggedBookingId && newCourt && newTime) {
        const booking = mockBookings.find(b => b.id === draggedBookingId);
        
        if (booking) {
            // Check if dropped in the same position (no change)
            if (booking.court === newCourt && booking.startTime === newTime) {
                draggedBookingId = null;
                return false;
            }
            
            // Check if the slot is already occupied
            const conflict = mockBookings.find(b => 
                b.id !== draggedBookingId && 
                b.court === newCourt && 
                b.date === currentDate.toISOString().split('T')[0] &&
                b.startTime === newTime
            );
            
            if (conflict) {
                alert('This time slot is already occupied!');
                return false;
            }
            
            // Calculate duration
            const start = new Date(`2000-01-01 ${booking.startTime}`);
            const end = new Date(`2000-01-01 ${booking.endTime}`);
            const durationMs = end - start;
            
            // Calculate new end time
            const newStart = new Date(`2000-01-01 ${newTime}`);
            const newEnd = new Date(newStart.getTime() + durationMs);
            const newEndTime = newEnd.toTimeString().slice(0, 5);
            
            // Confirmation dialog
            const confirmMsg = `Move booking for ${booking.customer} to Court ${newCourt} at ${newTime}-${newEndTime}?`;
            if (!confirm(confirmMsg)) {
                renderCalendar(); // Refresh to reset the dragged booking position
                return false;
            }
            
            // Update booking
            booking.court = newCourt;
            booking.startTime = newTime;
            booking.endTime = newEndTime;
            
            const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            booking.activityLog.push({ 
                time: now, 
                action: `Booking moved to Court ${newCourt} at ${newTime} by ${currentUser.name}` 
            });
            
            // Refresh calendar
            renderCalendar();
        }
    }
    
    draggedBookingId = null;
    return false;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (login(email, password)) {
            showPage('dashboard');
            if (currentUser.role === 'admin') {
                document.body.classList.add('admin');
            }
            document.getElementById('userRole').textContent = currentUser.role.toUpperCase();
        } else {
            alert('Invalid credentials');
        }
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            showContentPage(page);
        });
    });
    
    // Schedule controls
    document.getElementById('prevDay')?.addEventListener('click', () => changeDate(-1));
    document.getElementById('nextDay')?.addEventListener('click', () => changeDate(1));
    document.getElementById('todayBtn')?.addEventListener('click', goToToday);
    document.getElementById('scheduleDate')?.addEventListener('change', function() {
        currentDate = new Date(this.value);
        renderCalendar();
    });
    document.getElementById('courtFilter')?.addEventListener('change', renderCalendar);
    document.getElementById('lookupBtn')?.addEventListener('click', lookupBookingCode);
    document.getElementById('bookingCodeInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            lookupBookingCode();
        }
    });
    
    // Bookings search and filters
    document.getElementById('bookingSearch')?.addEventListener('input', renderBookings);
    document.getElementById('transactionDate')?.addEventListener('change', renderBookings);
    
    // Modal
    document.querySelector('.modal-close')?.addEventListener('click', closeBookingModal);
    document.getElementById('bookingModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeBookingModal();
        }
    });
    
    document.getElementById('addBookingModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeAddBookingModal();
        }
    });
    
    // Action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            handleBookingAction(this.dataset.action);
        });
    });
    
    // Start on login page
    showPage('login');
});
