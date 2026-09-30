/*
Backend integration contract (Node.js/Express, MongoDB or PostgreSQL):
POST /api/auth/register and POST /api/auth/login -> { token: JWT, user }
POST /api/complaints; GET /api/complaints/:userId; GET /api/complaints/track/:id
POST /api/pickups; GET /api/pickups/admin
GET /api/admin/stats; GET /api/admin/heatmap-data
Suggested tables: Users(id,name,email,passwordHash,role,address),
Complaints(id,userId,category,description,imageUrl,location,status,assignedTo),
Pickups(id,userId,wasteType,quantity,date,status).
These pages use local demo interactions; production requests should send the JWT
as an Authorization: Bearer token and validate roles on the server.
*/

const showToast = (message) => {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2600);
};

const sidebar = document.querySelector('.app-sidebar');
if (sidebar) {
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'sidebar-close';
  closeButton.setAttribute('aria-label', 'Close navigation');
  closeButton.innerHTML = '<i data-lucide="x" class="h-5 w-5"></i>';
  sidebar.prepend(closeButton);
  closeButton.addEventListener('click', () => sidebar.classList.remove('mobile-open'));
}

document.querySelectorAll('[data-menu-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    sidebar?.classList.toggle('mobile-open');
    button.setAttribute('aria-expanded', String(sidebar?.classList.contains('mobile-open')));
  });
});

document.querySelectorAll('[data-role-toggle]').forEach((group) => {
  group.querySelectorAll('[data-role]').forEach((button) => {
    button.addEventListener('click', () => {
      group.querySelectorAll('[data-role]').forEach((option) => {
        option.setAttribute('aria-pressed', String(option === button));
      });
    });
  });
});

document.querySelectorAll('form[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const confirmation = form.querySelector('[data-confirm-password]');
    if (confirmation) {
      const password = form.querySelector('[name="password"]');
      confirmation.setCustomValidity(confirmation.value === password?.value ? '' : 'Passwords do not match.');
    }
    if (!form.reportValidity()) return;
    showToast(form.dataset.success || 'Your request has been saved.');
    form.reset();
  });
});

const dateInput = document.querySelector('input[type="date"][name="date"]');
if (dateInput) {
  const localDate = new Date();
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  dateInput.min = localDate.toISOString().slice(0, 10);
}

const currentDate = new Date();
document.querySelectorAll('[data-current-date]').forEach((element) => {
  element.textContent = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(currentDate);
});
document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = String(currentDate.getFullYear());
});

document.querySelectorAll('[data-current-location]').forEach((button) => {
  button.addEventListener('click', () => {
    const field = document.querySelector(button.dataset.currentLocation);
    if (!navigator.geolocation) {
      showToast('Location is not available in this browser.');
      return;
    }
    button.disabled = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (field) field.value = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
        button.disabled = false;
        showToast('Current location added.');
      },
      () => {
        button.disabled = false;
        showToast('Location permission was not granted.');
      },
      { timeout: 8000 }
    );
  });
});

document.querySelectorAll('[data-track-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = document.querySelector('[data-track-result]');
    const complaintId = form.querySelector('input')?.value.trim();
    if (!complaintId) return;
    if (result) {
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showToast(`Showing demo status for ${complaintId}.`);
  });
});

document.querySelectorAll('[data-file-input]').forEach((input) => {
  input.addEventListener('change', () => {
    const label = document.querySelector(input.dataset.fileInput);
    if (label && input.files?.length) label.textContent = input.files[0].name;
  });
});

document.querySelectorAll('[data-leaflet-map]').forEach((element) => {
  if (!window.L) return;
  const map = window.L.map(element, { scrollWheelZoom: false }).setView([40.7128, -74.006], 14);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);
  [
    { offset: [0.004, -0.006], level: 'high' },
    { offset: [-0.003, 0.005], level: 'medium' },
    { offset: [0.006, 0.008], level: 'low' },
    { offset: [-0.007, -0.002], level: 'high' },
  ].forEach(({ offset, level }) => {
    const color = { high: '#d96859', medium: '#e5a53b', low: '#55a36b' }[level];
    window.L.circleMarker([40.7128 + offset[0], -74.006 + offset[1]], {
      radius: 8, color: '#fff', weight: 3, fillColor: color, fillOpacity: 1,
    }).addTo(map).bindPopup(`${level[0].toUpperCase()}${level.slice(1)} priority hotspot`);
  });
  element.classList.add('leaflet-ready');
});

