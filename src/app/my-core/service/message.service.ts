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

  updateErrorHandle(rsp) {
    let message;
    if (rsp instanceof HttpErrorResponse) {
      if (rsp.status === 404) {
        message = Message.notFound;
      } else if (rsp.error?.return === 'existed') {
        message = Message.nameExisted;
      } else {
        message = rsp.message || Message.defaultError;
      }
    } else {
      message = rsp.message || Message.defaultError;
    }
    this.toastr.error(message);
    return EMPTY;
  }

  updateSuccess() {
    this.toastr.success(Message.updateSuccess);
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

  deleteSuccess() {
    this.toastr.success(Message.deleteSuccess);
  }



}
