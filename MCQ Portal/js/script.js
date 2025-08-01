document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const role = document.getElementById('role').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("Login Attempt:", { role, email, password });
  // TODO: Add Supabase login logic based on role
});

document.getElementById('registerForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const role = document.getElementById('role').value;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  let additional = {};

  if (role === 'teacher') {
    additional.division = document.getElementById('teacherDivision').value;
    additional.subject = document.getElementById('teacherSubject').value;
  } else if (role === 'student') {
    additional.enrollment = document.getElementById('enrollment').value;
    additional.division = document.getElementById('studentDivision').value;
  }

  console.log("Register Attempt:", { role, name, email, password, ...additional });
  // TODO: Add Supabase register logic based on role
});
