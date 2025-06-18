// Global variables
let apiKey = '';
const rootPath = 'https://mysite.itvarsity.org/api/ContactBook/';

// Check if API key exists when page loads
function checkApiKey() {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
        apiKey = storedApiKey;
        // Show contacts page
        showContacts();
        // Get contacts (API call)
        getContacts();
    }
}

// Set the API key and Store it
function setApiKey() {
    const inputApiKey = document.getElementById('apiKeyInput').ariaValueMax.trim();

    if (!inputApiKey){
        alert('Please enter an API Key!');
        return;
    }

    // Validate API Key first
    fetch(rootPath + "controller/api-key/?apiKey=" + inputApiKey)
        .then(function (response) {
            return response.text()
        })
        .then(function (data) {
            if (data == "1") {
                apiKey = inputApiKey;
                localStorage.setItem("apiKey", apiKey);
                showContacts();
                getContacts();
            } else {
                alert("Invalid API Key entered!");
            }
        })
        .catch(function (error) {
            alert('Enter validation your API Key. Please try again.');
        })
}

// Show different pages
function showPage(pageID) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Show selected page
    document.getElementById(pageID).classList.add('active');
}

function showContacts() {
    showPage('contactsPage');
}

function showAddContacts() {
    showPage('addContactPage');
    // Clear the form
    document.getElementById('addContactForm').reset();
}

function showEditContact(contactId) {
    showPage('editContactPage')
    // Load contact data for editing
    loadContactForEdit(contactId);
}

function getContacts() {
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '<div class="Loading">Loading contacts...</div>';

    fetch(rootPath + "controller/get-contacts/")
        .then(function (response) {
            return response.json();
        })
        .catch(function (data) {
            displayContacts(data);
        })
        .catch(function (erroe) {
            contactsList.innerHTML = '<div class="error">Something went wrong, please try again</div>'
        });
}

function displayContacts(contacts) {
    const contactsList = document.getElementById('contactsList');

    if (!contacts || contacts.length === 0) {
        contactsList.innerHTML = '<div class="loading">No contacts found. Add your first contact!</div>';
        return;
    }

    let html = '<div class="contacts-grid">';

    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        
        let avatarSrc = contact.avatar ?
            `${rootPath}controller/uploads/${contacts.avatar}` :
            `https://ui-avatars.com/api/?name=${contact.firstname}+${contact.lastname}&background=ff6b6b&color=fff&size=120`;

        html += `
                <div class="contact-card">
                    <img src="${avatarSrc}" alt="Avatar" class="contact-avatar">
                    <div class="contact-name">${contact.firstname} ${contact.lastname}</div>
                    <div class="contact-details">
                        <p><strong>📱 Mobile:</strong> ${contact.mobile}</p>
                        <p><strong>📧 Email:</strong> ${contact.email}</p>
                    </div>
                    <div class="contact-actions">
                        <button class="btn btn-secondary" onclick="showEditContact('${contact.id}')">✏ Edit</button>
                        <button class="btn btn-danger" onclick="deleteContact('${contact.id}')">🗑 Delete</button>
                    </div>
                </div>
        `;
    }

    html += '</div>';
    contactsList.innerHTML = html;
}

function refreshContacts() {
    getContacts();
}

function addContact(event) {
    event.preventDefault();

    const form = new FormData(document.querySelector('#addContactForm'));
    form.append('apiKey', apiKey);

    fetch(rootPath + 'controller/insert-contact/', {
        method: 'POST',
        headers: {'Accept': 'application/json, *.*'},
        body: form
    })
        .then(function (response) {
            return response.text();
        })
        .then(function (data) {
            if (data == "1") {
                alert("Contact added successfully!");
                showContacts();
                getContacts();
            } else {
                alert('Error adding contact: ' + data);
            }
        })
        .catch(function (error) {
            alert('Something went wrong. Please try again.');
        })
}

function loadContactForEdit(contactId) {
    fetch(rootPath + 'controller/get-contacts/?id=' + contactId)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data && data.length > 0) {
                const contact = data[0];

                //Show avatar if available
                if (contact.avatar) {
                    const avatarImg = '<img src="${rootPath}controller/uploads/${contact.avatar}" width=200 style="border-radius: 10px;" />';
                    document.getElementById("editAvatarImage").innerHTML = avatarImg;
                } else {
                    document.getElementById("editAvatarImage").innerHTML = '';
                }

                document.getElementById('editContactId').value = contact.id;
                document.getElementById('editFirstName').value = contact.firstname;
                document.getElementById('editLastName').value = contact.lastname;
                document.getElementById('editMobile').value = contact.mobile;
                document.getElementById('editEmail').value = contact.email;
            }
        })
        .catch(function (error) {
            alert('Error loading contact details.');
            showContacts();
        })
}

function updateContact(event) {
    event.preventDefault();

    const form = new FormData(document.querySelector("#editContactForm"));
    const contactId = document.getElementById('editContactId').value;

    form.append('apiKey', apiKey);
    form.append('id', contactId);

    fetch(rootPath + 'controller/edit-contact/', {
        method: 'POST',
        headers: {'Accept': 'application/json, *.*'},
        body: form
    })
        .then(function (response) {
            return response.text();
        })
        .then(function (data) {
            if (data == "1") {
                alert("Contact uploaded successfully!");
                showContacts();
                getContacts();
            } else {
                alert('Error updating contact: ' + data);
            }
        })
        .catch(function (error) {
            alert('Something went wrong. Please try again.');
        });
}

function deleteContact(contactId) {
    var confirmDelete = confirm("Delete contact. Are you sure");

    if (confirmDelete == true) {
        fetch(rootPath + 'controller/delete-contact/?id' + contactId)
            .then(function (response) {
                return response.text();
            })
            .then(function (data) {
                if (data == "1") {
                    alert('Contact delete successfully!')
                    getContacts();
                } else {
                    alert('Error deleting contact: ' + data);
                }
            })
            .catch(function (error) {
                alert('Something went wrong. Please try again');
            });
    }
}

Window.onload = function() {
    checkApiKey();
};