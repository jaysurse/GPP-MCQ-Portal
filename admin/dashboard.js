function showTab(id) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

// Load dynamic units and subtopics
document.getElementById("unitCount").addEventListener("change", function () {
  const container = document.getElementById("unitsContainer");
  container.innerHTML = "";
  const count = parseInt(this.value);

  for (let i = 1; i <= count; i++) {
    const unitDiv = document.createElement("div");
    unitDiv.innerHTML = `<h4>Unit ${i}</h4>
      <div id="unit-${i}-subs"></div>
      <button type="button" onclick="addSubtopic(${i})">+ Add Subtopic</button>`;
    container.appendChild(unitDiv);
  }
});

function addSubtopic(unitNum) {
  const container = document.getElementById(`unit-${unitNum}-subs`);
  const subNum = container.children.length + 1;
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = `${unitNum}.${subNum}`;
  input.dataset.unit = unitNum;
  input.dataset.sub = subNum;
  container.appendChild(input);
}

// Load divisions into both management list and subject assignment checkboxes
async function loadDivisions() {
  const list = document.getElementById("divisionList");
  const checkboxContainer = document.getElementById("divisionCheckboxes");
  list.innerHTML = "";
  checkboxContainer.innerHTML = "";

  const snapshot = await db.collection("divisions").get();
  snapshot.forEach(doc => {
    const name = doc.id;

    // Division list with delete button
    const li = document.createElement("li");
    li.textContent = name;
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      await db.collection("divisions").doc(name).delete();
      loadDivisions();
    };
    li.appendChild(delBtn);
    list.appendChild(li);

    // Division checkbox for subject form
    const div = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = name;
    div.appendChild(checkbox);
    div.appendChild(document.createTextNode(" " + name));
    checkboxContainer.appendChild(div);
  });
}
loadDivisions();

// Add new division
document.getElementById("divisionForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("newDivision").value.trim();
  if (!name) return;

  const doc = await db.collection("divisions").doc(name).get();
  if (doc.exists) return alert("Division already exists.");

  await db.collection("divisions").doc(name).set({ created: new Date() });
  document.getElementById("newDivision").value = "";
  loadDivisions();
});

// Add or update subject
document.getElementById("subjectForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("subjectName").value.trim();
  const unitCount = parseInt(document.getElementById("unitCount").value);
  const divisions = Array.from(document.querySelectorAll('#divisionCheckboxes input[type="checkbox"]:checked')).map(cb => cb.value);
  const subjectId = document.getElementById("editingSubjectId").value;

  const units = [];
  for (let i = 1; i <= unitCount; i++) {
    const subs = Array.from(document.querySelectorAll(`#unit-${i}-subs input`)).map(input => {
      return `${i}.${input.dataset.sub} ${input.value.trim()}`;
    });
    units.push({ unit: i, subtopics: subs });
  }

  const subjectData = {
    subject: name,
    units,
    divisions
  };

  if (subjectId) {
    await db.collection("subjects").doc(subjectId).update(subjectData);
  } else {
    await db.collection("subjects").add(subjectData);
  }

  this.reset();
  document.getElementById("unitsContainer").innerHTML = "";
  document.getElementById("subjectMsg").textContent = "Subject saved.";
  document.getElementById("editingSubjectId").value = "";
  loadSubjectsForManagement();
});

// Load subjects for management
async function loadSubjectsForManagement() {
  const ul = document.getElementById("subjectList");
  ul.innerHTML = "";

  const snapshot = await db.collection("subjects").get();
  const seenSubjects = new Set();

  snapshot.forEach(doc => {
    const subject = doc.data();
    const id = doc.id;

    if (seenSubjects.has(subject.subject)) return; // Prevent duplicate display
    seenSubjects.add(subject.subject);

    const li = document.createElement("li");
    li.innerHTML = `<strong>${subject.subject}</strong> - Units: ${subject.units.length}, Divisions: ${subject.divisions.join(", ") || "None"}`;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editSubject(id, subject);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      await db.collection("subjects").doc(id).delete();
      loadSubjectsForManagement();
    };

    li.appendChild(editBtn);
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
}
loadSubjectsForManagement();

function editSubject(id, subject) {
  document.getElementById("subjectName").value = subject.subject;
  document.getElementById("unitCount").value = subject.units.length;
  document.getElementById("unitCount").dispatchEvent(new Event("change"));
  document.getElementById("editingSubjectId").value = id;

  subject.units.forEach(unit => {
    const unitNum = unit.unit;
    const container = document.getElementById(`unit-${unitNum}-subs`);
    container.innerHTML = "";
    unit.subtopics.forEach((sub, index) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = sub.split(' ').slice(1).join(' ');
      input.dataset.unit = unitNum;
      input.dataset.sub = index + 1;
      container.appendChild(input);
    });
  });

  const checkboxes = document.querySelectorAll('#divisionCheckboxes input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = subject.divisions.includes(cb.value);
  });

  showTab("addSubject");
}

