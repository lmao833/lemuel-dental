// staff.js - Staff dashboard enhancements
const API = 'http://127.0.0.1:5000';

// CSV export helper
function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  let csv = [];
  for (let row of table.rows) {
    let rowData = [];
    for (let cell of row.cells) {
      rowData.push('"' + cell.innerText.replace(/"/g, '""') + '"');
    }
    csv.push(rowData.join(','));
  }
  const csvStr = csv.join('\n');
  const blob = new Blob([csvStr], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Search/filter helper
function filterTable(inputId, tableId) {
  const filter = document.getElementById(inputId).value.toLowerCase();
  const rows = document.getElementById(tableId).getElementsByTagName('tr');
  for (let i = 1; i < rows.length; i++) {
    let show = false;
    for (let cell of rows[i].cells) {
      if (cell.innerText.toLowerCase().includes(filter)) show = true;
    }
    rows[i].style.display = show ? '' : 'none';
  }
}
