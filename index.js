const express = require('express');
const bodyParser = require('body-parser');
const { 
    ContactModel,
    Pager,
    sortContacts,
    filterContacts
  } = require("@jworkman-fs/asl")

  const app = express();
  app.use(bodyParser.json());
  
  // Example contacts data
  let contacts = [
      ContactModel
  ];
  
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Get all contacts
app.get('/contacts', (req, res) => {
    try {
        // Apply sorting
        const sorted = sortContacts(contacts, req.query.sort, req.query.direction);

        // Apply filtering
        const filtered = filterContacts(sorted, req.get('X-Filter-By'), req.get('X-Filter-Value'));

        // Create pager instance
        const pager = new Pager(filtered, req.query.page, req.query.size);

        // Set pagination headers
        res.set("X-Page-Total", pager.total());
        res.set("X-Page-Next", pager.next());
        res.set("X-Page-Prev", pager.prev());

        // Send paginated results
        res.json(pager.results());
    } catch (error) {
        next(error); // Pass error to the error handling middleware
    }
});

// Get a single contact
app.get('/contacts/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const contact = contacts.find(contact => contact.id === id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json(contact);
    } catch (error) {
        next(error); // Pass error to the error handling middleware
    }
});

// Create a new contact
app.post('/contacts', (req, res) => {
    try {
        const { firstName, lastName, email, phone, birthday } = req.body;
        const id = contacts.length + 1;
        const newContact = new ContactModel(id, firstName, lastName, email, phone, birthday);
        contacts.push(newContact);
        res.status(201).json(newContact);
    } catch (error) {
        next(error); // Pass error to the error handling middleware
    }
});

// Update a contact
app.put('/contacts/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { firstName, lastName, email, phone, birthday } = req.body;
        const index = contacts.findIndex(contact => contact.id === id);
        if (index === -1) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        const updatedContact = new ContactModel(id, firstName, lastName, email, phone, birthday);
        contacts[index] = updatedContact;
        res.json(updatedContact);
    } catch (error) {
        next(error); // Pass error to the error handling middleware
    }
});

// Delete a contact
app.delete('/contacts/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = contacts.findIndex(contact => contact.id === id);
        if (index === -1) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        contacts.splice(index, 1);
        res.sendStatus(204);
    } catch (error) {
        next(error); // Pass error to the error handling middleware
    }
});

// Run the server on port 8080
const port = 8080;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});