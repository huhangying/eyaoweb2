import { NbMenuItem } from '@nebular/theme';

export function getMenuItems(role: number): NbMenuItem[] {
  return [
    {
      title: '控制台',
      icon: 'home',
      link: '/cms/dashboard',
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
          title: '病患审核',
          link: '/cms/crm/patient-audit',
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
  ];
}