document.querySelectorAll('[data-chart]').forEach((canvas) => {
  if (!window.Chart) return;
  const isStatus = canvas.dataset.chart === 'status';
  new window.Chart(canvas, {
    type: isStatus ? 'doughnut' : 'bar',
    data: isStatus
      ? { labels: ['Resolved', 'In progress', 'Pending'], datasets: [{ data: [54, 28, 18], backgroundColor: ['#79ad62', '#4f8294', '#e5a53b'], borderWidth: 0, hoverOffset: 4 }] }
      : { labels: ['Plastic', 'Overflow', 'E-waste', 'Illegal dump', 'Other'], datasets: [{ label: 'Complaints', data: [42, 34, 22, 18, 12], backgroundColor: '#79ad62', borderRadius: 4, maxBarThickness: 34 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: isStatus, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 18 } } },
      scales: isStatus ? {} : { x: { grid: { display: false }, border: { display: false } }, y: { beginAtZero: true, grid: { color: '#edf0ed' }, border: { display: false }, ticks: { precision: 0 } } },
      cutout: isStatus ? '70%' : undefined,
    },
  });
});

const translations = {
  'Home': 'होम', 'About': 'परिचय', 'Features': 'विशेषताएँ', 'Awareness': 'जागरूकता', 'Log in': 'लॉग इन',
  'Join WasteFlow': 'WasteFlow से जुड़ें', 'Cleaner Cities,': 'स्वच्छ शहर,', 'Greener Tomorrow': 'हरित भविष्य',
  'A cleaner city starts here': 'स्वच्छ शहर की शुरुआत यहाँ से', 'Report waste, book a pickup, and help your neighborhood move toward a cleaner future. Small actions add up.': 'कचरे की रिपोर्ट करें, पिकअप बुक करें और अपने इलाके को स्वच्छ बनाने में मदद करें। छोटे प्रयास बड़ा बदलाव लाते हैं।',
  'Get started': 'शुरू करें', 'Learn more': 'और जानें', 'neighbors taking action': 'पड़ोसी बदलाव ला रहे हैं', 'Neighborhood update': 'इलाके की जानकारी',
  'Collection in progress': 'कचरा संग्रह जारी है', 'Route 04 · Oak Street': 'मार्ग 04 · ओक स्ट्रीट', 'Pickup team nearby': 'पिकअप टीम पास में है',
  'Simple by design': 'सरल और सहज', 'How WasteFlow works': 'WasteFlow कैसे काम करता है', 'Four steps connect your report to real action on the ground.': 'चार आसान चरणों में आपकी रिपोर्ट पर कार्रवाई होती है।',
  'Report': 'रिपोर्ट करें', 'Spot an issue? Share a photo and location in a few taps.': 'समस्या दिखे? कुछ ही टैप में फोटो और जगह साझा करें।',
  'Track': 'ट्रैक करें', 'Follow your report with clear updates at every step.': 'हर चरण की जानकारी के साथ अपनी रिपोर्ट ट्रैक करें।',
  'Resolve': 'समाधान', 'Local crews receive reports and coordinate a response.': 'स्थानीय टीमें रिपोर्ट लेकर कार्रवाई करती हैं।',
  'Cleaner city': 'स्वच्छ शहर', 'Every resolved issue makes shared spaces better for all.': 'हर हल हुई समस्या सार्वजनिक जगहों को बेहतर बनाती है।',
  'Know where it goes': 'जानें, कचरा कहाँ जाता है', 'Be a part of the change': 'बदलाव का हिस्सा बनें',
  'A little sorting makes a big difference. Keep recyclables clean and dry, compost food scraps where available, and keep hazardous materials separate.': 'कचरे को अलग-अलग रखना बड़ा बदलाव लाता है। पुनर्चक्रण योग्य चीज़ें साफ़ और सूखी रखें, भोजन के बचे हिस्सों से खाद बनाएँ और खतरनाक कचरा अलग रखें।',
  'Explore awareness': 'जागरूकता देखें', 'Wet waste': 'गीला कचरा', 'Dry waste': 'सूखा कचरा', 'Special care': 'विशेष सावधानी',
  'Food scraps & garden waste': 'खाने के बचे हिस्से और बगीचे का कचरा', 'Paper, glass & packaging': 'कागज़, काँच और पैकेजिंग', 'Hazardous & e-waste': 'खतरनाक और इलेक्ट्रॉनिक कचरा',
  'Sign in': 'साइन इन', 'Back to home': 'होम पर वापस जाएँ', 'Good to see you again': 'आपका फिर से स्वागत है',
  'Welcome back!': 'वापसी पर स्वागत है!', 'Pick up where you left off. Your neighborhood is counting on all of us.': 'जहाँ छोड़ा था वहीं से शुरू करें। आपका इलाका हम सब पर भरोसा करता है।',
  'Report waste issues in your area': 'अपने इलाके में कचरे की समस्या बताएँ', 'Request a convenient waste pickup': 'सुविधाजनक कचरा पिकअप का अनुरोध करें',
  'Track every update to resolution': 'समाधान तक हर अपडेट ट्रैक करें', 'Together, we make cleaner streets possible.': 'मिलकर हम सड़कें स्वच्छ बना सकते हैं।',
  'Sign in to your account': 'अपने खाते में साइन इन करें', 'Welcome back. Enter your details below.': 'वापसी पर स्वागत है। नीचे अपनी जानकारी दर्ज करें।',
  'Citizen': 'नागरिक', 'Admin': 'व्यवस्थापक', 'Email or phone': 'ईमेल या फ़ोन', 'Password': 'पासवर्ड',
  'Forgot password?': 'पासवर्ड भूल गए?', 'Enter your password': 'अपना पासवर्ड दर्ज करें', 'Remember me': 'मुझे याद रखें',
  'New to WasteFlow?': 'WasteFlow पर नए हैं?', 'Create an account': 'खाता बनाएँ',
  'Create your account': 'अपना खाता बनाएँ', 'A few details to get your neighborhood started.': 'अपने इलाके की शुरुआत के लिए कुछ जानकारी दें।',
  'Full name': 'पूरा नाम', 'Your name': 'आपका नाम', 'Confirm password': 'पासवर्ड की पुष्टि करें', 'Repeat password': 'पासवर्ड दोबारा दर्ज करें',
  'Address or locality': 'पता या इलाका', 'Neighborhood, city': 'इलाका, शहर', 'Already registered?': 'पहले से पंजीकृत हैं?',
  'Your community needs you': 'आपके समुदाय को आपकी ज़रूरत है', 'Join us for a cleaner city.': 'स्वच्छ शहर के लिए हमसे जुड़ें।',
  'Make it easier to care for the places we share, one small action at a time.': 'छोटे-छोटे प्रयासों से साझा जगहों की देखभाल आसान बनाएँ।',
  'Send local reports to the right team': 'स्थानीय रिपोर्ट सही टीम तक भेजें', 'Arrange a household waste pickup': 'घर के कचरे का पिकअप तय करें',
  'Learn better everyday waste habits': 'रोज़मर्रा में कचरा सँभालने के बेहतर तरीके जानें', 'A better block begins with a neighbor.': 'बेहतर मोहल्ले की शुरुआत पड़ोसी से होती है।',
  'Operations': 'कार्य संचालन', 'Overview': 'अवलोकन', 'Complaints': 'शिकायतें', 'Pickup requests': 'पिकअप अनुरोध',
  'Hotspots': 'समस्या वाले स्थान', 'Reports': 'रिपोर्टें', 'Settings': 'सेटिंग्स', 'Log out': 'लॉग आउट',
  'Operations overview': 'कार्य संचालन का अवलोकन', 'Oak District · Today': 'ओक इलाका · आज', 'Total complaints': 'कुल शिकायतें',
  'Pending': 'लंबित', 'In progress': 'जारी है', 'Resolved': 'हल हो गया', 'My complaints': 'मेरी शिकायतें',
  'All time submissions': 'अब तक भेजी गईं', 'Awaiting review': 'समीक्षा की प्रतीक्षा में', 'With a response team': 'कार्रवाई टीम के पास',
  'Thanks for pitching in': 'सहयोग के लिए धन्यवाद', 'Complaints by category': 'श्रेणी के अनुसार शिकायतें',
  'Monthly reporting volume by issue type': 'समस्या के प्रकार के अनुसार मासिक रिपोर्ट', 'Status distribution': 'स्थिति का विवरण',
  'Current complaint lifecycle': 'शिकायतों की वर्तमान स्थिति', 'Needs attention': 'ध्यान देने योग्य',
  'Recent reports awaiting action': 'कार्रवाई की प्रतीक्षा में हाल की रिपोर्टें', 'View queue': 'सूची देखें',
  'ID': 'आईडी', 'Issue': 'समस्या', 'Location': 'स्थान', 'Reported': 'रिपोर्ट की गई', 'Priority': 'प्राथमिकता', 'Status': 'स्थिति',
  'Illegal dumping': 'अवैध रूप से कचरा फेंकना', 'Overflowing bin': 'कूड़ेदान का भर जाना', 'Missed collection': 'कचरा संग्रह छूट गया',
  'In progress': 'जारी है', 'Citizen space': 'नागरिक क्षेत्र', 'Dashboard': 'डैशबोर्ड', 'Report waste issue': 'कचरे की समस्या बताएँ',
  'Request pickup': 'पिकअप का अनुरोध करें', 'Track complaint': 'शिकायत ट्रैक करें', 'Profile': 'प्रोफ़ाइल',
  'Citizen dashboard': 'नागरिक डैशबोर्ड', 'Good morning, Rahul': 'सुप्रभात, राहुल', 'Here’s what’s happening in your neighborhood.': 'आपके इलाके की ताज़ा जानकारी।',
  'New report': 'नई रिपोर्ट', 'Recent complaints': 'हाल की शिकायतें', 'Your latest neighborhood reports': 'आपके इलाके की हाल की रिपोर्टें',
  'View all': 'सभी देखें', 'Category': 'श्रेणी', 'Date': 'तारीख', 'Waste hotspots': 'कचरे की समस्या वाले स्थान',
  'Reports near your area': 'आपके इलाके के पास की रिपोर्टें', 'High': 'उच्च', 'Medium': 'मध्यम', 'Low': 'कम',
  'Report a hotspot': 'समस्या वाले स्थान की रिपोर्ट करें', 'Your actions matter.': 'आपके प्रयास मायने रखते हैं।',
  'Learn how to sort waste and reduce what goes to landfill.': 'कचरा अलग करना सीखें और लैंडफिल में जाने वाला कचरा घटाएँ।', 'Explore guides': 'मार्गदर्शिकाएँ देखें',
  'Help us keep your neighborhood clean': 'अपने इलाके को स्वच्छ रखने में मदद करें', 'Report a waste issue': 'कचरे की समस्या की रिपोर्ट करें',
  'Issue category': 'समस्या की श्रेणी', 'Select a category': 'श्रेणी चुनें', 'Description': 'विवरण',
  'Tell us what you noticed and when it started...': 'बताएँ कि आपने क्या देखा और यह कब शुरू हुआ...', 'Be specific so our team can help.': 'स्पष्ट जानकारी दें ताकि हमारी टीम मदद कर सके।',
  'Add a photo': 'फ़ोटो जोड़ें', 'Drop a photo here or browse': 'फ़ोटो यहाँ छोड़ें या चुनें', 'JPG or PNG · up to 10 MB': 'JPG या PNG · अधिकतम 10 MB',
  'Use my current location': 'मेरी वर्तमान जगह इस्तेमाल करें', 'Street address or nearby landmark': 'सड़क का पता या पास की पहचान',
  'I confirm this report is accurate and understand my location may be shared with the response team.': 'मैं पुष्टि करता/करती हूँ कि यह रिपोर्ट सही है और मेरी जगह कार्रवाई टीम के साथ साझा की जा सकती है।',
  'Submit report': 'रिपोर्ट भेजें', 'Reported activity around Oak District': 'ओक इलाके के आसपास की रिपोर्ट की गई गतिविधियाँ',
  'Map view': 'मानचित्र देखें', 'Live tiles · sample hotspot data': 'लाइव टाइलें · नमूना जानकारी',
  'Convenient collection, at a time that works for you': 'आपके समय के अनुसार सुविधाजनक कचरा संग्रह', 'Schedule a pickup': 'पिकअप तय करें',
  'Waste type': 'कचरे का प्रकार', 'Choose waste type': 'कचरे का प्रकार चुनें', 'Approximate quantity': 'अनुमानित मात्रा',
  'Select amount': 'मात्रा चुनें', 'Pickup address': 'पिकअप का पता', 'Street address, neighborhood': 'सड़क का पता, इलाका',
  'Preferred date': 'पसंदीदा तारीख', 'Preferred time': 'पसंदीदा समय', 'Select a time window': 'समयावधि चुनें',
  'Additional notes': 'अतिरिक्त जानकारी', 'Gate code, access instructions, or other details': 'गेट कोड, पहुँच के निर्देश या अन्य जानकारी',
  'A team member will confirm your collection window. Please keep items accessible and separated by type.': 'टीम का सदस्य संग्रह का समय बताएगा। सामान को पहुँच योग्य रखें और प्रकार के अनुसार अलग करें।',
  'Submit pickup request': 'पिकअप अनुरोध भेजें', 'What happens next?': 'इसके बाद क्या होगा?',
  'Your request is reviewed by the collection team.': 'संग्रह टीम आपके अनुरोध की समीक्षा करेगी।', 'We confirm your pickup window.': 'हम पिकअप का समय तय करेंगे।',
  'Your team collects the items.': 'टीम आपका सामान एकत्र करेगी।', 'Special waste?': 'विशेष कचरा?',
  'Every report deserves a clear update': 'हर रिपोर्ट पर स्पष्ट जानकारी मिलनी चाहिए', 'Track your complaint': 'अपनी शिकायत ट्रैक करें',
  'Enter complaint ID (e.g. WF-2408)': 'शिकायत आईडी दर्ज करें (जैसे WF-2408)', 'Complaint status': 'शिकायत की स्थिति',
  'Active': 'सक्रिय', 'Report details': 'रिपोर्ट का विवरण', 'View details': 'विवरण देखें', 'Submitted': 'जमा की गई',
  'Under review': 'समीक्षाधीन', 'Assigned': 'सौंपी गई', 'Your report was received.': 'आपकी रिपोर्ट मिल गई है।',
  'The service team verified the issue.': 'सेवा टीम ने समस्या की पुष्टि की।', 'Assigned to Oak District crew.': 'ओक इलाके की टीम को सौंपी गई।',
  'A crew is working on your report.': 'एक टीम आपकी रिपोर्ट पर काम कर रही है।', 'We’ll let you know when the issue is cleared.': 'समस्या हल होने पर हम आपको बताएँगे।',
  'Organic': 'जैविक', 'Recycling': 'पुनर्चक्रण', 'Handle with care': 'सावधानी से सँभालें', 'Special collection': 'विशेष संग्रह',
  'Circular living': 'चक्रीय जीवनशैली', 'Quick reference': 'त्वरित जानकारी', 'Hazardous waste': 'खतरनाक कचरा',
  'E-waste': 'ई-कचरा', 'Composting': 'खाद बनाना', 'Do’s & don’ts': 'क्या करें और क्या न करें',
  'Food scraps, coffee grounds, and garden trimmings can become useful compost.': 'खाने के बचे हिस्से, कॉफ़ी के अवशेष और बगीचे की कतरनें उपयोगी खाद बन सकती हैं।',
  'Keep paper, glass, metal, and accepted plastics clean and dry before recycling.': 'पुनर्चक्रण से पहले कागज़, काँच, धातु और स्वीकार्य प्लास्टिक साफ़ और सूखे रखें।',
  'Paint, chemicals, and batteries need designated drop-off points, never regular bins.': 'पेंट, रसायन और बैटरियाँ निर्धारित संग्रह केंद्र पर दें, सामान्य कूड़ेदान में नहीं।',
  'Phones, chargers, and electronics contain materials best recovered by specialists.': 'फ़ोन, चार्जर और इलेक्ट्रॉनिक सामान विशेषज्ञों द्वारा पुनर्चक्रित किए जाने चाहिए।',
  'Turn food and garden scraps into a natural soil improver at home or locally.': 'घर या स्थानीय स्तर पर खाने और बगीचे के बचे हिस्सों से प्राकृतिक खाद बनाएँ।',
  'A quick checklist to avoid common sorting mistakes and keep collections safe.': 'कचरा अलग करने की आम गलतियों से बचने और संग्रह सुरक्षित रखने की छोटी सूची।',
  'Practical guides for a cleaner routine': 'स्वच्छ दिनचर्या के लिए उपयोगी मार्गदर्शिकाएँ', 'Explore the guides': 'मार्गदर्शिकाएँ देखें',
  'Have something that needs collection?': 'क्या कुछ ऐसा है जिसे उठवाना है?', 'Request pickup': 'पिकअप का अनुरोध करें',
  'Responsive preview': 'अनुकूल दृश्य पूर्वावलोकन', 'Citizen experience': 'नागरिक अनुभव', 'Mobile dashboard': 'मोबाइल डैशबोर्ड',
  'Open dashboard': 'डैशबोर्ड खोलें', 'API placeholder:': 'API नमूना:', 'Today': 'आज', 'Today · 9:42 AM': 'आज · सुबह 9:42',
  'Close navigation': 'नेविगेशन बंद करें', 'Open navigation': 'नेविगेशन खोलें', 'Notifications': 'सूचनाएँ',
  'Citizen space': 'नागरिक क्षेत्र', 'Complaint summary': 'शिकायतों का सारांश', 'Expand map': 'मानचित्र बड़ा करें',
  'Oak Street': 'ओक स्ट्रीट', 'Maple Avenue': 'मेपल एवेन्यू', 'Pine Road': 'पाइन रोड', 'Central Park': 'सेंट्रल पार्क',
  'Litter hotspot': 'कचरे का जमाव', 'WF-2408 · Updated today, 9:42 AM': 'WF-2408 · आज अपडेट किया गया, सुबह 9:42',
  'Sep 28': '28 सितंबर', 'Sep 25': '25 सितंबर', 'Sep 19': '19 सितंबर', 'Sep 14': '14 सितंबर',
  'Operations overview': 'कार्य संचालन का अवलोकन', 'Complaint activity across your service area.': 'आपके सेवा क्षेत्र में शिकायतों की गतिविधि।',
  'Export report': 'रिपोर्ट निर्यात करें', 'vs last month': 'पिछले महीने की तुलना में', '14 need attention today': '14 पर आज ध्यान देना है',
  'Across 9 active teams': '9 सक्रिय टीमों में', 'resolution rate': 'समाधान दर', 'Complaints by category': 'श्रेणी के अनुसार शिकायतें',
  'Last 30 days': 'पिछले 30 दिन', 'Last 90 days': 'पिछले 90 दिन', 'This year': 'इस वर्ष',
  'Sep 28, 2025 · 10:14 AM': '28 सितंबर 2025 · सुबह 10:14', 'Sep 28, 2025 · 11:02 AM': '28 सितंबर 2025 · सुबह 11:02',
  'Sep 29, 2025 · 8:30 AM': '29 सितंबर 2025 · सुबह 8:30', 'Today · 9:42 AM': 'आज · सुबह 9:42',
  'Overflowing public bin': 'सार्वजनिक कूड़ेदान भर गया', '24 Oak Street, Oak District': '24 ओक स्ट्रीट, ओक इलाका',
  'September 28, 2025': '28 सितंबर 2025', 'Assigned team': 'सौंपी गई टीम',
  'The public bin near the bus stop is full and waste has started collecting around it.': 'बस स्टॉप के पास का सार्वजनिक कूड़ेदान भर गया है और उसके आसपास कचरा जमा होने लगा है।',
  'Sort fruit and vegetable scraps, coffee grounds, and garden cuttings. Keep plastic, glass, and liquids out of the compost container.': 'फल-सब्ज़ियों के बचे हिस्से, कॉफ़ी और बगीचे की कतरनें अलग रखें। खाद के डिब्बे में प्लास्टिक, काँच और तरल पदार्थ न डालें।',
  'Rinse food residue from accepted containers, flatten cardboard, and keep paper dry. Check local rules for plastic films and cartons.': 'स्वीकार्य डिब्बों से खाने के अवशेष धोएँ, गत्ते को समतल करें और कागज़ सूखा रखें। प्लास्टिक फिल्म और पैकेट के स्थानीय नियम जाँचें।',
  'Keep chemicals, paint, and batteries in their original containers. Never pour them down a drain or place them in regular curbside waste.': 'रसायन, पेंट और बैटरियाँ उनके मूल डिब्बों में रखें। इन्हें नाली में न डालें और न ही सामान्य कचरे में फेंकें।',
  'Use a certified electronics drop-off or collection event. Remove personal data from devices and keep loose batteries separate.': 'प्रमाणित इलेक्ट्रॉनिक कचरा केंद्र का उपयोग करें। उपकरणों से निजी जानकारी हटाएँ और ढीली बैटरियाँ अलग रखें।',
  'Balance moist food scraps with dry leaves or shredded paper, and turn the pile for airflow. Follow local guidance on meat and dairy.': 'गीले खाद्य अवशेषों में सूखे पत्ते या कटा कागज़ मिलाएँ और हवा के लिए ढेर पलटें। मांस और डेयरी के लिए स्थानीय निर्देश मानें।',
  'Do sort by your local collection rules and secure bags against wind. Don’t mix sharp, hot, or hazardous material with household waste.': 'स्थानीय नियमों के अनुसार कचरा अलग करें और थैलियों को हवा से सुरक्षित रखें। नुकीली, गर्म या खतरनाक चीज़ें घरेलू कचरे में न मिलाएँ।',
  'A live narrow-screen preview of the dashboard, with stacked metrics and persistent bottom navigation.': 'डैशबोर्ड का संकरा स्क्रीन पूर्वावलोकन, जिसमें क्रमबद्ध आँकड़े और नीचे नेविगेशन है।',
  'The preview loads the real dashboard at a 430px viewport. Resize the browser to see the same responsive layout adapt.': 'यह पूर्वावलोकन डैशबोर्ड को 430px चौड़ाई पर दिखाता है। ब्राउज़र का आकार बदलकर अनुकूल लेआउट देखें।',
  'Dashboard': 'डैशबोर्ड', 'Learn': 'सीखें', 'Track': 'ट्रैक करें', 'Map showing nearby waste hotspots': 'पास के कचरा समस्या स्थलों का मानचित्र',
  'Citizen navigation': 'नागरिक नेविगेशन', 'Admin navigation': 'व्यवस्थापक नेविगेशन', 'Main navigation': 'मुख्य नेविगेशन',
  'Pages': 'पेज', 'Admin dashboard': 'व्यवस्थापक डैशबोर्ड', 'Report issue': 'समस्या रिपोर्ट करें',
  'Pickup request': 'पिकअप अनुरोध', 'Complaint tracking': 'शिकायत ट्रैकिंग', 'Register': 'पंजीकरण', 'Mobile preview': 'मोबाइल पूर्वावलोकन',
};

