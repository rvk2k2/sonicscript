import jsPDF from "jspdf";

export function downloadAsTxt(data) {
  const blob = new Blob([data.text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.filename}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadAsPDF(data) {
  const doc = new jsPDF();
  doc.text(data.text, 10, 10);
  doc.save(`${data.filename}.pdf`);
}
