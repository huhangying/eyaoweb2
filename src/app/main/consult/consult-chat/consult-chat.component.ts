import { Component, Input, OnInit } from '@angular/core';
import { Consult } from '../../../models/consult/consult.model';
import { Doctor } from '../../../models/crm/doctor.model';
import { User } from '../../../models/crm/user.model';

@Component({
  selector: 'ngx-consult-chat',
  templateUrl: './consult-chat.component.html',
  styleUrls: ['./consult-chat.component.scss']
})
export class ConsultChatComponent implements OnInit {
  @Input() consults: Consult[];
  @Input() selectedPatient: User;
  @Input() doctor: Doctor;

  constructor() { }

  ngOnInit(): void {
  }

}
