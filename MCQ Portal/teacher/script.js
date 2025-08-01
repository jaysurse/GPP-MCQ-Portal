// Placeholder MCQ data (replace with Supabase fetch)
let mcqs = [
  {
    id: 1,
    unit: 1,
    subtopic: "1.2",
    question: "What is DBMS?",
    options: ["Database", "DBMS", "Data System", "Storage"],
    correct: "DBMS",
    studentName: "Aman",
    enrollment: "70"
  },
  {
    id: 2,
    unit: 2,
    subtopic: "2.1",
    question: "What is SQL?",
    options: ["Query Language", "System", "Server", "None"],
    correct: "Query Language",
    studentName: "Priya",
    enrollment: "85"
  }
];

let approvedMCQs = [];

function renderMCQs(list) {
  const mcqList = document.getElementById("mcqList");
  mcqList.innerHTML = "";

  list.forEach(mcq => {
    const item = document.createElement("div");
    item.className = "mcq-item";
    item.innerHTML = `
      <input type="checkbox" data-id="${mcq.id}" />
      <strong>Q:</strong> ${mcq.question}<br/>
      <strong>Options:</strong> ${mcq.options.join(", ")}<br/>
      <strong>Correct:</strong> ${mcq.correct}<br/>
      <em>Unit: ${mcq.unit}, Subtopic: ${mcq.subtopic}</em><br/>
      <small>By: ${mcq.studentName} (${mcq.enrollment})</small>
    `;
    mcqList.appendChild(item);
  });
}

function applyFilters() {
  const unit = document.getElementById("filterUnit").value;
  const subtopic = document.getElementById("filterSubtopic").value.toLowerCase();
  const name = document.getElementById("filterStudentName").value.toLowerCase();
  const enroll = document.getElementById("filterEnrollment").value;

  const filtered = mcqs.filter(mcq =>
    (unit === "" || mcq.unit == unit) &&
    (subtopic === "" || mcq.subtopic.toLowerCase().includes(subtopic)) &&
    (name === "" || mcq.studentName.toLowerCase().includes(name)) &&
    (enroll === "" || mcq.enrollment.includes(enroll))
  );

  renderMCQs(filtered);
}

function clearFilters() {
  document.getElementById("filterUnit").value = "";
  document.getElementById("filterSubtopic").value = "";
  document.getElementById("filterStudentName").value = "";
  document.getElementById("filterEnrollment").value = "";
  renderMCQs(mcqs);
}

function runAIReview() {
  const selectedIds = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
    .map(cb => parseInt(cb.dataset.id));

  if (selectedIds.length === 0) return alert("Select at least one MCQ for AI review.");

  const selected = mcqs.filter(mcq => selectedIds.includes(mcq.id));

  // Simulate AI review
  const reviewed = selected.filter((_, idx) => idx % 2 === 0); // take every alternate for demo
  alert(`AI selected ${reviewed.length} high-quality MCQs.`);

  approvedMCQs = [...approvedMCQs, ...reviewed];
  previewApproved();
}

function approveSelectedMCQs() {
  const selectedIds = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
    .map(cb => parseInt(cb.dataset.id));

  if (selectedIds.length === 0) return alert("Select MCQs to approve.");

  const selected = mcqs.filter(mcq => selectedIds.includes(mcq.id));
  approvedMCQs = [...approvedMCQs, ...selected];
  previewApproved();
}

function previewApproved() {
  const list = document.getElementById("approvedList");
  list.innerHTML = "";

  approvedMCQs.forEach(mcq => {
    const item = document.createElement("div");
    item.className = "mcq-item";
    item.innerHTML = `
      <strong>Q:</strong> ${mcq.question}<br/>
      <strong>Options:</strong> ${mcq.options.join(", ")}<br/>
      <strong>Correct:</strong> ${mcq.correct}<br/>
      <em>Unit: ${mcq.unit}, Subtopic: ${mcq.subtopic}</em><br/>
    `;
    list.appendChild(item);
  });
}

function finalSubmit() {
  if (approvedMCQs.length === 0) return alert("No MCQs approved to submit.");

  // Submit to Supabase DB here
  alert(`${approvedMCQs.length} MCQs published successfully.`);
  approvedMCQs = [];
  document.getElementById("approvedList").innerHTML = "";
}

function logout() {
  // logout logic
  window.location.href = "../login.html";
}

function initUnitDropdown() {
  const unitSelect = document.getElementById("filterUnit");
  for (let i = 1; i <= 6; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = "Unit " + i;
    unitSelect.appendChild(opt);
  }
}

window.onload = () => {
  initUnitDropdown();
  renderMCQs(mcqs);
};
