let products = JSON.parse(localStorage.getItem("products")) || [];
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let invoices = JSON.parse(localStorage.getItem("invoices")) || [];
let cart = [];

function login(){
  if(username.value==="admin" && password.value==="1234"){
    loginBox.classList.add("hidden");
    app.classList.remove("hidden");
    getBackendMessage();
    loadAll();
  } else {
    loginMsg.innerText = "Invalid Login";
  }
}

function logout(){ location.reload(); }

function showSection(id){
  document.querySelectorAll('.card').forEach(c=>c.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function addProduct(){

  const product = {
    name: pname.value,
    price: +pprice.value,
    gst: +pgst.value,
    image: pimage.value
  };

  fetch("http://localhost:3000/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadProductsFromBackend();
  })
  .catch(err => console.error(err));

  pname.value="";
  pprice.value="";
  pgst.value="";
  pimage.value="";
}

function loadProductsFromBackend(){
  fetch("http://localhost:3000/api/products")
    .then(res => res.json())
    .then(data => {
      products = data;
      loadProducts();
      loadCatalog();
      updateDashboard();
    })
    .catch(err => console.error(err));
}

function loadProducts(){
  productTable.innerHTML = "<tr><th>Name</th><th>Price</th><th>GST %</th><th>Final Price</th></tr>";

  products.forEach(p => {
    let price = Number(p.price);
    let gst = Number(p.gst);
    let finalPrice = price + (price * gst / 100);

    productTable.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>₹${p.price}</td>
        <td>${p.gst}%</td>
        <td>₹${finalPrice.toFixed(2)}</td>
      </tr>`;
  });

  // Load products into invoice dropdown
  invoiceProduct.innerHTML = "";

  products.forEach((p, i) => {
    invoiceProduct.innerHTML += `<option value=\"${i}\">${p.name}</option>`;
  });
};

function addCustomer(){

  const customer = {
    name: cname.value,
    email: cemail.value,
    phone: cphone.value
  };

  fetch("http://localhost:3000/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(customer)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadCustomersFromBackend();
  })
  .catch(err => console.error(err));

  cname.value="";
  cphone.value="";
  cemail.value="";
}

function loadCustomersFromBackend(){
  fetch("http://localhost:3000/api/customers")
    .then(res => res.json())
    .then(data => {
      customers = data;
      loadCustomers();
      updateDashboard();
    })
    .catch(err => console.error(err));
}

function loadInvoicesFromBackend(){

  fetch("http://localhost:3000/api/invoices")
    .then(res => res.json())
    .then(data => {
      invoices = data;
      updateDashboard();
    })
    .catch(err => console.error(err));

}

function loadTotalSales(){

  fetch("http://localhost:3000/api/total-sales")
  .then(res => res.json())
  .then(data => {
    document.getElementById("totalSales").innerText = data.totalSales;
  })
  .catch(err => console.error(err));

}

function loadCustomers(){
  customerTable.innerHTML="<tr><th>Name</th><th>Phone</th><th>Email</th></tr>";

  customers.forEach(c=>{
    customerTable.innerHTML+=`<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.email}</td></tr>`;
  });

  invoiceCustomer.innerHTML="";
  customers.forEach((c,i)=>{
    invoiceCustomer.innerHTML+=`<option value='${i}'>${c.name}</option>`;
  });
}

function addToInvoice(){
  let p = products[invoiceProduct.value];
  let q = +qty.value;

  if(!p || q<=0) return;

  let gst = (p.price*p.gst/100)*q;
  let total = (p.price*q)+gst;

  cart.push({...p,qty:q,total});

  renderInvoice();
}

function renderInvoice(){
  invoiceTable.innerHTML="<tr><th>Product</th><th>Price</th><th>GST</th><th>Qty</th><th>Total</th></tr>";

  let sub=0,g=0;

  cart.forEach(i=>{
    let gst=(i.price*i.gst/100)*i.qty;
    sub+=i.price*i.qty;
    g+=gst;

    invoiceTable.innerHTML+=`<tr><td>${i.name}</td><td>${i.price}</td><td>${i.gst}%</td><td>${i.qty}</td><td>₹${i.total}</td></tr>`;
  });

  subTotal.innerText=sub;
  gstTotal.innerText=g;
  grandTotal.innerText=sub+g;
}

