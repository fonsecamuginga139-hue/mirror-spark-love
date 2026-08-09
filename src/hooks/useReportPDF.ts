import { useCurrency } from "./useCurrency";

interface ReportDate {
  period: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expensesByCategory: Array<{ name: string; value: number; color: string }>;
  monthlyDate: Array<{ month: string; Income: number; Expenses: number }>;
}

export const useReportPDF = () => {
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  const generatePDF = async (data: ReportDate) => {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;

    // Header
    doc.setFillColor(11, 11, 11);
    doc.rect(0, 0, pageWidth, 45, "F");
    
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Vault", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 10;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Financial Report", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Period: ${data.period}`, pageWidth / 2, yPos, { align: "center" });
    
    yPos += 5;
    doc.text(`Generated on: ${new Date().toLocaleDateString("pt-PT")}`, pageWidth / 2, yPos, { align: "center" });

    yPos += 20;

    // Summary Section
    doc.setFillColor(20, 20, 20);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 3, 3, "F");
    
    yPos += 10;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Period Summary", margin + 5, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Income
    doc.setTextColor(34, 197, 94);
    doc.text(`Income: ${formatCurrency(data.totalIncome)}`, margin + 5, yPos);
    
    // Expenses
    doc.setTextColor(239, 68, 68);
    doc.text(`Expenses: ${formatCurrency(data.totalExpense)}`, margin + 70, yPos);
    
    yPos += 8;
    // Balance
    const balanceColor = data.balance >= 0 ? [34, 197, 94] : [239, 68, 68];
    doc.setTextColor(...balanceColor as [number, number, number]);
    doc.setFont("helvetica", "bold");
    doc.text(`Balance: ${formatCurrency(data.balance)}`, margin + 5, yPos);

    yPos += 25;

    // Expenses by Category
    if (data.expensesByCategory.length > 0) {
      doc.setFillColor(20, 20, 20);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10 + data.expensesByCategory.length * 8, 3, 3, "F");
      
      yPos += 8;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Expenses by Category", margin + 5, yPos);
      
      yPos += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      data.expensesByCategory.forEach((cat) => {
        const hexColor = cat.color.replace("#", "");
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);
        
        doc.setFillColor(r, g, b);
        doc.circle(margin + 8, yPos - 2, 2, "F");
        
        doc.setTextColor(200, 200, 200);
        doc.text(cat.name, margin + 15, yPos);
        doc.text(formatCurrency(cat.value), pageWidth - margin - 5, yPos, { align: "right" });
        yPos += 8;
      });

      yPos += 10;
    }

    // Monthly Comparison
    if (data.monthlyDate.length > 0) {
      doc.setFillColor(20, 20, 20);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10 + data.monthlyDate.length * 10, 3, 3, "F");
      
      yPos += 8;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Monthly Comparison", margin + 5, yPos);
      
      yPos += 10;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(150, 150, 150);
      doc.text("Month", margin + 5, yPos);
      doc.text("Income", margin + 60, yPos);
      doc.text("Expenses", margin + 110, yPos);
      
      yPos += 6;
      doc.setFont("helvetica", "normal");
      
      data.monthlyDate.forEach((month) => {
        doc.setTextColor(200, 200, 200);
        doc.text(month.month, margin + 5, yPos);
        
        doc.setTextColor(34, 197, 94);
        doc.text(formatCurrency(month.Income), margin + 60, yPos);
        
        doc.setTextColor(239, 68, 68);
        doc.text(formatCurrency(month.Expenses), margin + 110, yPos);
        
        yPos += 8;
      });
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFillColor(11, 11, 11);
    doc.rect(0, footerY - 5, pageWidth, 20, "F");
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("Report generated automatically by Vault", pageWidth / 2, footerY, { align: "center" });
    doc.text("Real-time financial control", pageWidth / 2, footerY + 5, { align: "center" });

    // Save the PDF
    const fileName = `vault-report-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  };

  return { generatePDF };
};
