import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentResolver } from '../../services/resolvers/department.resolver';
import { CustomerServiceSettingComponent } from './customer-service-setting/customer-service-setting.component';


const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'customer-service-setting',
      component: CustomerServiceSettingComponent,
      resolve: {
        departments: DepartmentResolver,
      }
    },

  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultRoutingModule { }

export const routedComponents = [
  CustomerServiceSettingComponent,
];
