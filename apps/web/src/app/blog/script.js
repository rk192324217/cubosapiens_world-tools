// DOM Ready function
document.addEventListener('DOMContentLoaded', () => {
  // Your code here
  initializeApp();
});

function initializeApp() {
  const app = document.getElementById('app');
  console.log('App initialized!');
  
  // Example: Dynamic content
  const button = document.createElement('button');
  button.textContent = 'Click Me';
  button.className = 'btn btn-primary';
  button.addEventListener('click', handleClick);
  app.appendChild(button);
}

function handleClick() {
  alert('Button clicked!');
}