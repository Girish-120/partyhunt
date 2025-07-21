
export function createTableEmail(arr: any[]) {
  const keys = arr.keys();
  const keysArray = arr.map((obj) => Object.keys(obj));

  // Flatten the array of arrays into a single array of unique keys
  const uniqueKeys = [...new Set(keysArray.flat())];
  let tableHtml = `
  <html>
    <head>
      <!-- Include Bootstrap CSS styles inline -->
      <style>
        .table {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          border-collapse: collapse;
        }

        .table th, .table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .table th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <table class="table">
        <thead>
          <tr>`;
  for (const textKey of uniqueKeys) {
    tableHtml += `       
          <th>${textKey}</th>
    `;
  }
  tableHtml += ` </tr>
  </thead>
  <tbody>
  <tr>
  `;
  for (const obj of arr) {
    for (const [key, value] of Object.entries(obj)) {
      tableHtml += `
          <td>${obj[key]}</td>
    `;
    }
  }
  tableHtml += ` </tr>
        </tbody>
        </table>`;
  return tableHtml;
}
