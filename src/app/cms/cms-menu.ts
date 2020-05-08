import { NbMenuItem } from '@nebular/theme';

export function getMenuItems(role: number): NbMenuItem[] {
  return [
    {
      title: '控制台',
      icon: 'home',
      link: '/cms/dashboard',
    },
    {
      title: 'CMS',
      group: true,
    },
    {
      title: '医院科室管理',
      icon: 'settings-2',
      children: [
        {
          title: '医院设置',
          link: '/cms/hospital/settings',
        },
        {
          title: '医院科室',
          link: '/cms/hospital/department',
        },
        {
          title: '疾病类型',
          link: '/cms/hospital/disease',
          hidden: true
        },
        {
          title: '药品管理',
          link: '/cms/hospital/medicine',
        },
        {
          title: '常问问题管理',
          link: '/cms/hospital/faq',
        },
      ],
    },
    {
      title: '医患管理',
      icon: 'people-outline',
      children: [
        {
          title: '药师',
          link: '/cms/crm/doctor',
        },
        {
          title: '药师用户组',
          link: '/cms/crm/doctor-group',
        },
        {
          title: '病患',
          link: '/cms/crm/patient',
        },
        {
          title: '医患关系',
          link: '/cms/crm/relationship',
        },

      ],
    },
    {
      title: '预约管理',
      icon: 'calendar-outline',
      children: [
        {
          title: '门诊开设',
          link: '/cms/reservation/schedule',
        },
        {
          title: '门诊预约',
          link: '/cms/reservation/booking',
        },
      ],
    },
    {
      title: '问卷管理',
      icon: 'map-outline',
      children: [
        {
          title: '问卷模版',
          link: '/cms/survey/template',
        },
      ],
    },
    {
      title: '宣教材料管理',
      icon: 'layers-outline',
      children: [
        {
          title: '材料类别',
          link: '/cms/article/cat',
        },
        {
          title: '材料模版',
          link: '/cms/article/template',
        },
      ],
    },
    {
      title: '统计报表',
      icon: 'pie-chart-2',
      children: [
        {
          title: '药师评价',
          link: '/cms/survey/template',
        },
      ],
    },
    {
      title: 'Forms',
      icon: 'edit-2-outline',
      children: [
        {
          title: 'Form Inputs',
          link: '/pages/forms/inputs',
        },
        {
          title: 'Form Layouts',
          link: '/pages/forms/layouts',
        },
        {
          title: 'Buttons',
          link: '/pages/forms/buttons',
        },
        {
          title: 'Datepicker',
          link: '/pages/forms/datepicker',
        },
      ],
    },
    {
      title: 'UI Features',
      icon: 'keypad-outline',
      link: '/pages/ui-features',
      children: [
        {
          title: 'Grid',
          link: '/pages/ui-features/grid',
        },
        {
          title: 'Icons',
          link: '/pages/ui-features/icons',
        },
        {
          title: 'Typography',
          link: '/pages/ui-features/typography',
        },
      ],
    },
    {
      title: 'Modal & Overlays',
      icon: 'browser-outline',
      children: [
        {
          title: 'Dialog',
          link: '/pages/modal-overlays/dialog',
        },
        {
          title: 'Window',
          link: '/pages/modal-overlays/window',
        },
        {
          title: 'Popover',
          link: '/pages/modal-overlays/popover',
        },
        {
          title: 'Toastr',
          link: '/pages/modal-overlays/toastr',
        },
        {
          title: 'Tooltip',
          link: '/pages/modal-overlays/tooltip',
        },
      ],
    },
    {
      title: 'Extra Components',
      icon: 'message-circle-outline',
      hidden: role < 2,
      children: [
        {
          title: 'Calendar',
          link: '/pages/extra-components/calendar',
        },
        {
          title: 'Progress Bar',
          link: '/pages/extra-components/progress-bar',
        },
        {
          title: 'Spinner',
          link: '/pages/extra-components/spinner',
        },
        {
          title: 'Alert',
          link: '/pages/extra-components/alert',
        },
        {
          title: 'Calendar Kit',
          link: '/pages/extra-components/calendar-kit',
        },
        {
          title: 'Chat',
          link: '/pages/extra-components/chat',
        },
      ],
    },
    {
      title: 'Editors',
      icon: 'text-outline',
      children: [
        {
          title: 'CKEditor',
          link: '/pages/editors/ckeditor',
        },
      ],
    },
    {
      title: 'Tables & Data',
      icon: 'grid-outline',
      children: [
        {
          title: 'Tree Grid',
          link: '/pages/tables/tree-grid',
        },
      ],
    },
    {
      title: 'Auth',
      icon: 'lock-outline',
      hidden: role < 2,
      children: [
        {
          title: 'Login',
          link: '/auth/login',
        },
        {
          title: 'Register',
          link: '/auth/register',
        },
        {
          title: 'Request Password',
          link: '/auth/request-password',
        },
        {
          title: 'Reset Password',
          link: '/auth/reset-password',
        },
      ],
    },
  ];
}
