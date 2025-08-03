

let allMCQs = [];

document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      alert("You must log in first.");
      location.href = "../login.html";
      return;
    }

    const uid = user.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();
    if (!userData || !userData.subject || !userData.division) {
      alert("Invalid user data.");
      return;
    }

    loadSubjects(userData.subject);
    populateSubjectDropdown(userData.subject);
    loadUnits(userData.subject);
    loadApprovedMCQs(userData.subject, userData.division);
  });

  document.getElementById("subject").addEventListener("change", (e) => {
    loadUnits(e.target.value);
  });

  document.getElementById("mcq-form").addEventListener("submit", submitMCQ);

  document.getElementById("filterSubject").addEventListener("change", filterMCQs);
  document.getElementById("filterUnit").addEventListener("change", filterMCQs);
  document.getElementById("filterSubtopic").addEventListener("change", filterMCQs);
});

function loadSubjects(subject) {
  document.getElementById("subjects-list").innerHTML = `<li>${subject}</li>`;
}

function populateSubjectDropdown(subject) {
  const dropdown = document.getElementById("subject");
  dropdown.innerHTML = `<option value="${subject}">${subject}</option>`;
}

async function loadUnits(subjectName) {
  const unitDropdown = document.getElementById("unit");
  unitDropdown.innerHTML = "";

  const subjectsSnap = await db.collection("subjects")
    .where("subject", "==", subjectName)
    .get();

  if (!subjectsSnap.empty) {
    const units = subjectsSnap.docs[0].data().units || [];
    units.forEach(unit => {
      const opt = new Option(`Unit ${unit.unit}`, `Unit ${unit.unit}`);
      unitDropdown.appendChild(opt);
    });
  }
}

async function submitMCQ(e) {
  e.preventDefault();
  const mcq = {
    subject: document.getElementById("subject").value,
    unit: document.getElementById("unit").value,
    subtopic: document.getElementById("subtopic").value,
    question: document.getElementById("question").value,
    options: {
      A: document.getElementById("optionA").value,
      B: document.getElementById("optionB").value,
      C: document.getElementById("optionC").value,
      D: document.getElementById("optionD").value,
    },
    correct: document.getElementById("correctOption").value,
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    userId: auth.currentUser.uid
  };

  await db.collection("mcqs").add(mcq);
  alert("MCQ submitted successfully!");
  e.target.reset();
}

async function loadApprovedMCQs(subject, divisions) {
  const mcqsSnap = await db.collection("mcqs")
    .where("status", "==", "approved")
    .where("subject", "==", subject)
    .get();

  allMCQs = mcqsSnap.docs
    .map(doc => doc.data())
    .filter(mcq => divisions.includes(mcq.division));

  populateMCQTable(allMCQs);
  populateFilters(allMCQs);
}

function populateMCQTable(mcqs) {
  const body = document.getElementById("mcq-table-body");
  body.innerHTML = "";

  mcqs.forEach(mcq => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${mcq.subject}</td>
      <td>${mcq.unit}</td>
      <td>${mcq.subtopic}</td>
      <td>${mcq.question}</td>
      <td>${mcq.options.A}</td>
      <td>${mcq.options.B}</td>
      <td>${mcq.options.C}</td>
      <td>${mcq.options.D}</td>
      <td>${mcq.correct}</td>
    `;
    body.appendChild(tr);
  });
}

function populateFilters(mcqs) {
  const filterSubject = document.getElementById("filterSubject");
  const filterUnit = document.getElementById("filterUnit");
  const filterSubtopic = document.getElementById("filterSubtopic");

  const subjects = [...new Set(mcqs.map(m => m.subject))];
  const units = [...new Set(mcqs.map(m => m.unit))];
  const subtopics = [...new Set(mcqs.map(m => m.subtopic))];

  subjects.forEach(s => filterSubject.appendChild(new Option(s, s)));
  units.forEach(u => filterUnit.appendChild(new Option(u, u)));
  subtopics.forEach(st => filterSubtopic.appendChild(new Option(st, st)));
}

function filterMCQs() {
  const subject = document.getElementById("filterSubject").value;
  const unit = document.getElementById("filterUnit").value;
  const subtopic = document.getElementById("filterSubtopic").value;

  let filtered = [...allMCQs];

  if (subject) filtered = filtered.filter(m => m.subject === subject);
  if (unit) filtered = filtered.filter(m => m.unit === unit);
  if (subtopic) filtered = filtered.filter(m => m.subtopic === subtopic);

  populateMCQTable(filtered);
}

function logout() {
  auth.signOut().then(() => {
    window.location.href = "../login.html";
  });
}
