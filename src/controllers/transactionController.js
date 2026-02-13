const { Transaction, Firm, Vehicle, Pricing } = require('../models');
const PDFDocument = require('pdfkit-table');
const XLSX = require('xlsx');

const formatDate = (date) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
};

const buildDateRangeQuery = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return { $gte: start, $lte: end };
};

const calculateDailyTotals = (transactions) => {
  return transactions.reduce((totals, t) => ({
    TotalTon: totals.TotalTon + Number(t.TotalTon),
    RoTon: totals.RoTon + Number(t.RoTon),
    OpenTon: totals.OpenTon + Number(t.OpenTon),
    RoPrice: totals.RoPrice + Number(t.RoPrice),
    OpenPrice: totals.OpenPrice + Number(t.OpenPrice),
    TotalPrice: totals.TotalPrice + Number(t.TotalPrice)
  }), {
    TotalTon: 0,
    RoTon: 0,
    OpenTon: 0,
    RoPrice: 0,
    OpenPrice: 0,
    TotalPrice: 0
  });
};

const transactionController = {
  // Create transaction
  createTransaction: async (req, res) => {
    try {
      const { FirmID, VehicleID, RoNumber, TotalTon, RoTon, TransactionDate } = req.body;

      const firm = await Firm.findOne({ FirmID });
      if (!firm) return res.status(404).json({ message: "Firm not found." });

      const vehicle = await Vehicle.findOne({ VehicleID, FirmID });
      if (!vehicle) return res.status(400).json({ message: "Vehicle does not belong to the selected firm." });

      const pricing = await Pricing.findOne({ FirmID }).sort({ EffectiveDate: -1 });
      if (!pricing) return res.status(400).json({ message: "No pricing data found for the selected firm." });

      if (TotalTon < RoTon) return res.status(400).json({ message: "Total Ton cannot be less than RO Ton." });

      const roPrice = + (RoTon * pricing.RoTonPrice).toFixed(2);
      const openTon = +(TotalTon - RoTon).toFixed(2);
      const openPrice = +(openTon * pricing.OpenTonPrice).toFixed(2);
      const totalPrice = +(roPrice + openPrice).toFixed(2);

      const transaction = new Transaction({
        FirmID,
        VehicleID,
        RoNumber,
        RoTon: +RoTon.toFixed(2),
        RoPrice: roPrice,
        TotalTon: +TotalTon.toFixed(2),
        OpenTon: openTon,
        OpenPrice: openPrice,
        TotalPrice: totalPrice,
        TransactionDate: (() => {
          const date = new Date();
          if (TransactionDate) {
            const provided = new Date(TransactionDate);
            date.setFullYear(provided.getFullYear(), provided.getMonth(), provided.getDate());
            return date;
          }
          return date;
        })()
      });

      await transaction.save();
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get transactions by firm
  getTransactionsByFirm: async (req, res) => {
    try {
      const transactions = await Transaction.find({ FirmID: req.params.firmId })
        .sort({ TransactionDate: -1 })
        .populate('Firm', 'FirmName')
        .populate('Vehicle', 'VehicleNo');

      if (!transactions.length) return res.status(404).json({ message: "No transactions found for this firm." });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Download PDF report
  downloadTransactionsPdf: async (req, res) => {
    try {
      const { startDate, endDate, firmId, roTonPrice, openTonPrice } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required." });
      }

      const query = {
        TransactionDate: buildDateRangeQuery(startDate, endDate)
      };
      if (firmId) query.FirmID = firmId;

      const transactions = await Transaction.find(query)
        .populate('Firm', 'FirmName')
        .populate('Vehicle', 'VehicleNo')
        .sort({ TransactionDate: -1 });

      if (!transactions.length) {
        return res.status(404).json({ message: "No transactions found in the given date range." });
      }

      const firmName = firmId ? (await Firm.findOne({ FirmID: firmId }))?.FirmName || "Unknown Firm" : "All Firms";

      // Determine which prices to use
      let useCustomPrices = false;
      let prices = {
        roTonPrice: 0,
        openTonPrice: 0
      };

      if (roTonPrice && openTonPrice) {
        useCustomPrices = true;
        prices = {
          roTonPrice: Number(roTonPrice) || 0,
          openTonPrice: Number(openTonPrice) || 0
        };
      } else if (firmId) {
        const currentPricing = await Pricing.findOne({ FirmID: firmId }).sort({ EffectiveDate: -1 });
        prices = {
          roTonPrice: Number(currentPricing?.RoTonPrice) || 0,
          openTonPrice: Number(currentPricing?.OpenTonPrice) || 0
        };
      }

      const doc = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        margin: { top: 50, bottom: 50, left: 40, right: 40 },
        bufferPages: true
      });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Transaction_Report_${formatDate(new Date())}.pdf`);
        res.send(Buffer.concat(chunks));
      });

      const tableWidth = 515;
      const leftMargin = 40;

      const addPageHeader = () => {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(18).fillColor('#1e3a5f')
          .text('Transaction Report', { align: 'center' })
          .moveDown(0.2);
        doc.font('Helvetica').fontSize(11).fillColor('#4b5563')
          .text(firmName, { align: 'center' })
          .moveDown(0.1);
        doc.font('Helvetica').fontSize(10).fillColor('#6b7280')
          .text(`Period: ${formatDate(new Date(startDate))} — ${formatDate(new Date(endDate))}`, { align: 'center' })
          .moveDown(0.3);
        doc.moveTo(leftMargin, doc.y).lineTo(leftMargin + tableWidth, doc.y)
          .strokeColor('#e5e7eb').lineWidth(0.5).stroke();
        doc.moveDown(0.6).fillColor('#000000');
      };

      addPageHeader();

      if (useCustomPrices) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor('#6b7280')
          .text(`* Recalculated with custom rates: RO Ton = Rs. ${prices.roTonPrice}, Open Ton = Rs. ${prices.openTonPrice}`, { align: 'center' })
          .fillColor('#000000').moveDown(0.4);
      }

      const tableSettings = {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8).fillColor('#1f2937'),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          const isTotalRow = row && row.some && row.some(c => c === 'Total');
          doc.font(isTotalRow ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor('#000000');
          if (doc.addBackground && indexColumn === 0 && !isTotalRow && indexRow % 2 === 1) {
            doc.addBackground(rectRow, '#f9fafb', 1);
          }
        },
        width: tableWidth,
        padding: [6, 8, 6, 8],
        columnSpacing: 4,
        minRowHeight: 22,
        divider: {
          header: { disabled: false, width: 1, opacity: 0.2 },
          horizontal: { disabled: false, width: 0.3, opacity: 0.4 }
        },
        x: leftMargin
      };

      const tableLayout = {
        headers: ['Sr.', 'Vehicle', 'RO No', 'Total Ton', 'RO Ton', 'RO Price', 'Over Ton', 'Over Price', 'Total Price'],
        rows: [],
        columnWidths: [28, 58, 88, 54, 50, 64, 50, 64, 64],
        headerColor: '#e5e7eb',
        headerOpacity: 1,
        headerFont: 'Helvetica-Bold',
        rowFont: 'Helvetica',
        fontSize: 8
      };

      const checkAndAddNewPage = () => {
        const pageHeight = 752;
        const currentHeight = doc.y;
        const remainingHeight = pageHeight - currentHeight;
        const estimatedTableHeight = (tableLayout.rows.length + 2) * 24;

        if (remainingHeight < estimatedTableHeight || doc.y > 680) {
          doc.addPage({ layout: 'portrait', size: 'A4', margin: { top: 50, bottom: 50, left: 40, right: 40 } });
          addPageHeader();
          doc.y = 95;
        }
      };

      const grouped = transactions.reduce((acc, t) => {
        const date = formatDate(t.TransactionDate);
        acc[date] = acc[date] || [];

        const roTon = Number(t.RoTon);
        const openTon = Number(t.OpenTon);
        const recalculatedRoPrice = +(roTon * prices.roTonPrice).toFixed(2);
        const recalculatedOpenPrice = +(openTon * prices.openTonPrice).toFixed(2);
        const recalculatedTotalPrice = +(recalculatedRoPrice + recalculatedOpenPrice).toFixed(2);

        acc[date].push({
          ...t.toObject(),
          RoPrice: recalculatedRoPrice,
          OpenPrice: recalculatedOpenPrice,
          TotalPrice: recalculatedTotalPrice
        });
        return acc;
      }, {});

      const grandTotals = {
        RoTon: 0,
        OpenTon: 0,
        RoPrice: 0,
        OpenPrice: 0,
        TotalPrice: 0,
        TotalTon: 0
      };

      const sortedDates = Object.keys(grouped).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('/');
        const [dayB, monthB, yearB] = b.split('/');
        const dateA = new Date(2000 + parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(2000 + parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
        return dateA - dateB;
      });

      for (const date of sortedDates) {
        checkAndAddNewPage();

        const dayTrans = grouped[date];
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#374151')
          .text(`Date: ${date}`, { continued: false })
          .moveDown(0.35).fillColor('#000000');

        const table = { ...tableLayout };
        table.rows = [];

        dayTrans.forEach((t, i) => {
          table.rows.push([
            (i + 1).toString(),
            t.Vehicle?.VehicleNo || 'N/A',
            t.RoNumber || '',
            Number(t.TotalTon).toFixed(2),
            Number(t.RoTon).toFixed(2),
            Number(t.RoPrice).toFixed(2),
            Number(t.OpenTon).toFixed(2),
            Number(t.OpenPrice).toFixed(2),
            Number(t.TotalPrice).toFixed(2)
          ]);
        });

        const dailyTotals = calculateDailyTotals(dayTrans);
        table.rows.push([
          'Total',
          '',
          '',
          dailyTotals.TotalTon.toFixed(2),
          dailyTotals.RoTon.toFixed(2),
          dailyTotals.RoPrice.toFixed(2),
          dailyTotals.OpenTon.toFixed(2),
          dailyTotals.OpenPrice.toFixed(2),
          dailyTotals.TotalPrice.toFixed(2)
        ]);

        await doc.table(table, tableSettings);
        doc.moveDown(0.5);

        Object.keys(grandTotals).forEach(key => {
          grandTotals[key] += dailyTotals[key];
        });
      }

      checkAndAddNewPage();
      doc.moveDown(0.6);
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#1e3a5f')
        .text('Summary', { align: 'center' })
        .moveDown(0.4).fillColor('#000000');

      const grandTable = {
        ...tableLayout,
        headers: ['Total Ton', 'RO Ton', 'RO Price', 'Over Ton', 'Over Price', 'Total Price'],
        columnWidths: [82, 82, 85, 82, 85, 99],
        rows: [[
          grandTotals.TotalTon.toFixed(2),
          grandTotals.RoTon.toFixed(2),
          grandTotals.RoPrice.toFixed(2),
          grandTotals.OpenTon.toFixed(2),
          grandTotals.OpenPrice.toFixed(2),
          grandTotals.TotalPrice.toFixed(2)
        ]]
      };

      await doc.table(grandTable, {
        ...tableSettings,
        width: tableWidth,
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9).fillColor('#1f2937'),
        prepareRow: () => doc.font('Helvetica-Bold').fontSize(9)
      });

      doc.font('Helvetica').fontSize(8).fillColor('#9ca3af')
        .text(`Generated on ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`, leftMargin, doc.page.height - 40, { align: 'left' });

      doc.end();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get transaction by ID
  getTransaction: async (req, res) => {
    try {
      const transaction = await Transaction.findOne({ TransactionID: req.params.id })
        .populate('Firm', 'FirmName')
        .populate('Vehicle', 'VehicleNo');

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found." });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get today's total ton
  getTodayTotalTon: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await Transaction.aggregate([
        {
          $match: {
            TransactionDate: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            totalTon: { $sum: { $toDouble: "$TotalTon" } },
            roTon: { $sum: { $toDouble: "$RoTon" } },
            openTon: { $sum: { $toDouble: "$OpenTon" } }
          }
        }
      ]);

      res.json({
        totalTon: result.length > 0 ? Number(result[0].totalTon || 0).toFixed(2) : "0.00",
        roTon: result.length > 0 ? Number(result[0].roTon || 0).toFixed(2) : "0.00",
        openTon: result.length > 0 ? Number(result[0].openTon || 0).toFixed(2) : "0.00"
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get daily total ton
  getDailyTotalTon: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totals = await Transaction.aggregate([
        {
          $match: {
            TransactionDate: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            totalTon: { $sum: { $toDouble: "$TotalTon" } }
          }
        }
      ]);

      res.json(totals.length > 0 ? totals[0] : { totalTon: 0 });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get weekly truck load count
  getWeeklyTruckLoadCount: async (req, res) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const count = await Transaction.countDocuments({
        TransactionDate: { $gte: startDate }
      });

      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all transactions
  getAllTransactions: async (req, res) => {
    try {
      const transactions = await Transaction.find()
        .populate('Firm', 'FirmName')
        .populate('Vehicle', 'VehicleNo')
        .sort({ TransactionDate: -1 });

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Download Excel report
  downloadTransactionsExcel: async (req, res) => {
    try {
      const { startDate, endDate, firmId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required." });
      }

      const query = {
        TransactionDate: buildDateRangeQuery(startDate, endDate)
      };
      if (firmId) query.FirmID = firmId;

      const transactions = await Transaction.find(query)
        .populate('Firm', 'FirmName')
        .populate('Vehicle', 'VehicleNo')
        .sort({ TransactionDate: -1 });

      if (!transactions.length) {
        return res.status(404).json({ message: "No transactions found in the given date range." });
      }

      const workbook = XLSX.utils.book_new();
      const data = transactions.map(t => ({
        Date: new Date(t.TransactionDate).toLocaleDateString(),
        Vehicle: t.Vehicle?.VehicleNo || 'N/A',
        'RO Number': t.RoNumber,
        'Total Ton': Number(t.TotalTon),
        'RO Ton': Number(t.RoTon),
        'RO Price': Number(t.RoPrice),
        'Over Ton': Number(t.OpenTon),
        'Over Price': Number(t.OpenPrice),
        'Total Price': Number(t.TotalPrice)
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Transaction_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get today's total amount
  getTodayTotalAmount: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await Transaction.aggregate([
        {
          $match: {
            TransactionDate: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$TotalPrice" } },
            roAmount: { $sum: { $toDouble: "$RoPrice" } },
            openAmount: { $sum: { $toDouble: "$OpenPrice" } },
            transactionCount: { $sum: 1 }
          }
        }
      ]);

      res.json({
        totalAmount: result.length > 0 ? Number(result[0].totalAmount || 0).toFixed(2) : "0.00",
        roAmount: result.length > 0 ? Number(result[0].roAmount || 0).toFixed(2) : "0.00",
        openAmount: result.length > 0 ? Number(result[0].openAmount || 0).toFixed(2) : "0.00",
        transactionCount: result.length > 0 ? Number(result[0].transactionCount || 0) : 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update transaction
  updateTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      const { FirmID, VehicleID, RoNumber, TotalTon, RoTon, TransactionDate } = req.body;

      const transaction = await Transaction.findOne({ TransactionID: id });
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found." });
      }

      // Verify firm exists
      const firm = await Firm.findOne({ FirmID });
      if (!firm) {
        return res.status(404).json({ message: "Firm not found." });
      }

      // Verify vehicle belongs to firm
      const vehicle = await Vehicle.findOne({ VehicleID, FirmID });
      if (!vehicle) {
        return res.status(400).json({ message: "Vehicle does not belong to the selected firm." });
      }

      // Get latest pricing
      const pricing = await Pricing.findOne({ FirmID }).sort({ EffectiveDate: -1 });
      if (!pricing) {
        return res.status(400).json({ message: "No pricing data found for the selected firm." });
      }

      if (TotalTon < RoTon) {
        return res.status(400).json({ message: "Total Ton cannot be less than RO Ton." });
      }

      // Calculate prices
      const roPrice = +(RoTon * pricing.RoTonPrice).toFixed(2);
      const openTon = +(TotalTon - RoTon).toFixed(2);
      const openPrice = +(openTon * pricing.OpenTonPrice).toFixed(2);
      const totalPrice = +(roPrice + openPrice).toFixed(2);

      // Update transaction
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { TransactionID: id },
        {
          FirmID,
          VehicleID,
          RoNumber,
          RoTon: +RoTon.toFixed(2),
          RoPrice: roPrice,
          TotalTon: +TotalTon.toFixed(2),
          OpenTon: openTon,
          OpenPrice: openPrice,
          TotalPrice: totalPrice,
          TransactionDate: (() => {
            if (TransactionDate) {
              const date = new Date();
              const provided = new Date(TransactionDate);
              date.setFullYear(provided.getFullYear(), provided.getMonth(), provided.getDate());
              return date;
            }
            return transaction.TransactionDate;
          })()
        },
        { new: true }
      ).populate('Firm', 'FirmName').populate('Vehicle', 'VehicleNo');

      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete transaction
  deleteTransaction: async (req, res) => {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findOneAndDelete({ TransactionID: id });
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found." });
      }

      res.json({ message: "Transaction deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get weekly total ton
  getWeeklyTotalTon: async (req, res) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);

      const result = await Transaction.aggregate([
        {
          $match: {
            TransactionDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalTon: { $sum: { $toDouble: "$TotalTon" } },
            roTon: { $sum: { $toDouble: "$RoTon" } },
            openTon: { $sum: { $toDouble: "$OpenTon" } },
            transactionCount: { $sum: 1 }
          }
        }
      ]);

      res.json({
        totalTon: result.length > 0 ? Number(result[0].totalTon || 0).toFixed(2) : "0.00",
        roTon: result.length > 0 ? Number(result[0].roTon || 0).toFixed(2) : "0.00",
        openTon: result.length > 0 ? Number(result[0].openTon || 0).toFixed(2) : "0.00",
        transactionCount: result.length > 0 ? Number(result[0].transactionCount || 0) : 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = transactionController;
