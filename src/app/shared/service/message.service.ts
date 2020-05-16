import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../enum/message.enum';
import { EMPTY } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private toastr: ToastrService,
  ) {
  }

  success(msg: string, title?: string) {
    this.toastr.success(msg, title);
  }
  info(msg: string, title?: string) {
    this.toastr.info(msg, title);
  }
  warning(msg: string, title?: string) {
    this.toastr.warning(msg, title);
  }
  error(msg: string, title?: string) {
    this.toastr.error(msg, title);
  }

  updateErrorHandle(rsp) {
    let message;
    if (rsp instanceof HttpErrorResponse) {
      if (rsp.status === 404) {
        message = Message.notFound;
      } else if (rsp.error?.return === 'existed') {
        message = Message.nameExisted;
      }
    }
    message = message || rsp.error?.message || rsp.message || Message.defaultError;
    this.toastr.error(message);
    return EMPTY;
  }

  updateSuccess(prefix?: string) {
    this.toastr.success((prefix || '') + Message.updateSuccess);
  }

  deleteErrorHandle(rsp) {
    let message;
    if (rsp instanceof HttpErrorResponse) {
      if (rsp.status === 404) {
        message = Message.notFound;
      } else if (rsp.error?.return === 'deleteNotAllowed') {
        message = Message.deleteNotAllowed;
      } else {
        message = rsp.message || Message.defaultError;
      }
    } else {
      message = rsp.message || Message.defaultError;
    }
    this.toastr.error(message);
    return EMPTY;
  }

  deleteSuccess(prefix?: string) {
    this.toastr.success((prefix || '') + Message.deleteSuccess);
  }

  nothingUpdated() {
    this.toastr.warning(Message.nothingUpdated);
  }


}
