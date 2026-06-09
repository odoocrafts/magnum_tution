const businessHours = {
  // Sunday = 0, Monday = 1, etc.
  0: { open: '10:00', close: '17:00' }, // Sunday 10 am - 5 pm
  1: { open: '05:15', close: '19:45' }, // Monday 5:15 am - 7:45 pm
  2: { open: '05:15', close: '19:45' },
  3: { open: '05:15', close: '19:45' },
  4: { open: '05:15', close: '19:45' },
  5: { open: '05:15', close: '19:45' },
  6: { open: '05:15', close: '19:45' }
};

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getNextOpenTime(currentDay, currentMinutes) {
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Check if it opens later today
  if (businessHours[currentDay] && currentMinutes < parseTime(businessHours[currentDay].open)) {
    return formatTime(businessHours[currentDay].open);
  }

  // Check upcoming days
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    if (businessHours[nextDay]) {
      const openTimeFormatted = formatTime(businessHours[nextDay].open);
      if (i === 1) return `tomorrow ${openTimeFormatted}`;
      return `${daysMap[nextDay]} ${openTimeFormatted}`;
    }
  }
  return '';
}

function checkStatus() {
  const now = new Date();
  const day = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayHours = businessHours[day];
  const statusBadge = document.getElementById('open-status');
  const statusText = document.getElementById('status-text');

  // Highlight today in the hours list
  document.querySelectorAll('.hours-list li').forEach(li => {
    li.classList.remove('today');
    if (parseInt(li.getAttribute('data-day')) === day) {
      li.classList.add('today');
    }
  });

  if (todayHours) {
    const openTime = parseTime(todayHours.open);
    const closeTime = parseTime(todayHours.close);

    if (currentMinutes >= openTime && currentMinutes < closeTime) {
      statusBadge.className = 'status-badge open';
      statusText.textContent = 'Open Now';
      return;
    }
  }
  
  // If we reach here, it's closed
  const nextOpen = getNextOpenTime(day, currentMinutes);
  statusBadge.className = 'status-badge closed';
  statusText.textContent = nextOpen ? `Opens ${nextOpen}` : 'Closed';
}

// WhatsApp Integration Logic
let selectedGrade = null;
let selectedSubject = null;
let selectedBranchPhone = null;
let selectedBranchName = null;

function updateWhatsAppLink() {
  const btn = document.getElementById('whatsapp-btn');
  const phone = selectedBranchPhone || '919447474488';
  let message = 'Hello Magnum Tuition Class,';
  
  if (selectedGrade || selectedSubject || selectedBranchName) {
    message += ' I am interested in joining';
    if (selectedBranchName) message += ` the ${selectedBranchName} branch`;
    if (selectedGrade || selectedSubject) message += ' for';
    if (selectedGrade) message += ` ${selectedGrade}`;
    if (selectedGrade && selectedSubject) message += ' -';
    if (selectedSubject) message += ` ${selectedSubject}`;
    message += '.';
  } else {
    message += ' I would like to know more about your tuition classes.';
  }
  
  btn.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll('.grade-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    // Toggle active
    if (chip.classList.contains('active')) {
      chip.classList.remove('active');
      selectedGrade = null;
    } else {
      document.querySelectorAll('.grade-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedGrade = chip.textContent;
    }
    updateWhatsAppLink();
  });
});

document.querySelectorAll('.topic-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    // Toggle active
    if (chip.classList.contains('active')) {
      chip.classList.remove('active');
      selectedSubject = null;
    } else {
      document.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedSubject = chip.textContent;
    }
    updateWhatsAppLink();
  });
});

document.querySelectorAll('.branch-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    // Toggle active
    if (chip.classList.contains('active')) {
      chip.classList.remove('active');
      selectedBranchPhone = null;
      selectedBranchName = null;
    } else {
      document.querySelectorAll('.branch-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedBranchPhone = chip.getAttribute('data-phone');
      selectedBranchName = chip.textContent;
    }
    updateWhatsAppLink();
  });
});

// Initial Setup
checkStatus();
updateWhatsAppLink();
setInterval(checkStatus, 60000);

// vCard Generation
document.getElementById('save-vcard-btn').addEventListener('click', () => {
  const vcardData = `BEGIN:VCARD
VERSION:3.0
FN:Magnum Tuition Class
ORG:Magnum Tuition Class
TITLE:CBSE Tuition Centre
TEL;TYPE=WORK,VOICE:09447474488
TEL;TYPE=WORK,VOICE:09037603754
ADR;TYPE=WORK;LABEL="Elamakkara":;;3rd floor, Desabhimani Rd, opposite B.V.M.School;Elamakkara, Kochi;Kerala;682026;India
ADR;TYPE=WORK;LABEL="Palarivattom":;;3rd Floor, Veeyes Building, Mahakavi Vyloppilly Road, near KSFE;Palarivattom, Kochi;Kerala;682025;India
URL:https://odoocrafts.github.io/magnum_tution/
END:VCARD`;

  const blob = new Blob([vcardData], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Magnum_Tuition_Class.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
