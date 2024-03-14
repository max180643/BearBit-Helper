function findCellIndexByValue(row: HTMLTableRowElement, value: string): number {
  for (let i = 0, cell: HTMLTableCellElement; (cell = row.cells[i]); i++) {
    const cellValue = cell.innerText;
    if (cellValue.includes(value)) {
      return i;
    }
    continue;
  }
  return -1;
}

export { findCellIndexByValue };
