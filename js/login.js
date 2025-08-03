const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    const docRef = db.collection("users").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      errorMsg.textContent = "No record found.";
      return;
    }

    const userData = docSnap.data();

    if (userData.role !== role) {
      errorMsg.textContent = `You are registered as ${userData.role}, not ${role}.`;
      return;
    }

    if (role === "teacher" && !userData.approved) {
      errorMsg.textContent = "Teacher account is not approved by admin.";
      return;
    }

    // Redirect to dashboard
    window.location.href = `${role}/dashboard.html`;

  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Login failed: " + error.message;
  }
});
