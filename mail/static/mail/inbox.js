document.addEventListener('DOMContentLoaded', function() {
 
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  console.log("compose_email()");
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  
  // document.querySelector('form').addEventListener('submit', () => send_email());
  document.querySelector('form').addEventListener('submit', () => send_email());
}

function load_mailbox(mailbox) {
  console.log("load_mailbox="+mailbox);

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display  = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';

  // Clear any preloaded emails that were previously loaded
  document.querySelector('#view-email').innerHTML = '';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  get_inbox_content(mailbox);




}

// Fetch contents of an inbox
function get_inbox_content(mailbox) {  
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Run create_inbox_view function below 
    create_inbox_view(emails);
  });
}



// Take json response from GET request and display as a table
function create_inbox_view(emails) {
  let sender;
  let subject;
  let timestamp;

  // Create table
  const table = document.createElement('table');
  
  // For every email in the list of emails in the inbox
  for (var i = 0; i < emails.length; i++) {
  //emails.forEach(email => {
    
    // Get information about the email and store into variables
    sender    = emails[i].sender;
    subject   = emails[i].subject;
    timestamp = emails[i].timestamp;
    isRead    = emails[i].read;
    emailId   = emails[i].id;

    // Create a new entry (table row) for an email
    let tr = document.createElement('tr');

    // Set default color as white
    tr.style.backgroundColor = "white";

    //tr.addEventListener('click', () => view_email(emailId));
    // Declare a closure to pass a local-scoped index variable (info from: https://softauthor.com/javascript-add-click-event-listener-in-a-loop/#use-foreach-instead-of-for)
    tr.addEventListener('click', function(index) {
      return function() {
        view_email(emails[index]);
      }
    }(i)) 
   
      
    
    // If the email is already read, make its background light grey
    if (isRead) {
      tr.style.backgroundColor = "lightgrey";
    }

    // Create a new row element for the sender and append it to the row
    let td = document.createElement('td');
    td.id = 'sender';
    td.innerHTML = sender;
    tr.appendChild(td);

    // Create a new row element for the subject and append it to the row
    td = document.createElement('td');
    td.id = 'subject';
    td.innerHTML = subject;
    tr.appendChild(td);

    // Create a new row element for the timestamp and append it to the row
    td = document.createElement('td');
    td.id = 'timestamp';
    td.innerHTML = timestamp;
    tr.appendChild(td);
    table.appendChild(tr);
  }
  
  // Append the whole table to #emails-view div in inbox.html
  document.querySelector('#emails-view').appendChild(table);
}

// To view the email
function view_email(email) {
  
  // Show the email and hide other views
  document.querySelector('#emails-view').style.display  = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  let emailContainer = document.querySelector('#view-email');
  emailContainer.style.display = 'block';

  // Fetch a specific email based on its id
  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {
 
    // Get information about the email and store into variables
    let from = document.createElement('p');
    let to = document.createElement('p');
    let subject = document.createElement('p');
    let timestamp = document.createElement('p');
    let body = document.createElement('p');

    // Set the inner HTMLs of the above elements 
    from.innerHTML = '<b>From:</b> ' + email.sender;
    to.innerHTML = '<b>To:</b> ' + email.recipients;
    subject.innerHTML = '<b>Subject:</b> ' + email.subject;
    timestamp.innerHTML = '<b>Timestamp:</b> ' + email.timestamp;
    body.innerHTML = email.body;

    // Append it to the page
    emailContainer.appendChild(from);
    emailContainer.appendChild(to);
    emailContainer.appendChild(subject);
    emailContainer.appendChild(timestamp);
    emailContainer.appendChild(body);

    // Set read status for an email that has been clicked on to true
    email.read = true;


  });
}

// To compose and send an email
function send_email() {

  console.log("send_email()");

  // Get recipients, subject, and body from the email
  const recipients  = document.querySelector('#compose-recipients').value;
  const subject     = document.querySelector('#compose-subject').value;
  const body        = document.querySelector('#compose-body').value;
  
  console.log("recipients="+recipients);
  console.log("subject="+subject);
  console.log("body="+body);

  // Post request to /emails route
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response=> response.json())
  .then(result=> {
    console.log(result);

    // Load sent mailbox when email is sent
    load_mailbox('sent');
  });
}