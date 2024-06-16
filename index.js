const express = require('express');
const router = express.Router();
const { ContactModel, Pager, sortContacts, filterContacts } = require('@jworkman-fs/asl');

router.use(express.json());

router.get('/v1/contacts', async (req, res) => {
  try {
    let contacts = await ContactModel.findAll();

    const filterBy = req.get('X-Filter-By');
    const filterValue = req.get('X-Filter-Value');
    if (filterBy && filterValue) {
      contacts = filterContacts(contacts, filterBy, filterValue);
    }

    const { sort, direction } = req.query;
    if (sort) {
      contacts = sortContacts(contacts, sort, direction);
    }

    const pager = new Pager(contacts, req.query.page, req.query.size);

    res.set('X-Page-Total', pager.total());
    res.set('X-Page-Next', pager.next());
    res.set('X-Page-Prev', pager.prev());

    res.status(200).json(pager.results());
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

router.get('/v1/contacts/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const contact = await ContactModel.findById(id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json(contact);
  } catch (err) {
    console.error(`Error fetching contact with ID ${id}:`, err);
    res.status(500).json({ error: `Failed to fetch contact with ID ${id}` });
  }
});

router.post('/v1/contacts', async (req, res) => {
  const { fname, lname, email, phone, birthday } = req.body;

  try {
    const newContact = await ContactModel.create({ fname, lname, email, phone, birthday });

    res.status(201).json(newContact);
  } catch (err) {
    console.error('Error creating contact:', err);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

router.put('/v1/contacts/:id', async (req, res) => {
  const id = req.params.id;
  const { fname, lname, email, phone, birthday } = req.body;

  try {
    const updatedContact = await ContactModel.update(id, { fname, lname, email, phone, birthday });

    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json(updatedContact);
  } catch (err) {
    console.error(`Error updating contact with ID ${id}:`, err);
    res.status(500).json({ error: `Failed to update contact with ID ${id}` });
  }
});

router.delete('/v1/contacts/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const deletedContact = await ContactModel.delete(id);

    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(204).end();
  } catch (err) {
    console.error(`Error deleting contact with ID ${id}:`, err);
    res.status(500).json({ error: `Failed to delete contact with ID ${id}` });
  }
});

module.exports = router;