// Approve pending teachers
async function loadPendingTeachers() {
  const ul = document.getElementById("pendingTeachers");
  ul.innerHTML = "";
  const snapshot = await db.collection("users").where("role", "==", "teacher").where("approved", "==", false).get();

  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = `${doc.data().name} (${doc.data().email})`;

    const approveBtn = document.createElement("button");
    approveBtn.textContent = "Approve";
    approveBtn.onclick = async () => {
      await db.collection("users").doc(doc.id).update({ approved: true });
      li.remove();
    };
    li.appendChild(approveBtn);
    ul.appendChild(li);
  });
}
loadPendingTeachers();

// Load basic stats
async function loadStats() {
  const students = await db.collection("users").where("role", "==", "student").get();
  const teachers = await db.collection("users").where("role", "==", "teacher").get();
  document.getElementById("studentCount").textContent = students.size;
  document.getElementById("teacherCount").textContent = teachers.size;
}
loadStats();



async function loadMCQOverviewFilters() {
  const subjectSelect = document.getElementById("filterSubject");
  const unitSelect = document.getElementById("filterUnit");
  const subtopicSelect = document.getElementById("filterSubtopic");
  const teacherSelect = document.getElementById("filterTeacher");
  const studentSelect = document.getElementById("filterStudent");

  subjectSelect.innerHTML = `<option value="">Select Subject</option>`;
  const snapshot = await db.collection("subjects").get();
  snapshot.forEach(doc => {
    subjectSelect.innerHTML += `<option value="${doc.id}">${doc.data().subject}</option>`;
  });

  subjectSelect.onchange = async () => {
    const subjectDoc = await db.collection("subjects").doc(subjectSelect.value).get();
    unitSelect.innerHTML = `<option value="">Select Unit</option>`;
    subtopicSelect.innerHTML = `<option value="">Select Subtopic</option>`;
    subjectDoc.data().units.forEach(u => {
      unitSelect.innerHTML += `<option value="${u.unit}">Unit ${u.unit}</option>`;
    });
  };

  unitSelect.onchange = async () => {
    const subjectDoc = await db.collection("subjects").doc(subjectSelect.value).get();
    const selectedUnit = parseInt(unitSelect.value);
    const unit = subjectDoc.data().units.find(u => u.unit === selectedUnit);
    subtopicSelect.innerHTML = `<option value="">Select Subtopic</option>`;
    unit.subtopics.forEach(st => {
      subtopicSelect.innerHTML += `<option value="${st}">${st}</option>`;
    });
  };

  const teachers = await db.collection("users").where("role", "==", "teacher").get();
  teacherSelect.innerHTML = `<option value="">Select Teacher</option>`;
  teachers.forEach(doc => {
    teacherSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
  });

  const students = await db.collection("users").where("role", "==", "student").get();
  studentSelect.innerHTML = `<option value="">Select Student</option>`;
  students.forEach(doc => {
    studentSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
  });
}
loadMCQOverviewFilters();

