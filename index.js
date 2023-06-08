const API_URL = "http://localhost:3000/events";

const editSVG =
  '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>';
const deleteSVG =
  '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
const saveSVG =
  '<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21,20V8.414a1,1,0,0,0-.293-.707L16.293,3.293A1,1,0,0,0,15.586,3H4A1,1,0,0,0,3,4V20a1,1,0,0,0,1,1H20A1,1,0,0,0,21,20ZM9,8h4a1,1,0,0,1,0,2H9A1,1,0,0,1,9,8Zm7,11H8V15a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1Z"/></svg>';
const cancelSVG =
  '<svg focusable="false" aria-hidden="true" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M19.587 16.001l6.096 6.096c0.396 0.396 0.396 1.039 0 1.435l-2.151 2.151c-0.396 0.396-1.038 0.396-1.435 0l-6.097-6.096-6.097 6.096c-0.396 0.396-1.038 0.396-1.434 0l-2.152-2.151c-0.396-0.396-0.396-1.038 0-1.435l6.097-6.096-6.097-6.097c-0.396-0.396-0.396-1.039 0-1.435l2.153-2.151c0.396-0.396 1.038-0.396 1.434 0l6.096 6.097 6.097-6.097c0.396-0.396 1.038-0.396 1.435 0l2.151 2.152c0.396 0.396 0.396 1.038 0 1.435l-6.096 6.096z"></path></svg>';
const addSVG =
  '<svg focusable viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M12 6V18M18 12H6" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function createSVGButton(svgHTML, onclick, className) {
  const button = document.createElement("button");
  button.innerHTML = svgHTML;
  button.onclick = onclick;
  button.className = className; // added this line
  return button;
}

function validateName(input) {
  // This regular expression allows only alphabetical characters and spaces
  const re = /^[A-Za-z\s]+$/;

  if (input.startsWith(' ')) {
      alert('Invalid input. Input should not start with a space.');
      return false;
  } else if (!re.test(input)) {
      alert('Invalid input. Only alphabetical characters and spaces are allowed.');
      return false;
  }

  return true;
}

function validateDates(startDate, endDate) {
  // Checking if the start date is later than the end date
  if (!startDate || !endDate) {
    alert('Invalid date. The start and end date should be entered.');
    return false;
  } else if (startDate > endDate) {
    alert('Invalid date. Start date should be earlier than end date.');
    return false;
  }

  return true;
}

function addEmptyRow() {
  const tbody = document
    .getElementById("eventTable")
    .getElementsByTagName("tbody")[0];

  const row = tbody.insertRow(-1);
  row.id = "newEventRow";

  const nameCell = row.insertCell();
  const startDateCell = row.insertCell();
  const endDateCell = row.insertCell();
  const actionCell = row.insertCell();

  nameCell.innerHTML =
    '<input id="newEventName" type="text" placeholder="Enter event name">';
  startDateCell.innerHTML = '<input id="newEventStart" type="date">';
  endDateCell.innerHTML = '<input id="newEventEnd" type="date">';

  const addButton = createSVGButton(addSVG, saveNewEvent, "buttonBlue");
  const cancelButton = createSVGButton(cancelSVG, cancelNewEvent, "buttonRed");

  actionCell.append(addButton, cancelButton);
}

function saveNewEvent() {
  const eventName = document.getElementById("newEventName").value;
  const startDate = document.getElementById("newEventStart").value;
  const endDate = document.getElementById("newEventEnd").value;

  const newEvent = {
    eventName,
    startDate,
    endDate,
  };

  if (!validateName(newEvent.eventName) || !validateDates(newEvent.startDate, newEvent.endDate)) {
    return;
  }

  addEventToDB(newEvent).then(() => {
    const newEventRow = document.getElementById("newEventRow");
    newEventRow.parentNode.removeChild(newEventRow);
  });
}

function cancelNewEvent() {
  const newEventRow = document.getElementById("newEventRow");
  newEventRow.parentNode.removeChild(newEventRow);
}

