import { Injectable } from "@angular/core";
import * as FileSaver from "file-saver";
import * as xlsx from "xlsx";

interface Wscols {
  wpx: number;
}
@Injectable({
  providedIn: "root",
})
export class ExportTablesService {
  exportExcel(list, fileName: string, wscols?: Wscols[]) {
    try {
      import("xlsx").then((xlsx) => {
        const worksheet = xlsx.utils.json_to_sheet(list, {
          skipHeader: Boolean(wscols?.length),
        });
        if (wscols) worksheet["!cols"] = wscols as any;
        const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
        const excelBuffer: any = xlsx.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        this.saveAsExcelFile(excelBuffer, fileName);
      });
    } catch (error) {
      console.error({
        message: "An error ocurred when try to export the excel report",
        error,
      });
    }
  }

  exportMultipleSheetsExcel(
    commentRaw,
    fileName: string,
    wscols?: Wscols[],
    assessmentRaw?
  ) {
    try {
      import("xlsx").then((xlsx) => {
        const comments = xlsx.utils.json_to_sheet(commentRaw, {
          skipHeader: Boolean(wscols?.length),
        });
        const assessment = xlsx.utils.json_to_sheet(assessmentRaw, {
          skipHeader: Boolean(wscols?.length),
        });
        if (wscols) {
          comments["!cols"] = wscols as any;
          assessment["!cols"] = wscols as any;
        }
        const workbook = {
          Sheets: {
            Comments: comments,
            "Assessment status by result": assessment,
          },
          SheetNames: ["Comments", "Assessment status by result"],
        };
        const excelBuffer: any = xlsx.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        this.saveAsExcelFile(excelBuffer, fileName);
      });
    } catch (error) {
      console.error({
        message: "An error ocurred when try to export the excel report",
        error,
      });
    }
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    let EXCEL_EXTENSION = ".xlsx";
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
      data,
      fileName + "_" + new Date().getTime() + EXCEL_EXTENSION
    );
  }
}
