const { Op } = require('sequelize');
const Title = require('../models/title')
const Author = require('../models/author')
const Client = require('../../config/pg_db/client');
const Type = require('../models/type');
const Book = require('../models/book');
const Language = require('../models/language')
const Position = require('../models/position')
const Publisher = require('../models/publisher');


class ManageBookController {
    // [GET] /manage
    async index(req, res, next) {
        try {
            const books = await Client.query('select * from title_infos order by title_id')
            // res.send(books.rows)
            // return
            const types = await Type.findAll({
                raw: true
            })
            const publishers = await Publisher.findAll({raw: true})
            res.render('manage-books/index',{
                books: books.rows,
                types,
                publishers
            })
        } catch (error) {
            res.send(error.message)            
        }
    }
    // POST /manage-books
    async search(req, res, next){
        try {
            let {bookName, authorName, typeID, pubID} = req.body
            if(typeID == '' && bookName == '' && authorName == '' && pubID == '' ){
                res.redirect('back')
                return
            }
            const query = `select * from title_infos
            where title_name ilike ${bookName ? `'%${bookName}%'` : `'%%'`}
            and type_id ilike ${typeID ? `'%${typeID}%'` : `'%%'` }
            and author_first_name ilike ${authorName ? `'%${authorName}%'` : `'%%'` }
            and publisher_id ilike ${pubID ? `'%${pubID}%'` : `'%%'` }
            `
            let books = await Client.query(query)
           
            const types = await Type.findAll({
                raw: true
            })
            const publishers = await Publisher.findAll({
                raw: true
            })
            res.render('manage-books/index',{
                books: books.rows,
                bookName,
                authorName,
                typeID,
                types,
                pubID,
                publishers
            })
        } catch (error) {
            res.send(error.message)            
        }
    }
    // GET /manage-books/:bookID
    async detail(req, res, next){
        const titleID = req.params.bookID ? req.params.bookID : ''
        let isAddPage = false
        if(titleID == 'add'){
            isAddPage = true
        }
        if(!titleID){
            res.redirect('back')
            return;
        }
        const types = await Type.findAll({
            raw: true
        })
        const language = await Language.findAll({
            raw: true
        })
        const positions = await Position.findAll({
            raw: true
        })
        const books = await Title.findByPk(titleID,{
            include: [
                { model: Author, attributes: ['firstName', 'lastName']},
                {model: Type, attributes: ['name']},
                {model: Language, attributes: ['name']},
                {model: Position, attributes: ['area', 'shelf']},
                {model: Publisher, attributes: ['name', 'address']}
            ],
            raw: true
        })
        // res.send(books)
        // return;
        res.render('manage-books/detailBook',{
            books,
            types,
            language,
            positions,
            titleID,
            isAddPage
        })
    }
    // POST /manage-books/add
    async create(req, res, next){
        try {
            let{name, type, language, position, quantity, pubDate, quanInLi, summary, url, authorID, authorFN, authorLN, publisherID, pubName, pubAddress} = req.body
            // res.send(req.body)
            // return
            const query = `insert into title_infos
            values(null, '${name}', ${quantity}, '${pubDate}', '${summary}', ${quanInLi}, '${url}', 
            ${authorID ? `'${authorID}'` : null}, ${authorFN ? `'${authorFN}'` : null}, ${authorLN ? `'${authorLN}'` : null}, 
            ${publisherID ? `'${publisherID}'` : null}, ${pubName ? `'${pubName}'` : null}, ${pubAddress ? `'${pubAddress}'` : null}, 
            '${language}', null, 
            '${position}', null, null, 
            '${type}', null)
            `
            const title = await Client.query(query)
            res.redirect(`/manage-books`)
        } catch (error) {
            res.send(error)            
        }
    }
    // PUT /manage-books/:bookID
    async editBook(req, res, next) {
        try {
            console.log('123123')
            const{name, type, language, position, quantity, pubDate, quanInLi, url, summary, authorID, publisherID} = req.body
            const bookID = req.params.bookID
            const query = `update title_infos set
            title_name = '${name}', quantity = '${quantity}',quan_in_lib = '${quanInLi}',
            publish_date = '${pubDate}', summary = '${summary}', url = '${url}',
            author_id = '${authorID}', publisher_id = '${publisherID}',
            type_id = '${type}', position_id = '${position}', language_id = '${language}'
            where title_id = '${bookID}'
            `
            // res.send(req.body)
            // return
            const book = await Client.query(query)
            res.redirect('back')  
        } catch (error) {
            res.send(error.message)
        }
    }
    // DELETE /manage-books/delete/:bookID
    async deleteBook(req, res, next){
        try {
            const bookID = req.params.bookID
            if(!bookID){
                res.redirect('back')
                return
            }
            // console.log(bookID)
            // return
            const book = await Title.destroy({
                where: {
                    titleID: bookID
                }
            })
            res.redirect('/manage-books')
        } catch (error) {
            res.send(error.message)
        }
    }


