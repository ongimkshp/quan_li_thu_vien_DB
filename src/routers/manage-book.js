const express = require('express');
const router = express.Router();
const manageBookController = require('../app/controllers/ManageBookController');

router.get('/author/:authorID',  manageBookController.authorID);
router.post('/author/:authorID',  manageBookController.editAuthor);
router.post('/author-delete/:authorID',  manageBookController.deleteAuthor);
router.get('/author',  manageBookController.author);
router.post('/author',  manageBookController.createAuthor);

router.get('/publisher/:publisherID',  manageBookController.publisherID);
router.post('/publisher/:publisherID',  manageBookController.editPublisher);
router.post('/publisher-delete/:publisherID',  manageBookController.deletePublisher);
router.get('/publisher',  manageBookController.publisher);
router.post('/publisher',  manageBookController.createPublisher);

router.get('/statistic',  manageBookController.statistic);
router.get('/:bookID',  manageBookController.detail);
router.post('/add', manageBookController.create);
router.post('/delete/:bookID', manageBookController.deleteBook);
router.post('/:bookID', manageBookController.editBook);
router.post('/', manageBookController.search);
router.get('/',  manageBookController.index);


module.exports = router;