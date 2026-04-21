// utils/reportExport.js
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportToCSV = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  // Use html2pdf or similar library
  // const pdf = await html2pdf().from(element).save();
};