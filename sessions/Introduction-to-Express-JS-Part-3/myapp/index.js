const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  const getBookQuery = `SELECT * FROM book WHERE book_id=${bookId};`;
  const bookArray = await db.get(getBookQuery);
  response.send(bookArray);
  //response.send("Hello word");
});

app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  //console.log(bookDetails);

  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastId;
  response.send({ bookId: bookId });
  console.log(bookId);
});

app.put("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;

  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;

  const dbresponse = await db.run(updateBookQuery);
  response.send(dbresponse);
  console.log(dbresponse);
});

app.delete("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;

  const deletequery = `DELETE FROM book WHERE book_id = ${bookId};`;

  await db.run(deletequery);
  response.send("Book deleted successfully");
});

app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;

  const getQuery = `SELECT * FROM book where author_id=${authorId};`;

  const dbresponse = await db.get(getQuery);
  response.send(dbresponse);
});