function saveInvoice() {

  const customer = customers[invoiceCustomer.value];

  let sub = 0, gst = 0;

  const items = cart.map(item => {
    let itemGST = (item.price * item.gst / 100) * item.qty;
    let total = (item.price * item.qty) + itemGST;

    sub += item.price * item.qty;
    gst += itemGST;

    return {
      name: item.name,
      price: item.price,
      gst: item.gst,
      qty: item.qty,
      total: total
    };
  });

  const invoiceData = {
    invoiceNo: "PV-" + (Date.now()),
    customerName: customer.name,
    customerPhone: customer.phone,
    subtotal: sub,
    gst: gst,
    grandTotal: sub + gst,
    items: items
  };

  fetch("http://localhost:3000/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoiceData)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    cart = [];
    renderInvoice();
    invoices.push(invoiceData);
    updateDashboard();
  })
  .catch(err => console.error(err));
}

function printInvoice() {

  const customer = customers[invoiceCustomer.value];

  document.getElementById("pInvoiceNo").innerText =
    "PV-" + (invoices.length + 1);

  document.getElementById("pInvoiceDate").innerText =
    new Date().toLocaleDateString();

  document.getElementById("pCustomerName").innerText = customer.name;
  document.getElementById("pCustomerPhone").innerText = customer.phone;

  let itemsHTML = "";
  let sub = 0, gst = 0;

  cart.forEach(item => {
    let itemGST = (item.price * item.gst / 100) * item.qty;
    let amount = (item.price * item.qty) + itemGST;

    sub += item.price * item.qty;
    gst += itemGST;

    itemsHTML += `
      <tr>
        <td>${item.name}</td>
        <td>₹${item.price}</td>
        <td>${item.gst}%</td>
        <td>${item.qty}</td>
        <td>₹${amount.toFixed(2)}</td>
      </tr>
    `;
  });

  document.getElementById("pInvoiceItems").innerHTML = itemsHTML;
  document.getElementById("pSubTotal").innerText = sub.toFixed(2);
  document.getElementById("pGST").innerText = gst.toFixed(2);
  document.getElementById("pGrandTotal").innerText = (sub + gst).toFixed(2);

  document.getElementById("printInvoiceArea").classList.remove("hidden");

  window.print();

  document.getElementById("printInvoiceArea").classList.add("hidden");
}

function updateDashboard(){
  totalProducts.innerText=products.length;
  totalCustomers.innerText=customers.length;
  totalInvoices.innerText=invoices.length;

  renderChart(); 
}

function loadAll(){
  loadProductsFromBackend();
  loadCustomersFromBackend();
  loadInvoicesFromBackend();
  loadTotalSales();
  updateDashboard();
  getBackendMessage();
}


let dashboardChart;

function renderChart() {
  const ctx = document.getElementById("dashboardChart").getContext("2d");

  if (dashboardChart) {
    dashboardChart.destroy();
  }

  dashboardChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Products", "Customers", "Invoices"],
      datasets: [{
        label: "System Growth",
        data: [products.length, customers.length, invoices.length],
        borderColor: "#db2777",
        backgroundColor: "rgba(219,39,119,0.3)",
        borderWidth: 4,
        pointRadius: 6,
        pointBackgroundColor: "#db2777",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#000" }
        },
        x: {
          ticks: { color: "#000" }
        }
      }
    }
  });
}

function getBackendMessage() {
  fetch("http://localhost:3000/api/message")
    .then(res => res.json())
    .then(data => {
      alert(data.message);
    })
    .catch(err => console.error("Error:", err));
}

window.addEventListener("load", function(){
  setTimeout(() => {
    document.getElementById("brandIntro").style.display = "none";
  }, 3000);
});

function toggleMenu(){
  document.getElementById("menuDropdown").classList.toggle("hidden");
}