    // GET /manage-books/author
    async author(req, res, next) {
        try {
            const authorLast = await Author.findAll({
                raw: true,
                limit: 1,
                offset: 0,
                order: [
                    ['authorID','DESC'] 
                ]
            })
            const authorIDLast = authorLast[0].authorID
            const number = Number(authorIDLast.slice(2))
            const newID = (pad(number+1,8))
            res.render('manage-books/detailAuthor',{
                author: null,
                newID,
                new: true
            })
        } catch (error) {
            res.send(error.message)            
        }
    }
    // POST /manage-books/author
    async createAuthor(req, res, next){
        try {
            const {authorID, firstName, lastName} = req.body
            const checkAuthor = Author.findByPk(authorID,{
                raw: true
            })
            const newAuthor = await Author.create({
                authorID,
                firstName,
                lastName
            })
            res.redirect(`/manage-books/author/${authorID}`)
        } catch (error) {
            res.send(error.message)
        }
    }
    // GET /manage-books/author/:authorID
    async authorID(req, res, next) {
        const authorID = req.params.authorID
        if(!authorID){
            res.redirect('/manage-books/author')
            return
        }
        const author = await Author.findByPk(authorID,{
            raw: true
        })
        if (author) {
            res.render('manage-books/detailAuthor',{
                author: author,
                new: false
            })
        }
        else{
            res.redirect('/manage-books/author') 
        }
    }
    // PUT /manage-books/author/:authorID
    async editAuthor(req, res, next){
        try {
            const authorID = req.params.authorID
            const {lastName, firstName} = req.body
            const author = await Author.findByPk(authorID)
            author.set({
                firstName: firstName,
                lastName: lastName
            })
            await author.save()
            res.redirect('back')
            // res.send(req.body)
        } catch (error) {
            res.send(error.message)
        }
    }
    // DELETE /manage-books/author-delete/:authorID
    async deleteAuthor(req, res, next) {
        try {
            const id = req.params.authorID
            const author = await Author.destroy({
                where: {
                    authorID: id
                }
            })
            res.redirect('/manage-books')
        } catch (error) {
            res.send(error.message)
        }
    }

    
    // GET /manage-books/publisher
    async publisher(req, res, next) {
        try {
            const publisherLast = await Publisher.findAll({
                raw: true,
                limit: 1,
                order: [
                    ['publisherID','DESC'] 
                ]
            })
            const publisherIDLast = publisherLast[0].publisherID
            const number = Number(publisherIDLast.slice(2))
            const newID = (pad(number+1,8))
            res.render('manage-books/detailPublisher',{
                publisher: null,
                newID,
                new: true
            })
        } catch (error) {
            res.send(error.message)
        }

    }
    // POST /manage-books/publisher
    async createPublisher(req, res, next) {
        try {
            const {publisherID, name, address} = req.body
            const checkPub = Publisher.findByPk(publisherID,{
                raw: true
            })
            const newPub = await Publisher.create({
                publisherID,
                name,
                address
            })
            res.redirect(`/manage-books/publisher/${publisherID}`)
        } catch (error) {
            res.send(error.message)
        }
    }
    // PUT /manage-books/publisher/:publisherID
    async editPublisher(req, res, next) {
        try {
            const publisherID = req.params.publisherID
            const {name, address} = req.body
            const publisher = await Publisher.findByPk(publisherID)
            publisher.set({
                name: name,
                address: address
            })
            await publisher.save()
            res.redirect('back')
        } catch (error) {
            res.send(error.message)
        }
    }
    // GET /manage-books/publisher/:publisherID
    async publisherID(req, res, next) {
        const publisherID = req.params.publisherID
        if(!publisherID){
            redirect('back')
            return
        }
        const publisher = await Publisher.findByPk(publisherID,{
            raw: true
        })
        res.render('manage-books/detailPublisher',{
            publisher
        })

    }
    // DELETE /manage-books/publisher-delete/:publisherID
    async deletePublisher(req, res, next) {
        try {
            const id = req.params.publisherID
            const publisher = await Publisher.destroy({
                where: {
                    publisherID: id
                }
            })
            res.redirect('/manage-books')
        } catch (error) {
            res.send(error.message)
        }
    }

    async statistic(req, res, next) {
        const totalTitle = await Title.count()
        const totalBook = await Title.sum('quantity')
        const totalBookInLib = await Title.sum('quan_in_lib')
        const totalBorrow = totalBook - totalBookInLib
        const totalAuthor = await Author.count()
        const totalType = await Type.count()
        const totalPub = await Publisher.count()
        res.render('manage-books/statistic',{
            totalTitle,
            totalBook,
            totalBookInLib,
            totalBorrow,
            totalType,
            totalAuthor,
            totalPub
        })
    }
}


module.exports = new ManageBookController();

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