const preferenceBar = document.createElement('div');
preferenceBar.className = 'site-preferences';
preferenceBar.innerHTML = '<details class="site-page-links"><summary data-pages-label>Pages</summary><div role="group" aria-label="Website pages"><a href="index.html" data-page-label="Home">Home</a><a href="citizen-dashboard.html" data-page-label="Dashboard">Dashboard</a><a href="admin-dashboard.html" data-page-label="Admin dashboard">Admin dashboard</a><a href="report-issue.html" data-page-label="Report issue">Report issue</a><a href="pickup-request.html" data-page-label="Pickup request">Pickup request</a><a href="complaint-tracking.html" data-page-label="Complaint tracking">Complaint tracking</a><a href="awareness.html" data-page-label="Awareness">Awareness</a><a href="login.html" data-page-label="Log in">Log in</a><a href="register.html" data-page-label="Register">Register</a><a href="mobile-view.html" data-page-label="Mobile preview">Mobile preview</a></div></details><label class="preference-toggle"><span data-theme-label>Dark mode</span><input type="checkbox" role="switch" aria-label="Dark mode"><span class="preference-track"></span></label><label class="language-toggle" aria-label="Select language"><span>EN</span><input type="checkbox" role="switch" aria-label="हिन्दी"><span>हिन्दी</span></label>';
const themeControl = preferenceBar.querySelector('.preference-toggle input');
const languageControl = preferenceBar.querySelector('.language-toggle input');
const preferredHeader = document.querySelector('.site-header nav, .main-content > header, body > header');
if (preferredHeader) {
  preferredHeader.append(preferenceBar);
} else {
  preferenceBar.classList.add('site-preferences-floating');
  document.body.append(preferenceBar);
}