async function listEventsFromDB() {
  const response = await fetch(API_URL);
  const events = await response.json();

  const tbody = document
    .getElementById("eventTable")
    .getElementsByTagName("tbody")[0];

  // Clear out the existing table data
  tbody.innerHTML = "";

  // Populate table with fetched events
  events.forEach((event) => {
    const row = tbody.insertRow();

    row.id = `event-${event.id}`;

    const nameCell = row.insertCell();
    const startDateCell = row.insertCell();
    const endDateCell = row.insertCell();
    const actionCell = row.insertCell();

    nameCell.textContent = event.eventName;
    startDateCell.textContent = event.startDate;
    endDateCell.textContent = event.endDate;

    const editButton = createSVGButton(
      editSVG,
      () => editEvent(event),
      "buttonBlue"
    );

    const deleteButton = createSVGButton(
      deleteSVG,
      () => deleteEventToDB(event.id),
      "buttonRed"
    );

    actionCell.append(editButton, deleteButton);
  });
}

function editEvent(event) {
  const row = document.getElementById(`event-${event.id}`);

  const nameCell = row.cells[0];
  const startDateCell = row.cells[1];
  const endDateCell = row.cells[2];

  nameCell.innerHTML = `<input type="text" value="${event.eventName}">`;
  startDateCell.innerHTML = `<input type="date" value="${
    event.startDate.split("T")[0]
  }">`;
  endDateCell.innerHTML = `<input type="date" value="${
    event.endDate.split("T")[0]
  }">`;

  const saveButton = createSVGButton(
    saveSVG,
    () => saveEdits(event.id),
    "buttonBlue"
  );

  const cancelButton = createSVGButton(
    cancelSVG,
    () => cancelEdits(event),
    "buttonRed"
  );

  const actionCell = row.cells[3];
  actionCell.innerHTML = "";
  actionCell.append(saveButton, cancelButton);
}

function cancelEdits(event) {
  const row = document.getElementById(`event-${event.id}`);

  const nameCell = row.cells[0];
  const startDateCell = row.cells[1];
  const endDateCell = row.cells[2];

  nameCell.textContent = event.eventName;
  startDateCell.textContent = event.startDate;
  endDateCell.textContent = event.endDate;

  const editButton = createSVGButton(
    editSVG,
    () => editEvent(event),
    "buttonBlue"
  );

  const deleteButton = createSVGButton(
    deleteSVG,
    () => deleteEventToDB(event.id),
    "buttonRed"
  );

  const actionCell = row.cells[3];
  actionCell.innerHTML = "";
  actionCell.append(editButton, deleteButton);
}

async function saveEdits(id) {
  const row = document.getElementById(`event-${id}`);
  const inputs = row.getElementsByTagName("input");

  const updatedEvent = {
    eventName: inputs[0].value,
    startDate: inputs[1].value,
    endDate: inputs[2].value,
  };

  if (!validateName(updatedEvent.eventName) || !validateDates(updatedEvent.startDate, updatedEvent.endDate)) {
    return;
  }

  // Send the updated event to the server
  await updateEventToDB(id, updatedEvent);

  // Disable the input fields and restore the 'Edit' and 'Delete' buttons
  for (const input of inputs) {
    input.disabled = true;
  }

  const editButton = createSVGButton(
    editSVG,
    () => editEvent(updatedEvent),
    "buttonBlue"
  );

  const deleteButton = createSVGButton(
    deleteSVG,
    () => deleteEventToDB(id),
    "buttonRed"
  );

  const actionCell = row.lastChild;
  actionCell.innerHTML = "";
  actionCell.append(editButton, deleteButton);
}

async function addEventToDB(event) {
  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  // Refresh the table after adding a new event
  listEventsFromDB();
}

async function updateEventToDB(id, event) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  // Refresh the table after updating an event
  listEventsFromDB();
}

async function deleteEventToDB(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  // Refresh the table after deleting an event
  listEventsFromDB();
}

// Fetch and display the list of events on page load
listEventsFromDB();
