const { QuickTransaction } = require('../models');
const PDFDocument = require('pdfkit-table');
const XLSX = require('xlsx');

const formatDate = (date) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
};

const calculateDailyTotals = (transactions) => {
  return transactions.reduce((totals, t) => ({
    TotalTon: totals.TotalTon + Number(t.TotalTon),
    RoTon: totals.RoTon + Number(t.RoTon),
    OpenTon: totals.OpenTon + Number(t.OpenTon),
    RoAmount: totals.RoAmount + Number(t.RoAmount),
    OpenAmount: totals.OpenAmount + Number(t.OpenAmount),
    TotalAmount: totals.TotalAmount + Number(t.TotalAmount),
    CashAmount: totals.CashAmount + Number(t.CashAmount),
    OnlineAmount: totals.OnlineAmount + Number(t.OnlineAmount)
  }), {
    TotalTon: 0,
    RoTon: 0,
    OpenTon: 0,
    RoAmount: 0,
    OpenAmount: 0,
    TotalAmount: 0,
    CashAmount: 0,
    OnlineAmount: 0
  });
};

const quickTransactionController = {
  // Create quick transaction
  createQuickTransaction: async (req, res) => {
    try {
      const {
        VehicleNo,
        DriverName,
        DriverNumber,
        RoTon,
        OpenTon,
        RoTonPrice,
        OpenTonPrice,
        CashAmount,
        OnlineAmount,
        OnlinePaymentDetails,
        TransactionDate,
        Remarks
      } = req.body;

      // Validate required fields
      if (RoTon === undefined || RoTon === null) {
        return res.status(400).json({ message: "RO Ton is required." });
      }
      if (OpenTon === undefined || OpenTon === null) {
        return res.status(400).json({ message: "Open Ton is required." });
      }
      if (RoTonPrice === undefined || RoTonPrice === null) {
        return res.status(400).json({ message: "RO Ton Price is required." });
      }
      if (OpenTonPrice === undefined || OpenTonPrice === null) {
        return res.status(400).json({ message: "Open Ton Price is required." });
      }

      // Calculate amounts
      const roAmount = +(Number(RoTon) * Number(RoTonPrice)).toFixed(2);
      const openAmount = +(Number(OpenTon) * Number(OpenTonPrice)).toFixed(2);
      const totalAmount = +(roAmount + openAmount).toFixed(2);
      const totalTon = +(Number(RoTon) + Number(OpenTon)).toFixed(2);

      // Validate payment amounts
      const cashAmt = Number(CashAmount) || 0;
      const onlineAmt = Number(OnlineAmount) || 0;
      const totalPayment = +(cashAmt + onlineAmt).toFixed(2);

      if (totalPayment !== totalAmount) {
        return res.status(400).json({
          message: `Payment mismatch. Total Amount: ${totalAmount}, Cash + Online: ${totalPayment}. Difference: ${(totalAmount - totalPayment).toFixed(2)}`
        });
      }

      // If online amount > 0, payment details should be provided
      if (onlineAmt > 0 && !OnlinePaymentDetails) {
        return res.status(400).json({ message: "Online payment details are required when online amount is provided." });
      }

      const quickTransaction = new QuickTransaction({
        VehicleNo: VehicleNo || null,
        DriverName: DriverName || null,
        DriverNumber: DriverNumber || null,
        RoTon: +Number(RoTon).toFixed(2),
        OpenTon: +Number(OpenTon).toFixed(2),
        TotalTon: totalTon,
        RoTonPrice: +Number(RoTonPrice).toFixed(2),
        OpenTonPrice: +Number(OpenTonPrice).toFixed(2),
        RoAmount: roAmount,
        OpenAmount: openAmount,
        TotalAmount: totalAmount,
        CashAmount: +cashAmt.toFixed(2),
        OnlineAmount: +onlineAmt.toFixed(2),
        OnlinePaymentDetails: onlineAmt > 0 ? OnlinePaymentDetails : null,
        TransactionDate: (() => {
          const date = new Date();
          if (TransactionDate) {
            const provided = new Date(TransactionDate);
            date.setFullYear(provided.getFullYear(), provided.getMonth(), provided.getDate());
            return date;
          }
          return date;
        })(),
        Remarks: Remarks || null
      });

      await quickTransaction.save();
      res.status(201).json(quickTransaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all quick transactions
  getAllQuickTransactions: async (req, res) => {
    try {
      const transactions = await QuickTransaction.find()
        .sort({ TransactionDate: -1 });

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get quick transaction by ID
  getQuickTransaction: async (req, res) => {
    try {
      const transaction = await QuickTransaction.findOne({ QuickTransactionID: req.params.id });

      if (!transaction) {
        return res.status(404).json({ message: "Quick transaction not found." });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update quick transaction
  updateQuickTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        VehicleNo,
        DriverName,
        DriverNumber,
        RoTon,
        OpenTon,
        RoTonPrice,
        OpenTonPrice,
        CashAmount,
        OnlineAmount,
        OnlinePaymentDetails,
        TransactionDate,
        Remarks
      } = req.body;

      const transaction = await QuickTransaction.findOne({ QuickTransactionID: id });
      if (!transaction) {
        return res.status(404).json({ message: "Quick transaction not found." });
      }

      // Calculate amounts
      const roAmount = +(Number(RoTon) * Number(RoTonPrice)).toFixed(2);
      const openAmount = +(Number(OpenTon) * Number(OpenTonPrice)).toFixed(2);
      const totalAmount = +(roAmount + openAmount).toFixed(2);
      const totalTon = +(Number(RoTon) + Number(OpenTon)).toFixed(2);

      // Validate payment amounts
      const cashAmt = Number(CashAmount) || 0;
      const onlineAmt = Number(OnlineAmount) || 0;
      const totalPayment = +(cashAmt + onlineAmt).toFixed(2);

      if (totalPayment !== totalAmount) {
        return res.status(400).json({
          message: `Payment mismatch. Total Amount: ${totalAmount}, Cash + Online: ${totalPayment}. Difference: ${(totalAmount - totalPayment).toFixed(2)}`
        });
      }

      // If online amount > 0, payment details should be provided
      if (onlineAmt > 0 && !OnlinePaymentDetails) {
        return res.status(400).json({ message: "Online payment details are required when online amount is provided." });
      }

      const updatedTransaction = await QuickTransaction.findOneAndUpdate(
        { QuickTransactionID: id },
        {
          VehicleNo: VehicleNo || null,
          DriverName: DriverName || null,
          DriverNumber: DriverNumber || null,
          RoTon: +Number(RoTon).toFixed(2),
          OpenTon: +Number(OpenTon).toFixed(2),
          TotalTon: totalTon,
          RoTonPrice: +Number(RoTonPrice).toFixed(2),
          OpenTonPrice: +Number(OpenTonPrice).toFixed(2),
          RoAmount: roAmount,
          OpenAmount: openAmount,
          TotalAmount: totalAmount,
          CashAmount: +cashAmt.toFixed(2),
          OnlineAmount: +onlineAmt.toFixed(2),
          OnlinePaymentDetails: onlineAmt > 0 ? OnlinePaymentDetails : null,
          TransactionDate: (() => {
            if (TransactionDate) {
              const date = new Date();
              const provided = new Date(TransactionDate);
              date.setFullYear(provided.getFullYear(), provided.getMonth(), provided.getDate());
              return date;
            }
            return transaction.TransactionDate;
          })(),
          Remarks: Remarks || null
        },
        { new: true }
      );

      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete quick transaction
  deleteQuickTransaction: async (req, res) => {
    try {
      const { id } = req.params;

      const transaction = await QuickTransaction.findOneAndDelete({ QuickTransactionID: id });
      if (!transaction) {
        return res.status(404).json({ message: "Quick transaction not found." });
      }

      res.json({ message: "Quick transaction deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get today's totals
  getTodayTotals: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await QuickTransaction.aggregate([
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
            openTon: { $sum: { $toDouble: "$OpenTon" } },
            totalAmount: { $sum: { $toDouble: "$TotalAmount" } },
            roAmount: { $sum: { $toDouble: "$RoAmount" } },
            openAmount: { $sum: { $toDouble: "$OpenAmount" } },
            cashAmount: { $sum: { $toDouble: "$CashAmount" } },
            onlineAmount: { $sum: { $toDouble: "$OnlineAmount" } },
            transactionCount: { $sum: 1 }
          }
        }
      ]);

      res.json({
        totalTon: result.length > 0 ? Number(result[0].totalTon || 0).toFixed(2) : "0.00",
        roTon: result.length > 0 ? Number(result[0].roTon || 0).toFixed(2) : "0.00",
        openTon: result.length > 0 ? Number(result[0].openTon || 0).toFixed(2) : "0.00",
        totalAmount: result.length > 0 ? Number(result[0].totalAmount || 0).toFixed(2) : "0.00",
        roAmount: result.length > 0 ? Number(result[0].roAmount || 0).toFixed(2) : "0.00",
        openAmount: result.length > 0 ? Number(result[0].openAmount || 0).toFixed(2) : "0.00",
        cashAmount: result.length > 0 ? Number(result[0].cashAmount || 0).toFixed(2) : "0.00",
        onlineAmount: result.length > 0 ? Number(result[0].onlineAmount || 0).toFixed(2) : "0.00",
        transactionCount: result.length > 0 ? Number(result[0].transactionCount || 0) : 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get weekly totals
  getWeeklyTotals: async (req, res) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);

      const result = await QuickTransaction.aggregate([
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
            totalAmount: { $sum: { $toDouble: "$TotalAmount" } },
            roAmount: { $sum: { $toDouble: "$RoAmount" } },
            openAmount: { $sum: { $toDouble: "$OpenAmount" } },
            cashAmount: { $sum: { $toDouble: "$CashAmount" } },
            onlineAmount: { $sum: { $toDouble: "$OnlineAmount" } },
            transactionCount: { $sum: 1 }
          }
        }
      ]);

      res.json({
        totalTon: result.length > 0 ? Number(result[0].totalTon || 0).toFixed(2) : "0.00",
        roTon: result.length > 0 ? Number(result[0].roTon || 0).toFixed(2) : "0.00",
        openTon: result.length > 0 ? Number(result[0].openTon || 0).toFixed(2) : "0.00",
        totalAmount: result.length > 0 ? Number(result[0].totalAmount || 0).toFixed(2) : "0.00",
        roAmount: result.length > 0 ? Number(result[0].roAmount || 0).toFixed(2) : "0.00",
        openAmount: result.length > 0 ? Number(result[0].openAmount || 0).toFixed(2) : "0.00",
        cashAmount: result.length > 0 ? Number(result[0].cashAmount || 0).toFixed(2) : "0.00",
        onlineAmount: result.length > 0 ? Number(result[0].onlineAmount || 0).toFixed(2) : "0.00",
        transactionCount: result.length > 0 ? Number(result[0].transactionCount || 0) : 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get payment summary (cash vs online breakdown)
  getPaymentSummary: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const query = {};
      if (startDate && endDate) {
        query.TransactionDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const result = await QuickTransaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$TotalAmount" } },
            cashAmount: { $sum: { $toDouble: "$CashAmount" } },
            onlineAmount: { $sum: { $toDouble: "$OnlineAmount" } },
            transactionCount: { $sum: 1 }
          }
        }
      ]);

      // Get online payment details breakdown
      const onlineDetails = await QuickTransaction.aggregate([
        {
          $match: {
            ...query,
            OnlineAmount: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: "$OnlinePaymentDetails",
            totalOnlineAmount: { $sum: { $toDouble: "$OnlineAmount" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalOnlineAmount: -1 } }
      ]);

      res.json({
        summary: {
          totalAmount: result.length > 0 ? Number(result[0].totalAmount || 0).toFixed(2) : "0.00",
          cashAmount: result.length > 0 ? Number(result[0].cashAmount || 0).toFixed(2) : "0.00",
          onlineAmount: result.length > 0 ? Number(result[0].onlineAmount || 0).toFixed(2) : "0.00",
          cashPercentage: result.length > 0 && result[0].totalAmount > 0
            ? ((result[0].cashAmount / result[0].totalAmount) * 100).toFixed(2)
            : "0.00",
          onlinePercentage: result.length > 0 && result[0].totalAmount > 0
            ? ((result[0].onlineAmount / result[0].totalAmount) * 100).toFixed(2)
            : "0.00",
          transactionCount: result.length > 0 ? Number(result[0].transactionCount || 0) : 0
        },
        onlineBreakdown: onlineDetails.map(d => ({
          paymentMethod: d._id || 'Unknown',
          amount: Number(d.totalOnlineAmount || 0).toFixed(2),
          count: d.count
        }))
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Download PDF report
  downloadQuickTransactionsPdf: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required." });
      }

      const query = {
        TransactionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const transactions = await QuickTransaction.find(query)
        .sort({ TransactionDate: -1 });

      if (!transactions.length) {
        return res.status(404).json({ message: "No quick transactions found in the given date range." });
      }

      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: { top: 40, bottom: 40, left: 30, right: 30 },
        bufferPages: true
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Quick_Transaction_Report_${formatDate(new Date())}.pdf`);
        res.send(Buffer.concat(chunks));
      });

      const addPageHeader = () => {
        doc.font('Helvetica-Bold').fontSize(14)
          .text('Quick Transaction Report', { align: 'center' })
          .moveDown(0.3);
        doc.font('Helvetica').fontSize(10)
          .text(`Date Range: ${formatDate(new Date(startDate))} - ${formatDate(new Date(endDate))}`,
            { align: 'center' })
          .moveDown(0.5);
      };

      addPageHeader();

      // Add custom pricing note if used
      if (useCustomPrices) {
        doc.font('Helvetica-Oblique').fontSize(9)
          .fillColor('#666666')
          .text(`* Recalculated with custom prices: RO Ton = ₹${customPrices.roTonPrice}, Open Ton = ₹${customPrices.openTonPrice}`,
            { align: 'center' })
          .fillColor('#000000')
          .moveDown(0.3);
      }

      const tableSettings = {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(7),
        prepareRow: () => doc.font('Helvetica').fontSize(7),
        width: 760,
        padding: [3, 2, 3, 2],
        divider: {
          header: { disabled: false, width: 1, opacity: 1 },
          horizontal: { disabled: false, width: 0.5, opacity: 0.5 }
        },
        x: 30,
        columnSpacing: 2
      };

      const tableLayout = {
        headers: ['Sr.', 'Vehicle', 'RO Ton', 'Open Ton', 'Total Ton', 'RO Price', 'Open Price', 'Total Amt', 'Cash', 'Online', 'Online Details'],
        rows: [],
        columnWidths: [30, 70, 55, 55, 55, 60, 60, 65, 65, 65, 180],
        headerColor: '#eeeeee',
        headerOpacity: 1,
        headerFont: 'Helvetica-Bold',
        rowFont: 'Helvetica',
        fontSize: 7
      };

      const checkAndAddNewPage = () => {
        const pageHeight = 560;
        const currentHeight = doc.y;
        const remainingHeight = pageHeight - currentHeight;
        const estimatedTableHeight = (tableLayout.rows.length + 2) * 18;

        if (remainingHeight < estimatedTableHeight || doc.y > 480) {
          doc.addPage();
          addPageHeader();
          doc.y = 100;
        }
      };

      // Group by date and optionally recalculate with custom prices
      const grouped = transactions.reduce((acc, t) => {
        const date = formatDate(t.TransactionDate);
        acc[date] = acc[date] || [];

        let transaction = t.toObject();

        // Recalculate amounts if custom prices provided
        if (useCustomPrices) {
          const roTon = Number(t.RoTon);
          const openTon = Number(t.OpenTon);
          const recalculatedRoAmount = +(roTon * customPrices.roTonPrice).toFixed(2);
          const recalculatedOpenAmount = +(openTon * customPrices.openTonPrice).toFixed(2);
          const recalculatedTotalAmount = +(recalculatedRoAmount + recalculatedOpenAmount).toFixed(2);

          transaction = {
            ...transaction,
            RoAmount: recalculatedRoAmount,
            OpenAmount: recalculatedOpenAmount,
            TotalAmount: recalculatedTotalAmount,
            // Keep original cash/online split ratio
            CashAmount: transaction.CashAmount,
            OnlineAmount: transaction.OnlineAmount
          };
        }

        acc[date].push(transaction);
        return acc;
      }, {});

      const grandTotals = {
        RoTon: 0,
        OpenTon: 0,
        TotalTon: 0,
        RoAmount: 0,
        OpenAmount: 0,
        TotalAmount: 0,
        CashAmount: 0,
        OnlineAmount: 0
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
        doc.font('Helvetica-Bold').fontSize(10)
          .text(`Date: ${date}`, { continued: false })
          .moveDown(0.3);

        const table = { ...tableLayout };
        table.rows = [];

        dayTrans.forEach((t, i) => {
          table.rows.push([
            (i + 1).toString(),
            t.VehicleNo || '-',
            Number(t.RoTon).toFixed(2),
            Number(t.OpenTon).toFixed(2),
            Number(t.TotalTon).toFixed(2),
            Number(t.RoAmount).toFixed(2),
            Number(t.OpenAmount).toFixed(2),
            Number(t.TotalAmount).toFixed(2),
            Number(t.CashAmount).toFixed(2),
            Number(t.OnlineAmount).toFixed(2),
            t.OnlinePaymentDetails || '-'
          ]);
        });

        const dailyTotals = calculateDailyTotals(dayTrans);
        table.rows.push([
          'Total',
          '',
          dailyTotals.RoTon.toFixed(2),
          dailyTotals.OpenTon.toFixed(2),
          dailyTotals.TotalTon.toFixed(2),
          dailyTotals.RoAmount.toFixed(2),
          dailyTotals.OpenAmount.toFixed(2),
          dailyTotals.TotalAmount.toFixed(2),
          dailyTotals.CashAmount.toFixed(2),
          dailyTotals.OnlineAmount.toFixed(2),
          ''
        ]);

        await doc.table(table, tableSettings);
        doc.moveDown(0.5);

        // Add to grand totals
        grandTotals.RoTon += dailyTotals.RoTon;
        grandTotals.OpenTon += dailyTotals.OpenTon;
        grandTotals.TotalTon += dailyTotals.TotalTon;
        grandTotals.RoAmount += dailyTotals.RoAmount;
        grandTotals.OpenAmount += dailyTotals.OpenAmount;
        grandTotals.TotalAmount += dailyTotals.TotalAmount;
        grandTotals.CashAmount += dailyTotals.CashAmount;
        grandTotals.OnlineAmount += dailyTotals.OnlineAmount;
      }

      // Grand totals section
      checkAndAddNewPage();
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(12)
        .text('Grand Totals', { align: 'center' })
        .moveDown(0.3);

      const grandTable = {
        headers: ['Total Ton', 'RO Ton', 'Open Ton', 'RO Amt', 'Open Amt', 'Total Amt', 'Cash', 'Online'],
        columnWidths: [95, 95, 95, 95, 95, 95, 95, 95],
        rows: [[
          grandTotals.TotalTon.toFixed(2),
          grandTotals.RoTon.toFixed(2),
          grandTotals.OpenTon.toFixed(2),
          grandTotals.RoAmount.toFixed(2),
          grandTotals.OpenAmount.toFixed(2),
          grandTotals.TotalAmount.toFixed(2),
          grandTotals.CashAmount.toFixed(2),
          grandTotals.OnlineAmount.toFixed(2)
        ]]
      };

      await doc.table(grandTable, {
        ...tableSettings,
        width: 760,
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9),
        prepareRow: () => doc.font('Helvetica-Bold').fontSize(9)
      });

      // Payment summary
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(10)
        .text('Payment Summary:', { align: 'left' })
        .moveDown(0.2);
      doc.font('Helvetica').fontSize(9)
        .text(`Total Collection: ${grandTotals.TotalAmount.toFixed(2)}`)
        .text(`Cash Collection: ${grandTotals.CashAmount.toFixed(2)}`)
        .text(`Online Collection: ${grandTotals.OnlineAmount.toFixed(2)}`);

      doc.end();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Download Excel report
  downloadQuickTransactionsExcel: async (req, res) => {
    try {
      const { startDate, endDate, roTonPrice, openTonPrice } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required." });
      }

      const query = {
        TransactionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const transactions = await QuickTransaction.find(query)
        .sort({ TransactionDate: -1 });

      if (!transactions.length) {
        return res.status(404).json({ message: "No quick transactions found in the given date range." });
      }

      // Determine if we should recalculate with custom prices
      let useCustomPrices = false;
      let customPrices = null;

      if (roTonPrice && openTonPrice) {
        useCustomPrices = true;
        customPrices = {
          roTonPrice: Number(roTonPrice) || 0,
          openTonPrice: Number(openTonPrice) || 0
        };
      }

      const workbook = XLSX.utils.book_new();

      // Main transactions sheet
      const data = transactions.map(t => {
        let roAmount = Number(t.RoAmount);
        let openAmount = Number(t.OpenAmount);
        let totalAmount = Number(t.TotalAmount);

        // Recalculate if custom prices provided
        if (useCustomPrices) {
          roAmount = +(Number(t.RoTon) * customPrices.roTonPrice).toFixed(2);
          openAmount = +(Number(t.OpenTon) * customPrices.openTonPrice).toFixed(2);
          totalAmount = +(roAmount + openAmount).toFixed(2);
        }

        return {
          'Date': new Date(t.TransactionDate).toLocaleDateString(),
          'Vehicle No': t.VehicleNo || '-',
          'Driver Name': t.DriverName || '-',
          'Driver Number': t.DriverNumber || '-',
          'RO Ton': Number(t.RoTon),
          'Open Ton': Number(t.OpenTon),
          'Total Ton': Number(t.TotalTon),
          'RO Ton Price': useCustomPrices ? customPrices.roTonPrice : Number(t.RoTonPrice),
          'Open Ton Price': useCustomPrices ? customPrices.openTonPrice : Number(t.OpenTonPrice),
          'RO Amount': roAmount,
          'Open Amount': openAmount,
          'Total Amount': totalAmount,
          'Cash Amount': Number(t.CashAmount),
          'Online Amount': Number(t.OnlineAmount),
          'Online Details': t.OnlinePaymentDetails || '-',
          'Remarks': t.Remarks || '-'
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      // Summary sheet
      const totals = transactions.reduce((acc, t) => {
        let totalAmount = Number(t.TotalAmount);

        // Recalculate if custom prices provided
        if (useCustomPrices) {
          const roAmount = Number(t.RoTon) * customPrices.roTonPrice;
          const openAmount = Number(t.OpenTon) * customPrices.openTonPrice;
          totalAmount = +(roAmount + openAmount).toFixed(2);
        }

        return {
          totalTon: acc.totalTon + Number(t.TotalTon),
          roTon: acc.roTon + Number(t.RoTon),
          openTon: acc.openTon + Number(t.OpenTon),
          totalAmount: acc.totalAmount + totalAmount,
          cashAmount: acc.cashAmount + Number(t.CashAmount),
          onlineAmount: acc.onlineAmount + Number(t.OnlineAmount)
        };
      }, { totalTon: 0, roTon: 0, openTon: 0, totalAmount: 0, cashAmount: 0, onlineAmount: 0 });

      const summaryData = [
        { 'Metric': 'Total Transactions', 'Value': transactions.length },
        { 'Metric': 'Total Ton', 'Value': totals.totalTon.toFixed(2) },
        { 'Metric': 'RO Ton', 'Value': totals.roTon.toFixed(2) },
        { 'Metric': 'Open Ton', 'Value': totals.openTon.toFixed(2) },
        { 'Metric': 'Total Amount', 'Value': totals.totalAmount.toFixed(2) },
        { 'Metric': 'Cash Amount', 'Value': totals.cashAmount.toFixed(2) },
        { 'Metric': 'Online Amount', 'Value': totals.onlineAmount.toFixed(2) },
        { 'Metric': 'Cash %', 'Value': totals.totalAmount > 0 ? ((totals.cashAmount / totals.totalAmount) * 100).toFixed(2) + '%' : '0%' },
        { 'Metric': 'Online %', 'Value': totals.totalAmount > 0 ? ((totals.onlineAmount / totals.totalAmount) * 100).toFixed(2) + '%' : '0%' }
      ];

      if (useCustomPrices) {
        summaryData.push({ 'Metric': 'Custom RO Ton Price', 'Value': `₹${customPrices.roTonPrice}` });
        summaryData.push({ 'Metric': 'Custom Open Ton Price', 'Value': `₹${customPrices.openTonPrice}` });
      }

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Quick_Transaction_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = quickTransactionController;