const storedTheme = localStorage.getItem('wasteflow-theme');
const storedLanguage = localStorage.getItem('wasteflow-language');
document.documentElement.dataset.theme = storedTheme === 'light' ? 'light' : 'dark';
themeControl.checked = document.documentElement.dataset.theme === 'dark';
languageControl.checked = storedLanguage === 'hi';

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const normalized = (value) => value.replace(/\s+/g, ' ').trim();

const applyLanguage = (language) => {
  document.documentElement.lang = language;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => node.parentElement?.closest('script, style, noscript, .site-preferences') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const original = originalText.get(node);
    const translation = language === 'hi' ? translations[normalized(original)] : null;
    if (translation) {
      const leading = original.match(/^\s*/)?.[0] || '';
      const trailing = original.match(/\s*$/)?.[0] || '';
      node.nodeValue = `${leading}${translation}${trailing}`;
    } else {
      node.nodeValue = original;
    }
  }
  document.querySelectorAll('input, textarea, button, [aria-label], [title], img[alt]').forEach((element) => {
    const attributes = ['placeholder', 'aria-label', 'title', 'alt', 'value'];
    if (!originalAttributes.has(element)) originalAttributes.set(element, {});
    const originals = originalAttributes.get(element);
    attributes.forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return;
      if (originals[attribute] === undefined) originals[attribute] = element.getAttribute(attribute);
      const original = originals[attribute];
      element.setAttribute(attribute, language === 'hi' ? (translations[normalized(original)] || original) : original);
    });
  });
  preferenceBar.querySelector('[data-pages-label]').textContent = language === 'hi' ? 'पेज' : 'Pages';
  preferenceBar.querySelectorAll('[data-page-label]').forEach((element) => {
    const label = element.dataset.pageLabel;
    element.textContent = language === 'hi' ? (translations[label] || label) : label;
  });
  document.querySelectorAll('[data-current-date]').forEach((element) => {
    element.textContent = new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(currentDate);
  });
};

themeControl.addEventListener('change', () => {
  document.documentElement.dataset.theme = themeControl.checked ? 'dark' : 'light';
  localStorage.setItem('wasteflow-theme', document.documentElement.dataset.theme);
});
languageControl.addEventListener('change', () => {
  const language = languageControl.checked ? 'hi' : 'en';
  localStorage.setItem('wasteflow-language', language);
  applyLanguage(language);
});
applyLanguage(languageControl.checked ? 'hi' : 'en');

if (window.lucide) window.lucide.createIcons();