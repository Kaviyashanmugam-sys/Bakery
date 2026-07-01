const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const { asyncHandler } = require("../middleware/errorHandler");

async function fetchOrdersForReport(query) {
  const { from, to, status } = query;
  const filter = {};
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (status) filter.status = status;
  return Order.find(filter).sort({ createdAt: -1 });
}

// GET /api/reports/orders/excel?from=&to=&status=
const exportOrdersExcel = asyncHandler(async (req, res) => {
  const orders = await fetchOrdersForReport(req.query);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Orders");

  sheet.columns = [
    { header: "Order ID", key: "orderId", width: 22 },
    { header: "Date", key: "date", width: 14 },
    { header: "Customer", key: "customerName", width: 20 },
    { header: "Phone", key: "customerPhone", width: 15 },
    { header: "Items", key: "items", width: 40 },
    { header: "Subtotal", key: "itemsTotal", width: 12 },
    { header: "GST", key: "gstAmount", width: 10 },
    { header: "Total", key: "totalAmount", width: 12 },
    { header: "Fulfillment", key: "fulfillmentType", width: 12 },
    { header: "Payment", key: "paymentMethod", width: 10 },
    { header: "Payment Status", key: "paymentStatus", width: 14 },
    { header: "Status", key: "status", width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };

  orders.forEach((o) => {
    sheet.addRow({
      orderId: o.orderId,
      date: o.createdAt.toISOString().slice(0, 10),
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      items: o.items.map((i) => `${i.name} x${i.quantity}`).join(", "),
      itemsTotal: o.itemsTotal,
      gstAmount: o.gstAmount,
      totalAmount: o.totalAmount,
      fulfillmentType: o.fulfillmentType,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
    });
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=orders_report_${Date.now()}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
});

// GET /api/reports/orders/pdf?from=&to=&status=
const exportOrdersPDF = asyncHandler(async (req, res) => {
  const orders = await fetchOrdersForReport(req.query);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=orders_report_${Date.now()}.pdf`);

  const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
  doc.pipe(res);

  doc.fontSize(16).text(`${process.env.BAKERY_NAME || "Bakery"} - Orders Report`, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(9).text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
  doc.moveDown(1);

  const tableTop = doc.y;
  const colWidths = [90, 60, 90, 80, 150, 60, 70, 80, 70];
  const headers = ["Order ID", "Date", "Customer", "Phone", "Items", "Subtotal", "GST", "Total", "Status"];

  let x = doc.page.margins.left;
  doc.fontSize(9).font("Helvetica-Bold");
  headers.forEach((h, i) => {
    doc.text(h, x, tableTop, { width: colWidths[i] });
    x += colWidths[i];
  });

  let y = tableTop + 18;
  doc.font("Helvetica").fontSize(8);

  orders.forEach((o) => {
    if (y > doc.page.height - 50) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    x = doc.page.margins.left;
    const rowValues = [
      o.orderId,
      o.createdAt.toISOString().slice(0, 10),
      o.customerName,
      o.customerPhone,
      o.items.map((i) => `${i.name} x${i.quantity}`).join(", "),
      String(o.itemsTotal),
      String(o.gstAmount),
      String(o.totalAmount),
      o.status,
    ];
    rowValues.forEach((val, i) => {
      doc.text(val, x, y, { width: colWidths[i] });
      x += colWidths[i];
    });
    y += 16;
  });

  doc.end();
});

module.exports = { exportOrdersExcel, exportOrdersPDF };
