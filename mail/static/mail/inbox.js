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
  //document.querySelector('#mailbox').value              ='sent';

  document.querySelector('#submit-button').addEventListener('click', () => send_email());
  //document.querySelector('#submit-button').addEventListener('click', () => send_email());
}


function load_mailbox(mailbox) {
  
  //console.log('mailbox='+ document.querySelector('#mailbox').value);

  //Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display  = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display   = 'none';

  //Clear any preloaded emails that were previously loaded
  document.querySelector('#view-email').innerHTML = '';

  //Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Get the contents of an inbox
  get_inbox_content(mailbox);
  
}


//Fetch contents of an inbox
function get_inbox_content(mailbox) {  
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    create_inbox_view(mailbox,emails);
  }) // Run create_inbox_view function below 
  //.catch(error => console.log('Failed while getting the mailbox content',error));
}



//Take json response from GET request and display as a table
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

    // Create a new entry (table row) for an email
    let tr = document.createElement('tr');
    tr.setAttribute('id', 'mailbox_tr');//set tr id
    tr.style.backgroundColor = "white";// Set default color as white
    
    // Declare a closure to pass a local-scoped index variable (info from: https://softauthor.com/javascript-add-click-event-listener-in-a-loop/#use-foreach-instead-of-for)
    tr.addEventListener('click', function(index) {
      return function() {
        view_email(mailbox, emails[index]);
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


function print_email (mailbox, emailContainer, email) {
  
  //Create table data elements
  let fromTd      = document.createElement('td');
  let toTd        = document.createElement('td');
  let subjectTd   = document.createElement('td');
  let timestampTd = document.createElement('td');
  let bodyTd      = document.createElement('td');
  let buttonsTd   = document.createElement('td');
  let hr          = document.createElement('hr');

  //Set table data values
  fromTd.innerHTML      = '<b>From:</b> ' + email.sender;
  toTd.innerHTML        = '<b>To:</b> ' + email.recipients;
  subjectTd.innerHTML   = '<b>Subject:</b> ' + email.subject;
  timestampTd.innerHTML = '<b>Timestamp:</b> ' + email.timestamp;
  bodyTd.innerHTML      = email.body;

   
  //Create table rows
  let fromTr      = document.createElement('tr'); 
  let toTr        = document.createElement('tr');
  let subjectTr   = document.createElement('tr'); 
  let timestampTr = document.createElement('tr'); 
  let buttonsTr   = document.createElement('tr');

  
  //Create buttons 
  let replyButton    = document.createElement('button');
  replyButton.setAttribute('class','btn btn-primary');
  replyButton.innerHTML  ='Reply';
  replyButton.addEventListener('click', () => replyEmail(email));
  buttonsTd.appendChild(replyButton);

  if (mailbox != 'sent') { 
    let archiveButton  = document.createElement('button');
    archiveButton.setAttribute('class', 'btn btn-primary');
    archiveButton.setAttribute('id', 'archive-button');
    archiveButton.innerHTML = 'Archive';
    archiveButton.addEventListener('click', () => updateArchive(email.id, true));
    //archiveButton.onclick = updateArchive(email.id, true);

    if (email.archived) {
      archiveButton.innerHTML = 'Unarchive';
      archiveButton.addEventListener('click', () => updateArchive(email.id, false));
      //archiveButton.onclick = updateArchive(email.id, false);
    }

    buttonsTd.appendChild(archiveButton);
  }
  
  buttonsTr.appendChild(buttonsTd);

  //Add columns into the rows
  fromTr.appendChild(fromTd);
  toTr.appendChild(toTd);  
  subjectTr.appendChild(subjectTd);
  timestampTr.appendChild(timestampTd); 


  //Create table content
  let table = document.createElement('table'); 
  table.setAttribute('id', 'email_header');

  //Add rows into the table
  table.appendChild(fromTr);
  table.appendChild(toTr);
  table.appendChild(subjectTr);
  table.appendChild(timestampTr);
  table.appendChild(buttonsTr);
      
  //Add table content into html container(div)
  emailContainer.appendChild(table);
  emailContainer.appendChild(hr);
  emailContainer.appendChild(bodyTd);
   
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

  document.querySelector('#submit-button').addEventListener('click', () => send_email());
}

// Mark a given email as read
function markAsRead (email_id) {  
  fetch(`/emails/${email_id}`,{
    method: 'PUT',
    body: JSON.stringify({read: true})
  })
}

// Mark a given email as archived
function updateArchive (email_id, trueOrFalse) {  

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({archived: trueOrFalse})
  })

  document.querySelector('#archive-button').onclick = load_mailbox('inbox'); //window.location.reload();
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

  //Mark email as read
  if (!email.read) { 
    markAsRead(email.id);
  }
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