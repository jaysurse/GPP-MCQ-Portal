document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const roleInputs = document.querySelectorAll('input[name="role"]');

  roleInputs.forEach(input => {
    input.addEventListener("change", toggleRoleFields);
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.querySelector('input[name="role"]:checked').value;

    let division = null;
    let subject = null;
    let adminKey = null;

    if (role === "student") {
      division = document.getElementById("studentDivision").value;
    } else if (role === "teacher") {
      division = document.getElementById("teacherDivision").value;
      subject = document.getElementById("teacherSubject").value;
    } else if (role === "admin") {
      adminKey = document.getElementById("adminKey").value;
      if (adminKey !== "yourSecretKey") {
        alert("Invalid Admin Key");
        return;
      }
    }

    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      const userData = {
  name,
  email,
  role,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
};

// Common for both students and teachers
if (division) userData.division = division;

// Teacher-specific: subject and approval flag
if (role === "teacher") {
  userData.subject = subject;
  userData.approved = false; // ✅ new field added
}


      await firebase.firestore().collection("users").doc(uid).set(userData);

      alert("Registration successful!");

      if (role === "teacher") {
  alert("Your account has been created but is pending admin approval.");
}

      window.location.href = `/${role}/dashboard.html;` // redirect to respective dashboard

    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to register: " + error.message);
    }
  });

  // Load division and subject options from Firestore
  loadDivisions();
  loadSubjects();
  toggleRoleFields(); // <-- this is the missing piece

});

function toggleRoleFields() {
  const role = document.querySelector('input[name="role"]:checked').value;

  const studentFields = document.getElementById("studentFields");
  const teacherFields = document.getElementById("teacherFields");
  const adminFields = document.getElementById("adminFields");

  studentFields.style.display = role === "student" ? "block" : "none";
  teacherFields.style.display = role === "teacher" ? "block" : "none";
  adminFields.style.display = role === "admin" ? "block" : "none";

  // Toggle required attribute safely
  document.getElementById("studentDivision").required = role === "student";
  document.getElementById("teacherDivision").required = role === "teacher";
  document.getElementById("teacherSubject").required = role === "teacher";
  document.getElementById("adminKey").required = role === "admin";
}

async function loadDivisions() {
  const divisionsSnap = await firebase.firestore().collection("divisions").get();
  const divisions = divisionsSnap.docs.map(doc => doc.id);

  const studentSelect = document.getElementById("studentDivision");
  const teacherSelect = document.getElementById("teacherDivision");

  divisions.forEach(division => {
    studentSelect.appendChild(new Option(division, division));
    teacherSelect.appendChild(new Option(division, division));
  });
}

async function loadSubjects() {
  const subjectsSnap = await firebase.firestore().collection("subjects").get();
  const subjectSelect = document.getElementById("teacherSubject");

  subjectsSnap.forEach(doc => {
    const subject = doc.data().subject;
    subjectSelect.appendChild(new Option(subject, subject));
  });
}