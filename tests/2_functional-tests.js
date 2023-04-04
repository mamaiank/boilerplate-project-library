/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  // test('#example Test GET /api/books', function(done){
  //    chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, response){
  //       assert.equal(response.status, 200);
  //       assert.isArray(response.body, 'response should be an array');
  //       assert.property(response.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(response.body[0], 'title', 'Books in array should contain title');
  //       assert.property(response.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    let _id;
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "POST book" })
            .end((error, response) => {
              assert.equal(response.status, 200);
              const body = response.body;
              assert.isDefined(body._id, "book should have an id");
              _id = body._id;
              assert.equal(
                body.title,
                "POST book",
                "book should have the title sent"
              );
              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({})
            .end((error, response) => {
              assert.equal(response.status, 200);
              assert.equal(
                response.text,
                "missing required field title",
                "book cannot be created without a title"
              );
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function (err, response) {
            assert.equal(response.status, 200);
            assert.isArray(response.body, "response should be an array");
            assert.property(
              response.body[0],
              "commentcount",
              "Books in array should contain commentcount"
            );
            assert.property(
              response.body[0],
              "title",
              "Books in array should contain title"
            );
            assert.property(
              response.body[0],
              "_id",
              "Books in array should contain _id"
            );
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .get("/api/books/12345")
          .end(function (err, response) {
            assert.equal(response.status, 200);
            assert.equal(response.text, "no book exists");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .get("/api/books/" + _id)
          .end(function (error, response) {
            assert.equal(response.status, 200);
            assert.equal(response.body.title, "POST book");
            assert.isArray(response.body.comments);
            done();
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .post("/api/books/" + _id)
            .send({ comment: "A great book" })
            .end(function (error, response) {
              assert.equal(response.status, 200);
              assert.equal(response.body.title, "POST book");
              assert.isAtLeast(response.body.comments.length, 1);
              done();
            });
        });
        test("Test POST /api/books/[id] with no comment given", function (done) {
          chai
            .request(server)
            .post("/api/books/" + _id)
            .send({ title: "POST book" })
            .end((error, response) => {
              assert.equal(response.status, 200);
              assert.equal(
                response.text,
                "missing required field comment",
                "book cannot be update without a comment"
              );
              done();
            });
        });
        test("Test POST /api/books/[id] with id not in db", function (done) {
          chai
            .request(server)
            .get("/api/books/12345")
            .end(function (err, response) {
              assert.equal(response.status, 200);
              assert.equal(response.text, "no book exists");
              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book with id", function () {
      test("Test DELETE /api/books/[id] with id", function (done) {
        chai
          .request(server)
          .delete("/api/books/" + _id)
          .end(function (error, response) {
            assert.equal(response.status, 200);
            assert.equal(
              response.text,
              "delete successful",
              "book can be delete"
            );
            done();
          });
      });
      test("Test DELETE /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/12345")
          .end(function (err, response) {
            assert.equal(response.status, 200);
            assert.equal(response.text, "no book exists");
            done();
          });
      });
    });

    suite("DELETE /api/books] => delete all book", function () {
      test("Test DELETE /api/books", function (done) {
        chai
          .request(server)
          .delete("/api/books")
          .end(function (error, response) {
            assert.equal(response.status, 200);
            assert.equal(response.text, "complete delete successful");
            chai.request(server).get("/");
            done();
          });
      });
    });
  });
});
