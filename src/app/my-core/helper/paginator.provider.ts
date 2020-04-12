import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginatorProvider extends MatPaginatorIntl {
  itemsPerPageLabel = '每页个数';
  previousPageLabel = '上一页';
  nextPageLabel = '下一页';
  firstPageLabel = '首页';
  lastPageLabel = '末页';

  getRangeLabel = function (page: number, pageSize: number, length: number) {
    if (length === 0 || pageSize === 0) {
      return '0 个记录 ' + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return '第' + (startIndex + 1) + ' - ' + endIndex + '个记录, 共 ' + length;
  };

}
