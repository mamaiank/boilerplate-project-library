/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const mongoose = require("mongoose");
mongoose.connect(MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useFindAndModify: false,
});

const Schema = mongoose.Schema;
const bookSchema = new Schema({
  title: String,
  comments: { type: [String], default: [] },
});

const Book = mongoose.model("Book", bookSchema, "books2");

module.exports = function (app) {
  app
    .route("/api/books")
    .get((request, response) => {
      Book.find({}, (error, books) => {
        if (error) {
          console.log(error.message);
          return response.status(500).send("Failed to retreive books");
        }

        const bookSummaries = books.map(({ _id, title, comments }) => ({
          _id,
          title,
          commentcount: comments.length,
        }));
        response.json(bookSummaries);
      });
    })

    .post((request, response) => {
      var title = request.body.title;
      if (!title) {
        return response.send("missing required field title");
      }

      const book = new Book({ title });
      book.save((error, book) => {
        if (error) {
          console.log(error.message);
          return response.status(500).send("Failed to save book");
        }

        const bookToSend = { _id: book._id, title: book.title };
        response.json(bookToSend);
      });
    })

    .delete((request, response) => {
      Book.deleteMany({}, (error, document) => {
        if (error) {
          console.log(error.message);
          return response.status(500).send("Failed to delete books");
        }

        response.send("complete delete successful");
      });
    });

  app
    .route("/api/books/:id")
    .get((request, response) => {
      var bookid = request.params.id;
      Book.findById(bookid, (error, book) => {
        if (error) {
          console.log(error.message);
          if (error.message.includes("Cast to ObjectId failed")) {
            return response.send("no book exists");
          }

          return response.status(500).send("please try later");
        } else {
          if (!book) {
            return response.send("no book exists");
          }

          let { _id, title, comments } = book;
          if (!comments) {
            return response.send("missing required field comment");
          }
          response.json({ _id, title, comments });
        }
      });
    })

    .post((request, response) => {
      var bookid = request.params.id;
      var comment = request.body.comment;
      //json res format same as .get
      Book.findOneAndUpdate(
        { _id: bookid },
        { $push: { comments: comment } },
        { new: true },
        (error, book) => {
          if (error) {
            if (error.message.includes("Cast to ObjectId failed")) {
              return response.send("no book exists");
            }

            return response.status(500).send("please try later");
          } else {
            if (!book) {
              return response.send("no book exists");
            }

            let { _id, title, comments } = book;
            response.json({ _id, title, comments });
          }
        }
      );
    })

    .delete((request, response) => {
      var bookid = request.params.id;
      Book.findByIdAndRemove(bookid, (error, book) => {
        if (error) {
          if (error.message.includes("Cast to ObjectId failed")) {
            return response.send("no book exists");
          }

          return response.status(500).send("please try later");
        }

        if (!book) {
          return response.send("no book exists");
        }

        response.send("delete successful");
      });
    });
};
