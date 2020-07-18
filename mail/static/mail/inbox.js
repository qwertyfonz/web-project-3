document.addEventListener('DOMContentLoaded', function() {
 
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
 
  //By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display  = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display   = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value   = '';
  document.querySelector('#compose-subject').value      = '';
  document.querySelector('#compose-body').value         = '';

  // Send email on click
  document.querySelector('#submit-button').addEventListener('click', () => send_email());
}


function load_mailbox(mailbox) {

  //Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display  = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display   = 'none';

  //Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Get the contents of an inbox
  get_inbox_content(mailbox);
}


//Get contents of an inbox
function get_inbox_content(mailbox) {  
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    create_inbox_view(mailbox, emails);
  })  
}



//Take list of emails from GET request and display as a table
function create_inbox_view(mailbox, emails) {
  
  let sender;
  let subject;
  let timestamp;

  //Create table
  const table = document.createElement('table');
  table.setAttribute('id', 'mailbox_table');

  // For every email in the list of emails in the inbox
  for (var i = 0; i < emails.length; i++) { 

    //Get information about the email and store into variables
    sender    = emails[i].sender;
    subject   = emails[i].subject;
    timestamp = emails[i].timestamp;
    isRead    = emails[i].read;
    emailId   = emails[i].id;

    // Create a new entry (table row) for an email and set default background as white
    let tr = document.createElement('tr');
    tr.setAttribute('id', 'mailbox_tr');
    tr.style.backgroundColor = 'white';
    
    // Declare a closure to pass a local-scoped index variable (info from: https://softauthor.com/javascript-add-click-event-listener-in-a-loop/#use-foreach-instead-of-for)
    tr.addEventListener('click', function(index) {
      return function() {
        view_email(mailbox, emails[index]);
      }
    }(i)) 
   
    // If the email is already read, make its background light grey
    if (isRead) {
      tr.style.backgroundColor = 'lightgrey';
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


//To view the email
function view_email(mailbox, email) {  
  
  // Show the email and hide other views
  document.querySelector('#emails-view').style.display  = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  let emailContainer            = document.querySelector('#view-email');
  emailContainer.style.display  = 'block';

  // Fetch a specific email and print it
  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => print_email(mailbox, emailContainer, email));
}

// Displays a given email
function print_email (mailbox, emailContainer, email) {

  // Create a reply button and loads compose form pre-filled on click
  let replyButton           = document.querySelector('#reply_button');
  replyButton.style.display = 'inline';
  replyButton.addEventListener('click', () => replyEmail(email));

  // Create archive/unarchive buttons
  let archiveButton    = document.querySelector('#archive_button');
  let unArchiveButton  = document.querySelector('#unarchive_button'); 
  
  // If the email is not archived, then show archive button; else, show the unarchive button and hide archive
  if (!email.archived) {
    archiveButton.style.display   = 'inline';
    unArchiveButton.style.display = 'none';
    archiveButton.addEventListener('click', () => updateArchivedEmail(email.id,{archived:true}))
  } else {
    unArchiveButton.style.display   = 'inline';
    archiveButton.style.display     = 'none';
    unArchiveButton.addEventListener('click', () => updateArchivedEmail(email.id,{archived:false}))
  }

  // Set the innerHTML of the contents of the email
  document.querySelector('#from_td').innerHTML      = '<b>From:</b> ' + email.sender;
  document.querySelector('#to_td').innerHTML        = '<b>To:</b> ' + email.recipients;
  document.querySelector('#subject_td').innerHTML   = '<b>Subject:</b> ' + email.subject;
  document.querySelector('#timestamp_td').innerHTML = '<b>Timestamp:</b> ' + email.timestamp; 
  document.querySelector('#email_body').innerHTML   = email.body;
  
  
  // Mark email as read
  if (!email.read) { 
    updateEmailProperties(email.id, {read:true});
  }

  // Do not display the archive button if in sent inbox
  if (mailbox === 'sent') {
    document.querySelector('#archive_button').style.display  = 'none';
    document.querySelector('i').style.display  = 'none';
  }
}


// Allow user to write a reply to an email
function replyEmail(email) {
  
  document.querySelector('#emails-view').style.display  = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display   = 'none';

  // Detect if the subject line already starts with 'Re:'
  let emailSubject = email.subject;
  if (emailSubject.startsWith('Re: ')) {
    emailSubject = emailSubject.slice(4);
  }

  // Prepopulate form with given information
  document.querySelector('#compose-recipients').value   = `${email.sender}`;
  document.querySelector('#compose-subject').value      = `Re: ${emailSubject}`;
  document.querySelector('#compose-body').value         = `On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`;

  // Send email on click
  document.querySelector('#submit-button').addEventListener('click', () => send_email());
}


// Update a given email's properties
function updateEmailProperties(email_id, updateValue) {  

  // Send put request to update read status
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify(updateValue)
  })
}

// Update an email's archived status (calls the updateEmailProperties function to update) and reloads main inbox after
function updateArchivedEmail(email_id, updateValue) { 

  updateEmailProperties(email_id, updateValue);
  load_mailbox('inbox');
}

//To compose and send an email
function send_email() {
  
  //Get recipients, subject, and body from the email
  const recipients  = document.querySelector('#compose-recipients').value;
  const subject     = document.querySelector('#compose-subject').value;
  const body        = document.querySelector('#compose-body').value;

  // Post request to /emails route
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {

    // Load sent mailbox when email is sent
    load_mailbox('sent');
  })
}