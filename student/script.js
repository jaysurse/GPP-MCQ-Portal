firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const doc = await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .get();
      if (doc.exists) {
        const userData = doc.data();
        document.getElementById("userName").textContent =
          userData.name || "Unknown";
        document.getElementById("userRole").textContent =
          userData.role || "Student";
      } else {
        console.error("User data not found.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  } else {
    // User not logged in, redirect to login page
    window.location.href = "/login.html";
  }
});

// Simulated data fetch
document.addEventListener("DOMContentLoaded", () => {
  loadSubjects();
  loadMyMCQs();
  loadApprovedMCQs();
});

function loadSubjects() {
  const subjects = ["Maths", "Computer Networks", "DBMS"];
  const subjectDropdown = document.getElementById("subject");
  const unitDropdown = document.getElementById("unit");

  subjects.forEach((subj) => {
    let opt = document.createElement("option");
    opt.value = subj;
    opt.textContent = subj;
    subjectDropdown.appendChild(opt);
  });

  for (let i = 1; i <= 5; i++) {
    let unitOpt = document.createElement("option");
    unitOpt.value = `Unit ${i}`;
    unitOpt.textContent = `Unit ${i}`;
    unitDropdown.appendChild(unitOpt);
  }
}

document.getElementById("mcq-form").addEventListener("submit", function (e) {
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
  };

  console.log("Submitted MCQ:", mcq);
  alert("MCQ Submitted! (This will go to Supabase)");
  this.reset();
});

function loadMyMCQs() {
  const list = document.getElementById("my-mcqs-list");
  list.innerHTML = `<li>Logic Gates - Which gate outputs 1 when both inputs are 1?</li>`;
}

function loadApprovedMCQs() {
  const list = document.getElementById("approved-mcqs-list");
  list.innerHTML = `<li>Which protocol ensures reliable delivery? — TCP</li>`;
}

function logout() {
  alert("Logged out!");
  window.location.href = "../login.html";
}
