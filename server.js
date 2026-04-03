const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());          
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "bssg@098765",
  database: "mars_app"
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});


app.get("/", (req, res) => {
  res.send("Server is running successfully");
});

app.get("/api/messages", (req, res) => {
  db.query("SELECT * FROM messages", (err, results) => {
    if (err) {
      res.status(500).json({ error: err });
      return;
    }
    res.json(results);
  });
});

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from Backend" });
});

app.post("/api/products", (req, res) => {
  const { name, price, gst, image } = req.body;

  const sql = "INSERT INTO products (name, price, gst, image) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, price, gst, image], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Product saved to MySQL" });
  });
});

app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

app.post("/api/customers", (req, res) => {
  const { name, email, phone } = req.body;

  const sql = "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)";

  db.query(sql, [name, email, phone], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Customer saved to MySQL" });
  });
});

app.get("/api/customers", (req, res) => {
  db.query("SELECT * FROM customers", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

app.post("/api/invoices", (req, res) => {
  const {
    invoiceNo,
    customerName,
    customerPhone,
    subtotal,
    gst,
    grandTotal,
    items
  } = req.body;

  const invoiceSql = `
    INSERT INTO invoices 
    (invoice_no, customer_name, customer_phone, subtotal, gst, grand_total)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    invoiceSql,
    [invoiceNo, customerName, customerPhone, subtotal, gst, grandTotal],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Invoice insert failed" });
      }

      const invoiceId = result.insertId;

      const itemSql = `
        INSERT INTO invoice_items 
        (invoice_id, product_name, price, gst_percent, quantity, total)
        VALUES ?
      `;

      const values = items.map(i => [
        invoiceId,
        i.name,
        i.price,
        i.gst,
        i.qty,
        i.total
      ]);

      db.query(itemSql, [values], (err2) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ message: "Invoice items failed" });
        }

        res.json({ message: "Invoice saved to MySQL" });
      });
    }
  );
});

app.get("/api/invoices", (req, res) => {

  const sql = "SELECT * FROM invoices";

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });

});

app.get("/api/total-sales", (req, res) => {

  const sql = "SELECT SUM(grand_total) AS totalSales FROM invoices";

  db.query(sql, (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ totalSales: result[0].totalSales || 0 });

  });

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});