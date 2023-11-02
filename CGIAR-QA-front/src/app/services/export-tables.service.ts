import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';

interface Wscols {
  wpx: number;
}
@Injectable({
  providedIn: 'root'
})
export class ExportTablesService {
  // exportExcel(list, fileName: string, wscols?: Wscols[]) {
  //   try {
  //     import('xlsx').then(xlsx => {
  //       const worksheet = xlsx.utils.json_to_sheet(list, { skipHeader: Boolean(wscols?.length) });
  //       if (wscols) worksheet['!cols'] = wscols as any;
  //       const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
  //       const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
  //       this.saveAsExcelFile(excelBuffer, fileName);
  //     });
  //   } catch (error) {
  //   console.log("🚀 ~ file: export-tables.service.ts:21 ~ ExportTablesService ~ exportExcel ~ error:", error)
  //   }
  // }

  // exportMultipleSheetsExcel(list: any[], fileName: string, wscols?: Wscols[], tocToExport?: any[]) {
  //   try {
  //     import('xlsx').then(xlsx => {
  //       const worksheet = xlsx.utils.json_to_sheet(list, { skipHeader: Boolean(wscols?.length) });
  //       const tocsheet = xlsx.utils.json_to_sheet(tocToExport, { skipHeader: Boolean(wscols?.length) });
  //       if (wscols) {
  //         worksheet['!cols'] = wscols as any;
  //         tocsheet['!cols'] = wscols as any;
  //       }
  //       const workbook = { Sheets: { data: worksheet, 'TOC indicators by result': tocsheet }, SheetNames: ['data', 'TOC indicators by result'] };
  //       const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
  //       this.saveAsExcelFile(excelBuffer, fileName);
  //     });
  //   } catch (error) {
  //     console.log("🚀 ~ file: export-tables.service.ts:39 ~ ExportTablesService ~ exportMultipleSheetsExcel ~ error:", error)
  //   }
  // }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