async function exportMCQs(format) {
  const mcqsSnapshot = await db.collection("mcqs").get();
  const mcqs = mcqsSnapshot.docs.map(doc => doc.data());

  if (format === "csv") {
    const headers = ["Question", "Options", "Answer", "Subject", "Unit", "Subtopic", "SubmittedBy"];
    const rows = mcqs.map(m => [
      m.question,
      m.options.join(" | "),
      m.answer,
      m.subject,
      m.unit,
      m.subtopic,
      m.submittedBy
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${val}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcqs.csv";
    a.click();
  } else if (format === "pdf") {
    alert("PDF export feature is in progress. Use CSV for now.");
  }
}

// =========================
// ✅ User Management Panel
// =========================

async function loadUserManagement() {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";

  const snapshot = await db.collection("users").get();
  snapshot.forEach(doc => {
    const user = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `<b>${user.name}</b> - ${user.email} - ${user.role} - Div: ${user.division || 'N/A'}`;

    const deactivateBtn = document.createElement("button");
    deactivateBtn.textContent = "Deactivate";
    deactivateBtn.onclick = async () => {
      await db.collection("users").doc(doc.id).update({ active: false });
      logAudit("deactivate", doc.id, user.role);
      alert("User deactivated");
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      await db.collection("users").doc(doc.id).delete();
      logAudit("delete_user", doc.id, user.role);
      loadUserManagement();
    };

    li.appendChild(deactivateBtn);
    li.appendChild(deleteBtn);
    userList.appendChild(li);
  });
}
loadUserManagement();

// =========================
// ✅ Audit Logs Panel
// =========================

async function logAudit(action, targetId, role) {
  await db.collection("logs").add({
    action,
    targetId,
    role,
    timestamp: new Date()
  });
}

async function loadAuditLogs() {
  const logList = document.getElementById("logList");
  logList.innerHTML = "";

  const snapshot = await db.collection("logs").orderBy("timestamp", "desc").limit(100).get();
  snapshot.forEach(doc => {
    const log = doc.data();
    const li = document.createElement("li");
    li.textContent = `${log.action.toUpperCase()} - ${log.targetId} - ${log.role} - ${log.timestamp.toDate().toLocaleString()}`;
    logList.appendChild(li);
  });
}
loadAuditLogs();

// =========================
// ✅ Teacher Role Settings
// =========================

async function loadTeacherRoles() {
  const selector = document.getElementById("teacherSelector");
  const assignmentDiv = document.getElementById("teacherAssignments");
  selector.innerHTML = "";

  const teachers = await db.collection("users").where("role", "==", "teacher").get();
  teachers.forEach(doc => {
    const opt = document.createElement("option");
    opt.value = doc.id;
    opt.textContent = doc.data().name;
    selector.appendChild(opt);
  });

  selector.onchange = async () => {
    const teacherId = selector.value;
    const teacherDoc = await db.collection("users").doc(teacherId).get();
    const roles = teacherDoc.data().assignedSubjects || [];

    assignmentDiv.innerHTML = `<p>Assigned Subjects: ${roles.join(", ") || 'None'}</p>`;

    const subjectSnapshot = await db.collection("subjects").get();
    subjectSnapshot.forEach(doc => {
      const s = doc.data().subject;
      const btn = document.createElement("button");
      btn.textContent = roles.includes(s) ? `Remove ${s}` : `Assign ${s}`;
      btn.onclick = async () => {
        const updatedRoles = roles.includes(s) ? roles.filter(r => r !== s) : [...roles, s];
        await db.collection("users").doc(teacherId).update({ assignedSubjects: updatedRoles });
        logAudit("update_teacher_role", teacherId, "teacher");
        loadTeacherRoles();
      };
      assignmentDiv.appendChild(btn);
    });
  };
}
loadTeacherRoles();

// =========================
// ✅ Division-Subject Mapping
// =========================

async function loadAccessMapping() {
  const panel = document.getElementById("mappingPanel");
  panel.innerHTML = "";

  const divisions = await db.collection("divisions").get();
  const subjects = await db.collection("subjects").get();

  divisions.forEach(divDoc => {
    const divName = divDoc.id;
    const divRow = document.createElement("div");
    divRow.innerHTML = `<h4>${divName}</h4>`;

    subjects.forEach(subDoc => {
      const subName = subDoc.data().subject;
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = subDoc.data().divisions.includes(divName);
      checkbox.onchange = async () => {
        const updatedDivs = checkbox.checked
          ? [...subDoc.data().divisions, divName]
          : subDoc.data().divisions.filter(d => d !== divName);
        await db.collection("subjects").doc(subDoc.id).update({ divisions: updatedDivs });
        logAudit("update_mapping", subDoc.id, "subject");
      };
      const label = document.createElement("label");
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(" " + subName));
      divRow.appendChild(label);
    });

    panel.appendChild(divRow);
  });
}
loadAccessMapping();